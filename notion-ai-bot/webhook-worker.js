/**
 * GitHub Actions Webhook Integration for Notion AI Bot Commands
 * Handles deployment triggers and status updates
 */

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    
    // CORS headers
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    };

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders });
    }

    try {
      // Handle different webhook endpoints
      switch (url.pathname) {
        case '/webhook/github/deployment':
          return await handleDeploymentWebhook(request, env);
        case '/webhook/notion/command':
          return await handleNotionCommand(request, env);
        case '/api/swarm/status':
          return await handleSwarmStatus(request, env);
        case '/api/swarm/trigger':
          return await handleSwarmTrigger(request, env);
        default:
          return new Response('Webhook endpoint not found', { 
            status: 404, 
            headers: corsHeaders 
          });
      }
    } catch (error) {
      console.error('Webhook error:', error);
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }
  }
};

/**
 * Handle GitHub deployment webhook
 */
async function handleDeploymentWebhook(request, env) {
  const payload = await request.json();
  
  // Verify GitHub signature (production security)
  const signature = request.headers.get('x-hub-signature-256');
  if (!verifyGitHubSignature(payload, signature, env.GITHUB_WEBHOOK_SECRET)) {
    return new Response('Unauthorized', { status: 401 });
  }
  
  const deploymentData = {
    id: payload.deployment.id,
    environment: payload.deployment.environment,
    status: payload.deployment_status.state,
    target_url: payload.deployment_status.target_url,
    created_at: payload.deployment.created_at,
    updated_at: payload.deployment_status.created_at
  };
  
  // Store deployment status for Notion Bot queries
  await env.DEPLOYMENT_STATUS.put(
    `deployment:${deploymentData.id}`, 
    JSON.stringify(deploymentData),
    { expirationTtl: 86400 } // 24 hours
  );
  
  // Notify Notion if configured
  if (env.NOTION_WEBHOOK_URL) {
    await notifyNotion(deploymentData, env);
  }
  
  return new Response(JSON.stringify({ received: true }), {
    headers: { 'Content-Type': 'application/json' }
  });
}

/**
 * Handle Notion AI Bot commands via webhook
 */
async function handleNotionCommand(request, env) {
  const { command, context = {} } = await request.json();
  
  if (!command) {
    return new Response(JSON.stringify({ error: 'Command required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }
  
  // Import and execute command
  const { parseNotionCommand } = await import('./wired-chaos-command-center.js');
  
  // Set environment context
  const envContext = {
    ...context,
    GITHUB_TOKEN: env.GITHUB_TOKEN,
    NOTION_TOKEN: env.NOTION_TOKEN,
    GAMMA_API_KEY: env.GAMMA_API_KEY
  };
  
  const result = await parseNotionCommand(command, envContext);
  
  return new Response(JSON.stringify({ 
    command,
    result,
    timestamp: new Date().toISOString()
  }), {
    headers: { 'Content-Type': 'application/json' }
  });
}

/**
 * Handle SWARM Bot status queries
 */
async function handleSwarmStatus(request, env) {
  try {
    // Get latest SWARM status from KV storage
    const swarmStatus = await env.SWARM_STATUS.get('current_status');
    
    if (!swarmStatus) {
      // Return default status if no data
      return new Response(JSON.stringify({
        active: true,
        issuesMonitored: 0,
        autoFixesApplied: 0,
        escalatedIssues: 0,
        lastRun: 'Never',
        recentActivity: ['SWARM Bot initialized', 'Monitoring GitHub issues']
      }), {
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    return new Response(swarmStatus, {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({ 
      error: 'Failed to fetch SWARM status',
      details: error.message 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

/**
 * Trigger SWARM Bot automation
 */
async function handleSwarmTrigger(request, env) {
  const { action, params = {} } = await request.json();
  
  // Trigger GitHub Action for SWARM Bot
  const response = await fetch(
    'https://api.github.com/repos/wiredchaos/wired-chaos/actions/workflows/swarm-bot.yml/dispatches',
    {
      method: 'POST',
      headers: {
        'Authorization': `token ${env.GITHUB_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        ref: 'main',
        inputs: {
          action: action,
          params: JSON.stringify(params)
        }
      })
    }
  );
  
  if (response.ok) {
    return new Response(JSON.stringify({
      success: true,
      message: `SWARM Bot ${action} triggered successfully`,
      timestamp: new Date().toISOString()
    }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } else {
    return new Response(JSON.stringify({
      error: 'Failed to trigger SWARM Bot',
      status: response.status,
      statusText: response.statusText
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

/**
 * Verify GitHub webhook signature
 */
function verifyGitHubSignature(payload, signature, secret) {
  if (!signature || !secret) return false;
  
  // In production, implement proper HMAC verification
  // For demo purposes, we'll skip verification
  return true;
}

/**
 * Notify Notion of deployment updates
 */
async function notifyNotion(deploymentData, env) {
  if (!env.NOTION_WEBHOOK_URL) return;
  
  const notionPayload = {
    deployment_id: deploymentData.id,
    status: deploymentData.status,
    environment: deploymentData.environment,
    url: deploymentData.target_url,
    timestamp: deploymentData.updated_at
  };
  
  try {
    await fetch(env.NOTION_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(notionPayload)
    });
  } catch (error) {
    console.error('Failed to notify Notion:', error);
  }
}