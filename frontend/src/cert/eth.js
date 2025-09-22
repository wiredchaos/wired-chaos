/**
 * WIRED CHAOS - Ethereum Sepolia NFT Certificate Minter
 * ERC-721 implementation via ethers.js v6
 */

import { ethers } from 'ethers';
import { getChainConfig } from '../chains/config';

// ERC-721 Certificate Contract ABI (minimal required functions)
const CERTIFICATE_ABI = [
  "function mintTo(address to, string memory tokenURI) public returns (uint256)",
  "function ownerOf(uint256 tokenId) public view returns (address)",
  "function tokenURI(uint256 tokenId) public view returns (string)",
  "function totalSupply() public view returns (uint256)",
  "event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)"
];

/**
 * Mint NFT certificate on Ethereum Sepolia
 */
export const mintEthereumCertificate = async (certData) => {
  try {
    const { walletAddress, metadataUri } = certData;
    const config = getChainConfig('ethereum');
    
    if (!config) {
      throw new Error('Ethereum configuration not found');
    }

    // Get private key from environment (backend only)
    const privateKey = process.env.ETH_MINTER_PRIVATE_KEY;
    const contractAddress = process.env.CERT_ETH_CONTRACT || config.contracts.certificateNFT;
    
    if (!privateKey) {
      throw new Error('ETH_MINTER_PRIVATE_KEY not configured');
    }
    
    if (!contractAddress || contractAddress === '0x0000000000000000000000000000000000000000') {
      throw new Error('Certificate contract not deployed. Deploy CertificateNFT.sol first.');
    }

    console.log('🔷 Minting Ethereum certificate...', {
      to: walletAddress,
      contract: contractAddress,
      network: 'Sepolia'
    });

    // Connect to Sepolia testnet
    const provider = new ethers.JsonRpcProvider(config.rpcUrl);
    const wallet = new ethers.Wallet(privateKey, provider);
    
    // Connect to certificate contract
    const contract = new ethers.Contract(contractAddress, CERTIFICATE_ABI, wallet);
    
    // Check wallet balance for gas
    const balance = await provider.getBalance(wallet.address);
    if (balance < ethers.parseEther('0.01')) {
      throw new Error('Insufficient ETH balance for gas fees. Need at least 0.01 ETH on Sepolia.');
    }

    // Estimate gas
    const gasEstimate = await contract.mintTo.estimateGas(walletAddress, metadataUri);
    const gasPrice = await provider.getFeeData();
    
    console.log('⛽ Gas estimate:', {
      gasLimit: gasEstimate.toString(),
      gasPrice: gasPrice.gasPrice?.toString()
    });

    // Mint the NFT
    const tx = await contract.mintTo(walletAddress, metadataUri, {
      gasLimit: gasEstimate * BigInt(120) / BigInt(100), // 20% buffer
      gasPrice: gasPrice.gasPrice
    });

    console.log('📤 Transaction submitted:', tx.hash);

    // Wait for confirmation
    const receipt = await tx.wait();
    
    if (!receipt || receipt.status !== 1) {
      throw new Error('Transaction failed');
    }

    // Extract token ID from Transfer event
    let tokenId = null;
    for (const log of receipt.logs) {
      try {
        const parsedLog = contract.interface.parseLog(log);
        if (parsedLog?.name === 'Transfer' && parsedLog.args.from === ethers.ZeroAddress) {
          tokenId = parsedLog.args.tokenId.toString();
          break;
        }
      } catch (e) {
        // Skip unparseable logs
        continue;
      }
    }

    const result = {
      success: true,
      chain: 'ethereum',
      network: 'sepolia',
      txHash: receipt.hash,
      tokenId,
      contractAddress,
      to: walletAddress,
      metadataUri,
      gasUsed: receipt.gasUsed.toString(),
      blockNumber: receipt.blockNumber,
      explorerUrl: `${config.explorerUrl}/tx/${receipt.hash}`
    };

    console.log('✅ Ethereum certificate minted:', result);
    return result;

  } catch (error) {
    console.error('❌ Ethereum minting failed:', error);
    
    // Parse common errors
    let errorMessage = error.message;
    if (error.code === 'INSUFFICIENT_FUNDS') {
      errorMessage = 'Insufficient ETH balance for gas fees';
    } else if (error.code === 'REPLACEMENT_UNDERPRICED') {
      errorMessage = 'Transaction replaced due to low gas price';
    } else if (error.message.includes('execution reverted')) {
      errorMessage = 'Smart contract execution failed';
    }

    return {
      success: false,
      chain: 'ethereum',
      network: 'sepolia',
      error: errorMessage,
      originalError: error.message
    };
  }
};

/**
 * Verify certificate exists on Ethereum
 */
export const verifyEthereumCertificate = async (tokenId, contractAddress) => {
  try {
    const config = getChainConfig('ethereum');
    const provider = new ethers.JsonRpcProvider(config.rpcUrl);
    const contract = new ethers.Contract(contractAddress, CERTIFICATE_ABI, provider);
    
    const owner = await contract.ownerOf(tokenId);
    const tokenUri = await contract.tokenURI(tokenId);
    
    return {
      exists: true,
      owner,
      tokenUri,
      tokenId
    };
    
  } catch (error) {
    return {
      exists: false,
      error: error.message
    };
  }
};

/**
 * Get certificate contract info
 */
export const getEthereumContractInfo = async () => {
  try {
    const config = getChainConfig('ethereum');
    const contractAddress = process.env.CERT_ETH_CONTRACT || config.contracts.certificateNFT;
    
    if (!contractAddress || contractAddress === '0x0000000000000000000000000000000000000000') {
      return {
        deployed: false,
        message: 'Contract not deployed'
      };
    }

    const provider = new ethers.JsonRpcProvider(config.rpcUrl);
    const contract = new ethers.Contract(contractAddress, CERTIFICATE_ABI, provider);
    
    const totalSupply = await contract.totalSupply();
    
    return {
      deployed: true,
      contractAddress,
      totalSupply: totalSupply.toString(),
      network: 'Sepolia',
      explorerUrl: `${config.explorerUrl}/address/${contractAddress}`
    };
    
  } catch (error) {
    return {
      deployed: false,
      error: error.message
    };
  }
};

export default {
  mintEthereumCertificate,
  verifyEthereumCertificate,
  getEthereumContractInfo
};