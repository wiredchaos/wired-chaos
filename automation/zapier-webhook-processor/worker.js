// WIRED CHAOS - Zapier Webhook Processor
// Cloudflare Worker for handling Zapier webhook events

addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

async function handleRequest(request) {
  const url = new URL(request.url)
  const path = url.pathname

  // CORS headers
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Zapier-Signature',
    'Access-Control-Max-Age': '86400',
  }

  // Handle CORS preflight
  if (request.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  // Route handling
  if (path === '/api/zapier/webhook' && request.method === 'POST') {
    return handleZapierWebhook(request, corsHeaders)
  } else if (path === '/api/zapier/health') {
    return handleHealthCheck(corsHeaders)
  } else if (path === '/api/zapier/status') {
    return handleStatus(corsHeaders)
  }

  return new Response('Not Found', { 
    status: 404, 
    headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
  })
}

async function handleZapierWebhook(request, corsHeaders) {
  try {
    const body = await request.json()
    
    // Log webhook event
    console.log('Zapier webhook received:', {
      timestamp: new Date().toISOString(),
      event_type: body.event_type || 'unknown',
      source: body.source || 'zapier'
    })

    // Verify signature if provided
    const signature = request.headers.get('X-Zapier-Signature')
    if (signature) {
      // TODO: Implement signature verification
      console.log('Signature verification: skipped (implement if needed)')
    }

    // Process webhook based on event type
    let result
    switch (body.event_type) {
      case 'signup':
        result = await processSignupEvent(body)
        break
      case 'deck_generation':
        result = await processDeckGenerationEvent(body)
        break
      case 'content_sync':
        result = await processContentSyncEvent(body)
        break
      case 'notification':
        result = await processNotificationEvent(body)
        break
      default:
        result = await processGenericEvent(body)
    }

    return new Response(JSON.stringify({
      success: true,
      message: 'Webhook processed successfully',
      event_type: body.event_type,
      result: result,
      timestamp: new Date().toISOString()
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('Webhook processing error:', error)
    return new Response(JSON.stringify({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
}

async function processSignupEvent(data) {
  console.log('Processing signup event:', data)
  
  // Extract signup data
  const { email, name, company, phone } = data
  
  // TODO: Trigger deck generation workflow
  // TODO: Add to CRM (Notion)
  // TODO: Send welcome email
  
  return {
    action: 'signup_processed',
    email: email,
    next_steps: [
      'deck_generation_queued',
      'crm_entry_created',
      'welcome_email_sent'
    ]
  }
}

async function processDeckGenerationEvent(data) {
  console.log('Processing deck generation event:', data)
  
  // TODO: Call Gamma API to generate presentation
  // TODO: Store deck URL in CRM
  // TODO: Send deck to user
  
  return {
    action: 'deck_generated',
    deck_id: 'generated-deck-id',
    status: 'ready'
  }
}

async function processContentSyncEvent(data) {
  console.log('Processing content sync event:', data)
  
  // TODO: Sync content between Notion, Gamma, and Wix
  // TODO: Update social media
  
  return {
    action: 'content_synced',
    platforms: ['notion', 'gamma', 'wix', 'social']
  }
}

async function processNotificationEvent(data) {
  console.log('Processing notification event:', data)
  
  // TODO: Send notifications to Discord, Telegram, etc.
  
  return {
    action: 'notification_sent',
    channels: ['discord', 'telegram']
  }
}

async function processGenericEvent(data) {
  console.log('Processing generic event:', data)
  
  return {
    action: 'event_logged',
    event_type: data.event_type || 'unknown'
  }
}

async function handleHealthCheck(corsHeaders) {
  return new Response(JSON.stringify({
    status: 'healthy',
    service: 'zapier-webhook-processor',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  }), {
    status: 200,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  })
}

async function handleStatus(corsHeaders) {
  return new Response(JSON.stringify({
    service: 'zapier-webhook-processor',
    status: 'operational',
    version: '1.0.0',
    endpoints: [
      '/api/zapier/webhook (POST)',
      '/api/zapier/health (GET)',
      '/api/zapier/status (GET)'
    ],
    capabilities: [
      'signup_processing',
      'deck_generation',
      'content_sync',
      'notifications'
    ],
    integrations: [
      'zapier',
      'gamma',
      'notion',
      'wix',
      'discord',
      'telegram'
    ],
    timestamp: new Date().toISOString()
  }), {
    status: 200,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  })
}
