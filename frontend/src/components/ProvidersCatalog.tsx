import React, { useState, useEffect } from 'react';
import { 
  Provider, 
  PersonaType, 
  PersonaWeights, 
  PERSONA_PRESETS, 
  CRITERIA_INFO,
  calculateProviderScore 
} from '../lib/ranking';
import { Slider } from './ui/slider';
import '../styles/resources.css';

/**
 * Providers Catalog Component
 * Ranked list of blockchain API providers with persona-based scoring
 */
export const ProvidersCatalog: React.FC = () => {
  const [providers, setProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(true);
  const [persona, setPersona] = useState<PersonaType>('builder');
  const [weights, setWeights] = useState<PersonaWeights>(PERSONA_PRESETS.builder);
  const [customMode, setCustomMode] = useState(false);
  const [category, setCategory] = useState('all');
  
  const API_BASE = process.env.REACT_APP_EDGE_API || 'http://localhost:8787';
  
  useEffect(() => {
    fetchProviders();
  }, [category]);
  
  useEffect(() => {
    // Recalculate scores when weights change
    if (providers.length > 0) {
      const updated = providers.map(p => ({
        ...p,
        score: calculateProviderScore(p.criteria, weights)
      })).sort((a, b) => (b.score || 0) - (a.score || 0));
      setProviders(updated);
    }
  }, [weights]);
  
  const fetchProviders = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/providers?category=${category}`, {
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        setProviders(data.providers);
      }
    } catch (error) {
      console.error('Failed to fetch providers:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const handlePersonaChange = (newPersona: PersonaType) => {
    setPersona(newPersona);
    setWeights(PERSONA_PRESETS[newPersona]);
    setCustomMode(false);
  };
  
  const handleWeightChange = (criterion: keyof PersonaWeights, value: number) => {
    setWeights({ ...weights, [criterion]: value });
    setCustomMode(true);
  };
  
  const handleClaim = async (providerId: string) => {
    try {
      const response = await fetch(`${API_BASE}/api/providers/${providerId}/claim`, {
        method: 'POST',
        credentials: 'include'
      });
      
      if (response.ok) {
        alert('Provider claimed! Add your API key in the Vault tab.');
      } else {
        alert('Please create a profile first');
      }
    } catch (error) {
      console.error('Failed to claim provider:', error);
      alert('Failed to claim provider');
    }
  };
  
  const getScoreColor = (score: number): string => {
    if (score >= 90) return 'score-excellent';
    if (score >= 80) return 'score-good';
    if (score >= 70) return 'score-fair';
    return 'score-low';
  };
  
  if (loading) {
    return (
      <div className="catalog-loading">
        <div className="loading-spinner"></div>
        <p>Loading providers...</p>
      </div>
    );
  }
  
  return (
    <div className="providers-catalog">
      {/* Persona Selector */}
      <div className="persona-selector">
        <h3>Select Your Persona</h3>
        <div className="persona-buttons">
          <button
            className={`persona-btn ${persona === 'builder' && !customMode ? 'active' : ''}`}
            onClick={() => handlePersonaChange('builder')}
          >
            <span className="persona-icon">🏗️</span>
            <span className="persona-label">Builder</span>
          </button>
          <button
            className={`persona-btn ${persona === 'analyst' && !customMode ? 'active' : ''}`}
            onClick={() => handlePersonaChange('analyst')}
          >
            <span className="persona-icon">📊</span>
            <span className="persona-label">Analyst</span>
          </button>
          <button
            className={`persona-btn ${persona === 'trader' && !customMode ? 'active' : ''}`}
            onClick={() => handlePersonaChange('trader')}
          >
            <span className="persona-icon">💹</span>
            <span className="persona-label">Trader</span>
          </button>
          <button
            className={`persona-btn ${persona === 'security' && !customMode ? 'active' : ''}`}
            onClick={() => handlePersonaChange('security')}
          >
            <span className="persona-icon">🔒</span>
            <span className="persona-label">Security</span>
          </button>
          {customMode && (
            <span className="custom-indicator">
              <span className="indicator-icon">⚙️</span>
              Custom Weights
            </span>
          )}
        </div>
      </div>
      
      {/* Weight Sliders */}
      <div className="weight-sliders">
        <h3>Customize Criteria Weights</h3>
        <div className="sliders-grid">
          {(Object.keys(weights) as (keyof PersonaWeights)[]).map(criterion => (
            <div key={criterion} className="slider-group">
              <div className="slider-header">
                <label>{CRITERIA_INFO[criterion].label}</label>
                <span className="slider-value">{weights[criterion]}</span>
              </div>
              <Slider
                value={[weights[criterion]]}
                onValueChange={(values) => handleWeightChange(criterion, values[0])}
                min={1}
                max={10}
                step={1}
                className="weight-slider"
              />
              <span className="slider-description">{CRITERIA_INFO[criterion].description}</span>
            </div>
          ))}
        </div>
      </div>
      
      {/* Category Filter */}
      <div className="category-filter">
        <label htmlFor="category">Filter by Category:</label>
        <select
          id="category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="category-select"
        >
          <option value="all">All Providers</option>
          <option value="rpc">RPC Nodes</option>
          <option value="indexing">Indexing</option>
          <option value="data">Data APIs</option>
          <option value="market">Market Data</option>
          <option value="analytics">Analytics</option>
        </select>
      </div>
      
      {/* Providers List */}
      <div className="providers-list">
        <div className="list-header">
          <h3>Ranked Providers</h3>
          <span className="list-count">{providers.length} providers</span>
        </div>
        
        {providers.map((provider, index) => (
          <div key={provider.id} className="provider-card">
            <div className="provider-rank">#{index + 1}</div>
            
            <div className="provider-content">
              <div className="provider-header">
                <div className="provider-title">
                  <h4>{provider.name}</h4>
                  <span className="provider-category">{provider.category}</span>
                </div>
                <div className={`provider-score ${getScoreColor(provider.score || 0)}`}>
                  {provider.score}/100
                </div>
              </div>
              
              <p className="provider-description">{provider.description}</p>
              
              <div className="provider-details">
                <div className="detail-item">
                  <span className="detail-label">Chains:</span>
                  <span className="detail-value">{provider.chains.join(', ')}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Tier:</span>
                  <span className="detail-value">{provider.tier}</span>
                </div>
              </div>
              
              {/* Criteria Breakdown */}
              <div className="criteria-breakdown">
                {(Object.keys(provider.criteria) as (keyof typeof provider.criteria)[]).map(key => {
                  const value = provider.criteria[key];
                  const weight = weights[key];
                  const contribution = (value * weight) / 10;
                  
                  return (
                    <div key={key} className="criterion-bar">
                      <span className="criterion-label">{CRITERIA_INFO[key].label}</span>
                      <div className="criterion-progress">
                        <div 
                          className="progress-fill"
                          style={{ width: `${value * 10}%` }}
                        />
                      </div>
                      <span className="criterion-value">{value}/10</span>
                    </div>
                  );
                })}
              </div>
              
              <div className="provider-actions">
                <a 
                  href={provider.website} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="btn-secondary"
                >
                  Visit Website ↗
                </a>
                <a 
                  href={provider.signupUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="btn-secondary"
                >
                  Sign Up ↗
                </a>
                <button
                  onClick={() => handleClaim(provider.id)}
                  className="btn-primary"
                >
                  Claim Provider
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
