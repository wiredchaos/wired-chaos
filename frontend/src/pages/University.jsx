import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import './University.css';

const University = () => {
  const navigate = useNavigate();
  const wcRef = useRef(null);
  const [userId] = useState(() => {
    // Get or generate user ID
    let uid = localStorage.getItem('wc.userId');
    if (!uid) {
      uid = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem('wc.userId', uid);
    }
    return uid;
  });
  const [wallet] = useState(() => localStorage.getItem('wc.wallet') || null);

  useEffect(() => {
    // Load the web component script
    const script = document.createElement('script');
    script.src = '/wc-university.js';
    script.async = true;
    document.body.appendChild(script);

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

  useEffect(() => {
    // Set up event listeners for the web component
    const handleProgress = (e) => {
      console.log('Progress updated:', e.detail);
      // Could sync to server here
      fetch('/api/university/progress/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, state: e.detail.state })
      }).catch(err => console.warn('Failed to save progress:', err));
    };

    const handleXP = (e) => {
      console.log('XP awarded:', e.detail);
    };

    const handleBadge = (e) => {
      console.log('Badge earned:', e.detail);
    };

    const handleEnrollmentReady = async (e) => {
      console.log('Enrollment ready:', e.detail);
      
      try {
        const response = await fetch('/api/pos/enroll/issue', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(e.detail)
        });
        
        const result = await response.json();
        
        // Send credential back to web component
        if (wcRef.current) {
          wcRef.current.dispatchEvent(new CustomEvent('wc-university:credential:pose', {
            detail: {
              tx_hash: result.tx_hash,
              credential_url: result.credential_url
            }
          }));
        }
      } catch (error) {
        console.error('Enrollment failed:', error);
      }
    };

    const handleMintPoSM = async (e) => {
      console.log('Mint PoS-M:', e.detail);
      
      try {
        const response = await fetch('/api/pos/mastery/mint', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(e.detail)
        });
        
        const result = await response.json();
        
        // Send credential back to web component
        if (wcRef.current) {
          wcRef.current.dispatchEvent(new CustomEvent('wc-university:credential:posm', {
            detail: {
              bundle: e.detail,
              tx_hash: result.tx_hash,
              credential_url: result.credential_url
            }
          }));
        }
        
        // Navigate to verify page
        if (result.tx_hash) {
          setTimeout(() => {
            navigate(`/verify/posm/${result.tx_hash}`);
          }, 2000);
        }
      } catch (error) {
        console.error('Mint failed:', error);
      }
    };

    const element = wcRef.current;
    if (element) {
      element.addEventListener('wc-university:progress', handleProgress);
      element.addEventListener('wc-university:xp', handleXP);
      element.addEventListener('wc-university:badge', handleBadge);
      element.addEventListener('wc-university:enrollment:ready', handleEnrollmentReady);
      element.addEventListener('wc-university:mint-posm', handleMintPoSM);
    }

    return () => {
      if (element) {
        element.removeEventListener('wc-university:progress', handleProgress);
        element.removeEventListener('wc-university:xp', handleXP);
        element.removeEventListener('wc-university:badge', handleBadge);
        element.removeEventListener('wc-university:enrollment:ready', handleEnrollmentReady);
        element.removeEventListener('wc-university:mint-posm', handleMintPoSM);
      }
    };
  }, [userId, wallet, navigate]);

  const curriculum = [
    {
      id: 'A',
      name: 'Foundation',
      modules: [
        { id: 'A1', name: 'Introduction to Blockchain' },
        { id: 'A2', name: 'Cryptography Basics' },
        { id: 'A3', name: 'Decentralization Principles' }
      ]
    },
    {
      id: 'B',
      name: 'XRPL Development',
      modules: [
        { id: 'B1', name: 'XRPL Architecture' },
        { id: 'B2', name: 'Account Management' },
        { id: 'B3', name: 'Payment Channels' },
        { id: 'B4', name: 'Hooks & Smart Contracts' }
      ]
    },
    {
      id: 'C',
      name: 'Token Economics',
      modules: [
        { id: 'C1', name: 'Fungible Tokens (XRP, ERC-20)' },
        { id: 'C2', name: 'Non-Fungible Tokens (NFTs)' },
        { id: 'C3', name: 'DeFi Protocols' },
        { id: 'C4', name: 'Tokenomics Design' }
      ]
    },
    {
      id: 'D',
      name: 'Web3 Development',
      modules: [
        { id: 'D1', name: 'dApp Architecture' },
        { id: 'D2', name: 'Wallet Integration' },
        { id: 'D3', name: 'Smart Contract Development' },
        { id: 'D4', name: 'Frontend Integration' }
      ]
    },
    {
      id: 'E',
      name: 'Security & Best Practices',
      modules: [
        { id: 'E1', name: 'Cryptographic Security' },
        { id: 'E2', name: 'Smart Contract Auditing' },
        { id: 'E3', name: 'Operational Security' },
        { id: 'E4', name: 'Incident Response' }
      ]
    },
    {
      id: 'F',
      name: 'Community & Governance',
      modules: [
        { id: 'F1', name: 'DAO Structures' },
        { id: 'F2', name: 'Governance Mechanisms' },
        { id: 'F3', name: 'Community Building' },
        { id: 'F4', name: 'Decentralized Identity' }
      ]
    },
    {
      id: 'G',
      name: 'Advanced Topics',
      modules: [
        { id: 'G1', name: 'Layer 2 Scaling' },
        { id: 'G2', name: 'Cross-Chain Interoperability' },
        { id: 'G3', name: 'Zero-Knowledge Proofs' },
        { id: 'G4', name: 'MEV & Advanced Trading' }
      ]
    },
    {
      id: 'H',
      name: 'Real-World Applications',
      modules: [
        { id: 'H1', name: 'Supply Chain' },
        { id: 'H2', name: 'Digital Identity' },
        { id: 'H3', name: 'Healthcare & Records' },
        { id: 'H4', name: 'Gaming & Metaverse' }
      ]
    },
    {
      id: 'I',
      name: 'Capstone Projects',
      modules: [
        { id: 'I1', name: 'Project Planning' },
        { id: 'I2', name: 'Implementation' },
        { id: 'I3', name: 'Testing & Deployment' },
        { id: 'I4', name: 'Presentation & Defense' }
      ]
    }
  ];

  return (
    <div className="university-page">
      <div className="page-header">
        <Button onClick={() => navigate('/')} className="back-btn">
          ← Back to Hub
        </Button>
      </div>
      
      <wc-university
        ref={wcRef}
        user-id={userId}
        wallet={wallet}
        curriculum={JSON.stringify(curriculum)}
      />
    </div>
  );
};

export default University;
