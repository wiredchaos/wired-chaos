/**
 * WIRED CHAOS - IPFS Metadata Pinning Service
 * Web3.Storage integration for NFT metadata
 */

import { IPFS_CONFIG } from '../chains/config';
import { IPFS_TOKEN } from '../config/env';

/**
 * Pin JSON metadata to IPFS using Web3.Storage
 */
export const pinMetadataToIPFS = async (metadata) => {
  try {
    if (!IPFS_TOKEN) {
      throw new Error('IPFS token not configured');
    }

    // Create a blob from the JSON metadata
    const jsonBlob = new Blob([JSON.stringify(metadata, null, 2)], {
      type: 'application/json'
    });

    // Create FormData for upload
    const formData = new FormData();
    formData.append('file', jsonBlob, `${metadata.name.replace(/\s+/g, '_')}_metadata.json`);

    // Upload to Web3.Storage
    const response = await fetch(IPFS_CONFIG.pinUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${IPFS_TOKEN}`,
      },
      body: formData
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`IPFS upload failed: ${response.status} - ${errorText}`);
    }

    const result = await response.json();
    
    // Web3.Storage returns a CID
    const cid = result.cid;
    const ipfsUrl = `${IPFS_CONFIG.gatewayUrl}${cid}`;
    
    console.log('✅ Metadata pinned to IPFS:', {
      cid,
      ipfsUrl,
      name: metadata.name
    });

    return {
      success: true,
      cid,
      ipfsUrl,
      gatewayUrl: ipfsUrl
    };

  } catch (error) {
    console.error('❌ IPFS pinning failed:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Pin image to IPFS (for certificate images)
 */
export const pinImageToIPFS = async (imageBlob, filename) => {
  try {
    if (!IPFS_TOKEN) {
      throw new Error('IPFS token not configured');
    }

    const formData = new FormData();
    formData.append('file', imageBlob, filename);

    const response = await fetch(IPFS_CONFIG.pinUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${IPFS_TOKEN}`,
      },
      body: formData
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Image upload failed: ${response.status} - ${errorText}`);
    }

    const result = await response.json();
    const cid = result.cid;
    const imageUrl = `${IPFS_CONFIG.gatewayUrl}${cid}`;

    return {
      success: true,
      cid,
      imageUrl
    };

  } catch (error) {
    console.error('❌ Image pinning failed:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Validate IPFS URL
 */
export const validateIPFS = (url) => {
  const ipfsRegex = /^(https?:\/\/)?(gateway\.pinata\.cloud|dweb\.link|ipfs\.io)\/ipfs\/[a-zA-Z0-9]+/;
  return ipfsRegex.test(url);
};

/**
 * Convert IPFS URL to different gateways
 */
export const convertIPFSUrl = (url, gateway = 'dweb.link') => {
  if (!url || !url.includes('/ipfs/')) return url;
  
  const cid = url.split('/ipfs/')[1];
  return `https://${gateway}/ipfs/${cid}`;
};

/**
 * Create metadata template for certificates
 */
export const createCertificateMetadata = (certData) => {
  const timestamp = new Date().toISOString();
  
  return {
    name: `${certData.courseName} - Certificate of Completion`,
    description: `This certificate verifies that ${certData.studentName} has successfully completed the ${certData.courseName} course at WIRED CHAOS NEUROLAB ACADEMY.`,
    image: certData.imageUrl || 'https://wiredchaos.xyz/images/certificate_template.png',
    external_url: 'https://wiredchaos.xyz/neurolab',
    attributes: [
      {
        trait_type: 'Student Name',
        value: certData.studentName
      },
      {
        trait_type: 'Course',
        value: certData.courseName
      },
      {
        trait_type: 'Course ID',
        value: certData.courseId
      },
      {
        trait_type: 'Academy',
        value: 'WIRED CHAOS NEUROLAB'
      },
      {
        trait_type: 'Issue Date',
        value: timestamp.split('T')[0] // YYYY-MM-DD format
      },
      {
        trait_type: 'Certificate Type',
        value: 'Course Completion'
      },
      {
        trait_type: 'Blockchain',
        value: certData.chain.toUpperCase()
      }
    ],
    properties: {
      academy: 'WIRED CHAOS NEUROLAB ACADEMY',
      category: 'Education',
      type: 'Certificate',
      issued: timestamp,
      version: '1.0'
    }
  };
};

export default {
  pinMetadataToIPFS,
  pinImageToIPFS,
  validateIPFS,
  convertIPFSUrl,
  createCertificateMetadata
};