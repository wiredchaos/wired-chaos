/**
 * Tax Suite Page Component
 * Displays Tax Suite launch interface or URL not configured message
 */
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import { getTaxSuiteUrl } from '../utils/env';

const TaxSuite = () => {
  const navigate = useNavigate();
  const taxSuiteUrl = getTaxSuiteUrl();

  const handleLaunchTaxSuite = () => {
    if (taxSuiteUrl) {
      window.open(taxSuiteUrl, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div className="tax-suite-page" style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem',
      background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 100%)'
    }}>
      <div className="page-header" style={{ marginBottom: '2rem', textAlign: 'center' }}>
        <Button onClick={() => navigate('/')} className="back-btn" style={{ marginBottom: '1rem' }}>
          ← Back to Hub
        </Button>
        <h1 style={{ 
          fontSize: '3rem', 
          color: '#00FFFF', 
          textShadow: '0 0 10px rgba(0, 255, 255, 0.5)',
          marginBottom: '1rem'
        }}>
          Tax Suite
        </h1>
        <p style={{ color: 'rgba(255, 255, 255, 0.8)' }}>
          Professional Tax Management Portal
        </p>
      </div>

      <div style={{
        padding: '2rem',
        border: '1px solid #00FFFF',
        borderRadius: '0.5rem',
        background: 'rgba(0, 0, 0, 0.6)',
        backdropFilter: 'blur(8px)',
        maxWidth: '600px',
        textAlign: 'center'
      }}>
        {taxSuiteUrl ? (
          <>
            <p style={{ color: 'rgba(255, 255, 255, 0.9)', marginBottom: '1.5rem' }}>
              Click below to launch the Tax Suite portal
            </p>
            <Button 
              onClick={handleLaunchTaxSuite}
              style={{
                background: '#00FFFF',
                color: '#000',
                padding: '0.75rem 2rem',
                fontSize: '1.1rem',
                fontWeight: 'bold',
                border: 'none',
                borderRadius: '0.25rem',
                cursor: 'pointer'
              }}
            >
              Launch Tax Suite →
            </Button>
          </>
        ) : (
          <>
            <div style={{ 
              fontSize: '3rem', 
              marginBottom: '1rem',
              opacity: 0.6 
            }}>
              🔒
            </div>
            <p style={{ 
              color: '#FF3131', 
              fontWeight: 'bold',
              marginBottom: '1rem',
              fontSize: '1.1rem'
            }}>
              Launch Tax Suite (URL not configured)
            </p>
            <p style={{ 
              color: 'rgba(255, 255, 255, 0.6)',
              fontSize: '0.9rem'
            }}>
              The Tax Suite URL has not been configured in the environment variables.
              Please set REACT_APP_TAX_SUITE_URL to enable this feature.
            </p>
          </>
        )}
      </div>
    </div>
  );
};

export default TaxSuite;
