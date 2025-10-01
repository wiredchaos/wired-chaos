/**
 * WIRED CHAOS - Example WIX Page Integration
 * Complete example showing all integration features
 */

import wixChaos from './public/wired-chaos-integration.js';
import wixData from 'wix-data';
import wixWindow from 'wix-window';

// Configuration
const CONFIG = {
  apiBase: 'https://wired-chaos.pages.dev',
  apiKey: 'YOUR_API_KEY_HERE',
  arModelId: 'demo-model-123'
};

// ========== Page Load ==========
$w.onReady(async function() {
  console.log('🔌 Initializing WIRED CHAOS integration...');
  
  // Initialize integration
  const chaos = wixChaos.initialize(CONFIG);
  
  // Setup all features
  await setupHero();
  setupARViewer();
  setupContactForm();
  setupProductCatalog();
  setupGammaSync();
  applyBranding();
  
  console.log('✅ WIRED CHAOS integration ready');
});

// ========== Hero Section ==========
async function setupHero() {
  // Apply glitch effect to hero title
  wixChaos.Branding.applyGlitchEffect('#heroTitle');
  
  // Apply cyber style to CTA button
  wixChaos.Branding.applyStyle('#ctaButton', 'cyber');
  
  // Track CTA clicks
  wixChaos.WixHelpers.setupButton('#ctaButton', () => {
    wixWindow.openLightbox('contact-lightbox');
  }, 'cta_click');
}

// ========== AR/VR Model Viewer ==========
function setupARViewer() {
  // Load AR model
  wixChaos.loadARModel(CONFIG.arModelId, '#arViewer');
  
  // Track AR interactions
  $w('#arViewer').onReady(() => {
    wixChaos.trackEvent('ar_model_loaded', {
      modelId: CONFIG.arModelId,
      timestamp: Date.now()
    });
  });
  
  // AR button click
  $w('#viewInARButton').onClick(() => {
    wixChaos.trackEvent('ar_button_click', {
      modelId: CONFIG.arModelId
    });
  });
}

// ========== Contact Form ==========
function setupContactForm() {
  $w('#contactForm').onWixFormSubmit(async (event) => {
    event.preventDefault();
    
    // Show loading
    wixChaos.WixHelpers.showLoading('#loadingSpinner');
    
    // Get form data
    const formData = {
      name: $w('#nameInput').value,
      email: $w('#emailInput').value,
      phone: $w('#phoneInput').value,
      message: $w('#messageInput').value,
      subject: $w('#subjectDropdown').value
    };
    
    // Validate
    if (!formData.name || !formData.email) {
      wixChaos.WixHelpers.hideLoading('#loadingSpinner');
      wixChaos.WixHelpers.showError('Please fill in all required fields');
      return;
    }
    
    // Email validation
    if (!isValidEmail(formData.email)) {
      wixChaos.WixHelpers.hideLoading('#loadingSpinner');
      wixChaos.WixHelpers.showError('Please enter a valid email address');
      return;
    }
    
    try {
      // Submit via WIRED CHAOS API
      await wixChaos.submitForm(formData, 'contact-form');
      
      // Hide loading
      wixChaos.WixHelpers.hideLoading('#loadingSpinner');
      
      // Show success
      wixChaos.WixHelpers.showSuccess('Thank you! We will contact you soon.');
      
      // Reset form
      $w('#contactForm').reset();
      
      // Send to WIX CRM
      await wixData.insert('Contacts', formData);
      
    } catch (error) {
      console.error('Form submission error:', error);
      wixChaos.WixHelpers.hideLoading('#loadingSpinner');
      wixChaos.WixHelpers.showError('Submission failed. Please try again.');
    }
  });
}

// ========== Product Catalog ==========
async function setupProductCatalog() {
  try {
    // Load products from WIX Data
    const products = await wixChaos.getContent('Products', {
      limit: 12,
      sort: 'featured_desc'
    });
    
    // Setup repeater
    wixChaos.WixHelpers.setupRepeater('#productsRepeater', products, 
      ($item, product) => {
        // Product image
        $item('#productImage').src = product.image;
        $item('#productImage').alt = product.name;
        
        // Product name
        $item('#productName').text = product.name;
        
        // Product price
        $item('#productPrice').text = `$${product.price.toFixed(2)}`;
        
        // Product description
        $item('#productDescription').text = product.description || '';
        
        // View button
        $item('#viewButton').onClick(() => {
          wixChaos.trackEvent('product_view', {
            productId: product._id,
            productName: product.name,
            price: product.price
          });
          
          // Navigate to product page
          wixWindow.openLightbox('product-details', {
            productId: product._id
          });
        });
        
        // Add to cart button
        $item('#addToCartButton').onClick(async () => {
          wixChaos.trackEvent('add_to_cart', {
            productId: product._id,
            productName: product.name,
            price: product.price
          });
          
          // Add to cart logic here
          wixChaos.WixHelpers.showSuccess('Added to cart!');
        });
      }
    );
    
  } catch (error) {
    console.error('Error loading products:', error);
    wixChaos.WixHelpers.showError('Failed to load products');
  }
}

// ========== GAMMA Sync ==========
function setupGammaSync() {
  $w('#syncToGammaButton').onClick(async () => {
    try {
      wixChaos.WixHelpers.showLoading('#syncLoadingSpinner');
      
      // Get page content
      const pageContent = {
        title: $w('#pageTitle').text,
        content: $w('#pageContent').html,
        images: getPageImages()
      };
      
      // Sync to GAMMA
      const result = await wixChaos.syncToGamma(
        pageContent._id || 'current-page',
        `${pageContent.title} - Presentation`
      );
      
      wixChaos.WixHelpers.hideLoading('#syncLoadingSpinner');
      wixChaos.WixHelpers.showSuccess('Content synced to GAMMA!');
      
      console.log('GAMMA presentation created:', result);
      
    } catch (error) {
      console.error('Sync error:', error);
      wixChaos.WixHelpers.hideLoading('#syncLoadingSpinner');
      wixChaos.WixHelpers.showError('Sync failed. Please try again.');
    }
  });
}

// ========== Branding ==========
function applyBranding() {
  // Apply WIRED CHAOS colors to elements
  const colors = wixChaos.Branding.colors;
  
  // Header
  $w('#header').style.backgroundColor = colors.black;
  $w('#header').style.borderBottomColor = colors.neonCyan;
  
  // Navigation links
  $w('#navLinks').style.color = colors.neonCyan;
  
  // Footer
  $w('#footer').style.backgroundColor = colors.black;
  $w('#footer').style.borderTopColor = colors.electricGreen;
  
  // Buttons
  const buttons = ['#ctaButton', '#submitButton', '#syncButton'];
  buttons.forEach(buttonId => {
    wixChaos.Branding.applyStyle(buttonId, 'cyber');
  });
  
  // Accent elements
  $w('#accentLine1').style.backgroundColor = colors.glitchRed;
  $w('#accentLine2').style.backgroundColor = colors.accentPink;
  $w('#accentLine3').style.backgroundColor = colors.electricGreen;
}

// ========== Helper Functions ==========
function isValidEmail(email) {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}

function getPageImages() {
  const images = [];
  const imageElements = $w('Image');
  
  imageElements.forEach(img => {
    if (img.src) {
      images.push(img.src);
    }
  });
  
  return images;
}

// ========== Event Listeners ==========

// Track page unload
$w.onReady(() => {
  window.addEventListener('beforeunload', () => {
    wixChaos.trackEvent('page_unload', {
      url: wixWindow.getCurrentPage(),
      timeOnPage: Date.now() - window.pageLoadTime
    });
  });
  
  window.pageLoadTime = Date.now();
});

// Track scroll depth
let maxScrollDepth = 0;
$w.onReady(() => {
  wixWindow.onScroll((event) => {
    const scrollDepth = Math.round((event.scrollY / document.body.scrollHeight) * 100);
    
    if (scrollDepth > maxScrollDepth) {
      maxScrollDepth = scrollDepth;
      
      // Track major milestones
      if (scrollDepth >= 25 && scrollDepth < 50 && !window.tracked25) {
        wixChaos.trackEvent('scroll_depth', { depth: 25 });
        window.tracked25 = true;
      } else if (scrollDepth >= 50 && scrollDepth < 75 && !window.tracked50) {
        wixChaos.trackEvent('scroll_depth', { depth: 50 });
        window.tracked50 = true;
      } else if (scrollDepth >= 75 && scrollDepth < 90 && !window.tracked75) {
        wixChaos.trackEvent('scroll_depth', { depth: 75 });
        window.tracked75 = true;
      } else if (scrollDepth >= 90 && !window.tracked90) {
        wixChaos.trackEvent('scroll_depth', { depth: 90 });
        window.tracked90 = true;
      }
    }
  });
});

// ========== Export for Backend ==========
export {
  setupHero,
  setupARViewer,
  setupContactForm,
  setupProductCatalog,
  setupGammaSync,
  applyBranding
};
