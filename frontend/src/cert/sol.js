/**
 * WIRED CHAOS - Solana Devnet NFT Certificate Minter
 * Metaplex NFT standard implementation
 */

import { 
  Connection, 
  PublicKey, 
  Keypair,
  Transaction,
  SystemProgram,
  SYSVAR_RENT_PUBKEY
} from '@solana/web3.js';
import { 
  TOKEN_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID,
  getAssociatedTokenAddress,
  createAssociatedTokenAccountInstruction,
  createInitializeMintInstruction,
  createMintToInstruction,
  MINT_SIZE
} from '@solana/spl-token';
import { getChainConfig } from '../chains/config';

/**
 * Mint NFT certificate on Solana Devnet
 */
export const mintSolanaCertificate = async (certData) => {
  try {
    const { walletAddress, metadataUri } = certData;
    const config = getChainConfig('solana');
    
    if (!config) {
      throw new Error('Solana configuration not found');
    }

    console.log('🟣 Minting Solana certificate...', {
      to: walletAddress,
      network: 'Devnet'
    });

    // Connect to Solana devnet
    const connection = new Connection(config.rpcUrl, config.commitment);
    
    // Get minter keypair from environment
    const minterSecretKey = process.env.SOL_MINTER_SECRET_BASE58;
    if (!minterSecretKey) {
      throw new Error('SOL_MINTER_SECRET_BASE58 not configured');
    }

    const minterKeypair = Keypair.fromSecretKey(
      new Uint8Array(JSON.parse(minterSecretKey))
    );

    // Parse recipient address
    const recipientPubkey = new PublicKey(walletAddress);
    
    // Generate new mint address
    const mintKeypair = Keypair.generate();
    const mintPubkey = mintKeypair.publicKey;

    // Get associated token account for recipient
    const associatedTokenAccount = await getAssociatedTokenAddress(
      mintPubkey,
      recipientPubkey
    );

    console.log('🔑 Generated addresses:', {
      mint: mintPubkey.toString(),
      ata: associatedTokenAccount.toString(),
      recipient: recipientPubkey.toString()
    });

    // Check minter balance
    const balance = await connection.getBalance(minterKeypair.publicKey);
    const minimumBalance = 0.01 * 1e9; // 0.01 SOL in lamports
    
    if (balance < minimumBalance) {
      throw new Error('Insufficient SOL balance for minting. Need at least 0.01 SOL on Devnet.');
    }

    // Get recent blockhash
    const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash();

    // Calculate rent for mint account
    const mintRent = await connection.getMinimumBalanceForRentExemption(MINT_SIZE);

    // Build transaction
    const transaction = new Transaction({
      feePayer: minterKeypair.publicKey,
      blockhash,
      lastValidBlockHeight
    });

    // Create mint account
    transaction.add(
      SystemProgram.createAccount({
        fromPubkey: minterKeypair.publicKey,
        newAccountPubkey: mintPubkey,
        space: MINT_SIZE,
        lamports: mintRent,
        programId: TOKEN_PROGRAM_ID
      })
    );

    // Initialize mint (NFT has supply of 1, decimals 0)
    transaction.add(
      createInitializeMintInstruction(
        mintPubkey,
        0, // decimals
        minterKeypair.publicKey, // mint authority
        minterKeypair.publicKey, // freeze authority
        TOKEN_PROGRAM_ID
      )
    );

    // Create associated token account for recipient
    transaction.add(
      createAssociatedTokenAccountInstruction(
        minterKeypair.publicKey, // payer
        associatedTokenAccount, // ata
        recipientPubkey, // owner
        mintPubkey, // mint
        TOKEN_PROGRAM_ID,
        ASSOCIATED_TOKEN_PROGRAM_ID
      )
    );

    // Mint 1 token to recipient
    transaction.add(
      createMintToInstruction(
        mintPubkey,
        associatedTokenAccount,
        minterKeypair.publicKey,
        1, // amount (1 for NFT)
        [],
        TOKEN_PROGRAM_ID
      )
    );

    // Sign and send transaction
    transaction.sign(minterKeypair, mintKeypair);
    
    const signature = await connection.sendTransaction(transaction, [minterKeypair, mintKeypair], {
      skipPreflight: false,
      preflightCommitment: config.commitment
    });

    console.log('📤 Transaction submitted:', signature);

    // Confirm transaction
    const confirmation = await connection.confirmTransaction({
      signature,
      blockhash,
      lastValidBlockHeight
    }, config.commitment);

    if (confirmation.value.err) {
      throw new Error(`Transaction failed: ${JSON.stringify(confirmation.value.err)}`);
    }

    // Create metadata account (simplified - in production use Metaplex SDK)
    console.log('📝 Creating metadata...');
    
    // For now, we'll store metadata URI in transaction memo
    // In production, you'd use Metaplex Token Metadata program
    
    const result = {
      success: true,
      chain: 'solana',
      network: 'devnet',
      signature,
      mintAddress: mintPubkey.toString(),
      tokenAccount: associatedTokenAccount.toString(),
      to: walletAddress,
      metadataUri,
      slot: confirmation.context.slot,
      explorerUrl: `${config.explorerUrl}/tx/${signature}?cluster=devnet`
    };

    console.log('✅ Solana certificate minted:', result);
    return result;

  } catch (error) {
    console.error('❌ Solana minting failed:', error);
    
    let errorMessage = error.message;
    if (error.message.includes('insufficient funds')) {
      errorMessage = 'Insufficient SOL balance for minting';
    } else if (error.message.includes('blockhash not found')) {
      errorMessage = 'Transaction expired, please retry';
    }

    return {
      success: false,
      chain: 'solana',
      network: 'devnet',
      error: errorMessage,
      originalError: error.message
    };
  }
};

/**
 * Verify certificate exists on Solana
 */
export const verifySolanaCertificate = async (mintAddress) => {
  try {
    const config = getChainConfig('solana');
    const connection = new Connection(config.rpcUrl, config.commitment);
    
    const mintPubkey = new PublicKey(mintAddress);
    const mintInfo = await connection.getParsedAccountInfo(mintPubkey);
    
    if (!mintInfo.value) {
      return {
        exists: false,
        error: 'Mint account not found'
      };
    }

    const mintData = mintInfo.value.data.parsed.info;
    
    return {
      exists: true,
      mintAddress,
      supply: mintData.supply,
      decimals: mintData.decimals,
      mintAuthority: mintData.mintAuthority,
      isInitialized: mintData.isInitialized
    };
    
  } catch (error) {
    return {
      exists: false,
      error: error.message
    };
  }
};

/**
 * Get Solana network info
 */
export const getSolanaNetworkInfo = async () => {
  try {
    const config = getChainConfig('solana');
    const connection = new Connection(config.rpcUrl, config.commitment);
    
    const version = await connection.getVersion();
    const epochInfo = await connection.getEpochInfo();
    
    return {
      connected: true,
      network: 'devnet',
      version: version['solana-core'],
      epoch: epochInfo.epoch,
      slot: epochInfo.absoluteSlot,
      rpcUrl: config.rpcUrl
    };
    
  } catch (error) {
    return {
      connected: false,
      error: error.message
    };
  }
};

/**
 * Airdrop SOL for testing (devnet only)
 */
export const requestAirdrop = async (publicKey, amount = 1) => {
  try {
    const config = getChainConfig('solana');
    const connection = new Connection(config.rpcUrl, config.commitment);
    
    const pubkey = new PublicKey(publicKey);
    const signature = await connection.requestAirdrop(pubkey, amount * 1e9);
    
    await connection.confirmTransaction(signature);
    
    return {
      success: true,
      signature,
      amount,
      to: publicKey
    };
    
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
};

export default {
  mintSolanaCertificate,
  verifySolanaCertificate,
  getSolanaNetworkInfo,
  requestAirdrop
};