#!/usr/bin/env node
/**
 * Presentation Generator
 * Main automation engine for generating GAMMA presentations
 */

import GammaClient from './gamma-client.js';
import WixClient from './wix-client.js';
import TemplateManager from './template-manager.js';
import { config, validateConfig } from '../config/gamma-config.js';
import { getCurrentEnvironment, checkEnvironmentVariables } from '../config/environment.js';

class PresentationGenerator {
  constructor() {
    this.gammaClient = new GammaClient();
    this.wixClient = new WixClient();
    this.templateManager = new TemplateManager();
    this.env = getCurrentEnvironment();
  }

  /**
   * Initialize and validate configuration
   */
  async initialize() {
    console.log('🚀 Initializing GAMMA-Wix Automation...');
    console.log(`📍 Environment: ${this.env.name}`);

    try {
      if (checkEnvironmentVariables()) {
        validateConfig();
        console.log('✅ Configuration validated');
      } else {
        console.warn('⚠️  Some environment variables are missing. Using defaults.');
      }
    } catch (error) {
      console.error('❌ Configuration validation failed:', error.message);
      throw error;
    }
  }

  /**
   * Generate component documentation presentation
   */
  async generateComponentPresentation(componentData) {
    console.log(`\n📝 Generating component presentation: ${componentData.name}`);

    try {
      // Generate presentation from template
      const presentation = this.templateManager.generateComponentPresentation(componentData);
      
      // Create on GAMMA
      const result = await this.gammaClient.createPresentation(
        presentation.title,
        presentation.slides,
        { type: 'component', componentName: componentData.name }
      );

      if (!result.success) {
        throw new Error(result.error);
      }

      console.log(`✅ Component presentation created: ${result.data.id}`);
      return result.data;
    } catch (error) {
      console.error(`❌ Failed to generate component presentation:`, error.message);
      throw error;
    }
  }

  /**
   * Generate feature release presentation
   */
  async generateFeaturePresentation(featureData) {
    console.log(`\n🎉 Generating feature presentation: ${featureData.name}`);

    try {
      const presentation = this.templateManager.generateFeaturePresentation(featureData);
      
      const result = await this.gammaClient.createPresentation(
        presentation.title,
        presentation.slides,
        { type: 'feature', featureName: featureData.name, version: featureData.version }
      );

      if (!result.success) {
        throw new Error(result.error);
      }

      console.log(`✅ Feature presentation created: ${result.data.id}`);
      return result.data;
    } catch (error) {
      console.error(`❌ Failed to generate feature presentation:`, error.message);
      throw error;
    }
  }

  /**
   * Generate milestone presentation
   */
  async generateMilestonePresentation(milestoneData) {
    console.log(`\n🏆 Generating milestone presentation: ${milestoneData.name}`);

    try {
      const presentation = this.templateManager.generateMilestonePresentation(milestoneData);
      
      const result = await this.gammaClient.createPresentation(
        presentation.title,
        presentation.slides,
        { type: 'milestone', milestoneName: milestoneData.name }
      );

      if (!result.success) {
        throw new Error(result.error);
      }

      console.log(`✅ Milestone presentation created: ${result.data.id}`);
      return result.data;
    } catch (error) {
      console.error(`❌ Failed to generate milestone presentation:`, error.message);
      throw error;
    }
  }

  /**
   * Sync presentation to Wix gallery
   */
  async syncToWix(presentation, galleryType = 'components') {
    console.log(`\n🔄 Syncing presentation to Wix gallery: ${galleryType}`);

    try {
      // Export presentation
      const exportResult = await this.gammaClient.exportPresentation(
        presentation.id,
        'pdf',
        { quality: 'high' }
      );

      if (!exportResult.success) {
        throw new Error('Failed to export presentation');
      }

      // Add to Wix gallery
      const wixResult = await this.wixClient.addToGallery(galleryType, {
        id: presentation.id,
        title: presentation.title,
        description: presentation.metadata?.description || '',
        url: exportResult.data.url,
        metadata: presentation.metadata
      });

      if (!wixResult.success) {
        throw new Error(wixResult.error);
      }

      console.log(`✅ Presentation synced to Wix gallery`);
      return wixResult.data;
    } catch (error) {
      console.error(`❌ Failed to sync to Wix:`, error.message);
      throw error;
    }
  }

  /**
   * Batch generate presentations
   */
  async batchGenerate(items, type = 'component') {
    console.log(`\n📦 Batch generating ${items.length} ${type} presentations...`);

    const results = [];
    const batchSize = config.automation.batchSize;

    for (let i = 0; i < items.length; i += batchSize) {
      const batch = items.slice(i, i + batchSize);
      console.log(`\nProcessing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(items.length / batchSize)}`);

      const batchResults = await Promise.allSettled(
        batch.map(item => {
          switch (type) {
            case 'component':
              return this.generateComponentPresentation(item);
            case 'feature':
              return this.generateFeaturePresentation(item);
            case 'milestone':
              return this.generateMilestonePresentation(item);
            default:
              throw new Error(`Unknown type: ${type}`);
          }
        })
      );

      results.push(...batchResults);

      // Wait between batches to avoid rate limiting
      if (i + batchSize < items.length) {
        console.log('⏳ Waiting before next batch...');
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }

    const successful = results.filter(r => r.status === 'fulfilled').length;
    const failed = results.filter(r => r.status === 'rejected').length;

    console.log(`\n✅ Batch generation complete: ${successful} successful, ${failed} failed`);
    return results;
  }

  /**
   * Send notification
   */
  async sendNotification(message, type = 'info') {
    if (!config.automation.enableNotifications) {
      return;
    }

    console.log(`📢 Notification: ${message}`);

    // Discord notification
    if (config.notifications.discord.enabled && config.notifications.discord.webhookUrl) {
      try {
        await fetch(config.notifications.discord.webhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            embeds: [{
              title: 'GAMMA-Wix Automation',
              description: message,
              color: type === 'error' ? 15158332 : type === 'success' ? 3066993 : 3447003,
              timestamp: new Date().toISOString()
            }]
          })
        });
      } catch (error) {
        console.error('Failed to send Discord notification:', error.message);
      }
    }

    // Telegram notification
    if (config.notifications.telegram.enabled && config.notifications.telegram.botToken) {
      try {
        const url = `https://api.telegram.org/bot${config.notifications.telegram.botToken}/sendMessage`;
        await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: config.notifications.telegram.chatId,
            text: `🤖 GAMMA-Wix Automation\n\n${message}`
          })
        });
      } catch (error) {
        console.error('Failed to send Telegram notification:', error.message);
      }
    }
  }
}

/**
 * Main execution
 */
async function main() {
  const generator = new PresentationGenerator();

  try {
    await generator.initialize();

    // Example: Generate a sample component presentation
    const sampleComponent = {
      name: 'Suite Landing Component',
      description: 'WIRED CHAOS Suite Landing Page Component',
      overview: 'A comprehensive landing page component for the WIRED CHAOS suite',
      features: [
        'Responsive design',
        'Cyberpunk theme',
        'AR/VR integration',
        'Real-time analytics'
      ],
      codeExample: `import SuiteLanding from '@wired-chaos/suite-landing';

// Initialize component
const landing = new SuiteLanding({
  theme: 'cyber-dark',
  enableAR: true
});

// Render
landing.render('#app');`,
      language: 'javascript',
      apiEndpoints: [
        { method: 'GET', path: '/api/suite/info', description: 'Get suite information' },
        { method: 'POST', path: '/api/suite/track', description: 'Track user interaction' }
      ]
    };

    console.log('\n🎨 Example: Generating sample presentation...');
    const presentation = await generator.generateComponentPresentation(sampleComponent);

    if (presentation) {
      await generator.sendNotification(
        `Successfully generated presentation: ${presentation.title}`,
        'success'
      );
    }

    console.log('\n✅ Automation complete!');
  } catch (error) {
    console.error('\n❌ Automation failed:', error.message);
    await generator.sendNotification(
      `Automation failed: ${error.message}`,
      'error'
    );
    process.exit(1);
  }
}

// Run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { PresentationGenerator };
export default PresentationGenerator;
