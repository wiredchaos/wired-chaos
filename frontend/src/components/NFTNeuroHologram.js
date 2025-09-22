/**
 * WIRED CHAOS - NFT NEURO HOLOGRAM Component
 * Glitch-enhanced hologram for NFT collections and digital assets
 */
import React, { useState, useEffect, useRef } from 'react';
import './NFTNeuroHologram.css';

const NFTNeuroHologram = ({ isOpen, onClose, nftImages = [] }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const audioContextRef = useRef(null);
  const oscillatorRef = useRef(null);
  const cycleIntervalRef = useRef(null);

  // Default NFT hologram images - can be overridden via props
  const defaultNFTImages = [
    '/images/neurokiba.png',
    '/images/portal_echo.png', 
    '/images/doginal_dog1787.png',
    '/images/nft_brain_meta.png',
    '/images/wired_chaos_nft.png'
  ];

  const imageUrls = nftImages.length > 0 ? nftImages : defaultNFTImages;

  // Start NFT hologram audio effect (66Hz square wave)
  const playHum = () => {
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
        oscillatorRef.current = audioContextRef.current.createOscillator();
        const gainNode = audioContextRef.current.createGain();
        
        oscillatorRef.current.type = 'square'; // Different from business hologram
        oscillatorRef.current.frequency.value = 66; // Lower frequency for NFT vibe
        gainNode.gain.value = 0.04; // Slightly quieter
        
        oscillatorRef.current.connect(gainNode);
        gainNode.connect(audioContextRef.current.destination);
        oscillatorRef.current.start();
      }
    } catch (error) {
      console.warn('Audio context not supported:', error);
    }
  };

  // Stop NFT hologram audio effect
  const stopHum = () => {
    try {
      if (oscillatorRef.current) {
        oscillatorRef.current.stop();
        oscillatorRef.current.disconnect();
        oscillatorRef.current = null;
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
        audioContextRef.current = null;
      }
    } catch (error) {
      console.warn('Error stopping audio:', error);
    }
  };

  // Start NFT image cycling (4 second intervals)
  const startImageCycle = () => {
    cycleIntervalRef.current = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % imageUrls.length);
    }, 4000); // Faster cycling for NFTs
  };

  // Stop image cycling
  const stopImageCycle = () => {
    if (cycleIntervalRef.current) {
      clearInterval(cycleIntervalRef.current);
      cycleIntervalRef.current = null;
    }
  };

  // Handle modal open/close
  useEffect(() => {
    if (isOpen) {
      setCurrentImageIndex(0);
      startImageCycle();
      playHum();
    } else {
      stopImageCycle();
      stopHum();
    }

    // Cleanup on component unmount
    return () => {
      stopImageCycle();
      stopHum();
    };
  }, [isOpen]);

  // Handle ESC key to close
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEsc);
      return () => document.removeEventListener('keydown', handleEsc);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="nft-holo-modal open" onClick={onClose}>
      <div className="nft-holo-content" onClick={(e) => e.stopPropagation()}>
        {/* Holographic base disc - red theme for NFTs */}
        <div className="nft-holo-disc"></div>
        
        {/* Light beam effect */}
        <div className="nft-holo-beam"></div>
        
        {/* Floating hologram with glitch effects */}
        <div className="nft-holo glitch">
          <img 
            id="nftImage" 
            src={imageUrls[currentImageIndex]} 
            alt="NFT Neuro Hologram"
            onError={(e) => {
              // Fallback to a default if image fails to load
              e.target.src = '/images/nft_fallback.jpg';
            }}
          />
          
          {/* Enhanced glitch scan lines */}
          <div className="nft-glitch-overlay"></div>
        </div>
        
        {/* NFT NEURO META branding */}
        <div className="nft-neuro-branding">
          <h2>🐾🧠 NEURO META X</h2>
          <p>NFT Collection • Digital Assets Portal</p>
          <div className="nft-stats">
            <span className="nft-stat">COLLECTION: {currentImageIndex + 1}/{imageUrls.length}</span>
            <span className="nft-stat">STATUS: ACTIVATED</span>
          </div>
        </div>
        
        {/* Close button */}
        <div className="nft-close-x" onClick={onClose}>✕</div>
        
        {/* Audio and glitch indicators */}
        <div className="nft-system-status">
          <div className="nft-audio-indicator">
            <div className="nft-audio-wave"></div>
            <span>66Hz SQUARE WAVE</span>
          </div>
          <div className="glitch-indicator">
            <div className="glitch-bar"></div>
            <span>GLITCH ACTIVE</span>
          </div>
        </div>
        
        {/* NFT Collection Navigation */}
        <div className="nft-nav">
          <button 
            className="nft-nav-btn" 
            onClick={(e) => {
              e.stopPropagation();
              setCurrentImageIndex((prev) => prev === 0 ? imageUrls.length - 1 : prev - 1);
            }}
          >
            ◀ PREV
          </button>
          <div className="nft-index">
            {String(currentImageIndex + 1).padStart(2, '0')} / {String(imageUrls.length).padStart(2, '0')}
          </div>
          <button 
            className="nft-nav-btn" 
            onClick={(e) => {
              e.stopPropagation();
              setCurrentImageIndex((prev) => (prev + 1) % imageUrls.length);
            }}
          >
            NEXT ▶
          </button>
        </div>
      </div>
    </div>
  );
};

export default NFTNeuroHologram;