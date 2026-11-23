export interface GenerateUploadUrlResult {
  uploadUrl: string;
  key: string;
  expiresAt: string;
}

export interface GenerateDownloadUrlResult {
  downloadUrl: string;
  expiresAt: string;
}

export interface IStorageService {
  /**
   * Generates a pre-signed or authorized upload URL.
   */
  generateUploadUrl(
    key: string,
    mimeType: string,
    expiresInSeconds?: number
  ): Promise<GenerateUploadUrlResult>;

  /**
   * Generates a short-lived authorized download URL for private files.
   */
  generateDownloadUrl(
    key: string,
    originalName?: string,
    expiresInSeconds?: number
  ): Promise<GenerateDownloadUrlResult>;

  /**
   * Deletes a file from the underlying storage.
   */
  deleteFile(key: string): Promise<void>;
}
