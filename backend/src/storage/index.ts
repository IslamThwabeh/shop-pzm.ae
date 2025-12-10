import type { UploadConfig, UploadResult } from '../../../shared/types';

const DEFAULT_CONFIG: UploadConfig = {
  maxFileSize: 10 * 1024 * 1024, // 10MB
  allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
  bucketUrl: 'https://pzm-images.r2.cloudflarestorage.com',
};

export class StorageService {
  constructor(private bucket: R2Bucket, private config: UploadConfig = DEFAULT_CONFIG) {}

  /**
   * Validate file before upload
   */
  validateFile(file: File): { valid: boolean; error?: string } {
    // Check file size
    if (file.size > this.config.maxFileSize) {
      return {
        valid: false,
        error: `File size exceeds maximum of ${this.config.maxFileSize / 1024 / 1024}MB`,
      };
    }

    // Check MIME type
    if (!this.config.allowedMimeTypes.includes(file.type)) {
      return {
        valid: false,
        error: `File type ${file.type} is not allowed`,
      };
    }

    return { valid: true };
  }

  /**
   * Generate unique filename
   */
  generateFilename(originalName: string): string {
    const ext = originalName.split('.').pop() || 'jpg';
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    return `${timestamp}-${random}.${ext}`;
  }

  /**
   * Upload file to R2
   */
  async uploadFile(file: File, folder: string = 'products'): Promise<UploadResult | null> {
    try {
      // Validate file
      const validation = this.validateFile(file);
      if (!validation.valid) {
        throw new Error(validation.error);
      }

      // Generate filename
      const filename = this.generateFilename(file.name);
      const key = `${folder}/${filename}`;

      // Convert file to buffer
      const buffer = await file.arrayBuffer();

      // Upload to R2
      await this.bucket.put(key, buffer, {
        httpMetadata: {
          contentType: file.type,
          cacheControl: 'public, max-age=31536000', // 1 year cache
        },
      });

      // Generate public URL
      const url = `${this.config.bucketUrl}/${key}`;

      return { url, key };
    } catch (error) {
      console.error('Error uploading file:', error);
      return null;
    }
  }

  /**
   * Delete file from R2
   */
  async deleteFile(key: string): Promise<boolean> {
    try {
      await this.bucket.delete(key);
      return true;
    } catch (error) {
      console.error('Error deleting file:', error);
      return false;
    }
  }

  /**
   * Get file metadata
   */
  async getFileMetadata(key: string): Promise<any> {
    try {
      const object = await this.bucket.head(key);
      return object;
    } catch (error) {
      console.error('Error getting file metadata:', error);
      return null;
    }
  }

  /**
   * List files in folder
   */
  async listFiles(folder: string = 'products'): Promise<string[]> {
    try {
      const list = await this.bucket.list({ prefix: folder });
      return list.objects.map((obj) => obj.key);
    } catch (error) {
      console.error('Error listing files:', error);
      return [];
    }
  }
}
