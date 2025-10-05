/**
 * WIRED CHAOS - Admin Panel
 * University staff oversight and administration
 */
import React, { useState } from 'react';
import './AdminPanel.css';

const AdminPanel = () => {
  const [activeSection, setActiveSection] = useState('overview');
  // Tenant context: 'school' or 'business'
  const tenant = (window.location.pathname.includes('b2b') || window.location.pathname.includes('business')) ? 'business' : 'school';

  const stats = {
    totalStudents: 1247,
    activeStores: 89,
    totalRevenue: '$45,678.90',
    pendingApprovals: 12
  };

  const recentActivity = [
    { type: 'store', action: 'New store created', user: 'student@example.com', time: '5 min ago' },
    { type: 'product', action: 'Product approved', user: 'seller@example.com', time: '15 min ago' },
    { type: 'sale', action: 'Sale completed', user: 'buyer@example.com', time: '30 min ago' },
    { type: 'user', action: 'New user registered', user: 'newuser@example.com', time: '1 hour ago' }
  ];

  const pendingApprovals = [
    { id: 1, type: 'Store', name: 'Digital Art Studio', submitter: 'artist@example.com', status: 'pending' },
    { id: 2, type: 'Product', name: 'NFT Collection Pack', submitter: 'creator@example.com', status: 'pending' },
    { id: 3, type: 'Store', name: 'Code Templates Store', submitter: 'dev@example.com', status: 'pending' }
  ];

  return (
  <div className={`admin-panel-container tenant-${tenant}`}> 
      <div className="admin-header">
        <h1 className="admin-title">
          <span className="glitch" data-text="ADMIN PANEL">ADMIN PANEL</span>
        </h1>
        <p className="admin-subtitle">{tenant === 'business' ? 'Business Tenant Oversight' : 'University Staff • Student Union Management'}</p>
        <div className={`tenant-badge tenant-${tenant}`}>{tenant === 'business' ? 'Business' : 'School'}</div>
      </div>

      <div className="admin-stats-grid">
        <div className="admin-stat-card">
          <div className="stat-icon">👥</div>
          <div className="stat-value">{stats.totalStudents}</div>
          <div className="stat-label">Total Students</div>
        </div>
        <div className="admin-stat-card">
          <div className="stat-icon">🏪</div>
          <div className="stat-value">{stats.activeStores}</div>
          <div className="stat-label">Active Stores</div>
        </div>
        <div className="admin-stat-card">
          <div className="stat-icon">💰</div>
          <div className="stat-value">{stats.totalRevenue}</div>
          <div className="stat-label">Total Revenue</div>
        </div>
        <div className="admin-stat-card alert">
          <div className="stat-icon">⏳</div>
          <div className="stat-value">{stats.pendingApprovals}</div>
          <div className="stat-label">Pending Approvals</div>
        </div>
      </div>

      <div className="admin-navigation">
        <button 
          className={`nav-btn ${activeSection === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveSection('overview')}
        >
          📊 Overview
        </button>
        <button 
          className={`nav-btn ${activeSection === 'approvals' ? 'active' : ''}`}
          onClick={() => setActiveSection('approvals')}
        >
          ✅ Approvals
        </button>
        <button 
          className={`nav-btn ${activeSection === 'users' ? 'active' : ''}`}
          onClick={() => setActiveSection('users')}
        >
          👥 Users
        </button>
        <button 
          className={`nav-btn ${activeSection === 'reports' ? 'active' : ''}`}
          onClick={() => setActiveSection('reports')}
        >
          📈 Reports
        </button>
      </div>

      <div className="admin-content">
        {activeSection === 'overview' && (
          <div className="overview-section">
            <div className="content-card">
              <h2>Recent Activity</h2>
              <div className="activity-list">
                {recentActivity.map((activity, index) => (
                  <div key={index} className="activity-item">
                    <div className={`activity-icon ${activity.type}`}>
                      {activity.type === 'store' && '🏪'}
                      {activity.type === 'product' && '📦'}
                      {activity.type === 'sale' && '💰'}
                      {activity.type === 'user' && '👤'}
                    </div>
                    <div className="activity-details">
                      <div className="activity-action">{activity.action}</div>
                      <div className="activity-user">{activity.user}</div>
                    </div>
                    <div className="activity-time">{activity.time}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="content-card">
              <h2>System Health</h2>
              <div className="health-indicators">
                <div className="health-item">
                  <span className="health-label">VR Lobby</span>
                  <span className="health-status online">● Online</span>
                </div>
                <div className="health-item">
                  <span className="health-label">Store System</span>
                  <span className="health-status online">● Online</span>
                </div>
                <div className="health-item">
                  <span className="health-label">Wix Integration</span>
                  <span className="health-status online">● Online</span>
                </div>
                <div className="health-item">
                  <span className="health-label">Payment Gateway</span>
                  <span className="health-status online">● Online</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeSection === 'approvals' && (
          <div className="approvals-section">
            <div className="content-card">
              <h2>Pending Approvals</h2>
              <div className="approvals-table">
                <table>
                  <thead>
                    <tr>
                      <th>Type</th>
                      <th>Name</th>
                      <th>Submitter</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pendingApprovals.map(item => (
                      <tr key={item.id}>
                        <td>{item.type}</td>
                        <td>{item.name}</td>
                        <td>{item.submitter}</td>
                        <td>
                          <span className="approval-status pending">
                            {item.status}
                          </span>
                        </td>
                        <td>
                          <button className="approve-btn">✓ Approve</button>
                          <button className="reject-btn">✗ Reject</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeSection === 'users' && (
          <div className="users-section">
            <div className="content-card">
              <h2>User Management</h2>
              <p className="section-info">Student and seller account management coming soon...</p>
            </div>
          </div>
        )}

        {activeSection === 'reports' && (
          <div className="reports-section">
            <div className="content-card">
              <h2>Analytics & Reports</h2>
              <p className="section-info">Comprehensive reporting dashboard coming soon...</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPanel;
