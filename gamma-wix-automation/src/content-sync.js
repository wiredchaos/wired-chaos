#!/usr/bin/env node
/**
 * Content Synchronization
 * Sync presentations between GAMMA and Wix
 */

import GammaClient from './gamma-client.js';
import WixClient from './wix-client.js';
import { config } from '../config/gamma-config.js';

class ContentSync {
  constructor() {
    this.gammaClient = new GammaClient();
    this.wixClient = new WixClient();
  }

  /**
   * Sync all presentations to Wix
   */
  async syncAllToWix() {
    console.log('🔄 Starting full sync to Wix...');

    try {
      // Get all presentations from GAMMA
      const presentationsResult = await this.gammaClient.listPresentations();
      
      if (!presentationsResult.success) {
        throw new Error('Failed to fetch presentations from GAMMA');
      }

      const presentations = presentationsResult.data;
      console.log(`📋 Found ${presentations.length} presentations to sync`);

      const results = [];
      for (const presentation of presentations) {
        try {
          // Determine gallery type from metadata
          const galleryType = presentation.metadata?.type || 'components';
          
          // Export presentation
          const exportResult = await this.gammaClient.exportPresentation(
            presentation.id,
            'pdf',
            { quality: 'high' }
          );

          if (!exportResult.success) {
            console.error(`❌ Failed to export ${presentation.title}`);
            results.push({ success: false, presentation: presentation.title, error: 'Export failed' });
            continue;
          }

          // Add to Wix
          const wixResult = await this.wixClient.addToGallery(galleryType, {
            id: presentation.id,
            title: presentation.title,
            description: presentation.description || '',
            url: exportResult.data.url,
            metadata: presentation.metadata
          });

          if (wixResult.success) {
            console.log(`✅ Synced: ${presentation.title}`);
            results.push({ success: true, presentation: presentation.title, wixId: wixResult.data.id });
          } else {
            console.error(`❌ Failed to add ${presentation.title} to Wix`);
            results.push({ success: false, presentation: presentation.title, error: wixResult.error });
          }

          // Rate limiting
          await new Promise(resolve => setTimeout(resolve, 1000));
        } catch (error) {
          console.error(`❌ Error syncing ${presentation.title}:`, error.message);
          results.push({ success: false, presentation: presentation.title, error: error.message });
        }
      }

      const successful = results.filter(r => r.success).length;
      const failed = results.filter(r => !r.success).length;

      console.log(`\n✅ Sync complete: ${successful} successful, ${failed} failed`);
      return results;
    } catch (error) {
      console.error('❌ Sync failed:', error.message);
      throw error;
    }
  }

  /**
   * Sync single presentation to Wix
   */
  async syncPresentationToWix(presentationId, galleryType = 'components') {
    console.log(`🔄 Syncing presentation ${presentationId} to Wix...`);

    try {
      // Get presentation from GAMMA
      const presentationResult = await this.gammaClient.getPresentation(presentationId);
      
      if (!presentationResult.success) {
        throw new Error('Failed to fetch presentation from GAMMA');
      }

      const presentation = presentationResult.data;

      // Export presentation
      const exportResult = await this.gammaClient.exportPresentation(
        presentationId,
        'pdf',
        { quality: 'high' }
      );

      if (!exportResult.success) {
        throw new Error('Failed to export presentation');
      }

      // Add to Wix
      const wixResult = await this.wixClient.addToGallery(galleryType, {
        id: presentation.id,
        title: presentation.title,
        description: presentation.description || '',
        url: exportResult.data.url,
        metadata: presentation.metadata
      });

      if (!wixResult.success) {
        throw new Error(wixResult.error);
      }

      console.log(`✅ Presentation synced to Wix`);
      return wixResult.data;
    } catch (error) {
      console.error('❌ Sync failed:', error.message);
      throw error;
    }
  }

  /**
   * Sync Wix content to GAMMA (reverse sync)
   */
  async syncWixToGamma(collectionId) {
    console.log(`🔄 Syncing Wix content from ${collectionId} to GAMMA...`);

    try {
      // Get content from Wix
      const contentResult = await this.wixClient.getContent(collectionId);
      
      if (!contentResult.success) {
        throw new Error('Failed to fetch content from Wix');
      }

      const items = contentResult.data.items || [];
      console.log(`📋 Found ${items.length} items to sync`);

      const results = [];
      for (const item of items) {
        try {
          // Create presentation in GAMMA
          const slides = this.convertWixContentToSlides(item);
          
          const gammaResult = await this.gammaClient.createPresentation(
            item.title,
            slides,
            { 
              type: 'wix-import',
              wixCollectionId: collectionId,
              wixItemId: item.id
            }
          );

          if (gammaResult.success) {
            console.log(`✅ Created presentation: ${item.title}`);
            results.push({ success: true, item: item.title, gammaId: gammaResult.data.id });
          } else {
            console.error(`❌ Failed to create presentation for ${item.title}`);
            results.push({ success: false, item: item.title, error: gammaResult.error });
          }

          // Rate limiting
          await new Promise(resolve => setTimeout(resolve, 1000));
        } catch (error) {
          console.error(`❌ Error creating presentation for ${item.title}:`, error.message);
          results.push({ success: false, item: item.title, error: error.message });
        }
      }

      const successful = results.filter(r => r.success).length;
      const failed = results.filter(r => !r.success).length;

      console.log(`\n✅ Sync complete: ${successful} successful, ${failed} failed`);
      return results;
    } catch (error) {
      console.error('❌ Sync failed:', error.message);
      throw error;
    }
  }

  /**
   * Convert Wix content to GAMMA slides
   */
  convertWixContentToSlides(wixItem) {
    const slides = [];

    // Title slide
    slides.push({
      type: 'title',
      title: wixItem.title,
      content: wixItem.description || '',
      layout: 'single'
    });

    // Content slides
    if (wixItem.content) {
      slides.push({
        type: 'content',
        title: 'Content',
        content: wixItem.content,
        layout: 'single'
      });
    }

    // Additional metadata slides
    if (wixItem.metadata) {
      slides.push({
        type: 'content',
        title: 'Details',
        content: JSON.stringify(wixItem.metadata, null, 2),
        layout: 'two-column'
      });
    }

    return slides;
  }

  /**
   * Check sync status
   */
  async checkSyncStatus() {
    console.log('📊 Checking sync status...');

    try {
      // Get presentations from GAMMA
      const gammaResult = await this.gammaClient.listPresentations();
      const gammaCount = gammaResult.success ? gammaResult.data.length : 0;

      // Get galleries from Wix
      const wixResult = await this.wixClient.listGalleries();
      const wixCount = wixResult.success ? wixResult.data.length : 0;

      console.log(`\n📊 Sync Status:`);
      console.log(`   GAMMA Presentations: ${gammaCount}`);
      console.log(`   Wix Galleries: ${wixCount}`);

      return {
        gamma: gammaCount,
        wix: wixCount,
        synced: true
      };
    } catch (error) {
      console.error('❌ Failed to check sync status:', error.message);
      throw error;
    }
  }
}

/**
 * Main execution
 */
async function main() {
  const sync = new ContentSync();

  try {
    const command = process.argv[2] || 'status';

    switch (command) {
      case 'all':
        await sync.syncAllToWix();
        break;
      case 'presentation':
        const presentationId = process.argv[3];
        const galleryType = process.argv[4] || 'components';
        if (!presentationId) {
          console.error('❌ Please provide presentation ID');
          process.exit(1);
        }
        await sync.syncPresentationToWix(presentationId, galleryType);
        break;
      case 'wix-to-gamma':
        const collectionId = process.argv[3];
        if (!collectionId) {
          console.error('❌ Please provide collection ID');
          process.exit(1);
        }
        await sync.syncWixToGamma(collectionId);
        break;
      case 'status':
      default:
        await sync.checkSyncStatus();
        break;
    }

    console.log('\n✅ Sync operation complete!');
  } catch (error) {
    console.error('\n❌ Sync operation failed:', error.message);
    process.exit(1);
  }
}

// Run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { ContentSync };
export default ContentSync;
