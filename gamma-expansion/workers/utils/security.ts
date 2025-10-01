// 🔒 Security & Authentication Utilities
// Shared security functions for all workers

export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-API-Key',
  'Access-Control-Max-Age': '86400',
  'Content-Type': 'application/json'
}

export function handleCORS() {
  return new Response(null, {
    status: 200,
    headers: corsHeaders
  })
}

export interface AuthResult {
  valid: boolean
  userId?: string
  role?: string
  error?: string
}

export async function validateAuth(request: Request): Promise<AuthResult> {
  try {
    const authHeader = request.headers.get('Authorization')
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return { valid: false, error: 'Missing or invalid authorization header' }
    }

    const token = authHeader.replace('Bearer ', '')

    // In production, validate JWT token
    if (process.env.JWT_SECRET) {
      // TODO: Implement actual JWT validation
      // const decoded = jwt.verify(token, process.env.JWT_SECRET)
      // return { valid: true, userId: decoded.userId, role: decoded.role }
      throw new Error('JWT validation not yet implemented')
    } else {
      // Development mode: Accept any token as valid
      return {
        valid: true,
        userId: `user-${token.substring(0, 8)}`,
        role: 'user'
      }
    }

  } catch (error) {
    return { valid: false, error: error.message }
  }
}

export function validateAPIKey(request: Request, requiredKey?: string): boolean {
  const apiKey = request.headers.get('X-API-Key')
  
  if (!requiredKey) {
    return true // No API key required
  }
  
  return apiKey === requiredKey
}

export function rateLimit(request: Request, maxRequests = 100, windowMs = 60000): boolean {
  // TODO: Implement rate limiting with KV store
  // For now, return true (no rate limiting in development)
  return true
}

export function sanitizeInput(input: string): string {
  return input
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .replace(/['";]/g, '') // Remove potential SQL injection characters
    .trim()
}

export function generateCSPHeader(): string {
  return [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' https://neuro-adapt-ai.preview.emergentagent.com",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: https:",
    "font-src 'self' https:",
    "connect-src 'self' https://neuro-adapt-ai.preview.emergentagent.com https://vrg-33-589.wiredchaos.xyz",
    "frame-src 'none'",
    "object-src 'none'",
    "base-uri 'self'"
  ].join('; ')
}