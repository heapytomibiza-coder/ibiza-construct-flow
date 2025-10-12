/**
 * Simple encryption utilities for client-side data
 * Note: For sensitive data, always use server-side encryption
 */

/**
 * Encodes data to base64
 */
export function encodeBase64(data: string): string {
  return btoa(encodeURIComponent(data));
}

/**
 * Decodes base64 data
 */
export function decodeBase64(encoded: string): string {
  try {
    return decodeURIComponent(atob(encoded));
  } catch {
    throw new Error('Invalid base64 string');
  }
}

/**
 * Generates a random string for tokens/keys
 */
export function generateRandomString(length: number = 32): string {
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

/**
 * Hashes a string using SHA-256 (client-side)
 */
export async function hashString(input: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(input);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Generates a cryptographically secure UUID
 */
export function generateSecureId(): string {
  return crypto.randomUUID();
}

/**
 * Masks sensitive data (e.g., credit card numbers, emails)
 */
export function maskSensitiveData(
  data: string,
  type: 'email' | 'phone' | 'card' = 'email'
): string {
  switch (type) {
    case 'email':
      const [name, domain] = data.split('@');
      if (!domain) return '***';
      return `${name.charAt(0)}${'*'.repeat(Math.min(name.length - 1, 3))}@${domain}`;
    
    case 'phone':
      const cleaned = data.replace(/\D/g, '');
      if (cleaned.length < 4) return '***';
      return `***-***-${cleaned.slice(-4)}`;
    
    case 'card':
      const cardCleaned = data.replace(/\D/g, '');
      if (cardCleaned.length < 4) return '****';
      return `**** **** **** ${cardCleaned.slice(-4)}`;
    
    default:
      return '***';
  }
}

/**
 * Validates data integrity using checksum
 */
export async function generateChecksum(data: string): Promise<string> {
  return hashString(data);
}

/**
 * Verifies data integrity
 */
export async function verifyChecksum(
  data: string,
  checksum: string
): Promise<boolean> {
  const computed = await generateChecksum(data);
  return computed === checksum;
}

/**
 * Obfuscates sensitive data for logs
 */
export function obfuscateForLogs(data: Record<string, any>): Record<string, any> {
  const sensitiveKeys = ['password', 'token', 'secret', 'apiKey', 'key', 'auth'];
  const obfuscated: Record<string, any> = {};
  
  for (const [key, value] of Object.entries(data)) {
    if (sensitiveKeys.some(k => key.toLowerCase().includes(k.toLowerCase()))) {
      obfuscated[key] = '[REDACTED]';
    } else if (typeof value === 'object' && value !== null) {
      obfuscated[key] = obfuscateForLogs(value);
    } else {
      obfuscated[key] = value;
    }
  }
  
  return obfuscated;
}
