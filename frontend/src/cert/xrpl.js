/**
 * WIRED CHAOS - XRPL Testnet NFT Certificate Minter
 * XLS-20 NFTokenMint implementation
 */

import { Client, Wallet, xrpToDrops } from 'xrpl';
import { getChainConfig } from '../chains/config';

/**
 * Mint NFT certificate on XRPL Testnet
 */
export const mintXRPLCertificate = async (certData) => {
  try {
    const { walletAddress, metadataUri } = certData;
    const config = getChainConfig('xrpl');
    
    if (!config) {
      throw new Error('XRPL configuration not found');
    }

    console.log('🔹 Minting XRPL certificate...', {
      to: walletAddress,
      network: 'Testnet'
    });

    // Connect to XRPL testnet
    const client = new Client(config.wsUrl);
    await client.connect();

    // Get minter wallet from seed
    const minterSeed = process.env.XRPL_SEED_TEST;
    if (!minterSeed) {
      throw new Error('XRPL_SEED_TEST not configured');
    }

    const minterWallet = Wallet.fromSeed(minterSeed);
    console.log('🔑 Minter address:', minterWallet.address);

    // Check minter balance
    const accountInfo = await client.request({
      command: 'account_info',
      account: minterWallet.address,
      ledger_index: 'validated'
    });

    const balance = parseInt(accountInfo.result.account_data.Balance) / 1000000; // Convert drops to XRP
    if (balance < 10) { // Need at least 10 XRP for operations
      throw new Error('Insufficient XRP balance. Need at least 10 XRP on testnet.');
    }

    console.log(`💰 Minter balance: ${balance} XRP`);

    // Generate unique NFToken ID using current timestamp and hash
    const timestamp = Math.floor(Date.now() / 1000);
    const tokenTaxon = timestamp % 4294967295; // Ensure it fits in uint32

    // Prepare NFTokenMint transaction
    const nftMintTx = {
      TransactionType: 'NFTokenMint',
      Account: minterWallet.address,
      TokenTaxon: tokenTaxon,
      Flags: 8, // tfTransferable flag
      Fee: '12', // Fee in drops
      URI: Buffer.from(metadataUri).toString('hex').toUpperCase(), // Convert URI to hex
      // Optional: Add memo with certificate info
      Memos: [{
        Memo: {
          MemoType: Buffer.from('certificate').toString('hex').toUpperCase(),
          MemoData: Buffer.from(JSON.stringify({
            student: certData.studentName,
            course: certData.courseName,
            academy: 'WIRED CHAOS NEUROLAB'
          })).toString('hex').toUpperCase()
        }
      }]
    };

    console.log('📝 Preparing NFTokenMint transaction...', {
      tokenTaxon,
      uri: metadataUri,
      recipient: walletAddress
    });

    // Submit and wait for validation
    const mintResult = await client.submitAndWait(nftMintTx, {
      wallet: minterWallet
    });

    if (mintResult.result.meta.TransactionResult !== 'tesSUCCESS') {
      throw new Error(`NFTokenMint failed: ${mintResult.result.meta.TransactionResult}`);
    }

    console.log('✅ NFToken minted successfully');

    // Extract NFTokenID from transaction metadata
    let nftokenId = null;
    const meta = mintResult.result.meta;
    
    if (meta.CreatedNode) {
      const createdNode = Array.isArray(meta.CreatedNode) ? meta.CreatedNode[0] : meta.CreatedNode;
      if (createdNode.CreatedNode?.LedgerEntryType === 'NFToken') {
        nftokenId = createdNode.CreatedNode.NewFields?.NFTokenID;
      }
    }

    // If recipient is different from minter, create an offer to transfer
    let offerResult = null;
    if (walletAddress !== minterWallet.address) {
      console.log('🔄 Creating transfer offer to recipient...');
      
      const sellOfferTx = {
        TransactionType: 'NFTokenCreateOffer',
        Account: minterWallet.address,
        NFTokenID: nftokenId,
        Amount: '0', // Free transfer
        Destination: walletAddress,
        Fee: '12'
      };

      offerResult = await client.submitAndWait(sellOfferTx, {
        wallet: minterWallet
      });

      if (offerResult.result.meta.TransactionResult !== 'tesSUCCESS') {
        console.warn('⚠️ Transfer offer creation failed:', offerResult.result.meta.TransactionResult);
      } else {
        console.log('✅ Transfer offer created successfully');
      }
    }

    await client.disconnect();

    const result = {
      success: true,
      chain: 'xrpl',
      network: 'testnet',
      txHash: mintResult.result.hash,
      nftokenId,
      tokenTaxon,
      to: walletAddress,
      metadataUri,
      ledgerIndex: mintResult.result.ledger_index,
      explorerUrl: `${config.explorerUrl}/transactions/${mintResult.result.hash}`,
      transferOffer: offerResult ? {
        hash: offerResult.result.hash,
        success: offerResult.result.meta.TransactionResult === 'tesSUCCESS'
      } : null
    };

    console.log('✅ XRPL certificate minted:', result);
    return result;

  } catch (error) {
    console.error('❌ XRPL minting failed:', error);
    
    let errorMessage = error.message;
    if (error.message.includes('unfunded')) {
      errorMessage = 'Account not funded. Fund account with XRP testnet faucet.';
    } else if (error.message.includes('tecDIR_FULL')) {
      errorMessage = 'Directory full. Account has too many objects.';
    } else if (error.message.includes('tecNO_PERMISSION')) {
      errorMessage = 'No permission to create NFToken';
    }

    return {
      success: false,
      chain: 'xrpl',
      network: 'testnet',
      error: errorMessage,
      originalError: error.message
    };
  }
};

/**
 * Verify certificate exists on XRPL
 */
export const verifyXRPLCertificate = async (nftokenId) => {
  try {
    const config = getChainConfig('xrpl');
    const client = new Client(config.wsUrl);
    await client.connect();

    // Query NFToken by ID
    const response = await client.request({
      command: 'nft_info',
      nft_id: nftokenId,
      ledger_index: 'validated'
    });

    await client.disconnect();

    if (response.result.error) {
      return {
        exists: false,
        error: response.result.error_message || 'NFToken not found'
      };
    }

    return {
      exists: true,
      nftokenId,
      owner: response.result.owner,
      issuer: response.result.issuer,
      uri: response.result.uri ? Buffer.from(response.result.uri, 'hex').toString() : null,
      flags: response.result.flags
    };

  } catch (error) {
    return {
      exists: false,
      error: error.message
    };
  }
};

/**
 * Get XRPL network info
 */
export const getXRPLNetworkInfo = async () => {
  try {
    const config = getChainConfig('xrpl');
    const client = new Client(config.wsUrl);
    await client.connect();

    const serverInfo = await client.request({
      command: 'server_info'
    });

    const ledger = await client.request({
      command: 'ledger',
      ledger_index: 'validated'
    });

    await client.disconnect();

    return {
      connected: true,
      network: 'testnet',
      serverVersion: serverInfo.result.info.build_version,
      ledgerIndex: ledger.result.ledger.ledger_index,
      networkId: serverInfo.result.info.network_id,
      wsUrl: config.wsUrl
    };

  } catch (error) {
    return {
      connected: false,
      error: error.message
    };
  }
};

/**
 * Fund account with testnet XRP (faucet)
 */
export const fundTestnetAccount = async (address) => {
  try {
    const faucetUrl = 'https://faucet.altnet.rippletest.net/accounts';
    
    const response = await fetch(faucetUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        destination: address,
        xrpAmount: 1000 // Request 1000 XRP
      })
    });

    if (!response.ok) {
      throw new Error(`Faucet request failed: ${response.status}`);
    }

    const result = await response.json();
    
    return {
      success: true,
      account: result.account,
      amount: result.amount,
      hash: result.hash
    };

  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
};

export default {
  mintXRPLCertificate,
  verifyXRPLCertificate,
  getXRPLNetworkInfo,
  fundTestnetAccount
};