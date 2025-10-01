/**
 * WIRED CHAOS - Suite Landing Worker Handler
 * Cloudflare Worker endpoint for /suite route with feature flag support
 * 
 * Features:
 * - Feature flag detection from query params or headers
 * - Stub/Partial/Full mode support
 * - Static HTML with cyberpunk styling
 * - CORS enabled
 */

/**
 * Generate Suite Landing HTML based on feature mode
 * @param {string} mode - Feature mode: 'stub', 'partial', or 'full'
 * @returns {string} HTML content
 */
function generateSuiteLandingHTML(mode = 'stub') {
  const modeConfig = {
    stub: {
      title: 'WIRED CHAOS Suite (Stub Mode)',
      features: ['Dashboard Preview', 'Admin Controls Preview', 'Coming Soon Features'],
      badge: 'STUB MODE'
    },
    partial: {
      title: 'WIRED CHAOS Suite (Partial)',
      features: ['Dashboard', 'Admin Controls', 'Power Tools', 'API Access'],
      badge: 'PARTIAL MODE'
    },
    full: {
      title: 'WIRED CHAOS Suite',
      features: ['Full Dashboard', 'Admin Controls', 'Power Tools', 'Reports', 'Integrations', 'API Access'],
      badge: 'FULL MODE'
    }
  };

  const config = modeConfig[mode] || modeConfig.stub;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="description" content="WIRED CHAOS Suite - Complete toolkit and dashboard">
  <title>${config.title}</title>
  <link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400;600;800&display=swap" rel="stylesheet">
  <style>
    :root {
      --vault-ink: #0a0f13;
      --vault-cyan: #00fff0;
      --vault-red: #ff2a2a;
      --vault-purple: #8000ff;
      --vault-green: #39ff14;
      --vault-white: #ffffff;
    }

    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: 'Orbitron', system-ui, sans-serif;
      background: var(--vault-ink);
      color: var(--vault-white);
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 2rem;
    }

    .container {
      max-width: 1200px;
      width: 100%;
    }

    .header {
      text-align: center;
      margin-bottom: 3rem;
    }

    .title {
      font-size: 3rem;
      margin-bottom: 1rem;
    }

    .title-main {
      color: var(--vault-white);
      text-shadow:
        0 0 8px var(--vault-cyan),
        0 0 18px rgba(0, 255, 240, 0.35),
        0 0 38px var(--vault-red);
    }

    .title-sub {
      color: var(--vault-cyan);
      text-shadow:
        0 0 12px var(--vault-cyan),
        0 0 30px rgba(0, 255, 240, 0.7);
    }

    .subtitle {
      color: rgba(255, 255, 255, 0.8);
      font-size: 1.1rem;
      margin-bottom: 1rem;
    }

    .mode-badge {
      display: inline-block;
      background: rgba(128, 0, 255, 0.2);
      border: 1px solid var(--vault-purple);
      padding: 0.5rem 1rem;
      border-radius: 50px;
      color: var(--vault-purple);
      font-size: 0.9rem;
      font-weight: 600;
    }

    .features-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 2rem;
      margin: 3rem 0;
    }

    .feature-card {
      background: rgba(0, 255, 240, 0.05);
      border: 2px solid var(--vault-cyan);
      border-radius: 15px;
      padding: 2rem;
      text-align: center;
      transition: all 0.3s ease;
    }

    .feature-card:hover {
      transform: translateY(-5px);
      box-shadow: 0 10px 30px rgba(0, 255, 240, 0.3);
      border-color: var(--vault-green);
    }

    .feature-icon {
      font-size: 3rem;
      margin-bottom: 1rem;
    }

    .feature-title {
      color: var(--vault-cyan);
      font-size: 1.3rem;
      margin-bottom: 0.5rem;
    }

    .info-box {
      background: rgba(0, 255, 240, 0.05);
      border: 1px solid var(--vault-cyan);
      border-radius: 12px;
      padding: 2rem;
      margin: 2rem 0;
      text-align: center;
    }

    .info-box p {
      color: rgba(255, 255, 255, 0.8);
      line-height: 1.6;
      margin: 0.5rem 0;
    }

    .footer {
      text-align: center;
      margin-top: 3rem;
      padding-top: 2rem;
      border-top: 1px solid rgba(0, 255, 240, 0.2);
      color: rgba(255, 255, 255, 0.5);
      font-size: 0.9rem;
    }

    @media (max-width: 768px) {
      body {
        padding: 1rem;
      }

      .title {
        font-size: 2rem;
      }

      .features-grid {
        grid-template-columns: 1fr;
        gap: 1.5rem;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <header class="header">
      <h1 class="title">
        <div class="title-main">WIRED CHAOS</div>
        <div class="title-sub">Suite</div>
      </h1>
      <p class="subtitle">Complete toolkit and dashboard for digital chaos management</p>
      <span class="mode-badge">🔧 ${config.badge}</span>
    </header>

    <main>
      <div class="features-grid">
        ${config.features.map((feature, index) => `
          <div class="feature-card">
            <div class="feature-icon">${['📊', '⚙️', '🔧', '📈', '🔗', '🌐'][index] || '✨'}</div>
            <h3 class="feature-title">${feature}</h3>
          </div>
        `).join('')}
      </div>

      <div class="info-box">
        <p><strong>Mode: ${mode.toUpperCase()}</strong></p>
        <p>This is the ${mode} implementation of the WIRED CHAOS Suite.</p>
        ${mode === 'stub' ? '<p>Full features coming soon. Set mode=partial or mode=full for more functionality.</p>' : ''}
      </div>
    </main>

    <footer class="footer">
      <p>WIRED CHAOS Suite v1.0.0 | ${new Date().getFullYear()}</p>
      <p>Powered by Cloudflare Workers</p>
    </footer>
  </div>
</body>
</html>`;
}

/**
 * Handle Suite Landing requests
 * @param {Request} request - Incoming request
 * @returns {Response} HTML response
 */
export async function handleSuiteLanding(request) {
  const url = new URL(request.url);
  
  // Check feature mode from query param or header
  const mode = url.searchParams.get('mode') || 
               request.headers.get('X-Suite-Mode') || 
               'stub';
  
  // Validate mode
  const validModes = ['stub', 'partial', 'full'];
  const featureMode = validModes.includes(mode) ? mode : 'stub';
  
  const html = generateSuiteLandingHTML(featureMode);
  
  return new Response(html, {
    status: 200,
    headers: {
      'Content-Type': 'text/html;charset=UTF-8',
      'Cache-Control': 'public, max-age=300',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, X-Suite-Mode',
      'X-Suite-Version': '1.0.0',
      'X-Suite-Mode': featureMode
    }
  });
}

// Default export for standalone worker
export default {
  async fetch(request) {
    return handleSuiteLanding(request);
  }
};
