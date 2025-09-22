/**
 * WIRED CHAOS - Hedera Testnet NFT Certificate Minter
 * HTS Non-Fungible Token implementation
 */

import {
  Client,
  PrivateKey,
  AccountId,
  TokenCreateTransaction,
  TokenType,
  TokenSupplyType,
  TokenMintTransaction,
  TokenAssociateTransaction,
  TransferTransaction,
  Hbar
} from '@hashgraph/sdk';
import { getChainConfig } from '../chains/config';

/**
 * Mint NFT certificate on Hedera Testnet
 */
export const mintHederaCertificate = async (certData) => {
  try {
    const { walletAddress, metadataUri } = certData;
    const config = getChainConfig('hedera');
    
    if (!config) {
      throw new Error('Hedera configuration not found');
    }

    console.log('🌿 Minting Hedera certificate...', {
      to: walletAddress,
      network: 'Testnet'
    });

    // Get operator credentials
    const operatorId = process.env.HBAR_OPERATOR_ID;
    const operatorKey = process.env.HBAR_OPERATOR_KEY;
    
    if (!operatorId || !operatorKey) {
      throw new Error('HBAR_OPERATOR_ID and HBAR_OPERATOR_KEY must be configured');
    }

    // Create Hedera client
    const client = Client.forTestnet();
    client.setOperator(
      AccountId.fromString(operatorId),
      PrivateKey.fromString(operatorKey)
    );

    console.log('🔑 Operator account:', operatorId);

    // Parse recipient account ID
    const recipientId = AccountId.fromString(walletAddress);

    // Create unique token name and symbol
    const timestamp = Date.now();
    const tokenName = `WC-CERT-${timestamp}`;
    const tokenSymbol = `WCC${timestamp.toString().slice(-6)}`;

    console.log('📝 Creating NFT collection...', {
      name: tokenName,
      symbol: tokenSymbol,
      metadata: metadataUri
    });

    // Create NFT collection
    const nftCreate = new TokenCreateTransaction()
      .setTokenName(tokenName)
      .setTokenSymbol(tokenSymbol)
      .setTokenType(TokenType.NonFungibleUnique)
      .setDecimals(0)
      .setInitialSupply(0)
      .setTreasuryAccountId(operatorId)
      .setSupplyType(TokenSupplyType.Finite)
      .setMaxSupply(1) // Only one certificate
      .setSupplyKey(PrivateKey.fromString(operatorKey))
      .setFreezeDefault(false);

    // Submit token creation transaction
    const nftCreateSubmit = await nftCreate.execute(client);
    const nftCreateReceipt = await nftCreateSubmit.getReceipt(client);
    const tokenId = nftCreateReceipt.tokenId;

    console.log('✅ NFT collection created:', tokenId.toString());

    // Associate token with recipient account (if different from operator)
    if (recipientId.toString() !== operatorId) {
      console.log('🔗 Associating token with recipient...');
      
      // Note: In production, recipient would sign this transaction
      // For demo purposes, we'll assume the operator can associate
      try {
        const associateTransaction = new TokenAssociateTransaction()
          .setAccountId(recipientId)
          .setTokenIds([tokenId]);

        const associateSubmit = await associateTransaction.execute(client);
        const associateReceipt = await associateSubmit.getReceipt(client);
        
        console.log('✅ Token associated with recipient');
      } catch (error) {
        console.warn('⚠️ Token association failed (recipient must associate manually):', error.message);
      }
    }

    // Create certificate metadata
    const certificateMetadata = JSON.stringify({
      name: `${certData.courseName} - Certificate`,
      description: `Certificate of Completion for ${certData.studentName}`,
      image: metadataUri,
      student: certData.studentName,
      course: certData.courseName,
      academy: 'WIRED CHAOS NEUROLAB',
      issued: new Date().toISOString()
    });

    // Convert metadata to bytes
    const metadataBytes = new TextEncoder().encode(certificateMetadata);

    console.log('🏭 Minting NFT serial...');

    // Mint NFT with metadata
    const mintTransaction = new TokenMintTransaction()
      .setTokenId(tokenId)
      .setMetadata([metadataBytes]);

    const mintSubmit = await mintTransaction.execute(client);
    const mintReceipt = await mintSubmit.getReceipt(client);
    const serialNumbers = mintReceipt.serials;

    console.log('✅ NFT minted with serial:', serialNumbers[0].toString());

    // Transfer to recipient (if different from operator)
    let transferResult = null;
    if (recipientId.toString() !== operatorId) {
      console.log('📤 Transferring to recipient...');

      try {
        const transferTransaction = new TransferTransaction()
          .addNftTransfer(tokenId, serialNumbers[0], operatorId, recipientId);

        const transferSubmit = await transferTransaction.execute(client);
        const transferReceipt = await transferSubmit.getReceipt(client);
        
        transferResult = {
          hash: transferSubmit.transactionId.toString(),
          success: transferReceipt.status.toString() === 'SUCCESS'
        };

        console.log('✅ NFT transferred to recipient');
      } catch (error) {
        console.warn('⚠️ Transfer failed (recipient may need to accept):', error.message);
        transferResult = {
          success: false,
          error: error.message
        };
      }
    }

    client.close();

    const result = {
      success: true,
      chain: 'hedera',
      network: 'testnet',
      tokenId: tokenId.toString(),
      serialNumber: serialNumbers[0].toString(),
      to: walletAddress,
      metadataUri,
      createTxId: nftCreateSubmit.transactionId.toString(),
      mintTxId: mintSubmit.transactionId.toString(),
      explorerUrl: `${config.explorerUrl}/transaction/${mintSubmit.transactionId.toString()}`,
      transfer: transferResult
    };

    console.log('✅ Hedera certificate minted:', result);
    return result;

  } catch (error) {
    console.error('❌ Hedera minting failed:', error);
    
    let errorMessage = error.message;
    if (error.message.includes('INSUFFICIENT_ACCOUNT_BALANCE')) {
      errorMessage = 'Insufficient HBAR balance for transaction fees';
    } else if (error.message.includes('INVALID_ACCOUNT_ID')) {
      errorMessage = 'Invalid Hedera account ID format';
    } else if (error.message.includes('TOKEN_NOT_ASSOCIATED_TO_ACCOUNT')) {
      errorMessage = 'Token not associated with account';
    }

    return {
      success: false,
      chain: 'hedera',
      network: 'testnet',
      error: errorMessage,
      originalError: error.message
    };
  }
};

/**
 * Verify certificate exists on Hedera
 */
export const verifyHederaCertificate = async (tokenId, serialNumber) => {
  try {
    const config = getChainConfig('hedera');
    
    // Use mirror node API to query NFT info
    const mirrorUrl = `${config.mirrorUrl}/api/v1/tokens/${tokenId}/nfts/${serialNumber}`;
    
    const response = await fetch(mirrorUrl);
    
    if (!response.ok) {
      throw new Error(`NFT not found: ${response.status}`);
    }

    const nftInfo = await response.json();
    
    // Decode metadata if present
    let metadata = null;
    if (nftInfo.metadata) {
      try {
        const decodedBytes = Buffer.from(nftInfo.metadata, 'base64');
        metadata = JSON.parse(decodedBytes.toString());
      } catch (e) {
        metadata = nftInfo.metadata;
      }
    }

    return {
      exists: true,
      tokenId,
      serialNumber,
      owner: nftInfo.account_id,
      metadata,
      createdTimestamp: nftInfo.created_timestamp,
      modifiedTimestamp: nftInfo.modified_timestamp
    };

  } catch (error) {
    return {
      exists: false,
      error: error.message
    };
  }
};

/**
 * Get Hedera network info
 */
export const getHederaNetworkInfo = async () => {
  try {
    const config = getChainConfig('hedera');
    
    // Query mirror node for network info
    const response = await fetch(`${config.mirrorUrl}/api/v1/network/nodes`);
    
    if (!response.ok) {
      throw new Error(`Network query failed: ${response.status}`);
    }

    const networkInfo = await response.json();
    
    return {
      connected: true,
      network: 'testnet',
      nodeCount: networkInfo.nodes ? networkInfo.nodes.length : 0,
      mirrorUrl: config.mirrorUrl,
      explorerUrl: config.explorerUrl
    };

  } catch (error) {
    return {
      connected: false,
      error: error.message
    };
  }
};

/**
 * Get account balance on Hedera
 */
export const getHederaAccountBalance = async (accountId) => {
  try {
    const config = getChainConfig('hedera');
    
    const response = await fetch(`${config.mirrorUrl}/api/v1/accounts/${accountId}`);
    
    if (!response.ok) {
      throw new Error(`Account not found: ${response.status}`);
    }

    const accountInfo = await response.json();
    
    return {
      success: true,
      accountId,
      balance: accountInfo.balance ? (accountInfo.balance.balance / 100000000) : 0, // Convert tinybars to HBAR
      tokens: accountInfo.balance ? accountInfo.balance.tokens : []
    };

  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
};

export default {
  mintHederaCertificate,
  verifyHederaCertificate,
  getHederaNetworkInfo,
  getHederaAccountBalance
};