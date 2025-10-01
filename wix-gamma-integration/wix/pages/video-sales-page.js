/**
 * WIRED CHAOS - Video Sales Page (VSP) - Wix Velo Implementation
 * 
 * This file contains the complete Wix Velo code for implementing the Video Sales Page
 * with contract generation, e-signing, and SWARM automation integration.
 * 
 * Instructions:
 * 1. Create a new page in Wix Editor
 * 2. Add elements with the IDs referenced in this code
 * 3. Copy this code to the page's code section
 * 4. Configure your API base URL and key
 */

import wixChaos from 'public/wired-chaos-integration.js';

// Configuration
const CONFIG = {
  apiBase: 'https://www.wiredchaos.xyz', // Your Cloudflare Worker URL
  stripePublicKey: 'pk_test_YOUR_STRIPE_PUBLIC_KEY', // Add your Stripe public key
  enableAnalytics: true
};

let selectedPackage = null;
let chaos = null;

/**
 * Page initialization
 */
$w.onReady(function () {
  console.log('🚀 VSP Page Ready');
  
  // Initialize WIRED CHAOS integration
  chaos = wixChaos.initialize({
    apiBase: CONFIG.apiBase,
    analyticsEnabled: CONFIG.enableAnalytics
  });
  
  // Apply WIRED CHAOS branding
  applyBranding();
  
  // Setup event handlers
  setupPackageSelection();
  setupFormValidation();
  setupFormSubmission();
  
  // Track page view
  chaos.trackEvent('vsp_page_view', {
    page: 'video_sales_page',
    timestamp: Date.now()
  });
});

/**
 * Apply WIRED CHAOS branding to elements
 */
function applyBranding() {
  // Apply cyber theme to CTA buttons
  chaos.Branding.applyStyle('#ctaButton', 'cyber');
  chaos.Branding.applyStyle('#submitButton', 'cyber');
  
  // Apply glitch effect to hero title
  chaos.Branding.applyGlitchEffect('#heroTitle');
  
  // Set brand colors
  $w('#heroSection').style.backgroundColor = chaos.Branding.colors.black;
  $w('#heroSection').style.borderColor = chaos.Branding.colors.neonCyan;
  
  console.log('✅ Branding applied');
}

/**
 * Setup package selection buttons
 */
function setupPackageSelection() {
  // Starter package
  $w('#starterButton').onClick(() => {
    selectPackage('starter', 2500);
    chaos.trackEvent('package_selected', { package: 'starter', price: 2500 });
  });
  
  // Professional package
  $w('#professionalButton').onClick(() => {
    selectPackage('professional', 7500);
    chaos.trackEvent('package_selected', { package: 'professional', price: 7500 });
  });
  
  // Enterprise package
  $w('#enterpriseButton').onClick(() => {
    selectPackage('enterprise', null);
    chaos.trackEvent('package_selected', { package: 'enterprise', price: 'custom' });
  });
}

/**
 * Handle package selection
 */
function selectPackage(packageName, price) {
  selectedPackage = { name: packageName, price };
  
  // Update dropdown
  $w('#packageDropdown').value = packageName;
  
  // Scroll to form
  $w('#intakeSection').scrollTo();
  
  // Highlight form
  $w('#intakeForm').style.borderColor = chaos.Branding.colors.neonCyan;
  setTimeout(() => {
    $w('#intakeForm').style.borderColor = 'rgba(0, 255, 255, 0.3)';
  }, 2000);
  
  // Show success message
  chaos.WixHelpers.showSuccess(
    `${packageName.toUpperCase()} package selected!`,
    '#packageMessage'
  );
}

/**
 * Setup form validation
 */
function setupFormValidation() {
  // Email validation
  $w('#emailInput').onInput(() => {
    const email = $w('#emailInput').value;
    const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    
    if (!isValid && email.length > 0) {
      $w('#emailInput').style.borderColor = chaos.Branding.colors.glitchRed;
    } else {
      $w('#emailInput').style.borderColor = chaos.Branding.colors.neonCyan;
    }
  });
  
  // Required field indicators
  const requiredFields = [
    '#fullNameInput',
    '#emailInput',
    '#packageDropdown',
    '#projectDescriptionInput'
  ];
  
  requiredFields.forEach(fieldId => {
    $w(fieldId).onBlur(() => {
      if ($w(fieldId).value === '' || $w(fieldId).value === null) {
        $w(fieldId).style.borderColor = chaos.Branding.colors.glitchRed;
      } else {
        $w(fieldId).style.borderColor = chaos.Branding.colors.neonCyan;
      }
    });
  });
}

/**
 * Setup form submission
 */
function setupFormSubmission() {
  $w('#submitButton').onClick(async () => {
    await handleFormSubmit();
  });
}

/**
 * Handle form submission
 */
async function handleFormSubmit() {
  try {
    // Disable submit button
    $w('#submitButton').disable();
    $w('#submitButton').label = 'Processing...';
    
    // Validate form
    if (!validateForm()) {
      throw new Error('Please fill in all required fields');
    }
    
    // Gather form data
    const formData = {
      fullName: $w('#fullNameInput').value,
      email: $w('#emailInput').value,
      company: $w('#companyInput').value || 'N/A',
      phone: $w('#phoneInput').value || 'N/A',
      package: $w('#packageDropdown').value,
      projectDescription: $w('#projectDescriptionInput').value,
      timeline: $w('#timelineInput').value || 'Flexible',
      budget: $w('#budgetDropdown').value || 'Not specified',
      submittedAt: new Date().toISOString()
    };
    
    // Track form submission attempt
    chaos.trackEvent('vsp_form_submit_attempt', formData);
    
    // Submit to API
    const response = await fetch(`${CONFIG.apiBase}/api/vsp/submit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(formData)
    });
    
    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.error || 'Submission failed');
    }
    
    // Track successful submission
    chaos.trackEvent('vsp_form_submit_success', {
      submissionId: result.submissionId,
      contractId: result.contractId
    });
    
    // Show success message
    showSuccessMessage(result);
    
    // Optionally proceed to payment
    if (selectedPackage && selectedPackage.price) {
      await initiatePayment(formData, result);
    } else {
      showCustomQuoteMessage();
    }
    
    // Reset form
    resetForm();
    
  } catch (error) {
    console.error('Form submission error:', error);
    
    // Track error
    chaos.trackEvent('vsp_form_submit_error', {
      error: error.message
    });
    
    // Show error message
    showErrorMessage(error.message);
    
  } finally {
    // Re-enable submit button
    $w('#submitButton').enable();
    $w('#submitButton').label = 'Submit & Generate Contract';
  }
}

/**
 * Validate form data
 */
function validateForm() {
  const requiredFields = {
    '#fullNameInput': 'Full Name',
    '#emailInput': 'Email',
    '#packageDropdown': 'Package',
    '#projectDescriptionInput': 'Project Description'
  };
  
  for (const [fieldId, fieldName] of Object.entries(requiredFields)) {
    const value = $w(fieldId).value;
    if (!value || value === '') {
      showErrorMessage(`${fieldName} is required`);
      $w(fieldId).focus();
      return false;
    }
  }
  
  // Validate email format
  const email = $w('#emailInput').value;
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    showErrorMessage('Please enter a valid email address');
    $w('#emailInput').focus();
    return false;
  }
  
  return true;
}

/**
 * Show success message
 */
function showSuccessMessage(result) {
  $w('#messageBox').show();
  $w('#messageBox').style.backgroundColor = 'rgba(57, 255, 20, 0.1)';
  $w('#messageBox').style.borderColor = chaos.Branding.colors.electricGreen;
  $w('#messageText').text = result.message || 'Success! Your engagement letter is being generated.';
  $w('#messageText').style.color = chaos.Branding.colors.electricGreen;
  
  // Auto-hide after 5 seconds
  setTimeout(() => {
    $w('#messageBox').hide();
  }, 5000);
}

/**
 * Show error message
 */
function showErrorMessage(errorMsg) {
  $w('#messageBox').show();
  $w('#messageBox').style.backgroundColor = 'rgba(255, 49, 49, 0.1)';
  $w('#messageBox').style.borderColor = chaos.Branding.colors.glitchRed;
  $w('#messageText').text = `Error: ${errorMsg}`;
  $w('#messageText').style.color = chaos.Branding.colors.glitchRed;
  
  // Auto-hide after 5 seconds
  setTimeout(() => {
    $w('#messageBox').hide();
  }, 5000);
}

/**
 * Show custom quote message
 */
function showCustomQuoteMessage() {
  $w('#customQuoteBox').show();
  $w('#customQuoteText').text = 'Thank you! Our team will contact you within 24 hours to discuss your custom enterprise solution.';
}

/**
 * Initiate Stripe payment
 */
async function initiatePayment(formData, submissionResult) {
  try {
    // Create payment intent
    const paymentResponse = await fetch(`${CONFIG.apiBase}/api/vsp/payment`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        package: formData.package,
        email: formData.email,
        amount: selectedPackage.price * 100 // Convert to cents
      })
    });
    
    const paymentData = await paymentResponse.json();
    
    if (!paymentResponse.ok) {
      throw new Error(paymentData.error || 'Payment initialization failed');
    }
    
    // Track payment initiated
    chaos.trackEvent('payment_initiated', {
      package: formData.package,
      amount: selectedPackage.price,
      paymentIntentId: paymentData.paymentIntentId
    });
    
    // Show payment section
    $w('#paymentSection').show();
    $w('#paymentSection').scrollTo();
    
    // Initialize Stripe Elements (requires Stripe.js to be loaded)
    if (typeof Stripe !== 'undefined') {
      const stripe = Stripe(CONFIG.stripePublicKey);
      // Continue with Stripe payment flow
      // This is where you'd integrate Stripe Elements
      console.log('Stripe payment ready:', paymentData.clientSecret);
    } else {
      console.warn('Stripe.js not loaded. Add it to your page settings.');
    }
    
  } catch (error) {
    console.error('Payment initialization error:', error);
    showErrorMessage(`Payment setup failed: ${error.message}`);
  }
}

/**
 * Request e-signature for contract
 */
async function requestSignature(contractId, email, vendor = 'docusign') {
  try {
    const response = await fetch(`${CONFIG.apiBase}/api/vsp/contract/sign`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contractId,
        signerEmail: email,
        vendor
      })
    });
    
    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.error || 'E-signature request failed');
    }
    
    // Track signature request
    chaos.trackEvent('signature_requested', {
      contractId,
      vendor,
      status: result.signatureRequest.status
    });
    
    // Show signature section with link
    $w('#signatureSection').show();
    $w('#signatureLink').link = result.signatureRequest.signUrl;
    $w('#signatureMessage').text = `Your contract is ready for signing via ${vendor}. Click the button below to sign.`;
    
    return result.signatureRequest;
    
  } catch (error) {
    console.error('Signature request error:', error);
    showErrorMessage(`Signature request failed: ${error.message}`);
  }
}

/**
 * Reset form to initial state
 */
function resetForm() {
  $w('#fullNameInput').value = '';
  $w('#emailInput').value = '';
  $w('#companyInput').value = '';
  $w('#phoneInput').value = '';
  $w('#packageDropdown').value = '';
  $w('#projectDescriptionInput').value = '';
  $w('#timelineInput').value = '';
  $w('#budgetDropdown').value = '';
  
  selectedPackage = null;
}

/**
 * Track video play event
 */
export function videoPitchPlayer_onPlay(event) {
  chaos.trackEvent('video_pitch_play', {
    timestamp: Date.now()
  });
}

/**
 * Track video complete event
 */
export function videoPitchPlayer_onEnded(event) {
  chaos.trackEvent('video_pitch_complete', {
    timestamp: Date.now()
  });
}
