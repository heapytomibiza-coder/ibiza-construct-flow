/**
 * Sanitizes HTML content to prevent XSS attacks
 */
export function sanitizeHtml(input: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '/': '&#x2F;',
  };
  const reg = /[&<>"'/]/ig;
  return input.replace(reg, (match) => map[match]);
}

/**
 * Sanitizes user input for SQL queries (basic protection)
 * Note: Always use parameterized queries with Supabase client
 */
export function sanitizeSql(input: string): string {
  return input.replace(/['";\\]/g, '');
}

/**
 * Validates and sanitizes email addresses
 */
export function sanitizeEmail(email: string): string | null {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const trimmed = email.trim().toLowerCase();
  
  if (!emailRegex.test(trimmed)) {
    return null;
  }
  
  return trimmed;
}

/**
 * Sanitizes phone numbers (removes non-numeric characters)
 */
export function sanitizePhone(phone: string): string {
  return phone.replace(/[^\d+]/g, '');
}

/**
 * Validates and sanitizes URLs
 */
export function sanitizeUrl(url: string): string | null {
  try {
    const parsed = new URL(url);
    
    // Only allow http and https protocols
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return null;
    }
    
    return parsed.toString();
  } catch {
    return null;
  }
}

/**
 * Removes potentially dangerous characters from file names
 */
export function sanitizeFileName(fileName: string): string {
  return fileName
    .replace(/[^a-zA-Z0-9._-]/g, '_')
    .replace(/_{2,}/g, '_')
    .substring(0, 255);
}

/**
 * Deep sanitizes an object's string values
 */
export function sanitizeObject<T extends Record<string, any>>(
  obj: T,
  fields: (keyof T)[]
): T {
  const sanitized = { ...obj };
  
  fields.forEach(field => {
    if (typeof sanitized[field] === 'string') {
      sanitized[field] = sanitizeHtml(sanitized[field] as string) as any;
    }
  });
  
  return sanitized;
}

/**
 * Validates input length
 */
export function validateLength(
  input: string,
  min: number,
  max: number
): boolean {
  const length = input.trim().length;
  return length >= min && length <= max;
}

/**
 * Checks for common injection patterns
 */
export function containsSuspiciousPatterns(input: string): boolean {
  const patterns = [
    /<script[^>]*>.*?<\/script>/gi,
    /javascript:/gi,
    /on\w+\s*=/gi,
    /eval\s*\(/gi,
    /expression\s*\(/gi,
    /<iframe[^>]*>/gi,
  ];
  
  return patterns.some(pattern => pattern.test(input));
}

/**
 * Rate limiting check helper (used with backend)
 */
export function generateRateLimitKey(userId: string, action: string): string {
  return `${userId}:${action}`;
}
