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

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // Handle /school route
    if (url.pathname === '/school' || url.pathname.startsWith('/school/')) {
      return new Response(generateSchoolPage(), {
        status: 200,
        headers: {
          'Content-Type': 'text/html;charset=UTF-8',
          'Cache-Control': 'public, max-age=300',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }

    // Handle /api/ routes
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
      return new Response(await resp.text(), { status: resp.status });
    }

    return new Response("Worker running, but route not matched.", { status: 200 });
  }
};
