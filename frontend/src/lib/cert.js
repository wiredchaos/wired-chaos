/**
 * WIRED CHAOS - Certificate Builder & Utilities
 * Core certificate metadata and validation logic
 */

import { CERT_CONFIG } from '../chains/config';
import { createCertificateMetadata } from './ipfs';

/**
 * Build comprehensive certificate metadata
 */
export const buildCertMetadata = (certData) => {
  const {
    studentName,
    courseId,
    courseName,
    chain,
    walletAddress,
    completionDate,
    grade,
    instructor
  } = certData;

  // Validate required fields
  if (!studentName || !courseId || !courseName || !chain) {
    throw new Error('Missing required certificate data: studentName, courseId, courseName, chain');
  }

  const timestamp = completionDate ? new Date(completionDate) : new Date();
  const certificateId = generateCertificateId(courseId, studentName, timestamp);

  const metadata = {
    // Standard NFT Metadata
    name: `${courseName} - Certificate of Completion`,
    description: `${CERT_CONFIG.description}\n\nStudent: ${studentName}\nCourse: ${courseName}\nCourse ID: ${courseId}\nCompletion Date: ${timestamp.toLocaleDateString()}\nCertificate ID: ${certificateId}`,
    image: CERT_CONFIG.issuerLogo,
    external_url: CERT_CONFIG.externalUrl,
    
    // OpenSea-compatible attributes
    attributes: [
      {
        trait_type: 'Student Name',
        value: studentName
      },
      {
        trait_type: 'Course Name',
        value: courseName
      },
      {
        trait_type: 'Course ID',
        value: courseId
      },
      {
        trait_type: 'Academy',
        value: CERT_CONFIG.issuer
      },
      {
        trait_type: 'Completion Date',
        display_type: 'date',
        value: Math.floor(timestamp.getTime() / 1000) // Unix timestamp
      },
      {
        trait_type: 'Blockchain',
        value: chain.charAt(0).toUpperCase() + chain.slice(1)
      },
      {
        trait_type: 'Certificate ID',
        value: certificateId
      }
    ],

    // Extended properties
    properties: {
      // Core certificate data
      academy: CERT_CONFIG.issuer,
      category: 'Education',
      type: 'Course Completion Certificate',
      version: '1.0',
      
      // Academic details
      student: {
        name: studentName,
        wallet: walletAddress
      },
      course: {
        id: courseId,
        name: courseName,
        instructor: instructor || 'NEURO META X',
        completion_date: timestamp.toISOString()
      },
      
      // Blockchain details
      blockchain: {
        network: chain,
        testnet: true
      },
      
      // Verification
      certificate_id: certificateId,
      issued_at: new Date().toISOString(),
      valid: true
    }
  };

  // Add grade if provided
  if (grade) {
    metadata.attributes.push({
      trait_type: 'Grade',
      value: grade
    });
    metadata.properties.course.grade = grade;
  }

  // Add instructor if provided
  if (instructor) {
    metadata.attributes.push({
      trait_type: 'Instructor',
      value: instructor
    });
  }

  return metadata;
};

/**
 * Generate unique certificate ID
 */
export const generateCertificateId = (courseId, studentName, timestamp) => {
  const dateStr = timestamp.toISOString().split('T')[0].replace(/-/g, '');
  const nameHash = simpleHash(studentName);
  const courseHash = simpleHash(courseId);
  
  return `WC-${dateStr}-${courseHash}-${nameHash}`.toUpperCase();
};

/**
 * Simple hash function for generating short IDs
 */
const simpleHash = (str) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash).toString(36).substr(0, 6).toUpperCase();
};

/**
 * Validate certificate data before minting
 */
export const validateCertificateData = (certData) => {
  const errors = [];

  // Required fields
  if (!certData.studentName || certData.studentName.trim().length === 0) {
    errors.push('Student name is required');
  }

  if (!certData.courseId || certData.courseId.trim().length === 0) {
    errors.push('Course ID is required');
  }

  if (!certData.courseName || certData.courseName.trim().length === 0) {
    errors.push('Course name is required');
  }

  if (!certData.chain) {
    errors.push('Blockchain chain is required');
  }

  if (!certData.walletAddress || certData.walletAddress.trim().length === 0) {
    errors.push('Wallet address is required');
  }

  // Validate wallet address format (basic validation)
  if (certData.walletAddress) {
    const { chain, walletAddress } = certData;
    
    if (chain === 'ethereum' && !walletAddress.match(/^0x[a-fA-F0-9]{40}$/)) {
      errors.push('Invalid Ethereum wallet address format');
    }
    
    if (chain === 'solana' && (walletAddress.length < 32 || walletAddress.length > 44)) {
      errors.push('Invalid Solana wallet address format');
    }
    
    if (chain === 'xrpl' && !walletAddress.match(/^r[a-zA-Z0-9]{24,34}$/)) {
      errors.push('Invalid XRPL wallet address format');
    }
    
    if (chain === 'hedera' && !walletAddress.match(/^0\.0\.\d+$/)) {
      errors.push('Invalid Hedera account ID format (expected: 0.0.xxxxx)');
    }
  }

  // Validate completion date
  if (certData.completionDate) {
    const date = new Date(certData.completionDate);
    if (isNaN(date.getTime())) {
      errors.push('Invalid completion date format');
    }
    if (date > new Date()) {
      errors.push('Completion date cannot be in the future');
    }
  }

  return {
    valid: errors.length === 0,
    errors
  };
};

/**
 * Generate certificate image URL based on template
 */
export const generateCertificateImageUrl = (certData) => {
  // In a real implementation, this would generate a custom certificate image
  // For now, return a template URL with query parameters for customization
  const params = new URLSearchParams({
    student: certData.studentName,
    course: certData.courseName,
    date: new Date(certData.completionDate || Date.now()).toLocaleDateString(),
    chain: certData.chain
  });
  
  return `https://wiredchaos.xyz/api/certificate/image?${params.toString()}`;
};

/**
 * Course registry with predefined courses
 */
export const COURSE_REGISTRY = {
  'WC-001': {
    id: 'WC-001',
    name: 'Blockchain Fundamentals',
    description: 'Introduction to blockchain technology and cryptocurrency',
    duration: '4 weeks',
    level: 'Beginner'
  },
  'WC-002': {
    id: 'WC-002', 
    name: 'Smart Contract Development',
    description: 'Learn to build and deploy smart contracts on Ethereum',
    duration: '6 weeks',
    level: 'Intermediate'
  },
  'WC-003': {
    id: 'WC-003',
    name: 'DeFi Protocols & Strategies',
    description: 'Deep dive into decentralized finance protocols',
    duration: '8 weeks',
    level: 'Advanced'
  },
  'WC-004': {
    id: 'WC-004',
    name: 'NFT Creation & Marketing',
    description: 'Create, mint, and market NFT collections',
    duration: '5 weeks',
    level: 'Intermediate'
  },
  'WC-005': {
    id: 'WC-005',
    name: 'Multi-Chain Development',
    description: 'Build applications across multiple blockchains',
    duration: '10 weeks',
    level: 'Advanced'
  }
};

/**
 * Get course details by ID
 */
export const getCourseById = (courseId) => {
  return COURSE_REGISTRY[courseId] || null;
};

/**
 * Get all available courses
 */
export const getAllCourses = () => {
  return Object.values(COURSE_REGISTRY);
};

export default {
  buildCertMetadata,
  generateCertificateId,
  validateCertificateData,
  generateCertificateImageUrl,
  getCourseById,
  getAllCourses,
  COURSE_REGISTRY
};