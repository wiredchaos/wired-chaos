/**
 * WIRED CHAOS - Wix Velo Data Hooks
 * Backend hooks for syncing Wix data changes with the worker
 */

import { syncWixToGamma, trackAnalytics } from './worker-api-client.js';

/**
 * Hook: After item is inserted
 * Triggers sync to GAMMA when new content is created
 */
export function Content_afterInsert(item, context) {
  // Sync to GAMMA asynchronously
  syncWixToGamma({
    action: 'create',
    contentType: 'article',
    data: {
      id: item._id,
      title: item.title,
      content: item.content,
      author: item.author,
      createdAt: item._createdDate,
    },
  })
    .then(() => {
      console.log('Content synced to GAMMA:', item._id);
    })
    .catch((error) => {
      console.error('Failed to sync content to GAMMA:', error);
    });

  // Track analytics
  trackAnalytics({
    event: 'content_created',
    contentId: item._id,
    contentType: 'article',
    timestamp: Date.now(),
  }).catch((error) => {
    console.error('Failed to track analytics:', error);
  });

  return item;
}

/**
 * Hook: After item is updated
 * Triggers sync to GAMMA when content is updated
 */
export function Content_afterUpdate(item, context) {
  // Sync updates to GAMMA
  syncWixToGamma({
    action: 'update',
    contentType: 'article',
    data: {
      id: item._id,
      title: item.title,
      content: item.content,
      author: item.author,
      updatedAt: item._updatedDate,
    },
  })
    .then(() => {
      console.log('Content update synced to GAMMA:', item._id);
    })
    .catch((error) => {
      console.error('Failed to sync content update to GAMMA:', error);
    });

  // Track analytics
  trackAnalytics({
    event: 'content_updated',
    contentId: item._id,
    contentType: 'article',
    timestamp: Date.now(),
  }).catch((error) => {
    console.error('Failed to track analytics:', error);
  });

  return item;
}

/**
 * Hook: Before item is removed
 * Notifies GAMMA before content is deleted
 */
export function Content_beforeRemove(itemId, context) {
  // Notify GAMMA about deletion
  syncWixToGamma({
    action: 'delete',
    contentType: 'article',
    data: {
      id: itemId,
    },
  })
    .then(() => {
      console.log('Content deletion synced to GAMMA:', itemId);
    })
    .catch((error) => {
      console.error('Failed to sync content deletion to GAMMA:', error);
    });

  // Track analytics
  trackAnalytics({
    event: 'content_deleted',
    contentId: itemId,
    contentType: 'article',
    timestamp: Date.now(),
  }).catch((error) => {
    console.error('Failed to track analytics:', error);
  });

  return itemId;
}

/**
 * Hook: After AR model is inserted
 * Uploads AR model data to worker
 */
export function ARModels_afterInsert(item, context) {
  // Import at function level to avoid circular dependencies
  import('./worker-api-client.js').then(({ uploadARModel, trackAnalytics }) => {
    // Upload AR model
    uploadARModel({
      id: item._id,
      name: item.name,
      modelUrl: item.modelUrl,
      thumbnailUrl: item.thumbnailUrl,
      format: item.format,
      metadata: item.metadata,
    })
      .then(() => {
        console.log('AR model uploaded to worker:', item._id);
      })
      .catch((error) => {
        console.error('Failed to upload AR model:', error);
      });

    // Track analytics
    trackAnalytics({
      event: 'ar_model_uploaded',
      modelId: item._id,
      format: item.format,
      timestamp: Date.now(),
    }).catch((error) => {
      console.error('Failed to track analytics:', error);
    });
  });

  return item;
}
