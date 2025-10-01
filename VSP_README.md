# Video Sales Page (VSP) - Quick Start Guide

## 🚀 What is the Video Sales Page?

The Video Sales Page (VSP) is a comprehensive business solution for WIRED CHAOS that streamlines client onboarding through:

- **Professional Service Presentation** - Three pricing tiers (Starter, Professional, Enterprise)
- **Automated Contract Generation** - Auto-generates engagement letters from templates
- **E-Signature Integration** - Modular support for DocuSign, HelloSign, Adobe Sign, and PandaDoc
- **Payment Processing** - Stripe integration for service fees
- **SWARM Automation** - Automated workflows (Notion, Google Drive, Discord, Calendar)

## 📸 Visual Preview

### Hero Section
![VSP Hero](https://github.com/user-attachments/assets/8a980bb1-8674-4a00-b90f-73f6e511cf91)

### Service Packages
![VSP Packages](https://github.com/user-attachments/assets/7e69e1ab-718b-426f-bdaa-06baa271a612)

### Intake Form
![VSP Form](https://github.com/user-attachments/assets/7d3001fe-2b0f-43d7-87d7-6e449862b087)

## 🎯 Features

### Design
- **Black & Neon-Cyan Palette** - Bold WIRED CHAOS branding
- **Responsive Layout** - Mobile-friendly design
- **Gradient Typography** - Eye-catching headers
- **Hover Effects** - Interactive UI elements

### Service Packages

#### Starter Package - $2,500
- Landing Page Design
- Basic Web3 Integration
- Mobile Responsive
- 2 Revisions
- 2-Week Delivery

#### Professional Package - $7,500 (Featured)
- Full Website Development
- Advanced Web3 Features
- NFT Integration
- Smart Contract Development
- 5 Revisions
- 4-Week Delivery
- 3 Months Support

#### Enterprise Package - Custom Quote
- Custom Platform Development
- Multi-Chain Integration
- AI & AR/VR Features
- Dedicated Team
- Unlimited Revisions
- Priority Support
- 12 Months Support
- SWARM Automation

### Backend Integration

#### Contract Generation
Automatically creates professional engagement letters with:
- Client information
- Service package details
- Pricing and payment schedule
- Delivery timeline
- Terms and conditions

#### E-Signature Vendors (Modular)
Switch between vendors easily:
- **DocuSign** - Enterprise standard
- **HelloSign** - Developer friendly
- **Adobe Sign** - Adobe ecosystem integration
- **PandaDoc** - All-in-one documents

```javascript
// Example: Request signature with any vendor
await requestESignature(contractId, email, 'docusign');
// or: 'hellosign', 'adobesign', 'pandadoc'
```

#### SWARM Automation
On form submission, the system automatically:

1. **Creates Notion Record**
   - Adds client to VSP database
   - Tracks status and contract ID

2. **Sets up Google Drive**
   - Creates project folder
   - Adds subfolders: Contracts, Deliverables, Assets, Communications
   - Shares with client

3. **Sends Discord Notification**
   - Posts to #vsp-leads channel
   - Rich embed with all details

4. **Schedules Calendar Event**
   - Discovery call (2 days out)
   - Invites client and team
   - 60-minute duration

## 🔧 Quick Setup

### 1. Access the Page

**Live URL:**
```
https://www.wiredchaos.xyz/vsp
```

**Local Testing:**
```bash
cd /home/runner/work/wired-chaos/wired-chaos
npm run worker:dev
# Visit: http://localhost:8787/vsp
```

### 2. API Endpoints

```bash
# Form submission
POST /api/vsp/submit
{
  "fullName": "John Doe",
  "email": "john@example.com",
  "package": "professional",
  "projectDescription": "..."
}

# Contract generation
POST /api/vsp/contract/generate
{
  "fullName": "Jane Smith",
  "email": "jane@example.com",
  "package": "starter"
}

# E-signature request
POST /api/vsp/contract/sign
{
  "contractId": "CONTRACT-123",
  "signerEmail": "client@example.com",
  "vendor": "docusign"
}

# Payment intent
POST /api/vsp/payment
{
  "package": "professional",
  "email": "client@example.com",
  "amount": 750000
}
```

### 3. Testing

Run the test suite:
```bash
cd /home/runner/work/wired-chaos/wired-chaos
npm run worker:dev  # In one terminal

# In another terminal
node tests/vsp-test.js
```

## 📋 Test Results

All endpoints are fully functional:

```
✅ VSP page rendering - 200 OK
✅ Form submission - Auto-generates contract
✅ Contract generation - Creates engagement letter
✅ DocuSign integration - Signature request sent
✅ HelloSign integration - Signature request sent
✅ Adobe Sign integration - Signature request sent
✅ PandaDoc integration - Signature request sent
✅ Stripe payment - Payment intent created
✅ SWARM automation - All triggers fired
```

## 🎨 Wix Integration

For Wix websites, use the Velo code at:
```
wix-gamma-integration/wix/pages/video-sales-page.js
```

**Required Elements:**
- Hero: `#heroTitle`, `#ctaButton`
- Video: `#videoPitchPlayer`
- Packages: `#starterButton`, `#professionalButton`, `#enterpriseButton`
- Form: `#fullNameInput`, `#emailInput`, `#packageDropdown`, etc.
- Messages: `#messageBox`, `#messageText`

**Configuration:**
```javascript
const CONFIG = {
  apiBase: 'https://www.wiredchaos.xyz',
  stripePublicKey: 'pk_live_YOUR_KEY',
  enableAnalytics: true
};
```

## 🔐 Production Setup

### Environment Variables

Configure these in Cloudflare Workers:

```bash
# E-Signature
wrangler secret put DOCUSIGN_API_KEY
wrangler secret put HELLOSIGN_API_KEY
wrangler secret put ADOBESIGN_API_KEY
wrangler secret put PANDADOC_API_KEY

# Payment
wrangler secret put STRIPE_SECRET_KEY

# SWARM Integrations
wrangler secret put NOTION_TOKEN
wrangler secret put NOTION_DATABASE_ID
wrangler secret put GOOGLE_DRIVE_TOKEN
wrangler secret put GOOGLE_CALENDAR_TOKEN
wrangler secret put DISCORD_WEBHOOK_URL
```

### Deploy

```bash
npm run worker:deploy
```

## 📊 Analytics

All interactions are tracked:
- Page views
- Package selections
- Form submissions
- Video engagement
- Payment initiation
- Signature requests

Events flow: **Wix/VSP → Worker → WC-BUS → Analytics**

## 🛠️ Customization

### Add New Package

Edit `src/index.js`:
```javascript
// In HTML generation
<div class="package-card">
  <div class="package-name">Premium</div>
  <div class="package-price">$15,000</div>
  <!-- ... features ... -->
</div>

// In contract generation
const packageDetails = {
  starter: { price: 2500, ... },
  professional: { price: 7500, ... },
  enterprise: { price: 'Custom', ... },
  premium: { price: 15000, deliveryTime: '8 weeks', revisions: 10 }
};
```

### Change E-Signature Vendor

Simply pass the vendor name:
```javascript
// In production, set up API keys for your chosen vendor
await requestESignature(contractId, email, 'hellosign');
```

### Customize SWARM Automation

Edit the automation functions in `src/index.js`:
- `createNotionRecord()` - Notion integration
- `setupGoogleDriveFolder()` - Drive setup
- `sendDiscordNotification()` - Discord alerts
- `scheduleCalendarEvent()` - Calendar events

## 📚 Documentation

- **Full Implementation Guide**: `wix-gamma-integration/docs/video-sales-page.md`
- **Wix Velo Code**: `wix-gamma-integration/wix/pages/video-sales-page.js`
- **Test Suite**: `tests/vsp-test.js`

## 🎓 Usage Examples

### Example 1: Form Submission
```bash
curl -X POST https://www.wiredchaos.xyz/api/vsp/submit \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "Sarah Johnson",
    "email": "sarah@startup.com",
    "company": "Tech Startup Inc",
    "package": "professional",
    "projectDescription": "Need NFT marketplace with wallet integration"
  }'
```

Response:
```json
{
  "ok": true,
  "message": "Submission received successfully!",
  "submissionId": "VSP-1234567890-abc123",
  "contractId": "CONTRACT-1234567890-xyz789"
}
```

### Example 2: Generate Contract
```bash
curl -X POST https://www.wiredchaos.xyz/api/vsp/contract/generate \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "Mike Chen",
    "email": "mike@corp.com",
    "package": "enterprise"
  }'
```

Returns full contract object with terms, pricing, and content.

## 🚨 Important Notes

- **Demo Mode**: E-signature and SWARM automations return mock data in development
- **Production**: Set up API keys for all integrations before going live
- **Security**: Store API keys as Cloudflare Worker secrets, never in code
- **Testing**: Always test with small amounts before processing real payments

## 💡 Tips

1. **Video Pitch**: Replace the placeholder with your actual video embed
2. **Pricing**: Adjust package prices in `generateEngagementContract()`
3. **Branding**: All colors use the WIRED CHAOS palette (#000000, #00FFFF)
4. **Form Fields**: Add custom fields by editing both HTML and submission handler

## 🤝 Support

For questions or issues:
- Email: team@wiredchaos.xyz
- Discord: Check #vsp-leads channel
- Docs: See `wix-gamma-integration/docs/video-sales-page.md`

---

**WIRED CHAOS** - Transforming Business with Web3 Solutions
