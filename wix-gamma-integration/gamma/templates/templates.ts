/**
 * WIRED CHAOS - GAMMA Presentation Templates
 * Pre-designed templates with WIRED CHAOS branding
 */

import type { GammaPresentation, GammaSlide, GammaTheme } from '../../shared/types/index';

// WIRED CHAOS Color Palette
const COLORS = {
  BLACK: '#000000',
  NEON_CYAN: '#00FFFF',
  GLITCH_RED: '#FF3131',
  ELECTRIC_GREEN: '#39FF14',
  ACCENT_PINK: '#FF00FF',
  DARK_GRAY: '#1a1a1a',
  WHITE: '#FFFFFF'
};

// WIRED CHAOS Fonts
const FONTS = {
  HEADING: 'Orbitron, sans-serif',
  BODY: 'Rajdhani, sans-serif',
  MONO: 'Share Tech Mono, monospace'
};

/**
 * Cyber Dark Theme
 */
export const CyberDarkTheme: GammaTheme = {
  id: 'wired-chaos-cyber-dark',
  name: 'WIRED CHAOS Cyber Dark',
  colors: {
    primary: COLORS.NEON_CYAN,
    secondary: COLORS.ACCENT_PINK,
    background: COLORS.BLACK,
    text: COLORS.WHITE,
    accent: COLORS.ELECTRIC_GREEN
  },
  fonts: {
    heading: FONTS.HEADING,
    body: FONTS.BODY,
    code: FONTS.MONO
  },
  spacing: 'normal'
};

/**
 * Glitch Theme
 */
export const GlitchTheme: GammaTheme = {
  id: 'wired-chaos-glitch',
  name: 'WIRED CHAOS Glitch',
  colors: {
    primary: COLORS.GLITCH_RED,
    secondary: COLORS.NEON_CYAN,
    background: COLORS.DARK_GRAY,
    text: COLORS.WHITE,
    accent: COLORS.ACCENT_PINK
  },
  fonts: {
    heading: FONTS.HEADING,
    body: FONTS.BODY,
    code: FONTS.MONO
  },
  spacing: 'compact'
};

/**
 * Electric Theme
 */
export const ElectricTheme: GammaTheme = {
  id: 'wired-chaos-electric',
  name: 'WIRED CHAOS Electric',
  colors: {
    primary: COLORS.ELECTRIC_GREEN,
    secondary: COLORS.NEON_CYAN,
    background: COLORS.BLACK,
    text: COLORS.WHITE,
    accent: COLORS.ACCENT_PINK
  },
  fonts: {
    heading: FONTS.HEADING,
    body: FONTS.BODY,
    code: FONTS.MONO
  },
  spacing: 'spacious'
};

/**
 * Create title slide template
 */
export function createTitleSlide(
  title: string,
  subtitle?: string,
  author?: string
): GammaSlide {
  return {
    id: 'slide_title',
    index: 0,
    type: 'title',
    title,
    content: `${subtitle || ''}\n\n${author ? `By ${author}` : 'Powered by WIRED CHAOS'}`,
    layout: 'single',
    animations: [
      {
        type: 'fade',
        duration: 1000,
        delay: 0,
        easing: 'ease-in-out'
      }
    ]
  };
}

/**
 * Create content slide template
 */
export function createContentSlide(
  title: string,
  content: string,
  index: number,
  layout: 'single' | 'two-column' | 'grid' = 'single'
): GammaSlide {
  return {
    id: `slide_${index}`,
    index,
    type: 'content',
    title,
    content,
    layout,
    animations: [
      {
        type: 'slide',
        duration: 800,
        delay: 200,
        easing: 'ease-out'
      }
    ]
  };
}

/**
 * Create code slide template
 */
export function createCodeSlide(
  title: string,
  code: string,
  language: string,
  index: number
): GammaSlide {
  return {
    id: `slide_${index}`,
    index,
    type: 'code',
    title,
    content: {
      code: {
        language,
        code
      }
    },
    layout: 'single',
    animations: [
      {
        type: 'cyber',
        duration: 1200,
        delay: 0,
        easing: 'cubic-bezier(0.4, 0, 0.2, 1)'
      }
    ]
  };
}

/**
 * Create data visualization slide template
 */
export function createDataSlide(
  title: string,
  chartData: any,
  index: number
): GammaSlide {
  return {
    id: `slide_${index}`,
    index,
    type: 'data',
    title,
    content: {
      charts: [chartData]
    },
    layout: 'single',
    animations: [
      {
        type: 'zoom',
        duration: 1000,
        delay: 300,
        easing: 'ease-in-out'
      }
    ]
  };
}

/**
 * Create image slide template
 */
export function createImageSlide(
  title: string,
  imageUrls: string[],
  index: number,
  layout: 'single' | 'grid' = 'single'
): GammaSlide {
  return {
    id: `slide_${index}`,
    index,
    type: 'image',
    title,
    content: {
      images: imageUrls
    },
    layout,
    animations: [
      {
        type: 'fade',
        duration: 800,
        delay: 100,
        easing: 'ease-in'
      }
    ]
  };
}

/**
 * Complete presentation templates
 */

/**
 * Tech Pitch Template
 */
export function createTechPitchTemplate(
  projectName: string,
  description: string
): Partial<GammaPresentation> {
  const slides: GammaSlide[] = [
    createTitleSlide(projectName, description, 'WIRED CHAOS'),
    createContentSlide(
      'Problem Statement',
      'What problem are we solving?\n\n• Current challenges\n• Market gaps\n• User pain points',
      1,
      'two-column'
    ),
    createContentSlide(
      'Solution',
      'Our innovative approach:\n\n• Unique features\n• Technology stack\n• Competitive advantages',
      2,
      'two-column'
    ),
    createCodeSlide(
      'Technology Demo',
      '// WIRED CHAOS Integration\nimport { WixGammaIntegration } from "@wired-chaos";\n\nconst app = new WixGammaIntegration({\n  wix: { siteId: "..." },\n  gamma: { apiKey: "..." }\n});\n\nawait app.sync();',
      'javascript',
      3
    ),
    createDataSlide(
      'Market Analysis',
      {
        type: 'bar',
        data: {
          labels: ['Q1', 'Q2', 'Q3', 'Q4'],
          datasets: [{
            label: 'Growth',
            data: [30, 45, 60, 85],
            color: COLORS.NEON_CYAN
          }]
        }
      },
      4
    ),
    createContentSlide(
      'Call to Action',
      'Join the WIRED CHAOS revolution!\n\n• Visit wiredchaos.xyz\n• Follow on social media\n• Get in touch',
      5,
      'single'
    )
  ];

  return {
    title: projectName,
    description,
    slides,
    theme: CyberDarkTheme,
    branding: {
      logo: 'WIRED CHAOS',
      colors: {
        black: COLORS.BLACK,
        neonCyan: COLORS.NEON_CYAN,
        glitchRed: COLORS.GLITCH_RED,
        electricGreen: COLORS.ELECTRIC_GREEN,
        accentPink: COLORS.ACCENT_PINK
      },
      fonts: {
        primary: FONTS.HEADING,
        secondary: FONTS.BODY,
        monospace: FONTS.MONO
      },
      assets: {
        logoUrl: '/assets/wired-chaos-logo.png'
      }
    }
  };
}

/**
 * Product Demo Template
 */
export function createProductDemoTemplate(
  productName: string
): Partial<GammaPresentation> {
  const slides: GammaSlide[] = [
    createTitleSlide(productName, 'Product Demonstration', 'WIRED CHAOS'),
    createContentSlide(
      'Overview',
      'Key features and capabilities',
      1
    ),
    createImageSlide(
      'Interface',
      ['/assets/demo-1.png', '/assets/demo-2.png'],
      2,
      'grid'
    ),
    createContentSlide(
      'Use Cases',
      'Real-world applications',
      3,
      'two-column'
    ),
    createContentSlide(
      'Next Steps',
      'Get started today!',
      4
    )
  ];

  return {
    title: productName,
    slides,
    theme: ElectricTheme
  };
}

/**
 * Training/Tutorial Template
 */
export function createTrainingTemplate(
  courseName: string
): Partial<GammaPresentation> {
  const slides: GammaSlide[] = [
    createTitleSlide(courseName, 'Training Course', 'WIRED CHAOS'),
    createContentSlide(
      'Learning Objectives',
      'What you will learn:\n\n• Core concepts\n• Practical skills\n• Best practices',
      1,
      'two-column'
    ),
    createCodeSlide(
      'Example 1',
      '// Your first WIRED CHAOS app\nconsole.log("Hello, WIRED CHAOS!");',
      'javascript',
      2
    ),
    createContentSlide(
      'Practice Exercise',
      'Try it yourself!',
      3
    ),
    createContentSlide(
      'Summary',
      'Key takeaways and next steps',
      4
    )
  ];

  return {
    title: courseName,
    slides,
    theme: GlitchTheme
  };
}

/**
 * Status Report Template
 */
export function createStatusReportTemplate(
  projectName: string
): Partial<GammaPresentation> {
  const slides: GammaSlide[] = [
    createTitleSlide(projectName, 'Status Report', 'WIRED CHAOS'),
    createContentSlide(
      'Progress Summary',
      'Current status and achievements',
      1
    ),
    createDataSlide(
      'Metrics',
      {
        type: 'line',
        data: {
          labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
          datasets: [{
            label: 'Completion',
            data: [25, 50, 75, 90],
            color: COLORS.ELECTRIC_GREEN
          }]
        }
      },
      2
    ),
    createContentSlide(
      'Challenges & Solutions',
      'Issues faced and how we addressed them',
      3,
      'two-column'
    ),
    createContentSlide(
      'Next Steps',
      'Upcoming milestones',
      4
    )
  ];

  return {
    title: `${projectName} - Status Report`,
    slides,
    theme: CyberDarkTheme
  };
}

// Export all themes
export const themes = {
  CyberDarkTheme,
  GlitchTheme,
  ElectricTheme
};

// Export all templates
export const templates = {
  techPitch: createTechPitchTemplate,
  productDemo: createProductDemoTemplate,
  training: createTrainingTemplate,
  statusReport: createStatusReportTemplate
};

export default {
  themes,
  templates,
  createTitleSlide,
  createContentSlide,
  createCodeSlide,
  createDataSlide,
  createImageSlide
};
