// VSP Helper Functions

/**
 * Generate engagement contract from template
 */
async function generateEngagementContract(submission) {
  const contractId = `CONTRACT-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  
  const packageDetails = {
    starter: { price: 2500, deliveryTime: '2 weeks', revisions: 2 },
    professional: { price: 7500, deliveryTime: '4 weeks', revisions: 5 },
    enterprise: { price: 'Custom', deliveryTime: 'Custom', revisions: 'Unlimited' }
  };
  
  const details = packageDetails[submission.package] || packageDetails.professional;
  
  const contract = {
    id: contractId,
    template: 'engagement-letter-v1',
    client: {
      name: submission.fullName,
      email: submission.email,
      company: submission.company,
      phone: submission.phone
    },
    service: {
      package: submission.package,
      description: submission.projectDescription,
      price: details.price,
      deliveryTime: details.deliveryTime,
      revisions: details.revisions,
      timeline: submission.timeline
    },
    terms: {
      paymentSchedule: '50% upfront, 50% upon completion',
      deliveryTimeline: details.deliveryTime,
      revisions: details.revisions,
      warrantyPeriod: '30 days',
      cancellationPolicy: '7 days notice required'
    },
    content: generateContractContent(submission, details),
    status: 'draft',
    createdAt: new Date().toISOString()
  };
  
  return contract;
}

/**
 * Generate contract content/text
 */
function generateContractContent(submission, details) {
  return `
ENGAGEMENT LETTER
WIRED CHAOS - Digital Solutions

Date: ${new Date().toLocaleDateString()}

Client Information:
Name: ${submission.fullName}
Email: ${submission.email}
Company: ${submission.company}
Phone: ${submission.phone}

Service Package: ${submission.package.toUpperCase()}
Project Description: ${submission.projectDescription}

Terms of Service:
- Package Price: ${typeof details.price === 'number' ? '$' + details.price.toLocaleString() : details.price}
- Delivery Timeline: ${details.deliveryTime}
- Included Revisions: ${details.revisions}
- Payment Schedule: 50% upfront, 50% upon completion
- Warranty Period: 30 days post-delivery

By signing this agreement, both parties agree to the terms outlined above.

WIRED CHAOS Team
www.wiredchaos.xyz
`;
}

/**
 * Modular e-signature vendor integration
 */
async function requestESignature(contractId, signerEmail, vendor, env) {
  const vendors = {
    docusign: requestDocuSign,
    hellosign: requestHelloSign,
    adobesign: requestAdobeSign,
    pandadoc: requestPandaDoc
  };
  
  const handler = vendors[vendor.toLowerCase()];
  if (!handler) {
    throw new Error(`Unsupported e-signature vendor: ${vendor}`);
  }
  
  return await handler(contractId, signerEmail, env);
}

/**
 * DocuSign integration
 */
async function requestDocuSign(contractId, signerEmail, env) {
  // In production, integrate with DocuSign API
  // const apiKey = env.DOCUSIGN_API_KEY;
  // const accountId = env.DOCUSIGN_ACCOUNT_ID;
  
  return {
    vendor: 'docusign',
    contractId,
    signerEmail,
    status: 'sent',
    signUrl: `https://demo.docusign.net/signing/${contractId}`,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    message: 'Signature request sent via DocuSign (Demo Mode)'
  };
}

/**
 * HelloSign integration
 */
async function requestHelloSign(contractId, signerEmail, env) {
  return {
    vendor: 'hellosign',
    contractId,
    signerEmail,
    status: 'sent',
    signUrl: `https://hellosign.com/sign/${contractId}`,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    message: 'Signature request sent via HelloSign (Demo Mode)'
  };
}

/**
 * Adobe Sign integration
 */
async function requestAdobeSign(contractId, signerEmail, env) {
  return {
    vendor: 'adobesign',
    contractId,
    signerEmail,
    status: 'sent',
    signUrl: `https://adobesign.com/sign/${contractId}`,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    message: 'Signature request sent via Adobe Sign (Demo Mode)'
  };
}

/**
 * PandaDoc integration
 */
async function requestPandaDoc(contractId, signerEmail, env) {
  return {
    vendor: 'pandadoc',
    contractId,
    signerEmail,
    status: 'sent',
    signUrl: `https://app.pandadoc.com/sign/${contractId}`,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    message: 'Signature request sent via PandaDoc (Demo Mode)'
  };
}

/**
 * Stripe payment integration
 */
async function createStripePayment(packageName, email, amount, env) {
  // In production, integrate with Stripe API
  // const stripeKey = env.STRIPE_SECRET_KEY;
  
  const prices = {
    starter: 250000, // $2,500 in cents
    professional: 750000, // $7,500 in cents
    enterprise: amount || 1000000 // Custom or $10,000 default
  };
  
  const paymentAmount = amount || prices[packageName] || prices.professional;
  
  return {
    id: `pi_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    clientSecret: `pi_secret_${Math.random().toString(36).substr(2, 20)}`,
    amount: paymentAmount,
    currency: 'usd',
    customer: email,
    status: 'requires_payment_method',
    message: 'Payment intent created (Demo Mode - Use Stripe API in production)'
  };
}

/**
 * Trigger SWARM automation
 */
async function triggerSwarmAutomation(submission, contractData) {
  const automations = [];
  
  // 1. Create Notion record
  automations.push(createNotionRecord(submission, contractData));
  
  // 2. Setup Google Drive folder
  automations.push(setupGoogleDriveFolder(submission));
  
  // 3. Send Discord notification
  automations.push(sendDiscordNotification(submission, contractData));
  
  // 4. Schedule calendar event
  automations.push(scheduleCalendarEvent(submission));
  
  try {
    await Promise.all(automations);
    return { ok: true, message: 'SWARM automations triggered successfully' };
  } catch (error) {
    console.error('SWARM automation error:', error);
    return { ok: false, error: error.message };
  }
}

/**
 * Create Notion database record
 */
async function createNotionRecord(submission, contractData) {
  // In production, integrate with Notion API
  // const notionToken = env.NOTION_TOKEN;
  // const databaseId = env.NOTION_DATABASE_ID;
  
  return {
    service: 'notion',
    action: 'create_record',
    database: 'VSP Submissions',
    record: {
      Name: submission.fullName,
      Email: submission.email,
      Package: submission.package,
      Status: 'New Lead',
      ContractId: contractData.id,
      CreatedAt: new Date().toISOString()
    },
    status: 'success (demo mode)'
  };
}

/**
 * Setup Google Drive folder structure
 */
async function setupGoogleDriveFolder(submission) {
  // In production, integrate with Google Drive API
  // const googleToken = env.GOOGLE_DRIVE_TOKEN;
  
  const folderName = `${submission.fullName} - ${submission.package}`;
  
  return {
    service: 'google_drive',
    action: 'create_folder',
    folderName,
    subfolders: ['Contracts', 'Deliverables', 'Assets', 'Communications'],
    shareWith: [submission.email],
    status: 'success (demo mode)'
  };
}

/**
 * Send Discord notification
 */
async function sendDiscordNotification(submission, contractData) {
  // In production, integrate with Discord Webhook
  // const webhookUrl = env.DISCORD_WEBHOOK_URL;
  
  const message = {
    embeds: [{
      title: '🎯 New VSP Submission',
      color: 0x00FFFF,
      fields: [
        { name: 'Client', value: submission.fullName, inline: true },
        { name: 'Package', value: submission.package, inline: true },
        { name: 'Email', value: submission.email, inline: true },
        { name: 'Contract ID', value: contractData.id, inline: false },
        { name: 'Project', value: submission.projectDescription.substring(0, 200), inline: false }
      ],
      timestamp: new Date().toISOString()
    }]
  };
  
  return {
    service: 'discord',
    action: 'send_notification',
    channel: 'vsp-leads',
    message,
    status: 'success (demo mode)'
  };
}

/**
 * Schedule calendar event
 */
async function scheduleCalendarEvent(submission) {
  // In production, integrate with Google Calendar API
  // const calendarToken = env.GOOGLE_CALENDAR_TOKEN;
  
  const event = {
    summary: `VSP Call: ${submission.fullName}`,
    description: `Discovery call for ${submission.package} package\n\nProject: ${submission.projectDescription}`,
    start: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days from now
    duration: 60, // minutes
    attendees: [submission.email, 'team@wiredchaos.xyz']
  };
  
  return {
    service: 'google_calendar',
    action: 'create_event',
    event,
    status: 'success (demo mode)'
  };
}

// VSP Helper Functions End

// Helper function to generate Video Sales Page (VSP)
function generateVideoSalesPage() {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>WIRED CHAOS - Video Sales Page</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      background: #000000;
      color: #E6F3FF;
      font-family: system-ui, -apple-system, 'Segoe UI', Roboto, Arial, sans-serif;
      line-height: 1.6;
    }
    .hero {
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      text-align: center;
      padding: 40px 20px;
      background: linear-gradient(180deg, #000000 0%, #0A0F16 100%);
      border-bottom: 2px solid #00FFFF;
    }
    .hero h1 {
      font-size: 3.5rem;
      font-weight: 900;
      margin-bottom: 20px;
      background: linear-gradient(135deg, #00FFFF, #39FF14);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      text-shadow: 0 0 40px rgba(0, 255, 255, 0.4);
      letter-spacing: -2px;
    }
    .hero p {
      font-size: 1.4rem;
      color: #8B9DC3;
      max-width: 700px;
      margin-bottom: 40px;
    }
    .cta-button {
      display: inline-block;
      padding: 18px 40px;
      background: #00FFFF;
      color: #000000;
      font-size: 1.1rem;
      font-weight: 700;
      text-decoration: none;
      border-radius: 8px;
      transition: all 0.3s ease;
      border: 2px solid #00FFFF;
      text-transform: uppercase;
      letter-spacing: 1px;
    }
    .cta-button:hover {
      background: transparent;
      color: #00FFFF;
      transform: translateY(-3px);
      box-shadow: 0 10px 30px rgba(0, 255, 255, 0.4);
    }
    .container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 60px 20px;
    }
    .video-section {
      background: #0A0F16;
      padding: 80px 20px;
      text-align: center;
      border-bottom: 1px solid rgba(0, 255, 255, 0.2);
    }
    .video-section h2 {
      font-size: 2.5rem;
      margin-bottom: 30px;
      color: #00FFFF;
      font-weight: 800;
    }
    .video-wrapper {
      max-width: 900px;
      margin: 0 auto;
      aspect-ratio: 16/9;
      background: #000000;
      border: 2px solid #00FFFF;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 10px 50px rgba(0, 255, 255, 0.2);
      position: relative;
    }
    .video-placeholder {
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.2rem;
      color: #00FFFF;
      background: linear-gradient(135deg, #000000 0%, #0A0F16 100%);
    }
    .packages-section {
      background: #000000;
      padding: 80px 20px;
    }
    .packages-section h2 {
      font-size: 2.5rem;
      text-align: center;
      margin-bottom: 50px;
      color: #00FFFF;
      font-weight: 800;
    }
    .packages-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 30px;
      max-width: 1200px;
      margin: 0 auto;
    }
    .package-card {
      background: linear-gradient(135deg, #0A0F16 0%, #000000 100%);
      border: 2px solid rgba(0, 255, 255, 0.3);
      border-radius: 16px;
      padding: 40px 30px;
      transition: all 0.3s ease;
      position: relative;
      overflow: hidden;
    }
    .package-card::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 4px;
      background: linear-gradient(90deg, #00FFFF, #39FF14);
    }
    .package-card:hover {
      transform: translateY(-10px);
      border-color: #00FFFF;
      box-shadow: 0 15px 40px rgba(0, 255, 255, 0.3);
    }
    .package-card.featured {
      border-color: #00FFFF;
      box-shadow: 0 10px 40px rgba(0, 255, 255, 0.2);
    }
    .package-name {
      font-size: 1.8rem;
      font-weight: 800;
      color: #00FFFF;
      margin-bottom: 15px;
      text-transform: uppercase;
    }
    .package-price {
      font-size: 2.5rem;
      font-weight: 900;
      color: #FFFFFF;
      margin-bottom: 10px;
    }
    .package-price span {
      font-size: 1rem;
      color: #8B9DC3;
      font-weight: 400;
    }
    .package-features {
      list-style: none;
      margin: 30px 0;
    }
    .package-features li {
      padding: 12px 0;
      border-bottom: 1px solid rgba(0, 255, 255, 0.1);
      color: #B8C5D9;
    }
    .package-features li::before {
      content: '✓';
      color: #00FFFF;
      font-weight: 900;
      margin-right: 10px;
    }
    .select-package {
      width: 100%;
      padding: 15px;
      background: transparent;
      border: 2px solid #00FFFF;
      color: #00FFFF;
      font-size: 1rem;
      font-weight: 700;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.3s ease;
      text-transform: uppercase;
    }
    .select-package:hover {
      background: #00FFFF;
      color: #000000;
    }
    .form-section {
      background: #0A0F16;
      padding: 80px 20px;
      border-top: 1px solid rgba(0, 255, 255, 0.2);
    }
    .form-section h2 {
      font-size: 2.5rem;
      text-align: center;
      margin-bottom: 20px;
      color: #00FFFF;
      font-weight: 800;
    }
    .form-section p {
      text-align: center;
      color: #8B9DC3;
      margin-bottom: 50px;
      font-size: 1.1rem;
    }
    .intake-form {
      max-width: 700px;
      margin: 0 auto;
      background: #000000;
      border: 2px solid rgba(0, 255, 255, 0.3);
      border-radius: 16px;
      padding: 50px;
    }
    .form-group {
      margin-bottom: 25px;
    }
    .form-group label {
      display: block;
      margin-bottom: 8px;
      color: #00FFFF;
      font-weight: 600;
      font-size: 0.95rem;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .form-group input,
    .form-group textarea,
    .form-group select {
      width: 100%;
      padding: 15px;
      background: #0A0F16;
      border: 2px solid rgba(0, 255, 255, 0.3);
      border-radius: 8px;
      color: #FFFFFF;
      font-size: 1rem;
      transition: all 0.3s ease;
    }
    .form-group input:focus,
    .form-group textarea:focus,
    .form-group select:focus {
      outline: none;
      border-color: #00FFFF;
      box-shadow: 0 0 20px rgba(0, 255, 255, 0.2);
    }
    .form-group textarea {
      resize: vertical;
      min-height: 120px;
    }
    .submit-button {
      width: 100%;
      padding: 18px;
      background: #00FFFF;
      color: #000000;
      font-size: 1.1rem;
      font-weight: 700;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.3s ease;
      text-transform: uppercase;
      letter-spacing: 1px;
    }
    .submit-button:hover {
      background: #39FF14;
      transform: translateY(-2px);
      box-shadow: 0 10px 30px rgba(0, 255, 255, 0.4);
    }
    .submit-button:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
    .message {
      padding: 15px;
      border-radius: 8px;
      margin-bottom: 20px;
      display: none;
    }
    .message.success {
      background: rgba(57, 255, 20, 0.1);
      border: 1px solid #39FF14;
      color: #39FF14;
    }
    .message.error {
      background: rgba(255, 49, 49, 0.1);
      border: 1px solid #FF3131;
      color: #FF3131;
    }
    @media (max-width: 768px) {
      .hero h1 { font-size: 2.5rem; }
      .hero p { font-size: 1.1rem; }
      .packages-grid { grid-template-columns: 1fr; }
      .intake-form { padding: 30px 20px; }
    }
  </style>
</head>
<body>
  <!-- Hero Section -->
  <section class="hero">
    <h1>WIRED CHAOS</h1>
    <p>Transform Your Business with Cutting-Edge Web3 Solutions & Digital Innovation</p>
    <a href="#packages" class="cta-button">Explore Services</a>
  </section>

  <!-- Video Pitch Section -->
  <section class="video-section">
    <div class="container">
      <h2>See What We Can Do For You</h2>
      <div class="video-wrapper">
        <div class="video-placeholder">
          <div>
            <p style="margin-bottom: 10px;">🎥 Video Pitch Coming Soon</p>
            <p style="font-size: 0.9rem; color: #8B9DC3;">Embed your video URL in production</p>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- Service Packages Section -->
  <section class="packages-section" id="packages">
    <div class="container">
      <h2>Choose Your Service Package</h2>
      <div class="packages-grid">
        <!-- Starter Package -->
        <div class="package-card">
          <div class="package-name">Starter</div>
          <div class="package-price">$2,500<span>/project</span></div>
          <ul class="package-features">
            <li>Landing Page Design</li>
            <li>Basic Web3 Integration</li>
            <li>Mobile Responsive</li>
            <li>2 Revisions</li>
            <li>2-Week Delivery</li>
          </ul>
          <button class="select-package" onclick="selectPackage('starter')">Select Starter</button>
        </div>

        <!-- Professional Package -->
        <div class="package-card featured">
          <div class="package-name">Professional</div>
          <div class="package-price">$7,500<span>/project</span></div>
          <ul class="package-features">
            <li>Full Website Development</li>
            <li>Advanced Web3 Features</li>
            <li>NFT Integration</li>
            <li>Smart Contract Development</li>
            <li>5 Revisions</li>
            <li>4-Week Delivery</li>
            <li>3 Months Support</li>
          </ul>
          <button class="select-package" onclick="selectPackage('professional')">Select Professional</button>
        </div>

        <!-- Enterprise Package -->
        <div class="package-card">
          <div class="package-name">Enterprise</div>
          <div class="package-price">Custom<span>/quote</span></div>
          <ul class="package-features">
            <li>Custom Platform Development</li>
            <li>Multi-Chain Integration</li>
            <li>AI & AR/VR Features</li>
            <li>Dedicated Team</li>
            <li>Unlimited Revisions</li>
            <li>Priority Support</li>
            <li>12 Months Support</li>
            <li>SWARM Automation</li>
          </ul>
          <button class="select-package" onclick="selectPackage('enterprise')">Select Enterprise</button>
        </div>
      </div>
    </div>
  </section>

  <!-- Intake Form Section -->
  <section class="form-section" id="intake">
    <div class="container">
      <h2>Get Started Today</h2>
      <p>Fill out the form below and we'll create your custom engagement letter</p>
      
      <form class="intake-form" id="intakeForm">
        <div id="message" class="message"></div>
        
        <div class="form-group">
          <label for="fullName">Full Name *</label>
          <input type="text" id="fullName" name="fullName" required>
        </div>

        <div class="form-group">
          <label for="email">Email Address *</label>
          <input type="email" id="email" name="email" required>
        </div>

        <div class="form-group">
          <label for="company">Company Name</label>
          <input type="text" id="company" name="company">
        </div>

        <div class="form-group">
          <label for="phone">Phone Number</label>
          <input type="tel" id="phone" name="phone">
        </div>

        <div class="form-group">
          <label for="package">Selected Package *</label>
          <select id="package" name="package" required>
            <option value="">Choose a package...</option>
            <option value="starter">Starter - $2,500</option>
            <option value="professional">Professional - $7,500</option>
            <option value="enterprise">Enterprise - Custom Quote</option>
          </select>
        </div>

        <div class="form-group">
          <label for="projectDescription">Project Description *</label>
          <textarea id="projectDescription" name="projectDescription" required placeholder="Tell us about your project..."></textarea>
        </div>

        <div class="form-group">
          <label for="timeline">Desired Timeline</label>
          <input type="text" id="timeline" name="timeline" placeholder="e.g., 2-4 weeks">
        </div>

        <div class="form-group">
          <label for="budget">Budget Range</label>
          <select id="budget" name="budget">
            <option value="">Select budget range...</option>
            <option value="under-5k">Under $5,000</option>
            <option value="5k-10k">$5,000 - $10,000</option>
            <option value="10k-25k">$10,000 - $25,000</option>
            <option value="25k-50k">$25,000 - $50,000</option>
            <option value="50k-plus">$50,000+</option>
          </select>
        </div>

        <button type="submit" class="submit-button" id="submitBtn">Submit & Generate Contract</button>
      </form>
    </div>
  </section>

  <script>
    let selectedPackageGlobal = '';

    function selectPackage(packageName) {
      selectedPackageGlobal = packageName;
      document.getElementById('package').value = packageName;
      
      // Scroll to form
      document.getElementById('intake').scrollIntoView({ behavior: 'smooth' });
      
      // Highlight the form
      const form = document.querySelector('.intake-form');
      form.style.border = '2px solid #00FFFF';
      setTimeout(() => {
        form.style.border = '2px solid rgba(0, 255, 255, 0.3)';
      }, 2000);
    }

    document.getElementById('intakeForm').addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const submitBtn = document.getElementById('submitBtn');
      const messageDiv = document.getElementById('message');
      
      submitBtn.disabled = true;
      submitBtn.textContent = 'Processing...';
      
      const formData = {
        fullName: document.getElementById('fullName').value,
        email: document.getElementById('email').value,
        company: document.getElementById('company').value || 'N/A',
        phone: document.getElementById('phone').value || 'N/A',
        package: document.getElementById('package').value,
        projectDescription: document.getElementById('projectDescription').value,
        timeline: document.getElementById('timeline').value || 'Flexible',
        budget: document.getElementById('budget').value || 'Not specified',
        submittedAt: new Date().toISOString()
      };

      try {
        const response = await fetch('/api/vsp/submit', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(formData)
        });

        const result = await response.json();

        if (response.ok) {
          messageDiv.className = 'message success';
          messageDiv.style.display = 'block';
          messageDiv.textContent = result.message || 'Success! Your engagement letter is being generated. Check your email shortly.';
          
          // Reset form
          document.getElementById('intakeForm').reset();
          
          // Show next steps
          setTimeout(() => {
            messageDiv.textContent += ' You will receive a contract for e-signature within 24 hours.';
          }, 2000);
        } else {
          throw new Error(result.error || 'Submission failed');
        }
      } catch (error) {
        messageDiv.className = 'message error';
        messageDiv.style.display = 'block';
        messageDiv.textContent = 'Error: ' + error.message;
      } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Submit & Generate Contract';
      }
    });
  </script>
</body>
</html>`;
}

// Helper function to generate /school page HTML
function generateSchoolPage() {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>WIRED CHAOS School</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      background: #0A0F16;
      color: #E6F3FF;
      font-family: system-ui, -apple-system, 'Segoe UI', Roboto, Arial, sans-serif;
      min-height: 100vh;
      padding: 20px;
    }
    .container {
      max-width: 900px;
      margin: 0 auto;
      padding: 40px 20px;
    }
    h1 {
      font-size: 2.5rem;
      margin-bottom: 10px;
      background: linear-gradient(135deg, #00FFFF, #39FF14);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      text-shadow: 0 0 30px rgba(0, 255, 255, 0.3);
    }
    .subtitle {
      color: #8B9DC3;
      margin-bottom: 30px;
      font-size: 1.1rem;
    }
    .toggle-container {
      display: flex;
      gap: 15px;
      margin-bottom: 40px;
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(0, 255, 255, 0.2);
      border-radius: 12px;
      padding: 10px;
      width: fit-content;
    }
    .toggle-btn {
      padding: 12px 30px;
      border: none;
      border-radius: 8px;
      font-size: 1rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
      background: transparent;
      color: #8B9DC3;
    }
    .toggle-btn.active {
      background: linear-gradient(135deg, #00FFFF, #39FF14);
      color: #0A0F16;
      box-shadow: 0 0 20px rgba(0, 255, 255, 0.4);
    }
    .toggle-btn:hover:not(.active) {
      background: rgba(255, 255, 255, 0.1);
      color: #E6F3FF;
    }
    .content {
      background: rgba(255, 255, 255, 0.03);
      border: 1px solid rgba(0, 255, 255, 0.2);
      border-radius: 12px;
      padding: 30px;
    }
    .mode-content {
      display: none;
    }
    .mode-content.active {
      display: block;
    }
    h2 {
      font-size: 1.8rem;
      margin-bottom: 20px;
      color: #00FFFF;
    }
    .links-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 20px;
      margin-top: 20px;
    }
    .link-card {
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(0, 255, 255, 0.3);
      border-radius: 10px;
      padding: 20px;
      text-decoration: none;
      color: #E6F3FF;
      transition: all 0.3s ease;
      display: block;
    }
    .link-card:hover {
      background: rgba(0, 255, 255, 0.1);
      border-color: #00FFFF;
      transform: translateY(-2px);
      box-shadow: 0 5px 20px rgba(0, 255, 255, 0.3);
    }
    .link-title {
      font-size: 1.2rem;
      font-weight: 600;
      margin-bottom: 8px;
      color: #00FFFF;
    }
    .link-desc {
      font-size: 0.9rem;
      color: #8B9DC3;
      line-height: 1.5;
    }
    .description {
      margin-bottom: 20px;
      line-height: 1.6;
      color: #B8C5D9;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>WIRED CHAOS School</h1>
    <p class="subtitle">Choose your path: Business or Esoteric</p>
    
    <div class="toggle-container">
      <button class="toggle-btn active" data-mode="business">Business</button>
      <button class="toggle-btn" data-mode="esoteric">Esoteric</button>
    </div>

    <div class="content">
      <div class="mode-content active" data-mode="business">
        <h2>Business Track</h2>
        <p class="description">
          Professional development resources for enterprise integration, B2B solutions, and business-focused tools.
        </p>
        <div class="links-grid">
          <a href="/gamma/tour" class="link-card">
            <div class="link-title">Gamma Tour</div>
            <div class="link-desc">Interactive product tour and onboarding</div>
          </a>
          <a href="/gamma/workbook" class="link-card">
            <div class="link-title">Gamma Workbook</div>
            <div class="link-desc">Hands-on exercises and practical applications</div>
          </a>
          <a href="/suite" class="link-card">
            <div class="link-title">Suite</div>
            <div class="link-desc">Complete toolkit and dashboard</div>
          </a>
        </div>
      </div>

      <div class="mode-content" data-mode="esoteric">
        <h2>Esoteric Track</h2>
        <p class="description">
          Deep lore, experimental features, and advanced integration patterns for the curious explorer.
        </p>
        <div class="links-grid">
          <a href="/gamma/journal" class="link-card">
            <div class="link-title">Gamma Journal</div>
            <div class="link-desc">Research notes and experimental logs</div>
          </a>
          <a href="/suite" class="link-card">
            <div class="link-title">Suite</div>
            <div class="link-desc">Complete toolkit and dashboard</div>
          </a>
        </div>
      </div>
    </div>
  </div>

  <script>
    // Load saved mode from localStorage
    const savedMode = localStorage.getItem('schoolMode') || 'business';
    
    function setMode(mode) {
      // Update toggle buttons
      document.querySelectorAll('.toggle-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.mode === mode);
      });
      
      // Update content visibility
      document.querySelectorAll('.mode-content').forEach(content => {
        content.classList.toggle('active', content.dataset.mode === mode);
      });
      
      // Save to localStorage
      localStorage.setItem('schoolMode', mode);
    }
    
    // Initialize with saved mode
    setMode(savedMode);
    
    // Add click handlers to toggle buttons
    document.querySelectorAll('.toggle-btn').forEach(btn => {
      btn.addEventListener('click', () => setMode(btn.dataset.mode));
    });
  </script>
</body>
</html>`;
}

// Helper function to generate a simple placeholder HTML page
function generatePlaceholderPage(title, description) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title} - WIRED CHAOS</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      background: #0A0F16;
      color: #E6F3FF;
      font-family: system-ui, -apple-system, 'Segoe UI', Roboto, Arial, sans-serif;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
    }
    .container {
      max-width: 800px;
      text-align: center;
    }
    h1 {
      font-size: 2.5rem;
      margin-bottom: 20px;
      background: linear-gradient(135deg, #00FFFF, #39FF14);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      text-shadow: 0 0 30px rgba(0, 255, 255, 0.3);
    }
    p {
      color: #8B9DC3;
      font-size: 1.2rem;
      line-height: 1.6;
      margin-bottom: 30px;
    }
    .back-link {
      display: inline-block;
      padding: 12px 30px;
      background: rgba(0, 255, 255, 0.1);
      border: 1px solid rgba(0, 255, 255, 0.3);
      border-radius: 8px;
      color: #00FFFF;
      text-decoration: none;
      transition: all 0.3s ease;
    }
    .back-link:hover {
      background: rgba(0, 255, 255, 0.2);
      border-color: #00FFFF;
      transform: translateY(-2px);
      box-shadow: 0 5px 20px rgba(0, 255, 255, 0.3);
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>${title}</h1>
    <p>${description}</p>
    <a href="/" class="back-link">← Back to Home</a>
  </div>
</body>
</html>`;
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // CORS headers for all responses
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, HEAD, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, X-Wallet-Address',
    };

    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: corsHeaders
      });
    }

    // Handle /health endpoint
    if (url.pathname === '/health') {
      return new Response(JSON.stringify({ ok: true, timestamp: Date.now() }), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders
        }
      });
    }

    // Handle /tax redirect to /suite
    if (url.pathname === '/tax' || url.pathname.startsWith('/tax/')) {
      return Response.redirect(url.origin + '/suite', 302);
    }

    // Handle /vsp route (Video Sales Page)
    if (url.pathname === '/vsp' || url.pathname.startsWith('/vsp/')) {
      return new Response(generateVideoSalesPage(), {
        status: 200,
        headers: {
          'Content-Type': 'text/html;charset=UTF-8',
          'Cache-Control': 'public, max-age=300',
          ...corsHeaders
        }
      });
    }

    // Handle /school route
    if (url.pathname === '/school' || url.pathname.startsWith('/school/')) {
      return new Response(generateSchoolPage(), {
        status: 200,
        headers: {
          'Content-Type': 'text/html;charset=UTF-8',
          'Cache-Control': 'public, max-age=300',
          ...corsHeaders
        }
      });
    }

    // Handle /suite route
    if (url.pathname === '/suite' || url.pathname.startsWith('/suite/')) {
      return new Response(generatePlaceholderPage('Suite', 'Complete toolkit and dashboard for WIRED CHAOS'), {
        status: 200,
        headers: {
          'Content-Type': 'text/html;charset=UTF-8',
          'Cache-Control': 'public, max-age=300',
          ...corsHeaders
        }
      });
    }

    // Handle /gamma/* routes
    if (url.pathname.startsWith('/gamma/')) {
      const gammaPath = url.pathname.split('/')[2];
      const titles = {
        'tour': 'Gamma Tour',
        'journal': 'Gamma Journal',
        'workbook': 'Gamma Workbook'
      };
      const descriptions = {
        'tour': 'Interactive product tour and onboarding experience',
        'journal': 'Research notes and experimental logs',
        'workbook': 'Hands-on exercises and practical applications'
      };
      
      return new Response(generatePlaceholderPage(
        titles[gammaPath] || 'Gamma',
        descriptions[gammaPath] || 'Gamma module'
      ), {
        status: 200,
        headers: {
          'Content-Type': 'text/html;charset=UTF-8',
          'Cache-Control': 'public, max-age=300',
          ...corsHeaders
        }
      });
    }

    // Handle /bus/publish endpoint (wallet-gated)
    if (url.pathname === '/bus/publish' && request.method === 'POST') {
      const walletAddress = request.headers.get('X-Wallet-Address');
      
      if (!walletAddress) {
        return new Response(JSON.stringify({ ok: false, error: 'Wallet address required' }), {
          status: 401,
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders
          }
        });
      }

      // For now, accept any wallet address as valid
      return new Response(JSON.stringify({ 
        ok: true, 
        message: 'Event published',
        wallet: walletAddress 
      }), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders
        }
      });
    }

    // Handle /bus/poll endpoint
    if (url.pathname === '/bus/poll') {
      const since = url.searchParams.get('since') || '0';
      
      return new Response(JSON.stringify({ 
        ok: true, 
        events: [],
        since: parseInt(since),
        timestamp: Date.now()
      }), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders
        }
      });
    }

    // Handle /wl/xp/increment endpoint (wallet-gated)
    if (url.pathname === '/wl/xp/increment' && request.method === 'POST') {
      const walletAddress = request.headers.get('X-Wallet-Address');
      
      if (!walletAddress) {
        return new Response(JSON.stringify({ ok: false, error: 'Wallet address required' }), {
          status: 401,
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders
          }
        });
      }

      // Mock XP increment
      return new Response(JSON.stringify({ 
        ok: true, 
        xp: 150,
        tier: 'Holder',
        wallet: walletAddress 
      }), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders
        }
      });
    }

    // Handle /wl/xp/ status endpoint
    if (url.pathname === '/wl/xp/' || url.pathname === '/wl/xp') {
      const walletAddress = request.headers.get('X-Wallet-Address');
      
      if (!walletAddress) {
        return new Response(JSON.stringify({ ok: false, error: 'Wallet address required' }), {
          status: 401,
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders
          }
        });
      }

      // Mock XP status
      return new Response(JSON.stringify({ 
        xp: 150,
        tier: 'Holder',
        wallet: walletAddress 
      }), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders
        }
      });
    }

    // Handle /api/vsp/submit endpoint - Intake form submission
    if (url.pathname === '/api/vsp/submit' && request.method === 'POST') {
      try {
        const formData = await request.json();
        
        // Validate required fields
        if (!formData.fullName || !formData.email || !formData.package || !formData.projectDescription) {
          return new Response(JSON.stringify({ 
            ok: false, 
            error: 'Missing required fields' 
          }), {
            status: 400,
            headers: {
              'Content-Type': 'application/json',
              ...corsHeaders
            }
          });
        }

        // Generate unique submission ID
        const submissionId = `VSP-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        
        // Store submission (in production, save to KV or database)
        const submission = {
          id: submissionId,
          ...formData,
          status: 'pending',
          createdAt: new Date().toISOString()
        };

        // Trigger contract generation
        const contractData = await generateEngagementContract(submission);
        
        // Trigger SWARM automation
        await triggerSwarmAutomation(submission, contractData);

        return new Response(JSON.stringify({ 
          ok: true, 
          message: 'Submission received successfully! Check your email for the engagement letter.',
          submissionId,
          contractId: contractData.id
        }), {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders
          }
        });
      } catch (error) {
        return new Response(JSON.stringify({ 
          ok: false, 
          error: error.message 
        }), {
          status: 500,
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders
          }
        });
      }
    }

    // Handle /api/vsp/contract/generate endpoint
    if (url.pathname === '/api/vsp/contract/generate' && request.method === 'POST') {
      try {
        const data = await request.json();
        const contract = await generateEngagementContract(data);
        
        return new Response(JSON.stringify({ 
          ok: true, 
          contract 
        }), {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders
          }
        });
      } catch (error) {
        return new Response(JSON.stringify({ 
          ok: false, 
          error: error.message 
        }), {
          status: 500,
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders
          }
        });
      }
    }

    // Handle /api/vsp/contract/sign endpoint - E-signature integration
    if (url.pathname === '/api/vsp/contract/sign' && request.method === 'POST') {
      try {
        const { contractId, signerEmail, vendor = 'docusign' } = await request.json();
        
        // Use modular e-signature vendor
        const signatureRequest = await requestESignature(contractId, signerEmail, vendor, env);
        
        return new Response(JSON.stringify({ 
          ok: true, 
          signatureRequest 
        }), {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders
          }
        });
      } catch (error) {
        return new Response(JSON.stringify({ 
          ok: false, 
          error: error.message 
        }), {
          status: 500,
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders
          }
        });
      }
    }

    // Handle /api/vsp/payment endpoint - Stripe integration
    if (url.pathname === '/api/vsp/payment' && request.method === 'POST') {
      try {
        const { package: packageName, email, amount } = await request.json();
        
        // Create Stripe payment intent
        const paymentIntent = await createStripePayment(packageName, email, amount, env);
        
        return new Response(JSON.stringify({ 
          ok: true, 
          clientSecret: paymentIntent.clientSecret,
          paymentIntentId: paymentIntent.id
        }), {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders
          }
        });
      } catch (error) {
        return new Response(JSON.stringify({ 
          ok: false, 
          error: error.message 
        }), {
          status: 500,
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders
          }
        });
      }
    }

    // Handle /api/ routes - proxy to backend
    if (url.pathname.startsWith('/api/')) {
      const target = env.UG_API_BASE + url.pathname + url.search;
      const init = {
        method: request.method,
        headers: {
          'Authorization': env.UG_API_TOKEN,
          'Content-Type': 'application/json'
        },
        body: ['GET','HEAD'].includes(request.method) ? undefined : await request.text()
      };
      const resp = await fetch(target, init);
      return new Response(await resp.text(), { 
        status: resp.status,
        headers: corsHeaders
      });
    }

    return new Response("Worker running, but route not matched.", { 
      status: 200,
      headers: corsHeaders
    });
  }
};
