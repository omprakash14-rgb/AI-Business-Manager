import crypto from 'crypto';

/**
 * Generate a cryptographically secure random token (e.g. for sessions or invitations).
 */
export function generateSecureToken(byteLength: number = 32): string {
  return crypto.randomBytes(byteLength).toString('hex');
}

/**
 * Hash a token using SHA-256 for secure database storage.
 */
export function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}
