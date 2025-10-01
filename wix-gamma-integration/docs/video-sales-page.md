# Video Sales Page (VSP) - Implementation Guide

## Overview

The Video Sales Page is a comprehensive business-side solution for WIRED CHAOS that integrates:
- Professional service package presentation
- Contract generation and e-signing
- Payment processing with Stripe
- SWARM automation (Notion, Google Drive, Discord, Calendar)
- Analytics and event tracking

## Features

### 1. Hero Section
- Bold black and neon-cyan palette
- Attention-grabbing headline
- Clear call-to-action

### 2. Video Pitch
- Embedded video player section
- Analytics tracking for video engagement
- Responsive design

### 3. Service Packages
Three tiers with distinct features:
- **Starter** ($2,500): Basic landing page with Web3 integration
- **Professional** ($7,500): Full website with NFT and smart contracts
- **Enterprise** (Custom): Complete platform with AI, AR/VR, and SWARM

### 4. Intake Form
Collects essential client information:
- Full name, email, company, phone
- Package selection
- Project description
- Timeline and budget preferences

### 5. Backend Integration

#### Contract Generation
Automatically generates engagement letters from templates:
```javascript
// Contract template includes:
- Client information
- Service package details
- Terms of service
- Payment schedule
- Delivery timeline
```

#### E-Signature Integration
Modular support for multiple vendors:
- **DocuSign** - Enterprise standard
- **HelloSign** - Developer friendly
- **Adobe Sign** - Adobe ecosystem
- **PandaDoc** - All-in-one platform

To switch vendors, simply pass the vendor name:
```javascript
await requestESignature(contractId, email, 'docusign');
// or 'hellosign', 'adobesign', 'pandadoc'
```

#### Stripe Payment Processing
Integrated payment flow:
1. Form submission triggers payment intent
2. Client receives secure payment link
3. Payment success triggers SWARM automation
4. Receipt and confirmation sent

#### SWARM Automation
Four parallel automations trigger on submission:

1. **Notion Record Creation**
   - Creates client record in VSP database
   - Tracks status and contract ID
   - Updates automatically

2. **Google Drive Folder Setup**
   - Creates project folder structure
   - Subfolders: Contracts, Deliverables, Assets, Communications
   - Shares with client email

3. **Discord Notification**
   - Posts to #vsp-leads channel
   - Rich embed with client details
   - Includes contract ID and package info

4. **Calendar Event Scheduling**
   - Schedules discovery call (2 days out)
   - Sends invites to client and team
   - 60-minute duration

## Deployment

### Cloudflare Worker

The VSP is deployed via Cloudflare Workers at:
```
https://www.wiredchaos.xyz/vsp
```

API endpoints:
```
POST /api/vsp/submit              - Form submission
POST /api/vsp/contract/generate   - Contract generation
POST /api/vsp/contract/sign       - E-signature request
POST /api/vsp/payment             - Payment processing
```

### Wix Integration

For Wix sites, use the Velo code in:
```
wix-gamma-integration/wix/pages/video-sales-page.js
```

Required Wix elements:
```
Hero Section:
- #heroTitle (Text)
- #heroSection (Container)
- #ctaButton (Button)

Video Section:
- #videoPitchPlayer (Video Player)

Package Cards:
- #starterButton (Button)
- #professionalButton (Button)
- #enterpriseButton (Button)

Intake Form:
- #fullNameInput (Text Input)
- #emailInput (Text Input)
- #companyInput (Text Input)
- #phoneInput (Text Input)
- #packageDropdown (Dropdown)
- #projectDescriptionInput (Text Area)
- #timelineInput (Text Input)
- #budgetDropdown (Dropdown)
- #submitButton (Button)

Messages:
- #messageBox (Container)
- #messageText (Text)
- #packageMessage (Text)
- #customQuoteBox (Container)
- #customQuoteText (Text)

Payment & Signature:
- #paymentSection (Container)
- #signatureSection (Container)
- #signatureLink (Button/Link)
- #signatureMessage (Text)
```

## Configuration

### Environment Variables

For production, configure these environment variables:

```bash
# E-Signature Vendors
DOCUSIGN_API_KEY=your_docusign_api_key
DOCUSIGN_ACCOUNT_ID=your_account_id
HELLOSIGN_API_KEY=your_hellosign_api_key
ADOBESIGN_API_KEY=your_adobesign_api_key
PANDADOC_API_KEY=your_pandadoc_api_key

# Payment Processing
STRIPE_SECRET_KEY=sk_live_your_stripe_secret
STRIPE_PUBLIC_KEY=pk_live_your_stripe_public

# SWARM Integrations
NOTION_TOKEN=your_notion_integration_token
NOTION_DATABASE_ID=your_vsp_database_id
GOOGLE_DRIVE_TOKEN=your_google_service_account
GOOGLE_CALENDAR_TOKEN=your_calendar_token
DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/your_webhook
```

### Wix Configuration

In `video-sales-page.js`, update:
```javascript
const CONFIG = {
  apiBase: 'https://www.wiredchaos.xyz',
  stripePublicKey: 'pk_live_YOUR_KEY',
  enableAnalytics: true
};
```

## Testing

### Local Testing
```bash
# Start Cloudflare Worker locally
npm run worker:dev

# Access VSP at
http://localhost:8787/vsp
```

### Test Submission
```bash
curl -X POST http://localhost:8787/api/vsp/submit \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "Test Client",
    "email": "test@example.com",
    "package": "professional",
    "projectDescription": "Test project"
  }'
```

### Test Contract Generation
```bash
curl -X POST http://localhost:8787/api/vsp/contract/generate \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "Test Client",
    "email": "test@example.com",
    "package": "starter"
  }'
```

## Production Setup

### 1. Deploy Worker
```bash
cd /home/runner/work/wired-chaos/wired-chaos
npm run worker:deploy
```

### 2. Configure Secrets
```bash
# Using Wrangler CLI
wrangler secret put DOCUSIGN_API_KEY
wrangler secret put STRIPE_SECRET_KEY
wrangler secret put NOTION_TOKEN
# ... etc
```

### 3. Test Live
Visit `https://www.wiredchaos.xyz/vsp` and submit a test form.

### 4. Monitor
Check Cloudflare Dashboard for:
- Request analytics
- Error logs
- Performance metrics

## Customization

### Adding New Packages
Edit the `generateVideoSalesPage()` function in `src/index.js`:
```javascript
// Add new package card in HTML
<div class="package-card">
  <div class="package-name">Custom Package</div>
  <div class="package-price">$X,XXX</div>
  <!-- ... features ... -->
</div>

// Update packageDetails in generateEngagementContract()
const packageDetails = {
  starter: { price: 2500, deliveryTime: '2 weeks', revisions: 2 },
  professional: { price: 7500, deliveryTime: '4 weeks', revisions: 5 },
  enterprise: { price: 'Custom', deliveryTime: 'Custom', revisions: 'Unlimited' },
  custom: { price: 5000, deliveryTime: '3 weeks', revisions: 3 } // NEW
};
```

### Changing Colors
All styling uses the WIRED CHAOS palette:
- Black: `#000000`
- Neon Cyan: `#00FFFF`
- Electric Green: `#39FF14`
- Glitch Red: `#FF3131`

To change, edit the CSS in `generateVideoSalesPage()`.

### Adding E-Signature Vendor
1. Create handler function:
```javascript
async function requestYourVendor(contractId, signerEmail, env) {
  const apiKey = env.YOUR_VENDOR_API_KEY;
  // ... integration logic ...
  return {
    vendor: 'yourvendor',
    contractId,
    signerEmail,
    status: 'sent',
    signUrl: 'https://...',
    expiresAt: '...',
    message: 'Signature request sent'
  };
}
```

2. Register in `requestESignature()`:
```javascript
const vendors = {
  docusign: requestDocuSign,
  hellosign: requestHelloSign,
  adobesign: requestAdobeSign,
  pandadoc: requestPandaDoc,
  yourvendor: requestYourVendor // NEW
};
```

## Analytics

All events are tracked through the WIRED CHAOS analytics system:

```javascript
// Page views
chaos.trackEvent('vsp_page_view', { timestamp: Date.now() });

// Package selection
chaos.trackEvent('package_selected', { 
  package: 'professional', 
  price: 7500 
});

// Form submission
chaos.trackEvent('vsp_form_submit_success', {
  submissionId: 'VSP-123',
  contractId: 'CONTRACT-456'
});

// Payment
chaos.trackEvent('payment_initiated', {
  package: 'professional',
  amount: 7500
});

// Video engagement
chaos.trackEvent('video_pitch_play', { timestamp: Date.now() });
chaos.trackEvent('video_pitch_complete', { timestamp: Date.now() });
```

## Support

For issues or questions:
- Check Cloudflare Worker logs
- Review Discord #vsp-leads channel
- Contact: team@wiredchaos.xyz

---

**WIRED CHAOS** - Bridging Web2 and Web3
