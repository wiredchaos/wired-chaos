/**
 * WIRED CHAOS - Wix Velo HTTP Functions
 * Backend HTTP functions for exposing worker API endpoints
 */

import { ok, badRequest, serverError } from 'wix-http-functions';
import {
  getWixSiteData,
  getGammaPresentations,
  syncWixToGamma,
  syncGammaToWix,
  checkHealth,
} from './worker-api-client.js';

/**
 * GET /api/site-data
 * Fetch site data from worker
 */
export async function get_siteData(request) {
  try {
    const data = await getWixSiteData();
    return ok({
      body: JSON.stringify(data),
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Error in get_siteData:', error);
    return serverError({
      body: JSON.stringify({ error: error.message }),
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
}

/**
 * GET /api/presentations
 * Fetch GAMMA presentations
 */
export async function get_presentations(request) {
  try {
    const query = request.query || {};
    const limit = parseInt(query.limit || '10', 10);

    const data = await getGammaPresentations(limit);
    return ok({
      body: JSON.stringify(data),
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Error in get_presentations:', error);
    return serverError({
      body: JSON.stringify({ error: error.message }),
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
}

/**
 * POST /api/sync-to-gamma
 * Sync WIX content to GAMMA
 */
export async function post_syncToGamma(request) {
  try {
    const body = await request.body.json();

    if (!body || !body.contentId) {
      return badRequest({
        body: JSON.stringify({ error: 'Missing contentId in request body' }),
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }

    const data = await syncWixToGamma(body);
    return ok({
      body: JSON.stringify(data),
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Error in post_syncToGamma:', error);
    return serverError({
      body: JSON.stringify({ error: error.message }),
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
}

/**
 * POST /api/sync-from-gamma
 * Sync GAMMA presentation to WIX
 */
export async function post_syncFromGamma(request) {
  try {
    const body = await request.body.json();

    if (!body || !body.presentationId) {
      return badRequest({
        body: JSON.stringify({ error: 'Missing presentationId in request body' }),
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }

    const data = await syncGammaToWix(body);
    return ok({
      body: JSON.stringify(data),
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Error in post_syncFromGamma:', error);
    return serverError({
      body: JSON.stringify({ error: error.message }),
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
}

/**
 * GET /api/health
 * Check worker health status
 */
export async function get_health(request) {
  try {
    const data = await checkHealth();
    return ok({
      body: JSON.stringify(data),
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Error in get_health:', error);
    return serverError({
      body: JSON.stringify({ error: error.message, healthy: false }),
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
}

/**
 * POST /api/webhook
 * Handle incoming webhooks from external services
 */
export async function post_webhook(request) {
  try {
    const body = await request.body.json();
    const signature = request.headers['x-webhook-signature'];

    // Verify signature if needed
    // const isValid = await verifySignature(body, signature);
    // if (!isValid) {
    //   return badRequest({ body: JSON.stringify({ error: 'Invalid signature' }) });
    // }

    // Process webhook
    console.log('Webhook received:', body);

    // Trigger appropriate sync based on webhook type
    if (body.source === 'gamma') {
      await syncGammaToWix(body);
    } else if (body.source === 'wix') {
      await syncWixToGamma(body);
    }

    return ok({
      body: JSON.stringify({ received: true }),
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Error in post_webhook:', error);
    return serverError({
      body: JSON.stringify({ error: error.message }),
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
}
