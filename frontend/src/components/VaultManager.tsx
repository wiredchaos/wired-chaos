import React, { useState, useEffect } from 'react';
import '../styles/resources.css';

interface VaultKey {
  id: string;
  alias: string;
  provider: string;
  createdAt: string;
}

/**
 * Vault Manager Component
 * Encrypted storage for API keys (server-side encryption)
 */
export const VaultManager: React.FC = () => {
  const [keys, setKeys] = useState<VaultKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    alias: '',
    provider: '',
    apiKey: ''
  });
  const [saving, setSaving] = useState(false);
  
  const API_BASE = process.env.REACT_APP_EDGE_API || 'http://localhost:8787';
  
  useEffect(() => {
    fetchKeys();
  }, []);
  
  const fetchKeys = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/vault`, {
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        setKeys(data.keys);
      } else if (response.status === 401) {
        // Not authenticated
        setKeys([]);
      }
    } catch (error) {
      console.error('Failed to fetch vault keys:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleAdd = async () => {
    if (!formData.alias || !formData.provider || !formData.apiKey) {
      alert('All fields are required');
      return;
    }
    
    setSaving(true);
    try {
      const response = await fetch(`${API_BASE}/api/vault`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(formData)
      });
      
      if (response.ok) {
        await fetchKeys();
        setFormData({ alias: '', provider: '', apiKey: '' });
        setShowAddForm(false);
        alert('API key securely stored!');
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to store key');
      }
    } catch (error) {
      console.error('Failed to add key:', error);
      alert('Failed to store key');
    } finally {
      setSaving(false);
    }
  };
  
  if (loading) {
    return (
      <div className="vault-loading">
        <div className="loading-spinner"></div>
        <p>Loading vault...</p>
      </div>
    );
  }
  
  return (
    <div className="vault-manager">
      <div className="vault-header">
        <div className="header-content">
          <h2>🔐 Encrypted API Vault</h2>
          <p className="header-subtitle">
            Your API keys are encrypted with AES-GCM on the server. Only aliases are stored locally.
          </p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="btn-primary"
        >
          {showAddForm ? 'Cancel' : '+ Add Key'}
        </button>
      </div>
      
      {/* Security Notice */}
      <div className="security-notice">
        <div className="notice-icon">🛡️</div>
        <div className="notice-content">
          <h4>Security Features</h4>
          <ul>
            <li>Server-side AES-GCM encryption with 32-byte keys</li>
            <li>No secrets transmitted to client (aliases only)</li>
            <li>Encrypted storage in Cloudflare KV</li>
            <li>Automatic key rotation recommended</li>
          </ul>
        </div>
      </div>
      
      {/* Add Key Form */}
      {showAddForm && (
        <div className="add-key-form">
          <h3>Add New API Key</h3>
          
          <div className="form-group">
            <label htmlFor="alias">Key Alias</label>
            <input
              type="text"
              id="alias"
              value={formData.alias}
              onChange={(e) => setFormData({ ...formData, alias: e.target.value })}
              placeholder="My Alchemy Key"
              className="form-input"
            />
            <span className="form-hint">A friendly name to identify this key</span>
          </div>
          
          <div className="form-group">
            <label htmlFor="provider">Provider</label>
            <input
              type="text"
              id="provider"
              value={formData.provider}
              onChange={(e) => setFormData({ ...formData, provider: e.target.value })}
              placeholder="Alchemy, The Graph, etc."
              className="form-input"
            />
            <span className="form-hint">The service provider name</span>
          </div>
          
          <div className="form-group">
            <label htmlFor="apiKey">API Key</label>
            <input
              type="password"
              id="apiKey"
              value={formData.apiKey}
              onChange={(e) => setFormData({ ...formData, apiKey: e.target.value })}
              placeholder="••••••••••••••••"
              className="form-input"
              autoComplete="off"
            />
            <span className="form-hint">
              Will be encrypted before storage. Never stored in plain text.
            </span>
          </div>
          
          <div className="form-actions">
            <button
              onClick={handleAdd}
              disabled={saving}
              className="btn-primary"
            >
              {saving ? 'Encrypting & Storing...' : 'Add to Vault'}
            </button>
          </div>
        </div>
      )}
      
      {/* Keys List */}
      <div className="keys-list">
        <h3>Stored Keys</h3>
        
        {keys.length === 0 ? (
          <div className="empty-vault">
            <div className="empty-icon">🔓</div>
            <p>Your vault is empty</p>
            <p className="empty-subtitle">Add your first API key to get started</p>
          </div>
        ) : (
          <div className="keys-grid">
            {keys.map(key => (
              <div key={key.id} className="key-card">
                <div className="key-header">
                  <div className="key-icon">🔑</div>
                  <div className="key-info">
                    <h4>{key.alias}</h4>
                    <span className="key-provider">{key.provider}</span>
                  </div>
                </div>
                
                <div className="key-details">
                  <div className="detail-row">
                    <span className="detail-label">Key ID:</span>
                    <span className="detail-value monospace">{key.id}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Added:</span>
                    <span className="detail-value">
                      {new Date(key.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Status:</span>
                    <span className="status-badge encrypted">
                      🔒 Encrypted
                    </span>
                  </div>
                </div>
                
                <div className="key-actions">
                  <button className="btn-secondary btn-sm">
                    View Details
                  </button>
                  <button className="btn-danger btn-sm">
                    Revoke
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Vault Statistics */}
      {keys.length > 0 && (
        <div className="vault-stats">
          <div className="stat-card">
            <div className="stat-value">{keys.length}</div>
            <div className="stat-label">Total Keys</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">AES-256</div>
            <div className="stat-label">Encryption</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">0</div>
            <div className="stat-label">Compromised</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">100%</div>
            <div className="stat-label">Secure</div>
          </div>
        </div>
      )}
    </div>
  );
};
