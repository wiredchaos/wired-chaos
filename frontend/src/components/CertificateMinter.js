/**
 * WIRED CHAOS - Certificate Minting Interface
 * Multi-chain NFT certificate creation system
 */
import React, { useState, useEffect } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { CHAIN_NAMES, getEnabledChains } from '../chains/config';
import { getAllCourses } from '../lib/cert';
import { BACKEND_URL } from '../config/env';
import './CertificateMinter.css';

const CertificateMinter = () => {
  const [formData, setFormData] = useState({
    chain: 'ethereum',
    studentName: '',
    walletAddress: '',
    courseId: '',
    courseName: '',
    completionDate: new Date().toISOString().split('T')[0],
    grade: '',
    instructor: 'NEURO META X'
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [errors, setErrors] = useState({});
  const [courses] = useState(getAllCourses());

  const supportedChains = getEnabledChains();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }

    // Auto-fill course name when course ID is selected
    if (name === 'courseId' && value) {
      const course = courses.find(c => c.id === value);
      if (course) {
        setFormData(prev => ({
          ...prev,
          courseName: course.name
        }));
      }
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.studentName.trim()) {
      newErrors.studentName = 'Student name is required';
    }

    if (!formData.walletAddress.trim()) {
      newErrors.walletAddress = 'Wallet address is required';
    }

    if (!formData.courseId.trim()) {
      newErrors.courseId = 'Course selection is required';
    }

    if (!formData.courseName.trim()) {
      newErrors.courseName = 'Course name is required';
    }

    // Basic wallet address format validation
    const { chain, walletAddress } = formData;
    if (walletAddress) {
      if (chain === 'ethereum' && !walletAddress.match(/^0x[a-fA-F0-9]{40}$/)) {
        newErrors.walletAddress = 'Invalid Ethereum address format';
      } else if (chain === 'solana' && (walletAddress.length < 32 || walletAddress.length > 44)) {
        newErrors.walletAddress = 'Invalid Solana address format';
      } else if (chain === 'xrpl' && !walletAddress.match(/^r[a-zA-Z0-9]{24,34}$/)) {
        newErrors.walletAddress = 'Invalid XRPL address format';
      } else if (chain === 'hedera' && !walletAddress.match(/^0\.0\.\d+$/)) {
        newErrors.walletAddress = 'Invalid Hedera account ID format (0.0.xxxxx)';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setResult(null);

    try {
      const response = await fetch(`${BACKEND_URL}/api/cert/mint`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chain: formData.chain,
          to: formData.walletAddress,
          studentName: formData.studentName,
          courseId: formData.courseId,
          courseName: formData.courseName,
          completionDate: formData.completionDate,
          grade: formData.grade || null,
          instructor: formData.instructor || null
        })
      });

      const data = await response.json();
      
      if (response.ok) {
        setResult(data);
        
        // Reset form on success
        if (data.success) {
          setFormData({
            chain: formData.chain,
            studentName: '',
            walletAddress: '',
            courseId: '',
            courseName: '',
            completionDate: new Date().toISOString().split('T')[0],
            grade: '',
            instructor: 'NEURO META X'
          });
        }
      } else {
        setResult({
          success: false,
          error: data.detail || 'Minting failed'
        });
      }
    } catch (error) {
      console.error('Certificate minting error:', error);
      setResult({
        success: false,
        error: 'Network error. Please check your connection and try again.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="certificate-minter">
      <div className="minter-header">
        <h2>🎓 NEUROLAB ACADEMY Certificate Minter</h2>
        <p>Issue blockchain-verified certificates of completion</p>
      </div>

      <div className="minter-content">
        <Card className="minter-form-card">
          <form onSubmit={handleSubmit} className="cert-form">
            {/* Blockchain Selection */}
            <div className="form-group">
              <label htmlFor="chain">Blockchain Network *</label>
              <select
                id="chain"
                name="chain"
                value={formData.chain}
                onChange={handleInputChange}
                className="chain-select"
              >
                {supportedChains.map(chain => (
                  <option key={chain.key} value={chain.key}>
                    {chain.name} ({chain.config.name})
                  </option>
                ))}
              </select>
              <small className="help-text">
                All certificates are minted on TESTNET networks only
              </small>
            </div>

            {/* Student Information */}
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="studentName">Student Name *</label>
                <input
                  type="text"
                  id="studentName"
                  name="studentName"
                  value={formData.studentName}
                  onChange={handleInputChange}
                  className={errors.studentName ? 'error' : ''}
                  placeholder="Enter student's full name"
                />
                {errors.studentName && <span className="error-text">{errors.studentName}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="walletAddress">Wallet Address *</label>
                <input
                  type="text"
                  id="walletAddress"
                  name="walletAddress"
                  value={formData.walletAddress}
                  onChange={handleInputChange}
                  className={errors.walletAddress ? 'error' : ''}
                  placeholder={
                    formData.chain === 'ethereum' ? '0x...' :
                    formData.chain === 'solana' ? 'Base58 address' :
                    formData.chain === 'xrpl' ? 'r...' :
                    formData.chain === 'hedera' ? '0.0.xxxxx' : 'Wallet address'
                  }
                />
                {errors.walletAddress && <span className="error-text">{errors.walletAddress}</span>}
              </div>
            </div>

            {/* Course Information */}
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="courseId">Course *</label>
                <select
                  id="courseId"
                  name="courseId"
                  value={formData.courseId}
                  onChange={handleInputChange}
                  className={errors.courseId ? 'error' : ''}
                >
                  <option value="">Select a course</option>
                  {courses.map(course => (
                    <option key={course.id} value={course.id}>
                      {course.id} - {course.name}
                    </option>
                  ))}
                </select>
                {errors.courseId && <span className="error-text">{errors.courseId}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="courseName">Course Name *</label>
                <input
                  type="text"
                  id="courseName"
                  name="courseName"
                  value={formData.courseName}
                  onChange={handleInputChange}
                  className={errors.courseName ? 'error' : ''}
                  placeholder="Course name (auto-filled)"
                />
                {errors.courseName && <span className="error-text">{errors.courseName}</span>}
              </div>
            </div>

            {/* Additional Information */}
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="completionDate">Completion Date</label>
                <input
                  type="date"
                  id="completionDate"
                  name="completionDate"
                  value={formData.completionDate}
                  onChange={handleInputChange}
                />
              </div>

              <div className="form-group">
                <label htmlFor="grade">Grade (Optional)</label>
                <input
                  type="text"
                  id="grade"
                  name="grade"
                  value={formData.grade}
                  onChange={handleInputChange}
                  placeholder="A, B+, 95%, etc."
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="instructor">Instructor</label>
              <input
                type="text"
                id="instructor"
                name="instructor"
                value={formData.instructor}
                onChange={handleInputChange}
                placeholder="NEURO META X"
              />
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              className="mint-button"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <span className="loading-spinner"></span>
                  Minting Certificate...
                </>
              ) : (
                `🎓 Mint Certificate on ${CHAIN_NAMES[formData.chain]}`
              )}
            </Button>
          </form>
        </Card>

        {/* Result Display */}
        {result && (
          <Card className={`result-card ${result.success ? 'success' : 'error'}`}>
            <div className="result-header">
              <h3>
                {result.success ? '✅ Certificate Minted Successfully!' : '❌ Minting Failed'}
              </h3>
            </div>
            
            <div className="result-content">
              {result.success ? (
                <div className="success-details">
                  <p><strong>Chain:</strong> {result.chain} ({result.network})</p>
                  {result.data?.txHash && (
                    <p><strong>Transaction:</strong> 
                      <a href={result.data.explorerUrl} target="_blank" rel="noopener noreferrer">
                        {result.data.txHash.substring(0, 20)}...
                      </a>
                    </p>
                  )}
                  {result.data?.tokenId && (
                    <p><strong>Token ID:</strong> {result.data.tokenId}</p>
                  )}
                  {result.data?.mintAddress && (
                    <p><strong>Mint Address:</strong> {result.data.mintAddress.substring(0, 20)}...</p>
                  )}
                  {result.data?.nftokenId && (
                    <p><strong>NFToken ID:</strong> {result.data.nftokenId.substring(0, 20)}...</p>
                  )}
                </div>
              ) : (
                <div className="error-details">
                  <p><strong>Error:</strong> {result.error}</p>
                  {result.data?.stub && (
                    <p><em>This feature is coming soon!</em></p>
                  )}
                </div>
              )}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};

export default CertificateMinter;