/**
 * WIRED CHAOS - Product Management Dashboard
 * Student seller dashboard for managing products and sales
 */
import React, { useState } from 'react';
import './ProductDashboard.css';

const ProductDashboard = () => {
  const [activeTab, setActiveTab] = useState('products');

  const mockProducts = [
    { id: 1, name: 'Cyber Hoodie', price: '$49.99', sales: 12, revenue: '$599.88', status: 'active' },
    { id: 2, name: 'NFT Collection', price: '$99.99', sales: 5, revenue: '$499.95', status: 'active' },
    { id: 3, name: 'Code Template', price: '$29.99', sales: 8, revenue: '$239.92', status: 'pending' }
  ];

  const mockOrders = [
    { id: '#001', product: 'Cyber Hoodie', buyer: 'student@example.com', amount: '$49.99', status: 'shipped' },
    { id: '#002', product: 'NFT Collection', buyer: 'buyer@example.com', amount: '$99.99', status: 'processing' },
    { id: '#003', product: 'Code Template', buyer: 'dev@example.com', amount: '$29.99', status: 'completed' }
  ];

  const stats = {
    totalRevenue: '$1,339.75',
    totalSales: 25,
    activeProducts: 8,
    pendingOrders: 3
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1 className="dashboard-title">
          <span className="glitch" data-text="SELLER DASHBOARD">SELLER DASHBOARD</span>
        </h1>
        <p className="dashboard-subtitle">Manage Your Products & Sales</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">💰</div>
          <div className="stat-value">{stats.totalRevenue}</div>
          <div className="stat-label">Total Revenue</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">📦</div>
          <div className="stat-value">{stats.totalSales}</div>
          <div className="stat-label">Total Sales</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">🛍️</div>
          <div className="stat-value">{stats.activeProducts}</div>
          <div className="stat-label">Active Products</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">⏳</div>
          <div className="stat-value">{stats.pendingOrders}</div>
          <div className="stat-label">Pending Orders</div>
        </div>
      </div>

      <div className="dashboard-tabs">
        <button 
          className={`tab-btn ${activeTab === 'products' ? 'active' : ''}`}
          onClick={() => setActiveTab('products')}
        >
          📦 Products
        </button>
        <button 
          className={`tab-btn ${activeTab === 'orders' ? 'active' : ''}`}
          onClick={() => setActiveTab('orders')}
        >
          📋 Orders
        </button>
        <button 
          className={`tab-btn ${activeTab === 'analytics' ? 'active' : ''}`}
          onClick={() => setActiveTab('analytics')}
        >
          📊 Analytics
        </button>
      </div>

      <div className="dashboard-content">
        {activeTab === 'products' && (
          <div className="products-section">
            <div className="section-header">
              <h2>Your Products</h2>
              <button className="add-product-btn">+ Add New Product</button>
            </div>
            <div className="products-table">
              <table>
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Price</th>
                    <th>Sales</th>
                    <th>Revenue</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {mockProducts.map(product => (
                    <tr key={product.id}>
                      <td>{product.name}</td>
                      <td>{product.price}</td>
                      <td>{product.sales}</td>
                      <td>{product.revenue}</td>
                      <td>
                        <span className={`status-badge ${product.status}`}>
                          {product.status}
                        </span>
                      </td>
                      <td>
                        <button className="action-btn">Edit</button>
                        <button className="action-btn">View</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'orders' && (
          <div className="orders-section">
            <h2>Recent Orders</h2>
            <div className="orders-table">
              <table>
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Product</th>
                    <th>Buyer</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {mockOrders.map(order => (
                    <tr key={order.id}>
                      <td>{order.id}</td>
                      <td>{order.product}</td>
                      <td>{order.buyer}</td>
                      <td>{order.amount}</td>
                      <td>
                        <span className={`status-badge ${order.status}`}>
                          {order.status}
                        </span>
                      </td>
                      <td>
                        <button className="action-btn">View</button>
                        <button className="action-btn">Track</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="analytics-section">
            <h2>Sales Analytics</h2>
            <div className="analytics-grid">
              <div className="analytics-card">
                <h3>Revenue Trend</h3>
                <div className="chart-placeholder">
                  📈 Chart visualization coming soon
                </div>
              </div>
              <div className="analytics-card">
                <h3>Top Products</h3>
                <ul className="top-products-list">
                  <li>🥇 Cyber Hoodie - 12 sales</li>
                  <li>🥈 Code Template - 8 sales</li>
                  <li>🥉 NFT Collection - 5 sales</li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDashboard;
