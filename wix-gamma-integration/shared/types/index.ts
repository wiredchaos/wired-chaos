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
 * Video content with optional avatar linking
 * The avatarUrl field is optional - not all videos require an associated avatar
 */
export interface Video {
  id: string;
  title: string;
  description?: string;
  videoUrl: string;
  thumbnailUrl?: string;
  /** Optional avatar URL - videos can exist without an avatar */
  avatarUrl?: string;
  duration?: number; // in seconds
  uploadedBy: string;
  uploadedAt: Date;
  updatedAt?: Date;
  tags?: string[];
  status: 'draft' | 'processing' | 'published' | 'archived';
  views?: number;
  metadata?: VideoMetadata;
}

export interface VideoMetadata {
  width?: number;
  height?: number;
  format?: string;
  codec?: string;
  bitrate?: number;
  fileSize?: number;
}

/**
 * Video collection for organizing videos
 */
export interface VideoCollection {
  id: string;
  name: string;
  description?: string;
  videos: string[]; // Video IDs
  createdBy: string;
  createdAt: Date;
  updatedAt?: Date;
  isPublic: boolean;
}

/**
 * Video playback session
 */
export interface VideoSession {
  id: string;
  videoId: string;
  userId?: string;
  startedAt: Date;
  currentTime: number;
  completed: boolean;
}
