import React, { useState } from 'react';
import { ProfileManager } from '../components/ProfileManager';
import { ProvidersCatalog } from '../components/ProvidersCatalog';
import { VaultManager } from '../components/VaultManager';
import '../styles/resources.css';

/**
 * Resources Repository Page
 * - User Profile Management
 * - Provider Catalog with Persona Rankings
 * - Encrypted Vault for API Keys
 */
export const Resources: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'catalog' | 'vault' | 'profile'>('catalog');
  
  return (
    <div className="resources-container">
      <div className="resources-header">
        <h1>Resources Repository</h1>
        <p className="header-subtitle">Blockchain Development Tools & APIs</p>
      </div>
      
      <div className="resources-tabs">
        <button
          className={`tab-btn ${activeTab === 'catalog' ? 'active' : ''}`}
          onClick={() => setActiveTab('catalog')}
        >
          <span className="tab-icon">📚</span>
          <span>Provider Catalog</span>
        </button>
        <button
          className={`tab-btn ${activeTab === 'vault' ? 'active' : ''}`}
          onClick={() => setActiveTab('vault')}
        >
          <span className="tab-icon">🔐</span>
          <span>API Vault</span>
        </button>
        <button
          className={`tab-btn ${activeTab === 'profile' ? 'active' : ''}`}
          onClick={() => setActiveTab('profile')}
        >
          <span className="tab-icon">👤</span>
          <span>Profile</span>
        </button>
      </div>
      
      <div className="resources-content">
        {activeTab === 'catalog' && <ProvidersCatalog />}
        {activeTab === 'vault' && <VaultManager />}
        {activeTab === 'profile' && <ProfileManager />}
      </div>
    </div>
  );
};

export default Resources;
