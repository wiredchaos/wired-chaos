import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import './Verify.css';

const Verify = () => {
  const { type, tx } = useParams();
  const navigate = useNavigate();

  // Verify credential based on type and transaction hash
  const isValid = () => {
    if (type === 'pose' && tx?.startsWith('POSE_')) {
      return true;
    }
    if (type === 'posm' && tx?.startsWith('POSM_')) {
      return true;
    }
    return false;
  };

  const getCredentialType = () => {
    if (type === 'pose') return 'Proof of School - Enrollment (PoS-E)';
    if (type === 'posm') return 'Proof of School - Mastery (PoS-M)';
    return 'Unknown Credential';
  };

  const handlePrint = () => {
    window.print();
  };

  const valid = isValid();

  return (
    <div className="verify-page">
      <div className="verify-container">
        <Card className="verify-card">
          <div className="verify-header">
            <h1>🎓 WIRED CHAOS UNIVERSITY</h1>
            <h2>Credential Verification</h2>
          </div>

          <div className={`verify-status ${valid ? 'valid' : 'invalid'}`}>
            <div className="status-icon">
              {valid ? '✓' : '✗'}
            </div>
            <div className="status-text">
              {valid ? 'VALID' : 'INVALID'}
            </div>
          </div>

          <div className="verify-details">
            <div className="detail-row">
              <span className="detail-label">Credential Type:</span>
              <span className="detail-value">{getCredentialType()}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Transaction Hash:</span>
              <span className="detail-value tx-hash">{tx}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Network:</span>
              <span className="detail-value">XRPL (Stubbed)</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Verified:</span>
              <span className="detail-value">{new Date().toLocaleString()}</span>
            </div>
          </div>

          {valid && (
            <div className="verify-message">
              <p>
                This credential has been verified on the WIRED CHAOS UNIVERSITY platform.
                The holder has successfully {type === 'pose' ? 'enrolled in' : 'completed mastery requirements for'}
                {' '}the WCU program.
              </p>
              {type === 'posm' && (
                <p className="mastery-note">
                  This Proof of School - Mastery NFT represents completion of a quest set
                  and demonstrates proficiency in the covered modules.
                </p>
              )}
            </div>
          )}

          {!valid && (
            <div className="verify-message error">
              <p>
                This credential could not be verified. Please check the transaction hash
                and credential type.
              </p>
            </div>
          )}

          <div className="verify-actions">
            <Button onClick={() => navigate('/university')} className="btn-primary">
              ← Back to University
            </Button>
            <Button onClick={handlePrint} className="btn-secondary no-print">
              🖨️ Print Certificate
            </Button>
          </div>

          <div className="verify-footer">
            <p>WIRED CHAOS UNIVERSITY • Proof of School on XRPL</p>
            <p className="verify-url">{window.location.href}</p>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Verify;
