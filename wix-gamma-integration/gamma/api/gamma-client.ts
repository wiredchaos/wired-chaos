/**
 * WIRED CHAOS - GAMMA API Client
 * TypeScript client for GAMMA presentation API integration
 */

import type {
  GammaPresentation,
  GammaSlide,
  GammaTheme,
  GammaExport,
  ApiResponse,
  WiredChaosBranding
} from '../../shared/types/index';

export class GammaAPIClient {
  private apiKey: string;
  private apiBase: string;
  private branding: WiredChaosBranding;

  constructor(apiKey: string, apiBase: string = 'https://gamma.app/api/v1') {
    this.apiKey = apiKey;
    this.apiBase = apiBase;
    this.branding = this.createWiredChaosBranding();
  }

  /**
   * Create WIRED CHAOS branding
   */
  private createWiredChaosBranding(): WiredChaosBranding {
    return {
      logo: 'WIRED CHAOS',
      colors: {
        black: '#000000',
        neonCyan: '#00FFFF',
        glitchRed: '#FF3131',
        electricGreen: '#39FF14',
        accentPink: '#FF00FF'
      },
      fonts: {
        primary: 'Orbitron, sans-serif',
        secondary: 'Rajdhani, sans-serif',
        monospace: 'Share Tech Mono, monospace'
      },
      assets: {
        logoUrl: '/assets/wired-chaos-logo.png',
        backgroundUrl: '/assets/cyber-bg.png',
        iconUrl: '/assets/wired-chaos-icon.png'
      }
    };
  }

  /**
   * Make API request
   */
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.apiBase}${endpoint}`;
    
    const response = await fetch(url, {
      ...options,
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
        ...options.headers
      }
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: {
          code: `HTTP_${response.status}`,
          message: data.message || 'Request failed',
          details: data
        }
      };
    }

    return {
      success: true,
      data: data as T
    };
  }

  /**
   * List all presentations
   */
  async listPresentations(): Promise<ApiResponse<GammaPresentation[]>> {
    return this.request<GammaPresentation[]>('/presentations');
  }

  /**
   * Get presentation by ID
   */
  async getPresentation(id: string): Promise<ApiResponse<GammaPresentation>> {
    return this.request<GammaPresentation>(`/presentations/${id}`);
  }

  /**
   * Create new presentation with WIRED CHAOS branding
   */
  async createPresentation(
    title: string,
    slides: Partial<GammaSlide>[] = [],
    theme?: Partial<GammaTheme>
  ): Promise<ApiResponse<GammaPresentation>> {
    const defaultTheme = this.createWiredChaosTheme(theme);
    
    const presentation: Partial<GammaPresentation> = {
      title,
      slides: slides.map((slide, index) => ({
        id: `slide_${index}`,
        index,
        type: slide.type || 'content',
        layout: slide.layout || 'single',
        content: slide.content || '',
        ...slide
      })) as GammaSlide[],
      theme: defaultTheme,
      branding: this.branding,
      createdAt: new Date(),
      updatedAt: new Date(),
      collaborators: [],
      version: 1
    };

    return this.request<GammaPresentation>('/presentations', {
      method: 'POST',
      body: JSON.stringify(presentation)
    });
  }

  /**
   * Update presentation
   */
  async updatePresentation(
    id: string,
    updates: Partial<GammaPresentation>
  ): Promise<ApiResponse<GammaPresentation>> {
    return this.request<GammaPresentation>(`/presentations/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates)
    });
  }

  /**
   * Delete presentation
   */
  async deletePresentation(id: string): Promise<ApiResponse<void>> {
    return this.request<void>(`/presentations/${id}`, {
      method: 'DELETE'
    });
  }

  /**
   * Add slide to presentation
   */
  async addSlide(
    presentationId: string,
    slide: Partial<GammaSlide>
  ): Promise<ApiResponse<GammaPresentation>> {
    const presentation = await this.getPresentation(presentationId);
    
    if (!presentation.success || !presentation.data) {
      return presentation as ApiResponse<GammaPresentation>;
    }

    const newSlide: GammaSlide = {
      id: `slide_${presentation.data.slides.length}`,
      index: presentation.data.slides.length,
      type: slide.type || 'content',
      layout: slide.layout || 'single',
      content: slide.content || '',
      ...slide
    } as GammaSlide;

    presentation.data.slides.push(newSlide);

    return this.updatePresentation(presentationId, {
      slides: presentation.data.slides
    });
  }

  /**
   * Update slide
   */
  async updateSlide(
    presentationId: string,
    slideId: string,
    updates: Partial<GammaSlide>
  ): Promise<ApiResponse<GammaPresentation>> {
    const presentation = await this.getPresentation(presentationId);
    
    if (!presentation.success || !presentation.data) {
      return presentation as ApiResponse<GammaPresentation>;
    }

    const slideIndex = presentation.data.slides.findIndex(s => s.id === slideId);
    if (slideIndex === -1) {
      return {
        success: false,
        error: {
          code: 'SLIDE_NOT_FOUND',
          message: 'Slide not found'
        }
      };
    }

    presentation.data.slides[slideIndex] = {
      ...presentation.data.slides[slideIndex],
      ...updates
    };

    return this.updatePresentation(presentationId, {
      slides: presentation.data.slides
    });
  }

  /**
   * Delete slide
   */
  async deleteSlide(
    presentationId: string,
    slideId: string
  ): Promise<ApiResponse<GammaPresentation>> {
    const presentation = await this.getPresentation(presentationId);
    
    if (!presentation.success || !presentation.data) {
      return presentation as ApiResponse<GammaPresentation>;
    }

    presentation.data.slides = presentation.data.slides.filter(s => s.id !== slideId);

    return this.updatePresentation(presentationId, {
      slides: presentation.data.slides
    });
  }

  /**
   * Export presentation
   */
  async exportPresentation(
    presentationId: string,
    format: GammaExport['format'],
    options: Partial<GammaExport> = {}
  ): Promise<ApiResponse<{ url: string; expiresAt: number }>> {
    const exportRequest: GammaExport = {
      format,
      quality: options.quality || 'high',
      includeNotes: options.includeNotes !== false,
      watermark: options.watermark || 'WIRED CHAOS'
    };

    return this.request<{ url: string; expiresAt: number }>(
      `/presentations/${presentationId}/export`,
      {
        method: 'POST',
        body: JSON.stringify(exportRequest)
      }
    );
  }

  /**
   * Create WIRED CHAOS themed presentation
   */
  private createWiredChaosTheme(overrides?: Partial<GammaTheme>): GammaTheme {
    return {
      id: 'wired-chaos-cyber',
      name: 'WIRED CHAOS Cyber',
      colors: {
        primary: this.branding.colors.neonCyan,
        secondary: this.branding.colors.accentPink,
        background: this.branding.colors.black,
        text: '#FFFFFF',
        accent: this.branding.colors.electricGreen
      },
      fonts: {
        heading: this.branding.fonts.primary,
        body: this.branding.fonts.secondary,
        code: this.branding.fonts.monospace
      },
      spacing: 'normal',
      ...overrides
    };
  }

  /**
   * Create presentation from WIX content
   */
  async createFromWixContent(
    wixContent: any,
    title?: string
  ): Promise<ApiResponse<GammaPresentation>> {
    // Transform WIX content to slides
    const slides: Partial<GammaSlide>[] = [
      {
        type: 'title',
        title: title || wixContent.title,
        content: wixContent.description || 'Powered by WIRED CHAOS',
        layout: 'single'
      }
    ];

    // Add content slides
    if (Array.isArray(wixContent.sections)) {
      wixContent.sections.forEach((section: any, index: number) => {
        slides.push({
          type: 'content',
          title: section.title,
          content: section.content,
          layout: section.layout || 'single'
        });
      });
    }

    return this.createPresentation(
      title || wixContent.title,
      slides
    );
  }

  /**
   * Add data visualization slide
   */
  async addDataSlide(
    presentationId: string,
    title: string,
    chartData: any
  ): Promise<ApiResponse<GammaPresentation>> {
    const slide: Partial<GammaSlide> = {
      type: 'data',
      title,
      content: {
        charts: [chartData]
      },
      layout: 'single'
    };

    return this.addSlide(presentationId, slide);
  }

  /**
   * Add code slide
   */
  async addCodeSlide(
    presentationId: string,
    title: string,
    code: string,
    language: string = 'javascript'
  ): Promise<ApiResponse<GammaPresentation>> {
    const slide: Partial<GammaSlide> = {
      type: 'code',
      title,
      content: {
        code: {
          language,
          code
        }
      },
      layout: 'single'
    };

    return this.addSlide(presentationId, slide);
  }

  /**
   * Get presentation statistics
   */
  async getStatistics(presentationId: string): Promise<ApiResponse<{
    views: number;
    shares: number;
    exports: number;
    collaborators: number;
  }>> {
    return this.request(`/presentations/${presentationId}/stats`);
  }

  /**
   * Share presentation
   */
  async sharePresentation(
    presentationId: string,
    emails: string[],
    role: 'viewer' | 'editor' = 'viewer'
  ): Promise<ApiResponse<{ invited: string[] }>> {
    return this.request(`/presentations/${presentationId}/share`, {
      method: 'POST',
      body: JSON.stringify({ emails, role })
    });
  }

  /**
   * Get presentation templates
   */
  async getTemplates(): Promise<ApiResponse<GammaTheme[]>> {
    return this.request<GammaTheme[]>('/templates');
  }

  /**
   * Apply theme to presentation
   */
  async applyTheme(
    presentationId: string,
    themeId: string
  ): Promise<ApiResponse<GammaPresentation>> {
    return this.request<GammaPresentation>(
      `/presentations/${presentationId}/theme`,
      {
        method: 'PUT',
        body: JSON.stringify({ themeId })
      }
    );
  }
}

// Export convenience function
export function createGammaClient(apiKey: string): GammaAPIClient {
  return new GammaAPIClient(apiKey);
}

export default GammaAPIClient;
