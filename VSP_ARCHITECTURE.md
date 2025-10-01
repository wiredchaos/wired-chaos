# Video Sales Page (VSP) - System Architecture

## Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                        VIDEO SALES PAGE (VSP)                        │
│                    https://www.wiredchaos.xyz/vsp                   │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│                          HERO SECTION                                │
│  • WIRED CHAOS branding (Black & Neon-Cyan)                         │
│  • Bold typography with gradient effects                             │
│  • CTA Button: "Explore Services"                                   │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│                         VIDEO PITCH SECTION                          │
│  • Embedded video player (placeholder ready)                         │
│  • Analytics tracking: play, pause, complete events                 │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│                       SERVICE PACKAGES (3 Tiers)                     │
├─────────────────┬───────────────────────┬───────────────────────────┤
│   STARTER       │    PROFESSIONAL       │      ENTERPRISE           │
│   $2,500        │      $7,500          │       Custom              │
│                 │                       │                           │
│ • Landing Page  │ • Full Website       │ • Custom Platform         │
│ • Web3 Basic    │ • Web3 Advanced      │ • Multi-Chain             │
│ • 2 Revisions   │ • NFT + Contracts    │ • AI & AR/VR              │
│ • 2 Weeks       │ • 5 Revisions        │ • Unlimited Revisions     │
│                 │ • 4 Weeks            │ • SWARM Automation        │
│                 │ • 3 Months Support   │ • 12 Months Support       │
└─────────────────┴───────────────────────┴───────────────────────────┘
                                    │
                       [User Selects Package]
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│                          INTAKE FORM                                 │
│  • Full Name, Email, Company, Phone                                 │
│  • Package Selection (auto-filled if clicked)                       │
│  • Project Description (required)                                   │
│  • Timeline & Budget preferences                                    │
│  • Submit Button: "Submit & Generate Contract"                      │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                          [Form Submission]
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│              CLOUDFLARE WORKER: /api/vsp/submit                     │
│  1. Validate form data                                              │
│  2. Generate submission ID                                          │
│  3. Call contract generation                                        │
│  4. Trigger SWARM automation                                        │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                    ┌───────────────┴───────────────┐
                    │                               │
                    ▼                               ▼
┌──────────────────────────────┐    ┌──────────────────────────────┐
│   CONTRACT GENERATION        │    │    SWARM AUTOMATION          │
│                              │    │                              │
│ generateEngagementContract() │    │ triggerSwarmAutomation()     │
│                              │    │                              │
│ • Client info                │    │ Parallel execution:          │
│ • Package details            │    │                              │
│ • Pricing & terms            │    │ 1. Notion Record             │
│ • Payment schedule           │    │    createNotionRecord()      │
│ • Delivery timeline          │    │    └─> VSP database entry    │
│ • Generated content          │    │                              │
│                              │    │ 2. Google Drive              │
│ Returns: Contract ID         │    │    setupGoogleDriveFolder()  │
│                              │    │    └─> Project folders       │
│                              │    │                              │
│                              │    │ 3. Discord Notification      │
│                              │    │    sendDiscordNotification() │
│                              │    │    └─> #vsp-leads channel    │
│                              │    │                              │
│                              │    │ 4. Calendar Event            │
│                              │    │    scheduleCalendarEvent()   │
│                              │    │    └─> Discovery call        │
└──────────────────────────────┘    └──────────────────────────────┘
                    │                               │
                    └───────────────┬───────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    RESPONSE TO CLIENT                                │
│  {                                                                   │
│    "ok": true,                                                      │
│    "message": "Submission received! Check email...",                │
│    "submissionId": "VSP-...",                                       │
│    "contractId": "CONTRACT-..."                                     │
│  }                                                                  │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                    ┌───────────────┴───────────────┐
                    │                               │
                    ▼                               ▼
┌──────────────────────────────┐    ┌──────────────────────────────┐
│    E-SIGNATURE REQUEST       │    │    PAYMENT PROCESSING        │
│                              │    │                              │
│ /api/vsp/contract/sign       │    │ /api/vsp/payment             │
│                              │    │                              │
│ Modular vendor support:      │    │ Stripe Integration:          │
│                              │    │                              │
│ • DocuSign                   │    │ • Create payment intent      │
│   requestDocuSign()          │    │ • 50% upfront deposit        │
│                              │    │ • Secure client secret       │
│ • HelloSign                  │    │ • Return payment URL         │
│   requestHelloSign()         │    │                              │
│                              │    │ Returns:                     │
│ • Adobe Sign                 │    │ • clientSecret               │
│   requestAdobeSign()         │    │ • paymentIntentId            │
│                              │    │                              │
│ • PandaDoc                   │    │ Client completes payment     │
│   requestPandaDoc()          │    │ via Stripe Elements          │
│                              │    │                              │
│ Returns:                     │    │                              │
│ • Signature URL              │    │                              │
│ • Expiration date            │    │                              │
│ • Request status             │    │                              │
└──────────────────────────────┘    └──────────────────────────────┘
                    │                               │
                    └───────────────┬───────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      CLIENT COMPLETES                                │
│                                                                      │
│  ✅ Contract signed via chosen e-signature vendor                   │
│  ✅ Payment processed via Stripe                                    │
│  ✅ Notion record created with all details                          │
│  ✅ Google Drive folder ready with subfolders                       │
│  ✅ Discord team notified in #vsp-leads                             │
│  ✅ Discovery call scheduled on calendar                            │
│                                                                      │
│  → Project kickoff ready! 🚀                                        │
└─────────────────────────────────────────────────────────────────────┘
```

## API Endpoints

### 1. Form Submission
```
POST /api/vsp/submit
Content-Type: application/json

{
  "fullName": "string",
  "email": "string",
  "company": "string",
  "phone": "string",
  "package": "starter|professional|enterprise",
  "projectDescription": "string",
  "timeline": "string",
  "budget": "string"
}

→ Returns: { submissionId, contractId }
→ Triggers: Contract generation + SWARM automation
```

### 2. Contract Generation
```
POST /api/vsp/contract/generate
Content-Type: application/json

{
  "fullName": "string",
  "email": "string",
  "package": "string",
  "projectDescription": "string"
}

→ Returns: Full contract object with terms and content
```

### 3. E-Signature Request
```
POST /api/vsp/contract/sign
Content-Type: application/json

{
  "contractId": "string",
  "signerEmail": "string",
  "vendor": "docusign|hellosign|adobesign|pandadoc"
}

→ Returns: Signature URL and request details
→ Modular: Easy vendor switching
```

### 4. Payment Intent
```
POST /api/vsp/payment
Content-Type: application/json

{
  "package": "string",
  "email": "string",
  "amount": number (in cents)
}

→ Returns: Stripe clientSecret and paymentIntentId
→ Client uses Stripe Elements to complete payment
```

## Technology Stack

```
Frontend (Presentation Layer)
├── HTML5 (generated by Cloudflare Worker)
├── CSS3 (Black & Neon-Cyan theme)
└── JavaScript (Form handling & API calls)

Backend (Cloudflare Worker)
├── JavaScript ES6+
├── Modular function architecture
├── RESTful API endpoints
└── CORS enabled

Integrations
├── E-Signature Vendors (modular)
│   ├── DocuSign API
│   ├── HelloSign API
│   ├── Adobe Sign API
│   └── PandaDoc API
│
├── Payment Processing
│   └── Stripe API
│
└── SWARM Automation
    ├── Notion API (database records)
    ├── Google Drive API (folder creation)
    ├── Discord Webhooks (notifications)
    └── Google Calendar API (event scheduling)

Wix Integration (Optional)
├── Wix Velo (frontend code)
├── WIRED CHAOS integration library
└── Analytics tracking
```

## Data Flow

```
User Input → Validation → Storage → Processing → Integrations → Response

1. User fills form on VSP
2. Form validates required fields
3. Submit triggers API call
4. Worker validates & processes
5. Contract auto-generated
6. SWARM automations fire:
   - Notion record created
   - Drive folder setup
   - Discord notification sent
   - Calendar event scheduled
7. E-signature request sent
8. Payment intent created
9. Client receives confirmation
10. Team gets notification
11. Project ready to start
```

## Security & Best Practices

- ✅ HTTPS only (Cloudflare SSL)
- ✅ CORS properly configured
- ✅ Input validation on all fields
- ✅ Email format validation
- ✅ API keys stored as Worker secrets
- ✅ No sensitive data in client code
- ✅ Rate limiting (Cloudflare default)
- ✅ Error handling with user-friendly messages
- ✅ Audit trail (submission IDs)

## Customization Points

1. **Packages**: Add/remove/modify in `generateVideoSalesPage()`
2. **Pricing**: Update in `generateEngagementContract()`
3. **Contract Template**: Edit `generateContractContent()`
4. **E-Signature Vendor**: Pass vendor name to `requestESignature()`
5. **SWARM Automation**: Customize functions in trigger handlers
6. **Branding**: Modify CSS in HTML generator
7. **Form Fields**: Add fields in HTML and submission handler

## Analytics Tracking

All events tracked via WIRED CHAOS analytics:

- `vsp_page_view` - Page loads
- `package_selected` - User selects package
- `vsp_form_submit_attempt` - Form submission attempt
- `vsp_form_submit_success` - Successful submission
- `vsp_form_submit_error` - Submission errors
- `video_pitch_play` - Video starts
- `video_pitch_complete` - Video completes
- `payment_initiated` - Payment process starts
- `signature_requested` - E-signature sent

Data flows: VSP → Worker → WC-BUS → Analytics KV

---

**WIRED CHAOS** - Professional Web3 Solutions
