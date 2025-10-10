import React, { useState, useEffect } from 'react';
import '../styles/resources.css';

interface UserProfile {
  userId: string;
  displayName: string;
  avatar?: string;
  bio: string;
  persona: string;
  weights: any;
  createdAt: string;
  updatedAt: string;
}

/**
 * Profile Manager Component
 * Create and edit WIRED CHAOS user profiles
 */
export const ProfileManager: React.FC = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    displayName: '',
    bio: '',
    persona: 'builder'
  });
  
  const API_BASE = process.env.REACT_APP_EDGE_API || 'http://localhost:8787';
  
  useEffect(() => {
    fetchProfile();
  }, []);
  
  const fetchProfile = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/profile`, {
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        setProfile(data);
        setFormData({
          displayName: data.displayName,
          bio: data.bio || '',
          persona: data.persona || 'builder'
        });
      }
    } catch (error) {
      console.error('Failed to fetch profile:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await fetch(`${API_BASE}/api/profile`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(formData)
      });
      
      if (response.ok) {
        const data = await response.json();
        setProfile(data);
        alert('Profile saved successfully!');
      } else {
        alert('Failed to save profile');
      }
    } catch (error) {
      console.error('Failed to save profile:', error);
      alert('Failed to save profile');
    } finally {
      setSaving(false);
    }
  };
  
  if (loading) {
    return (
      <div className="profile-loading">
        <div className="loading-spinner"></div>
        <p>Loading profile...</p>
      </div>
    );
  }
  
  return (
    <div className="profile-manager">
      <div className="profile-card">
        <div className="card-header">
          <h2>WIRED CHAOS Profile</h2>
          {profile && (
            <span className="profile-status">
              Created: {new Date(profile.createdAt).toLocaleDateString()}
            </span>
          )}
        </div>
        
        <div className="profile-form">
          <div className="form-group">
            <label htmlFor="displayName">Display Name</label>
            <input
              type="text"
              id="displayName"
              value={formData.displayName}
              onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
              placeholder="Your name or handle"
              className="form-input"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="bio">Bio</label>
            <textarea
              id="bio"
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              placeholder="Tell us about yourself..."
              className="form-textarea"
              rows={4}
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="persona">Default Persona</label>
            <select
              id="persona"
              value={formData.persona}
              onChange={(e) => setFormData({ ...formData, persona: e.target.value })}
              className="form-select"
            >
              <option value="builder">🏗️ Builder - Development Focus</option>
              <option value="analyst">📊 Analyst - Research Focus</option>
              <option value="trader">💹 Trader - Real-time Focus</option>
              <option value="security">🔒 Security - Reliability Focus</option>
            </select>
          </div>
          
          <div className="form-actions">
            <button
              onClick={handleSave}
              disabled={saving || !formData.displayName}
              className="btn-primary"
            >
              {saving ? 'Saving...' : profile ? 'Update Profile' : 'Create Profile'}
            </button>
          </div>
        </div>
        
        {profile && (
          <div className="profile-info">
            <h3>Profile Details</h3>
            <div className="info-grid">
              <div className="info-item">
                <span className="info-label">User ID:</span>
                <span className="info-value">{profile.userId}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Last Updated:</span>
                <span className="info-value">
                  {new Date(profile.updatedAt).toLocaleString()}
                </span>
              </div>
              <div className="info-item">
                <span className="info-label">Current Persona:</span>
                <span className="info-value">{profile.persona}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
