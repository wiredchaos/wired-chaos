/**
 * WIRED CHAOS - Animated Motherboard Guide Component
 * Interactive tour guide that highlights different sections of the ecosystem
 */
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './AnimatedMotherboardGuide.css';

const AnimatedMotherboardGuide = ({ 
  isActive, 
  onClose, 
  onSectionHighlight,
  currentStep = 0 
}) => {
  const navigate = useNavigate();
  const [step, setStep] = useState(currentStep);
  const [isPlaying, setIsPlaying] = useState(false);
  const [highlightedSection, setHighlightedSection] = useState(null);
  const guideRef = useRef(null);

  // Guide tour steps with detailed information
  const tourSteps = [
    {
      id: 'welcome',
      title: '🧠 Welcome to WIRED CHAOS!',
      description: 'I\'m your AI Brain Assistant! Let me show you around our digital ecosystem motherboard.',
      section: null,
      position: { top: '50%', left: '50%' },
      duration: 4000,
      voiceText: 'Welcome to Wired Chaos! I am your brain assistant guide. Let me show you our amazing digital ecosystem.'
    },
    {
      id: 'neuro',
      title: '🧠 NEURO LAB',
      description: 'Your Web3 onboarding headquarters! Learn crypto, mint NFT certificates, and access AI-powered education.',
      section: 'neuro',
      position: { top: '8%', right: '15%' },
      duration: 6000,
      voiceText: 'This is Neuro Lab, your Web3 learning center with AI education and NFT certificates.',
      features: ['Web3 Onboarding', 'NFT Certificates', 'AI Education', 'Holographic UI']
    },
    {
      id: 'csn',
      title: '🚀 CRYPTO SPACES NET',
      description: 'Live streaming community hub for crypto discussions, spaces, and real-time interactions.',
      section: 'csn',
      position: { top: '8%', left: '15%' },
      duration: 5000,
      voiceText: 'Crypto Spaces Net is our live streaming community where crypto discussions happen in real time.',
      features: ['Live Streaming', 'Community Spaces', 'Real-time Chat', 'Event Scheduling']
    },
    {
      id: 'bwb',
      title: '📰 BARBED WIRED BROADCAST',
      description: 'News and blog network with RSS feeds, featuring latest crypto and tech updates.',
      section: 'bwb',
      position: { top: '30%', right: '8%' },
      duration: 5000,
      voiceText: 'Barbed Wired Broadcast delivers the latest news and blog content through RSS feeds.',
      features: ['RSS Integration', 'Blog Network', 'News Updates', 'Content Curation']
    },
    {
      id: 'vault33',
      title: '🔐 VAULT 33',
      description: 'Gamification system with whitelist tracking, Merovingian fragments, and advanced rewards.',
      section: 'vault33',
      position: { bottom: '30%', left: '8%' },
      duration: 6000,
      voiceText: 'Vault 33 is our gamification hub with whitelist tracking and mysterious Merovingian fragments.',
      features: ['WL Gamification', 'Merovingian System', 'Fragment Rewards', 'Discord/Telegram Bots']
    },
    {
      id: 'fm333',
      title: '📻 33.3 FM',
      description: 'Audio content hub and radio streaming with live broadcasts and podcast integration.',
      section: 'fm333',
      position: { top: '30%', left: '8%' },
      duration: 5000,
      voiceText: 'Tune into 33.3 FM for audio content, live broadcasts, and podcast streams.',
      features: ['Live Radio', 'Podcast Integration', 'Audio Streams', 'Broadcasting Hub']
    },
    {
      id: 'vrg33589',
      title: '👁️ VRG-33-589',
      description: 'Lore-based NFT collection with burn mechanics, echo generation, and frequency codes.',
      section: 'vrg33589',
      position: { bottom: '30%', right: '8%' },
      duration: 6000,
      voiceText: 'VRG-33-589 is our mysterious lore collection with advanced burn mechanics and echo generation.',
      features: ['NFT Collection', 'Burn Mechanics', 'Echo Generation', 'Frequency Codes']
    },
    {
      id: 'eveningvibes',
      title: '🌙 EVENING VIBES',
      description: 'Level Up Lounge community with crew networks, vibe checks, and holographic experiences.',
      section: 'eveningvibes',
      position: { bottom: '8%', left: '25%' },
      duration: 5000,
      voiceText: 'Evening Vibes is our community lounge where crew members connect and level up together.',
      features: ['Community Lounge', 'Crew Networks', 'Vibe Portal', 'Social Features']
    },
    {
      id: 'b2b',
      title: '💼 B2B ENTERPRISE',
      description: 'Professional services, enterprise solutions, and business partnerships hub.',
      section: 'b2b',
      position: { bottom: '8%', left: '15%' },
      duration: 5000,
      voiceText: 'Our B2B hub offers enterprise solutions and professional services for businesses.',
      features: ['Enterprise Solutions', 'Professional Services', 'Partnerships', 'Consulting']
    },
    {
      id: 'complete',
      title: '🎉 Tour Complete!',
      description: 'You\'ve explored the WIRED CHAOS ecosystem! Click any section to dive deeper, or ask me questions anytime.',
      section: null,
      position: { top: '50%', left: '50%' },
      duration: 8000,
      voiceText: 'Congratulations! You have completed the Wired Chaos ecosystem tour. You can now explore any section or ask me questions anytime.'
    }
  ];

  // Voice synthesis function
  const speakText = (text) => {
    try {
      if (!('speechSynthesis' in window)) return;
      
      speechSynthesis.cancel();
      
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US';
      utterance.rate = 0.9;
      utterance.pitch = 1.1;
      utterance.volume = 0.8;
      
      speechSynthesis.speak(utterance);
    } catch (error) {
      console.warn('Speech synthesis not supported:', error);
    }
  };

  // Auto-advance to next step
  useEffect(() => {
    if (!isPlaying || step >= tourSteps.length - 1) return;

    const currentStepData = tourSteps[step];
    const timer = setTimeout(() => {
      nextStep();
    }, currentStepData.duration);

    return () => clearTimeout(timer);
  }, [step, isPlaying]);

  // Highlight section when step changes
  useEffect(() => {
    const currentStepData = tourSteps[step];
    if (currentStepData && currentStepData.section) {
      setHighlightedSection(currentStepData.section);
      if (onSectionHighlight) {
        onSectionHighlight(currentStepData.section);
      }
    } else {
      setHighlightedSection(null);
      if (onSectionHighlight) {
        onSectionHighlight(null);
      }
    }

    // Speak the voice text
    if (isPlaying && currentStepData.voiceText) {
      setTimeout(() => {
        speakText(currentStepData.voiceText);
      }, 500);
    }
  }, [step, isPlaying, onSectionHighlight]);

  const startTour = () => {
    setIsPlaying(true);
    setStep(0);
  };

  const pauseTour = () => {
    setIsPlaying(false);
    speechSynthesis.cancel();
  };

  const resumeTour = () => {
    setIsPlaying(true);
  };

  const nextStep = () => {
    if (step < tourSteps.length - 1) {
      setStep(step + 1);
    } else {
      completeTour();
    }
  };

  const previousStep = () => {
    if (step > 0) {
      setStep(step - 1);
    }
  };

  const goToStep = (stepIndex) => {
    setStep(stepIndex);
  };

  const completeTour = () => {
    setIsPlaying(false);
    setHighlightedSection(null);
    speechSynthesis.cancel();
    if (onSectionHighlight) {
      onSectionHighlight(null);
    }
  };

  const handleSectionClick = (sectionRoute) => {
    pauseTour();
    navigate(sectionRoute);
  };

  const currentStepData = tourSteps[step] || tourSteps[0];

  if (!isActive) return null;

  return (
    <div className="motherboard-guide-overlay">
      {/* Highlight overlay for sections */}
      {highlightedSection && (
        <div className={`section-highlight ${highlightedSection}`} />
      )}

      {/* Main guide interface */}
      <div 
        className="guide-interface"
        style={{
          position: 'absolute',
          ...currentStepData.position,
          transform: 'translate(-50%, -50%)'
        }}
        ref={guideRef}
      >
        <div className="guide-card">
          {/* 3D Brain Icon */}
          <div className="guide-brain-icon">
            <div className="brain-3d">
              <div className="brain-hemisphere left"></div>
              <div className="brain-hemisphere right"></div>
              <div className="brain-stem"></div>
              <div className="neural-activity"></div>
            </div>
          </div>

          {/* Content */}
          <div className="guide-content">
            <h3 className="guide-title">{currentStepData.title}</h3>
            <p className="guide-description">{currentStepData.description}</p>
            
            {/* Feature list for sections */}
            {currentStepData.features && (
              <div className="guide-features">
                <h4>Key Features:</h4>
                <ul>
                  {currentStepData.features.map((feature, index) => (
                    <li key={index}>{feature}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Controls */}
          <div className="guide-controls">
            {/* Progress indicator */}
            <div className="guide-progress">
              <div className="progress-bar">
                <div 
                  className="progress-fill"
                  style={{ width: `${((step + 1) / tourSteps.length) * 100}%` }}
                />
              </div>
              <span className="progress-text">
                {step + 1} / {tourSteps.length}
              </span>
            </div>

            {/* Control buttons */}
            <div className="guide-buttons">
              {step > 0 && (
                <button 
                  className="guide-btn secondary"
                  onClick={previousStep}
                >
                  ← Back
                </button>
              )}
              
              {!isPlaying ? (
                <button 
                  className="guide-btn primary"
                  onClick={step === 0 ? startTour : resumeTour}
                >
                  {step === 0 ? '🚀 Start Tour' : '▶️ Resume'}
                </button>
              ) : (
                <button 
                  className="guide-btn secondary"
                  onClick={pauseTour}
                >
                  ⏸️ Pause
                </button>
              )}
              
              {step < tourSteps.length - 1 && (
                <button 
                  className="guide-btn primary"
                  onClick={nextStep}
                >
                  Next →
                </button>
              )}

              {currentStepData.section && (
                <button 
                  className="guide-btn explore"
                  onClick={() => handleSectionClick(`/${currentStepData.section}`)}
                >
                  🔍 Explore
                </button>
              )}
            </div>
          </div>

          {/* Step dots navigation */}
          <div className="step-dots">
            {tourSteps.map((_, index) => (
              <button
                key={index}
                className={`step-dot ${index === step ? 'active' : ''} ${index < step ? 'completed' : ''}`}
                onClick={() => goToStep(index)}
                title={tourSteps[index].title}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Close button */}
      <button className="guide-close-btn" onClick={onClose}>
        ✕
      </button>

      {/* Quick access mini-map */}
      <div className="guide-minimap">
        <h4>🗺️ Ecosystem Map</h4>
        <div className="minimap-sections">
          {[
            { id: 'neuro', icon: '🧠', label: 'NEURO' },
            { id: 'csn', icon: '🚀', label: 'CSN' },
            { id: 'bwb', icon: '📰', label: 'BWB' },
            { id: 'fm333', icon: '📻', label: '33.3FM' },
            { id: 'vault33', icon: '🔐', label: 'VAULT33' },
            { id: 'vrg33589', icon: '👁️', label: 'VRG' },
            { id: 'eveningvibes', icon: '🌙', label: 'VIBES' },
            { id: 'b2b', icon: '💼', label: 'B2B' }
          ].map((section) => (
            <button
              key={section.id}
              className={`minimap-section ${highlightedSection === section.id ? 'highlighted' : ''}`}
              onClick={() => handleSectionClick(`/${section.id}`)}
              title={section.label}
            >
              <span className="section-icon">{section.icon}</span>
              <span className="section-label">{section.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AnimatedMotherboardGuide;