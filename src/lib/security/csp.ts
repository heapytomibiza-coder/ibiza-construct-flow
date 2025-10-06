/**
 * Content Security Policy Configuration
 * Helps prevent XSS and other injection attacks
 */

export const cspDirectives = {
  'default-src': ["'self'"],
  'script-src': [
    "'self'",
    "'unsafe-inline'", // Required for Vite in development
    "'unsafe-eval'", // Required for development
    'https://ai.gateway.lovable.dev',
  ],
  'style-src': [
    "'self'",
    "'unsafe-inline'", // Required for styled components
    'https://fonts.googleapis.com',
  ],
  'img-src': [
    "'self'",
    'data:',
    'blob:',
    'https:',
  ],
  'font-src': [
    "'self'",
    'data:',
    'https://fonts.gstatic.com',
  ],
  'connect-src': [
    "'self'",
    import.meta.env.VITE_SUPABASE_URL,
    'https://ai.gateway.lovable.dev',
    'wss:',
  ],
  'frame-ancestors': ["'none'"],
  'base-uri': ["'self'"],
  'form-action': ["'self'"],
};

/**
 * Generate CSP header string
 */
export function generateCSP(): string {
  return Object.entries(cspDirectives)
    .map(([directive, sources]) => `${directive} ${sources.join(' ')}`)
    .join('; ');
}

/**
 * Apply CSP as meta tag (fallback for static hosting)
 */
export function applyCSPMetaTag(): void {
  if (import.meta.env.PROD) {
    const meta = document.createElement('meta');
    meta.httpEquiv = 'Content-Security-Policy';
    meta.content = generateCSP();
    document.head.appendChild(meta);
  }
}

/**
 * Security headers configuration for hosting
 * Add these to your hosting platform (Netlify, Vercel, etc.)
 */
export const securityHeaders = `
# Security Headers
/*
  X-Frame-Options: DENY
  X-Content-Type-Options: nosniff
  X-XSS-Protection: 1; mode=block
  Referrer-Policy: strict-origin-when-cross-origin
  Permissions-Policy: geolocation=(), microphone=(), camera=()
  Content-Security-Policy: ${generateCSP()}
  Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
`;
