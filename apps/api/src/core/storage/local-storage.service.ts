import crypto from 'crypto';
import type { IStorageService, GenerateUploadUrlResult, GenerateDownloadUrlResult } from './storage.interface.js';

/**
 * Local private storage provider implementation.
 * Issues signed HMAC access tokens for private file downloads,
 * fully replaceable by S3/R2 object storage in production.
 */
export class LocalDiskStorageService implements IStorageService {
  private readonly signingSecret: string;

  constructor() {
    this.signingSecret = process.env.STORAGE_SIGNING_SECRET || 'dev-file-storage-signing-secret-key-32chars';
  }

  async generateUploadUrl(
    key: string,
    _mimeType: string,
    expiresInSeconds: number = 3600
  ): Promise<GenerateUploadUrlResult> {
    const expiresAt = new Date(Date.now() + expiresInSeconds * 1000).toISOString();
    const token = this.createSignedToken(key, expiresAt);
    return {
      uploadUrl: `/api/files/upload?token=${encodeURIComponent(token)}&key=${encodeURIComponent(key)}`,
      key,
      expiresAt
    };
  }

  async generateDownloadUrl(
    key: string,
    originalName?: string,
    expiresInSeconds: number = 900 // 15 minutes by default
  ): Promise<GenerateDownloadUrlResult> {
    const expiresAt = new Date(Date.now() + expiresInSeconds * 1000).toISOString();
    const token = this.createSignedToken(key, expiresAt);
    const filenameParam = originalName ? `&filename=${encodeURIComponent(originalName)}` : '';

    return {
      downloadUrl: `/api/files/download?token=${encodeURIComponent(token)}&key=${encodeURIComponent(key)}${filenameParam}`,
      expiresAt
    };
  }

  async deleteFile(_key: string): Promise<void> {
    // In local dev/mock, no physical disk unlink needed; soft-delete in DB manages lifecycle
  }

  createSignedToken(key: string, expiresAt: string): string {
    const payload = `${key}:${expiresAt}`;
    const hmac = crypto.createHmac('sha256', this.signingSecret).update(payload).digest('hex');
    return Buffer.from(JSON.stringify({ key, expiresAt, hmac })).toString('base64url');
  }

  verifySignedToken(token: string, key: string): boolean {
    try {
      const decoded = JSON.parse(Buffer.from(token, 'base64url').toString('utf8'));
      if (decoded.key !== key) return false;
      if (new Date(decoded.expiresAt) <= new Date()) return false;

      const expectedPayload = `${decoded.key}:${decoded.expiresAt}`;
      const expectedHmac = crypto.createHmac('sha256', this.signingSecret).update(expectedPayload).digest('hex');
      return crypto.timingSafeEqual(Buffer.from(decoded.hmac), Buffer.from(expectedHmac));
    } catch {
      return false;
    }
  }
}

export const storageService = new LocalDiskStorageService();
