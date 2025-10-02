/**
 * Ticker SSE Route - Enhanced with InsightX Events
 * Streams: price updates + ix:risk + ix:bubble + ix:watch
 */

const INSIGHTX_EVENTS = ['ix:risk', 'ix:bubble', 'ix:watch'];

/**
 * Generate stub InsightX event data
 */
function generateStubInsightXEvent() {
  const eventTypes = INSIGHTX_EVENTS;
  const eventType = eventTypes[Math.floor(Math.random() * eventTypes.length)];
  
  const symbols = ['BTC', 'ETH', 'SOL', 'MATIC', 'ARB', 'OP', 'AVAX', 'DOGE'];
  const symbol = symbols[Math.floor(Math.random() * symbols.length)];
  
  const data = {
    symbol,
    timestamp: Date.now(),
    type: eventType
  };
  
  switch (eventType) {
    case 'ix:risk':
      data.riskLevel = ['low', 'medium', 'high', 'critical'][Math.floor(Math.random() * 4)];
      data.score = Math.floor(Math.random() * 100);
      data.factors = ['volatility', 'liquidity', 'sentiment'][Math.floor(Math.random() * 3)];
      break;
    case 'ix:bubble':
      data.bubbleScore = Math.floor(Math.random() * 100);
      data.trend = ['bullish', 'bearish', 'neutral'][Math.floor(Math.random() * 3)];
      data.volume = Math.floor(Math.random() * 1000000);
      break;
    case 'ix:watch':
      data.action = ['added', 'removed', 'updated'][Math.floor(Math.random() * 3)];
      data.reason = 'unusual_activity';
      data.confidence = (Math.random() * 100).toFixed(2);
      break;
  }
  
  return { event: eventType, data };
}

/**
 * Fetch real InsightX data if API key available
 */
async function fetchInsightXData(env) {
  const apiKey = env.INSIGHTX_API_KEY;
  const apiUrl = env.INSIGHTX_API_URL || 'https://api.insightx.network';
  
  if (!apiKey) {
    return null; // Fall back to stub mode
  }
  
  try {
    const response = await fetch(`${apiUrl}/v1/signals/latest`, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      signal: AbortSignal.timeout(5000) // 5s timeout
    });
    
    if (!response.ok) {
      if (response.status === 401) {
        console.error('InsightX API: Invalid API key');
      } else if (response.status >= 500) {
        console.error('InsightX API: Server error');
      }
      return null; // Silent failure
    }
    
    return await response.json();
  } catch (error) {
    console.error('InsightX API fetch error:', error);
    return null; // Silent failure
  }
}

/**
 * Generate price tick data (existing functionality)
 */
function generatePriceTick() {
  const symbols = ['BTC', 'ETH', 'SOL', 'MATIC', 'ARB', 'OP'];
  const symbol = symbols[Math.floor(Math.random() * symbols.length)];
  const price = (Math.random() * 10000 + 100).toFixed(2);
  const change = (Math.random() * 10 - 5).toFixed(2);
  
  return {
    symbol,
    price: parseFloat(price),
    change: parseFloat(change),
    timestamp: Date.now()
  };
}

/**
 * Handle ticker SSE endpoint
 */
export async function handleTicker(request, env) {
  const allowedOrigins = (env.TICKER_ALLOW_ORIGINS || '*').split(',');
  const origin = request.headers.get('Origin') || '*';
  
  // CORS check
  const corsOrigin = allowedOrigins.includes('*') || allowedOrigins.includes(origin) 
    ? origin : allowedOrigins[0];
  
  // Create SSE stream
  const { readable, writable } = new TransformStream();
  const writer = writable.getWriter();
  const encoder = new TextEncoder();
  
  // Send SSE messages
  const sendEvent = async (event, data) => {
    const message = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
    await writer.write(encoder.encode(message));
  };
  
  // Start streaming
  (async () => {
    try {
      // Send initial connection event
      await sendEvent('connected', { 
        timestamp: Date.now(), 
        mode: env.INSIGHTX_API_KEY ? 'live' : 'stub' 
      });
      
      // Streaming loop
      let counter = 0;
      const interval = 2000; // 2 seconds
      
      while (counter < 1800) { // 1 hour max (1800 * 2s)
        // Send price tick (existing functionality)
        const priceTick = generatePriceTick();
        await sendEvent('price', priceTick);
        
        // Send InsightX event every 3rd tick
        if (counter % 3 === 0) {
          const insightxData = await fetchInsightXData(env);
          
          if (insightxData && insightxData.signals) {
            // Use real InsightX data
            for (const signal of insightxData.signals.slice(0, 3)) {
              await sendEvent(signal.type, signal);
            }
          } else {
            // Use stub data
            const stubEvent = generateStubInsightXEvent();
            await sendEvent(stubEvent.event, stubEvent.data);
          }
        }
        
        // Wait for next interval
        await new Promise(resolve => setTimeout(resolve, interval));
        counter++;
      }
      
      // Close stream
      await sendEvent('closed', { timestamp: Date.now() });
      await writer.close();
    } catch (error) {
      console.error('Ticker stream error:', error);
      try {
        await writer.close();
      } catch (e) {
        // Ignore close errors
      }
    }
  })();
  
  return new Response(readable, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': corsOrigin,
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    }
  });
}
