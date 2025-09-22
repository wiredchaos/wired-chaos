/**
 * WIRED CHAOS - NEURO LAB Hologram Component (Enhanced)
 * Business hologram with cycling images, audio effects, and voice synthesis
 */
import React, { useState, useEffect, useRef } from 'react';
import './NeuroHologram.css';

const NeuroHologram = ({ 
  isOpen, 
  onClose, 
  images = [],
  voiceIntro = "Transmission online. Neuro Lab engaged. Business systems syncing. Brains chains.",
  audioConfig = { frequency: 72, type: 'sawtooth', gain: 0.06 },
  voiceConfig = { rate: 0.98, pitch: 1.02 }
}) => {
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

  // Create hologram audio hum
  const createHologramHum = () => {
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
        oscillatorRef.current = audioContextRef.current.createOscillator();
        const gainNode = audioContextRef.current.createGain();
        
        oscillatorRef.current.type = audioConfig.type;
        oscillatorRef.current.frequency.value = audioConfig.frequency;
        gainNode.gain.value = 0.0001;
        
        // Gradual gain ramp to avoid audio pops
        gainNode.gain.exponentialRampToValueAtTime(
          audioConfig.gain, 
          audioContextRef.current.currentTime + 0.5
        );
        
        oscillatorRef.current.connect(gainNode);
        gainNode.connect(audioContextRef.current.destination);
        oscillatorRef.current.start();
      }
    } catch (error) {
      console.warn('Audio context not supported:', error);
    }
  };

  // Stop hologram audio
  const stopHologramHum = () => {
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

  // Voice synthesis for intro
  const speakIntro = () => {
    try {
      if (!('speechSynthesis' in window)) return;
      
      // Cancel any existing speech
      speechSynthesis.cancel();
      
      const utterance = new SpeechSynthesisUtterance(voiceIntro);
      utterance.lang = 'en-US';
      utterance.rate = voiceConfig.rate;
      utterance.pitch = voiceConfig.pitch;
      utterance.volume = 1;
      
      speechSynthesis.speak(utterance);
    } catch (error) {
      console.warn('Speech synthesis not supported:', error);
    }
  };

  // Start image cycling
  const startImageCycle = () => {
    if (imageUrls.length > 1) {
      cycleIntervalRef.current = setInterval(() => {
        setCurrentImageIndex((prevIndex) => (prevIndex + 1) % imageUrls.length);
      }, 4600); // Slightly slower cycling for enhanced experience
    }
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
      createHologramHum();
      speakIntro();
    } else {
      stopImageCycle();
      stopHologramHum();
      // Cancel speech when closing
      if ('speechSynthesis' in window) {
        speechSynthesis.cancel();
      }
    }

    // Cleanup on component unmount
    return () => {
      stopImageCycle();
      stopHologramHum();
      if ('speechSynthesis' in window) {
        speechSynthesis.cancel();
      }
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
    <div className="holo-modal open" onClick={onClose} aria-hidden="false">
      <div className="holo-content stage" onClick={(e) => e.stopPropagation()} role="dialog" aria-label="Business Neuro Hologram">
        {/* Enhanced close button */}
        <div className="close-x x" onClick={onClose}>✕</div>
        
        {/* Holographic base disc */}
        <div className="holo-disc disc"></div>
        
        {/* Light beam effect */}
        <div className="holo-beam beam"></div>
        
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
          
          {/* Enhanced scan lines effect */}
          <div className="holo-scanlines scan"></div>
        </div>
        
        {/* NEURO LAB branding */}
        <div className="neuro-branding">
          <h2>🧠 NEURO LAB HOLOGRAM</h2>
          <p>Business Portal • Web3 Onboarding</p>
        </div>
        
        {/* Enhanced audio and system indicators */}
        <div className="audio-indicator">
          <div className="audio-wave"></div>
          <span>HOLOGRAM ACTIVE • {audioConfig.frequency}Hz {audioConfig.type.toUpperCase()}</span>
        </div>

        {/* Image counter with navigation */}
        <div className="holo-counter">
          <button 
            className="nav-btn prev" 
            onClick={(e) => {
              e.stopPropagation();
              setCurrentImageIndex(prev => prev === 0 ? imageUrls.length - 1 : prev - 1);
            }}
          >
            ◀
          </button>
          <span>{currentImageIndex + 1} / {imageUrls.length}</span>
          <button 
            className="nav-btn next" 
            onClick={(e) => {
              e.stopPropagation();
              setCurrentImageIndex(prev => (prev + 1) % imageUrls.length);
            }}
          >
            ▶
          </button>
        </div>
      </div>
    </div>
  );
};

export default NeuroHologram;