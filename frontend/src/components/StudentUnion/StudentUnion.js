/**
 * WIRED CHAOS - Student Union Digital Campus
 * VR/AR Social Space + Consignment Store System
 */
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './StudentUnion.css';

const StudentUnion = () => {
  const navigate = useNavigate();
  const [activeArea, setActiveArea] = useState(null);
  // Tenant context: 'school' or 'business'
  const tenant = (window.location.pathname.includes('b2b') || window.location.pathname.includes('business')) ? 'business' : 'school';

  const areas = [
    {
      id: 'lobby',
      name: 'Main Lobby',
      icon: '🏛️',
      description: 'VR/AR social commons area',
      path: '/university/student-union/lobby',
      status: 'active'
    },
    {
      id: 'stores',
      name: 'Consignment Marketplace',
      icon: '🛍️',
      description: 'Student stores & products',
      path: '/university/student-union/stores',
      status: 'active'
    },
    {
      id: 'arcade',
      name: 'Gaming Arcade',
      icon: '🎮',
      description: 'Multiplayer gaming area',
      path: '/university/student-union/arcade',
      status: 'active'
    },
    {
      id: 'events',
      name: 'Event Amphitheater',
      icon: '🎭',
      description: 'Presentations & gatherings',
      path: '/university/student-union/events',
      status: 'active'
    },
    {
      id: 'cafe',
      name: 'Social Café',
      icon: '☕',
      description: 'Dining & social spaces',
      path: '/university/student-union/cafe',
      status: 'active'
    },
    {
      id: 'profiles',
      name: 'Seller Dashboard',
      icon: '📊',
      description: 'Manage your products',
      path: '/university/student-union/profiles',
      status: 'active'
    },
    {
      id: 'admin',
      name: 'Admin Panel',
      icon: '⚙️',
      description: 'University staff only',
      path: '/university/student-union/admin',
      status: 'active'
    }
  ];

  const handleAreaClick = (area) => {
    setActiveArea(area.id);
    navigate(area.path);
  };

  return (
  <div className={`student-union-container tenant-${tenant}`}> 
      <div className="union-header">
        <div className="header-content">
          <h1 className="union-title">
            <span className="glitch" data-text="STUDENT UNION">STUDENT UNION</span>
          </h1>
          <p className="union-subtitle">Digital Campus • VR/AR Social Space • Consignment Marketplace</p>
          <div className={`university-badge badge-${tenant}`}>
            <span className="badge-icon">{tenant === 'business' ? '💼' : '🎓'}</span>
            <span className="badge-text">{tenant === 'business' ? 'BUSINESS TENANT' : 'WIRED CHAOS UNIVERSITY'}</span>
          </div>
        </div>
      </div>

      <div className="union-grid">
        {areas.map((area) => (
          <div
            key={area.id}
            className={`union-area-card ${activeArea === area.id ? 'active' : ''} tenant-${tenant}`}
            onClick={() => handleAreaClick(area)}
            onMouseEnter={() => setActiveArea(area.id)}
            onMouseLeave={() => setActiveArea(null)}
          >
            <div className="area-icon">{area.icon}</div>
            <h3 className="area-name">{area.name}</h3>
            <p className="area-description">{area.description}</p>
            <div className={`area-status ${area.status}`}>
              {area.status === 'active' ? '● LIVE' : '○ SOON'}
            </div>
            <div className={`tenant-badge tenant-${tenant}`}>{tenant === 'business' ? 'Business' : 'School'}</div>
          </div>
        ))}
      </div>

      <div className="union-features">
        <div className="feature-card">
          <h3>🥽 VR/AR Integration</h3>
          <p>Mozilla Hubs powered virtual spaces for immersive student interaction</p>
        </div>
        <div className="feature-card">
          <h3>🛒 E-Commerce Platform</h3>
          <p>Full consignment store system with Wix integration for seamless transactions</p>
        </div>
        <div className="feature-card">
          <h3>🎨 Gamma Framework</h3>
          <p>Enhanced AR/VR features with real-time collaboration tools</p>
        </div>
      </div>
    </div>
  );
};

export default StudentUnion;
