/**
 * WIRED CHAOS - Video Studio Component
 * Main interface for creating videos from Gamma presentations
 */

import React, { useState } from 'react';
import './VideoStudio.css';

const VideoStudio = () => {
  const [gammaDeckId, setGammaDeckId] = useState('');
  const [selectedNarrator, setSelectedNarrator] = useState('builder');
  const [backgroundMusic, setBackgroundMusic] = useState('ambient');
  const [transitionStyle, setTransitionStyle] = useState('dynamic');
  const [brandingLevel, setBrandingLevel] = useState('prominent');
  const [outputFormats, setOutputFormats] = useState({
    youtube: true,
    tiktok: false,
    linkedin: false,
    platform_native: true
  });
  const [renderPriority, setRenderPriority] = useState('normal');
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState(null);

  const narratorOptions = [
    { value: 'builder', label: 'Cyber Builder', desc: 'Technical, confident' },
    { value: 'analyst', label: 'Data Analyst', desc: 'Analytical, precise' },
    { value: 'trader', label: 'Market Trader', desc: 'Strategic, dynamic' },
    { value: 'security', label: 'Security Expert', desc: 'Cautious, authoritative' },
    { value: 'custom', label: 'Default Narrator', desc: 'Neutral, educational' }
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setProcessing(true);
    setResult(null);

    try {
      // Mock API call - in production, this would call the video engine API
      await new Promise(resolve => setTimeout(resolve, 2000));

      const mockResult = {
        success: true,
        jobId: `job_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        status: 'queued',
        estimatedDuration: 45,
        estimatedRenderTime: 300,
        metadata: {
          gamma_deck_id: gammaDeckId,
          ai_narrator: selectedNarrator,
          background_music: backgroundMusic,
          transition_style: transitionStyle,
          branding_level: brandingLevel
        }
      };

      setResult(mockResult);
    } catch (error) {
      setResult({
        success: false,
        error: error.message
      });
    } finally {
      setProcessing(false);
    }
  };

  const toggleOutputFormat = (format) => {
    setOutputFormats(prev => ({
      ...prev,
      [format]: !prev[format]
    }));
  };

  return (
    <div className="video-studio">
      <header className="studio-header">
        <h1 className="studio-title">🎬 Video Studio</h1>
        <p className="studio-subtitle">
          Transform Gamma presentations into professional videos
        </p>
      </header>

      <div className="studio-content">
        <form onSubmit={handleSubmit} className="video-form">
          {/* Gamma Deck Input */}
          <div className="form-section">
            <h2 className="section-title">Source Presentation</h2>
            <div className="form-group">
              <label htmlFor="gammaDeckId">Gamma Presentation ID</label>
              <input
                type="text"
                id="gammaDeckId"
                value={gammaDeckId}
                onChange={(e) => setGammaDeckId(e.target.value)}
                placeholder="Enter Gamma deck ID"
                required
              />
              <span className="help-text">
                Find this in your Gamma presentation URL
              </span>
            </div>
          </div>

          {/* AI Narrator Selection */}
          <div className="form-section">
            <h2 className="section-title">AI Narrator</h2>
            <div className="narrator-grid">
              {narratorOptions.map(option => (
                <label
                  key={option.value}
                  className={`narrator-card ${selectedNarrator === option.value ? 'selected' : ''}`}
                >
                  <input
                    type="radio"
                    name="narrator"
                    value={option.value}
                    checked={selectedNarrator === option.value}
                    onChange={(e) => setSelectedNarrator(e.target.value)}
                  />
                  <div className="narrator-info">
                    <div className="narrator-name">{option.label}</div>
                    <div className="narrator-desc">{option.desc}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Enhancement Options */}
          <div className="form-section">
            <h2 className="section-title">Enhancement Options</h2>
            
            <div className="form-group">
              <label htmlFor="backgroundMusic">Background Music</label>
              <select
                id="backgroundMusic"
                value={backgroundMusic}
                onChange={(e) => setBackgroundMusic(e.target.value)}
              >
                <option value="ambient">Ambient Cyberpunk</option>
                <option value="energetic">Energetic Electronic</option>
                <option value="professional">Professional Tech</option>
                <option value="none">None</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="transitionStyle">Transition Style</label>
              <select
                id="transitionStyle"
                value={transitionStyle}
                onChange={(e) => setTransitionStyle(e.target.value)}
              >
                <option value="minimal">Minimal</option>
                <option value="dynamic">Dynamic</option>
                <option value="glitch">Glitch</option>
                <option value="matrix">Matrix</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="brandingLevel">Branding Level</label>
              <select
                id="brandingLevel"
                value={brandingLevel}
                onChange={(e) => setBrandingLevel(e.target.value)}
              >
                <option value="subtle">Subtle</option>
                <option value="prominent">Prominent</option>
                <option value="branded">Fully Branded</option>
              </select>
            </div>
          </div>

          {/* Output Formats */}
          <div className="form-section">
            <h2 className="section-title">Output Formats</h2>
            <div className="format-options">
              {Object.entries(outputFormats).map(([format, enabled]) => (
                <label key={format} className="format-checkbox">
                  <input
                    type="checkbox"
                    checked={enabled}
                    onChange={() => toggleOutputFormat(format)}
                  />
                  <span className="format-label">
                    {format.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Render Priority */}
          <div className="form-section">
            <h2 className="section-title">Render Priority</h2>
            <div className="priority-options">
              {['low', 'normal', 'high'].map(priority => (
                <label key={priority} className="priority-option">
                  <input
                    type="radio"
                    name="priority"
                    value={priority}
                    checked={renderPriority === priority}
                    onChange={(e) => setRenderPriority(e.target.value)}
                  />
                  <span className="priority-label">
                    {priority.charAt(0).toUpperCase() + priority.slice(1)}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="submit-button"
            disabled={processing || !gammaDeckId}
          >
            {processing ? '⏳ Processing...' : '🎬 Create Video'}
          </button>
        </form>

        {/* Result Display */}
        {result && (
          <div className={`result-panel ${result.success ? 'success' : 'error'}`}>
            {result.success ? (
              <>
                <h3>✅ Video Creation Started</h3>
                <div className="result-details">
                  <p><strong>Job ID:</strong> {result.jobId}</p>
                  <p><strong>Status:</strong> {result.status}</p>
                  <p><strong>Estimated Duration:</strong> {result.estimatedDuration}s</p>
                  <p><strong>Estimated Render Time:</strong> {Math.floor(result.estimatedRenderTime / 60)}m</p>
                </div>
                <div className="result-actions">
                  <button className="action-button">View Render Queue</button>
                  <button className="action-button secondary">Create Another</button>
                </div>
              </>
            ) : (
              <>
                <h3>❌ Creation Failed</h3>
                <p className="error-message">{result.error}</p>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default VideoStudio;
