/**
 * WIRED CHAOS - Shared TypeScript Types
 * Type definitions for WIX and GAMMA integration
 */

// ========== WIX Types ==========
export interface WixSite {
  siteId: string;
  displayName: string;
  url: string;
  status: 'published' | 'unpublished' | 'draft';
}

export interface WixUser {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role: 'owner' | 'admin' | 'editor' | 'viewer';
}

export interface WixContent {
  id: string;
  title: string;
  content: string;
  collection: string;
  createdAt: Date;
  updatedAt: Date;
  metadata?: Record<string, any>;
}

export interface WixARModel {
  id: string;
  name: string;
  format: 'glb' | 'usdz' | 'gltf';
  url: string;
  thumbnailUrl?: string;
  size: number;
  dimensions?: {
    width: number;
    height: number;
    depth: number;
  };
}

export interface WixAnalyticsEvent {
  eventType: string;
  timestamp: number;
  userId?: string;
  sessionId: string;
  data: Record<string, any>;
}

// ========== GAMMA Types ==========
export interface GammaPresentation {
  id: string;
  title: string;
  description?: string;
  slides: GammaSlide[];
  theme: GammaTheme;
  branding: WiredChaosBranding;
  createdAt: Date;
  updatedAt: Date;
  owner: string;
  collaborators: string[];
  version: number;
}

export interface GammaSlide {
  id: string;
  index: number;
  type: 'title' | 'content' | 'image' | 'data' | 'code';
  title?: string;
  content: string | GammaSlideContent;
  layout: 'single' | 'two-column' | 'grid' | 'full';
  animations?: GammaAnimation[];
  notes?: string;
}

export interface GammaSlideContent {
  text?: string;
  images?: string[];
  charts?: GammaChart[];
  code?: {
    language: string;
    code: string;
  };
}

export interface GammaTheme {
  id: string;
  name: string;
  colors: {
    primary: string;
    secondary: string;
    background: string;
    text: string;
    accent: string;
  };
  fonts: {
    heading: string;
    body: string;
    code: string;
  };
  spacing: 'compact' | 'normal' | 'spacious';
}

export interface GammaAnimation {
  type: 'fade' | 'slide' | 'zoom' | 'glitch' | 'cyber';
  duration: number;
  delay?: number;
  easing?: string;
}

export interface GammaChart {
  type: 'bar' | 'line' | 'pie' | 'scatter';
  data: {
    labels: string[];
    datasets: {
      label: string;
      data: number[];
      color: string;
    }[];
  };
  options?: Record<string, any>;
}

export interface GammaExport {
  format: 'pdf' | 'pptx' | 'html' | 'png';
  quality: 'low' | 'medium' | 'high';
  includeNotes: boolean;
  watermark?: string;
}

// ========== WIRED CHAOS Branding ==========
export interface WiredChaosBranding {
  logo: string;
  colors: {
    black: string;
    neonCyan: string;
    glitchRed: string;
    electricGreen: string;
    accentPink: string;
  };
  fonts: {
    primary: string;
    secondary: string;
    monospace: string;
  };
  assets: {
    logoUrl: string;
    backgroundUrl?: string;
    iconUrl?: string;
  };
}

// ========== Integration Types ==========
export interface IntegrationConfig {
  wix: WixConfig;
  gamma: GammaConfig;
  security: SecurityConfig;
  performance: PerformanceConfig;
}

export interface WixConfig {
  appId: string;
  appSecret: string;
  siteId: string;
  apiVersion: string;
  webhookUrl?: string;
}

export interface GammaConfig {
  apiKey: string;
  projectId: string;
  webhookUrl?: string;
  defaultTheme: string;
}

export interface SecurityConfig {
  enableCSRF: boolean;
  enableRateLimit: boolean;
  enableAuditLog: boolean;
  jwtSecret: string;
  tokenExpiry: number;
}

export interface PerformanceConfig {
  enableCache: boolean;
  cacheTime: number;
  enableLazyLoad: boolean;
  enableCompression: boolean;
  cdnUrl?: string;
}

// ========== API Response Types ==========
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  metadata?: {
    timestamp: number;
    requestId: string;
    version: string;
  };
}

export interface PaginatedResponse<T = any> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

// ========== Webhook Types ==========
export interface WixWebhook {
  eventType: string;
  instanceId: string;
  timestamp: number;
  payload: any;
  signature: string;
}

export interface GammaWebhook {
  event: string;
  presentationId: string;
  userId: string;
  timestamp: number;
  data: any;
}

// ========== Analytics Types ==========
export interface AnalyticsData {
  userId?: string;
  sessionId: string;
  events: AnalyticsEvent[];
  metrics: {
    pageViews: number;
    uniqueVisitors: number;
    avgSessionDuration: number;
    bounceRate: number;
  };
}

export interface AnalyticsEvent {
  id: string;
  type: string;
  timestamp: number;
  data: Record<string, any>;
  source: 'wix' | 'gamma' | 'worker';
}

// ========== Collaboration Types ==========
export interface CollaborationSession {
  id: string;
  presentationId: string;
  users: CollaborationUser[];
  startedAt: Date;
  lastActivity: Date;
  locked: boolean;
}

export interface CollaborationUser {
  id: string;
  name: string;
  /**
   * Optional avatar URL for the collaborating user.
   * Avatar is not required - users without avatars are fully supported.
   * UI components should handle null/undefined avatar gracefully.
   */
  avatar?: string;
  role: 'owner' | 'editor' | 'viewer';
  cursor?: {
    x: number;
    y: number;
    slideId: string;
  };
  isActive: boolean;
}

export interface CollaborationChange {
  id: string;
  userId: string;
  slideId: string;
  type: 'insert' | 'update' | 'delete';
  timestamp: number;
  data: any;
  conflictsWith?: string[];
}

// ========== Video Types ==========
/**
 * Video interface with optional avatar linking.
 * Videos can optionally be associated with a user avatar,
 * but this is not required for video display or functionality.
 */
export interface Video {
  id: string;
  title: string;
  description?: string;
  url: string;
  thumbnailUrl?: string;
  duration?: number; // in seconds
  /**
   * Optional avatar URL for the video creator/presenter.
   * When null or undefined, video will display without an avatar.
   */
  avatar?: string | null;
  createdBy?: string; // User ID
  createdAt: Date;
  updatedAt: Date;
  tags?: string[];
  status: 'draft' | 'published' | 'archived';
  viewCount?: number;
  metadata?: Record<string, any>;
}

/**
 * Video player configuration with optional avatar display.
 */
export interface VideoPlayerConfig {
  autoplay?: boolean;
  controls?: boolean;
  muted?: boolean;
  loop?: boolean;
  /**
   * Whether to show the avatar (if available) alongside the video.
   * Default: true - shows avatar when available.
   */
  showAvatar?: boolean;
  avatarPosition?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  avatarSize?: 'small' | 'medium' | 'large';
}

/**
 * Video list item for galleries/feeds.
 */
export interface VideoListItem {
  id: string;
  title: string;
  thumbnailUrl?: string;
  duration?: number;
  /**
   * Optional avatar - videos without avatars are fully supported.
   */
  avatar?: string | null;
  createdBy?: string;
  createdAt: Date;
  viewCount?: number;
}
