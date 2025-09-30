/**
 * Simple Merkle root calculation for PoS-M evidence
 */
function calculateMerkleRoot(artifacts) {
  if (!artifacts || artifacts.length === 0) {
    return 'EMPTY_ROOT';
  }
  
  // Simple hash concatenation for stub implementation
  const combined = artifacts.map(a => a.sha256 || '').join('');
  return `MERKLE_${combined.substring(0, 16)}_${Date.now()}`;
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // WCU API endpoints
    if (url.pathname === '/api/university/progress/save' && request.method === 'POST') {
      try {
        const body = await request.json();
        // In a real implementation, this would save to KV or D1
        return new Response(JSON.stringify({ ok: true }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        });
      } catch (e) {
        return new Response(JSON.stringify({ ok: false, error: e.message }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
      }
    }

    if (url.pathname === '/api/pos/enroll/issue' && request.method === 'POST') {
      try {
        const body = await request.json();
        const { userId, wallet, programId, cohortId } = body;
        
        // Validate minimal inputs
        if (!userId || !wallet) {
          return new Response(JSON.stringify({ 
            status: 'error', 
            message: 'userId and wallet are required' 
          }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' }
          });
        }
        
        const txHash = `POSE_${Date.now()}`;
        
        return new Response(JSON.stringify({
          status: 'ok',
          tx_hash: txHash,
          credential_url: `/verify/pose/${txHash}`,
          userId,
          wallet,
          programId: programId || 'WCU-2024',
          cohortId: cohortId || 'COHORT-1',
          timestamp: new Date().toISOString()
        }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        });
      } catch (e) {
        return new Response(JSON.stringify({ 
          status: 'error', 
          error: e.message 
        }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
      }
    }

    if (url.pathname === '/api/pos/enroll/revoke' && request.method === 'POST') {
      try {
        const body = await request.json();
        const { userId, tx_hash } = body;
        
        return new Response(JSON.stringify({
          status: 'ok',
          revoked: true,
          tx: tx_hash,
          userId,
          timestamp: new Date().toISOString()
        }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        });
      } catch (e) {
        return new Response(JSON.stringify({ 
          status: 'error', 
          error: e.message 
        }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
      }
    }

    if (url.pathname === '/api/pos/mastery/mint' && request.method === 'POST') {
      try {
        const body = await request.json();
        const { userId, wallet, badge, modules, artifacts } = body;
        
        // Validate inputs
        if (!userId || !wallet || !badge) {
          return new Response(JSON.stringify({ 
            status: 'error', 
            message: 'userId, wallet, and badge are required' 
          }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' }
          });
        }
        
        // Calculate evidence root (Merkle root of artifacts)
        const evidenceRoot = calculateMerkleRoot(artifacts || []);
        
        const txHash = `POSM_${Date.now()}`;
        
        // Build metadata for NFT
        const metadata = {
          name: `WCU Badge: ${badge}`,
          description: `Proof of School - Mastery credential for ${badge}`,
          badge,
          modules: modules || [],
          artifacts: artifacts || [],
          evidenceRoot,
          userId,
          wallet,
          kind: 'XRPL',
          timestamp: new Date().toISOString()
        };
        
        return new Response(JSON.stringify({
          status: 'ok',
          tx_hash: txHash,
          credential_url: `/verify/posm/${txHash}`,
          metadata,
          evidenceRoot
        }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        });
      } catch (e) {
        return new Response(JSON.stringify({ 
          status: 'error', 
          error: e.message 
        }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
      }
    }

    if (url.pathname === '/api/rss/digest' && request.method === 'POST') {
      try {
        const body = await request.json();
        const schedule = body.schedule || 'daily';
        
        return new Response(JSON.stringify({
          scheduled: true,
          schedule,
          timestamp: new Date().toISOString()
        }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        });
      } catch (e) {
        return new Response(JSON.stringify({ 
          scheduled: false, 
          error: e.message 
        }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
      }
    }

    // Existing proxy logic
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
