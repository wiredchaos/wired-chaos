/**
 * Heat Map API - Generate 8x8 intensity grids from InsightX signals
 */

/**
 * Generate stub heat map data
 */
function generateStubHeatMap() {
  const grid = {
    rows: 8,
    cols: 8,
    cells: []
  };
  
  // Generate 64 cells with intensity values 0-1
  for (let i = 0; i < 64; i++) {
    const row = Math.floor(i / 8);
    const col = i % 8;
    
    // Create clusters of high intensity
    const centerRow = 4;
    const centerCol = 4;
    const distance = Math.sqrt(
      Math.pow(row - centerRow, 2) + Math.pow(col - centerCol, 2)
    );
    
    // Intensity decreases with distance from center
    const intensity = Math.max(0, 1 - (distance / 6) + (Math.random() * 0.3 - 0.15));
    
    grid.cells.push({
      row,
      col,
      intensity: Math.min(1, Math.max(0, intensity)),
      symbol: ['BTC', 'ETH', 'SOL', 'MATIC', 'ARB', 'OP', 'AVAX', 'DOGE'][col],
      metric: ['volume', 'price', 'volatility', 'sentiment', 'risk', 'bubble', 'liquidity', 'momentum'][row]
    });
  }
  
  return grid;
}

/**
 * Fetch real heat map data from InsightX
 */
async function fetchInsightXHeatMap(env) {
  const apiKey = env.INSIGHTX_API_KEY;
  const apiUrl = env.INSIGHTX_API_URL || 'https://api.insightx.network';
  
  if (!apiKey) {
    return null;
  }
  
  try {
    const response = await fetch(`${apiUrl}/v1/heatmap`, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      signal: AbortSignal.timeout(5000)
    });
    
    if (!response.ok) {
      console.error(`InsightX Heat Map API error: ${response.status}`);
      return null;
    }
    
    return await response.json();
  } catch (error) {
    console.error('InsightX Heat Map fetch error:', error);
    return null;
  }
}

/**
 * Transform InsightX data to 8x8 grid format
 */
function transformToGrid(insightxData) {
  if (!insightxData || !insightxData.data) {
    return null;
  }
  
  const grid = {
    rows: 8,
    cols: 8,
    cells: []
  };
  
  // Map InsightX data to grid cells
  for (let i = 0; i < 64; i++) {
    const row = Math.floor(i / 8);
    const col = i % 8;
    const dataPoint = insightxData.data[i];
    
    grid.cells.push({
      row,
      col,
      intensity: dataPoint ? (dataPoint.intensity || 0) : 0,
      symbol: dataPoint ? dataPoint.symbol : null,
      metric: dataPoint ? dataPoint.metric : null
    });
  }
  
  return grid;
}

/**
 * Handle heat map endpoint
 */
export async function handleHeatMap(request, env) {
  try {
    // Try to fetch real data first
    const insightxData = await fetchInsightXHeatMap(env);
    const grid = insightxData ? transformToGrid(insightxData) : generateStubHeatMap();
    
    const response = {
      ts: Date.now(),
      grid,
      mode: env.INSIGHTX_API_KEY && insightxData ? 'live' : 'stub'
    };
    
    return new Response(JSON.stringify(response), {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=5',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
      }
    });
  } catch (error) {
    console.error('Heat map error:', error);
    
    // Fallback to stub data on error
    const grid = generateStubHeatMap();
    
    return new Response(JSON.stringify({
      ts: Date.now(),
      grid,
      mode: 'stub',
      error: 'Failed to fetch live data'
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=5',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }
}
