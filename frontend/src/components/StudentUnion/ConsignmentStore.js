/**
 * WIRED CHAOS - Consignment Store Component
 * E-commerce Integration with Wix Platform
 */
import React, { useState } from 'react';
import './ConsignmentStore.css';

const ConsignmentStore = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = [
    { id: 'all', name: 'All Products', icon: '🛍️' },
    { id: 'art', name: 'Digital Art', icon: '🎨' },
    { id: 'music', name: 'Music & Audio', icon: '🎵' },
    { id: 'code', name: 'Code & Tools', icon: '💻' },
    { id: 'merch', name: 'Merchandise', icon: '👕' },
    { id: 'nft', name: 'NFTs', icon: '🖼️' }
  ];

  const featuredProducts = [
    {
      id: 1,
      name: 'Cyber Hoodie Collection',
      seller: 'Student #333',
      price: '$49.99',
      category: 'merch',
      image: '👕',
      sales: 12
    },
    {
      id: 2,
      name: 'AI-Generated Art Pack',
      seller: 'CreativeStudent',
      price: '$29.99',
      category: 'art',
      image: '🎨',
      sales: 8
    },
    {
      id: 3,
      name: 'Beats & Loops Bundle',
      seller: 'MusicMaker',
      price: '$19.99',
      category: 'music',
      image: '🎵',
      sales: 15
    },
    {
      id: 4,
      name: 'React Component Library',
      seller: 'CodeWizard',
      price: '$39.99',
      category: 'code',
      image: '💻',
      sales: 5
    }
  ];

  const filteredProducts = selectedCategory === 'all' 
    ? featuredProducts 
    : featuredProducts.filter(p => p.category === selectedCategory);

  return (
    <div className="consignment-store-container">
      <div className="store-header">
        <h1 className="store-title">
          <span className="glitch" data-text="CONSIGNMENT MARKETPLACE">CONSIGNMENT MARKETPLACE</span>
        </h1>
        <p className="store-subtitle">Student-Powered Digital Storefront • Wix Integration</p>
      </div>

      <div className="seller-cta">
        <div className="cta-content">
          <h2>🚀 Start Selling Your Creations</h2>
          <p>Set up your own store and reach the WIRED CHAOS community</p>
          <button className="cta-button">
            Create Your Store
          </button>
        </div>
      </div>

      <div className="category-filter">
        {categories.map(cat => (
          <button
            key={cat.id}
            className={`category-btn ${selectedCategory === cat.id ? 'active' : ''}`}
            onClick={() => setSelectedCategory(cat.id)}
          >
            <span className="cat-icon">{cat.icon}</span>
            <span className="cat-name">{cat.name}</span>
          </button>
        ))}
      </div>

      <div className="products-grid">
        {filteredProducts.map(product => (
          <div key={product.id} className="product-card">
            <div className="product-image">{product.image}</div>
            <div className="product-info">
              <h3 className="product-name">{product.name}</h3>
              <p className="product-seller">by {product.seller}</p>
              <div className="product-footer">
                <span className="product-price">{product.price}</span>
                <span className="product-sales">💰 {product.sales} sales</span>
              </div>
              <button className="buy-button">Add to Cart</button>
            </div>
          </div>
        ))}
      </div>

      <div className="store-features">
        <div className="feature-card">
          <h3>💳 Secure Payments</h3>
          <p>Stripe & PayPal integration for safe transactions</p>
        </div>
        <div className="feature-card">
          <h3>📊 Analytics Dashboard</h3>
          <p>Track sales, views, and customer insights</p>
        </div>
        <div className="feature-card">
          <h3>🎯 Commission Structure</h3>
          <p>Competitive rates with transparent pricing</p>
        </div>
      </div>

      <div className="wix-integration-info">
        <h2>🌐 Wix Store Integration</h2>
        <div className="integration-details">
          <div className="detail-item">
            <span className="detail-icon">✅</span>
            <span className="detail-text">Seamless product synchronization</span>
          </div>
          <div className="detail-item">
            <span className="detail-icon">✅</span>
            <span className="detail-text">Mobile-responsive storefront</span>
          </div>
          <div className="detail-item">
            <span className="detail-icon">✅</span>
            <span className="detail-text">SEO optimized for discovery</span>
          </div>
          <div className="detail-item">
            <span className="detail-icon">✅</span>
            <span className="detail-text">Inventory management system</span>
          </div>
        </div>
        <button className="wix-button">
          🔗 Connect to Wix Store
        </button>
      </div>
    </div>
  );
};

export default ConsignmentStore;
