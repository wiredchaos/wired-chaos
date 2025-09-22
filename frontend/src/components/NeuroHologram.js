/**
 * WIRED CHAOS - NEURO LAB Hologram Component
 * Business hologram with cycling images and audio effects
 */
import React, { useState, useEffect, useRef } from 'react';
import './NeuroHologram.css';

const NeuroHologram = ({ isOpen, onClose, images = [] }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const audioContextRef = useRef(null);
  const oscillatorRef = useRef(null);
  const cycleIntervalRef = useRef(null);

  // Default hologram images - can be overridden via props
  const defaultImages = [
    '/images/business1.png',
    '/images/business2.png', 
    '/images/portal_echo.png',
    '/images/neuro_brain.png',
    '/images/wired_chaos_logo.png'
  ];

  const imageUrls = images.length > 0 ? images : defaultImages;

  // Start hologram audio effect
  const startAudio = () => {
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
        oscillatorRef.current = audioContextRef.current.createOscillator();
        const gainNode = audioContextRef.current.createGain();
        
        oscillatorRef.current.type = 'sawtooth';
        oscillatorRef.current.frequency.value = 72; // Deep hologram hum
        gainNode.gain.value = 0.05; // Low volume
        
        oscillatorRef.current.connect(gainNode);
        gainNode.connect(audioContextRef.current.destination);
        oscillatorRef.current.start();
      }
    } catch (error) {
      console.warn('Audio context not supported:', error);
    }
  };

  // Stop hologram audio effect
  const stopAudio = () => {
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

  // Start image cycling
  const startImageCycle = () => {
    cycleIntervalRef.current = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % imageUrls.length);
    }, 4500); // Change image every 4.5 seconds
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
      startAudio();
    } else {
      stopImageCycle();
      stopAudio();
    }

    // Cleanup on component unmount
    return () => {
      stopImageCycle();
      stopAudio();
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
    <div className="holo-modal open" onClick={onClose}>
      <div className="holo-content" onClick={(e) => e.stopPropagation()}>
        {/* Holographic base disc */}
        <div className="holo-disc"></div>
        
        {/* Light beam effect */}
        <div className="holo-beam"></div>
        
        {/* Floating hologram with cycling images */}
        <div className="holo">
          <img 
            id="holoImage" 
            src={imageUrls[currentImageIndex]} 
            alt="Neuro Hologram"
            onError={(e) => {
              // Fallback to a default if image fails to load
              e.target.src = '/images/neuro_fallback.jpg';
            }}
          />
          
          {/* Hologram scan lines effect */}
          <div className="holo-scanlines"></div>
          
          {/* Image counter */}
          <div className="holo-counter">
            {currentImageIndex + 1} / {imageUrls.length}
          </div>
        </div>
        
        {/* NEURO LAB branding */}
        <div className="neuro-branding">
          <h2>🧠 NEURO LAB HOLOGRAM</h2>
          <p>Business Portal • Web3 Onboarding</p>
        </div>
        
        {/* Close button */}
        <div className="close-x" onClick={onClose}>✕</div>
        
        {/* Audio indicator */}
        <div className="audio-indicator">
          <div className="audio-wave"></div>
          <span>HOLOGRAM ACTIVE</span>
        </div>
      </div>
    </div>
  );
};

export default NeuroHologram;