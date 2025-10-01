/**
 * Template Manager
 * Manages presentation templates for different content types
 */

import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { config } from '../config/gamma-config.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export class TemplateManager {
  constructor() {
    this.templates = new Map();
    this.branding = config.gamma.brandingSettings;
  }

  /**
   * Load template from file
   */
  loadTemplate(templateName) {
    try {
      const templatePath = join(__dirname, '..', 'templates', `${templateName}.json`);
      const templateData = JSON.parse(readFileSync(templatePath, 'utf8'));
      this.templates.set(templateName, templateData);
      console.log(`✅ Loaded template: ${templateName}`);
      return templateData;
    } catch (error) {
      console.error(`❌ Failed to load template ${templateName}:`, error.message);
      // Return a default template structure
      return this.getDefaultTemplate(templateName);
    }
  }

  /**
   * Get default template structure
   */
  getDefaultTemplate(type) {
    const baseTemplate = {
      title: `WIRED CHAOS ${type}`,
      slides: [],
      theme: {
        colors: this.branding,
        fonts: this.branding.fonts
      }
    };

    return baseTemplate;
  }

  /**
   * Create title slide
   */
  createTitleSlide(title, subtitle = '', footer = 'WIRED CHAOS') {
    return {
      type: 'title',
      title,
      content: subtitle,
      footer,
      layout: 'single',
      animations: [{
        type: 'fade',
        duration: 800,
        delay: 0
      }]
    };
  }

  /**
   * Create content slide
   */
  createContentSlide(title, content, layout = 'single') {
    return {
      type: 'content',
      title,
      content,
      layout,
      animations: [{
        type: 'slide',
        duration: 600,
        delay: 0
      }]
    };
  }

  /**
   * Create code slide
   */
  createCodeSlide(title, code, language = 'javascript') {
    return {
      type: 'code',
      title,
      content: {
        code,
        language
      },
      layout: 'single',
      animations: [{
        type: 'fade',
        duration: 600,
        delay: 0
      }]
    };
  }

  /**
   * Create data visualization slide
   */
  createDataSlide(title, chartData) {
    return {
      type: 'data',
      title,
      content: {
        chart: chartData
      },
      layout: 'single',
      animations: [{
        type: 'fade',
        duration: 800,
        delay: 200
      }]
    };
  }

  /**
   * Create image slide
   */
  createImageSlide(title, images, layout = 'grid') {
    return {
      type: 'image',
      title,
      content: {
        images
      },
      layout,
      animations: [{
        type: 'zoom',
        duration: 600,
        delay: 0
      }]
    };
  }

  /**
   * Generate component documentation presentation
   */
  generateComponentPresentation(componentData) {
    const slides = [
      this.createTitleSlide(
        componentData.name,
        componentData.description || 'Component Documentation',
        'WIRED CHAOS'
      ),
      this.createContentSlide(
        'Overview',
        componentData.overview || 'Component overview and features',
        'single'
      )
    ];

    if (componentData.features && componentData.features.length > 0) {
      slides.push(this.createContentSlide(
        'Key Features',
        componentData.features.join('\n• '),
        'two-column'
      ));
    }

    if (componentData.codeExample) {
      slides.push(this.createCodeSlide(
        'Usage Example',
        componentData.codeExample,
        componentData.language || 'javascript'
      ));
    }

    if (componentData.apiEndpoints) {
      slides.push(this.createContentSlide(
        'API Endpoints',
        this.formatApiEndpoints(componentData.apiEndpoints),
        'two-column'
      ));
    }

    return {
      title: componentData.name,
      slides,
      type: 'component'
    };
  }

  /**
   * Generate feature release presentation
   */
  generateFeaturePresentation(featureData) {
    const slides = [
      this.createTitleSlide(
        featureData.name,
        `New Feature Release - ${featureData.version || 'v1.0'}`,
        'WIRED CHAOS'
      ),
      this.createContentSlide(
        'What\'s New',
        featureData.description || 'Feature description',
        'single'
      )
    ];

    if (featureData.benefits && featureData.benefits.length > 0) {
      slides.push(this.createContentSlide(
        'Benefits',
        featureData.benefits.join('\n• '),
        'two-column'
      ));
    }

    if (featureData.demo) {
      slides.push(this.createImageSlide(
        'Demo',
        [featureData.demo],
        'single'
      ));
    }

    if (featureData.implementation) {
      slides.push(this.createCodeSlide(
        'Implementation',
        featureData.implementation,
        featureData.language || 'javascript'
      ));
    }

    slides.push(this.createContentSlide(
      'Getting Started',
      featureData.gettingStarted || 'How to use this feature',
      'single'
    ));

    return {
      title: featureData.name,
      slides,
      type: 'feature'
    };
  }

  /**
   * Generate milestone presentation
   */
  generateMilestonePresentation(milestoneData) {
    const slides = [
      this.createTitleSlide(
        milestoneData.name,
        `Milestone Achievement - ${milestoneData.date || new Date().toLocaleDateString()}`,
        'WIRED CHAOS'
      ),
      this.createContentSlide(
        'Summary',
        milestoneData.summary || 'Milestone summary',
        'single'
      )
    ];

    if (milestoneData.achievements && milestoneData.achievements.length > 0) {
      slides.push(this.createContentSlide(
        'Key Achievements',
        milestoneData.achievements.join('\n• '),
        'two-column'
      ));
    }

    if (milestoneData.metrics) {
      slides.push(this.createDataSlide(
        'Metrics',
        milestoneData.metrics
      ));
    }

    if (milestoneData.nextSteps && milestoneData.nextSteps.length > 0) {
      slides.push(this.createContentSlide(
        'Next Steps',
        milestoneData.nextSteps.join('\n• '),
        'single'
      ));
    }

    return {
      title: milestoneData.name,
      slides,
      type: 'milestone'
    };
  }

  /**
   * Format API endpoints for display
   */
  formatApiEndpoints(endpoints) {
    return endpoints.map(ep => 
      `${ep.method} ${ep.path}\n${ep.description || ''}`
    ).join('\n\n');
  }
}

export default TemplateManager;
