import type { JWTPayload } from '../../shared/types';

export class AuthService {
  constructor(private secret: string) {}

  /**
   * Extract JWT token from Authorization header
   */
  extractToken(authHeader?: string): string | null {
    if (!authHeader) return null;
    const parts = authHeader.split(' ');
    if (parts.length === 2 && parts[0] === 'Bearer') {
      return parts[1];
    }
    return null;
  }

  /**
   * Generate JWT token
   */
  async generateToken(payload: Omit<JWTPayload, 'iat' | 'exp'>): Promise<string> {
    const header = {
      alg: 'HS256',
      typ: 'JWT',
    };

    const now = Math.floor(Date.now() / 1000);
    const expiresIn = 24 * 60 * 60; // 24 hours

    const tokenPayload: JWTPayload = {
      ...payload,
      iat: now,
      exp: now + expiresIn,
    };

    const headerEncoded = this.base64UrlEncode(JSON.stringify(header));
    const payloadEncoded = this.base64UrlEncode(JSON.stringify(tokenPayload));

    const signature = await this.sign(`${headerEncoded}.${payloadEncoded}`);
    const signatureEncoded = this.base64UrlEncode(signature);

    return `${headerEncoded}.${payloadEncoded}.${signatureEncoded}`;
  }

  /**
   * Verify JWT token
   */
  async verifyToken(token: string): Promise<JWTPayload | null> {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) return null;

      const [headerEncoded, payloadEncoded, signatureEncoded] = parts;

      // Verify signature
      const signature = await this.sign(`${headerEncoded}.${payloadEncoded}`);
      const expectedSignature = this.base64UrlEncode(signature);

      if (signatureEncoded !== expectedSignature) {
        return null;
      }

      // Decode and parse payload
      const payloadJson = this.base64UrlDecode(payloadEncoded);
      const payload: JWTPayload = JSON.parse(payloadJson);

      // Check expiration
      const now = Math.floor(Date.now() / 1000);
      if (payload.exp < now) {
        return null;
      }

      return payload;
    } catch (error) {
      console.error('Error verifying token:', error);
      return null;
    }
  }

  /**
   * Hash password using SHA-256
   */
  async hashPassword(password: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    return this.bufferToHex(hashBuffer);
  }

  /**
   * Verify password against hash
   */
  async verifyPassword(password: string, hash: string): Promise<boolean> {
    const passwordHash = await this.hashPassword(password);
    return passwordHash === hash;
  }

  /**
   * Sign data using HMAC-SHA256
   */
  private async sign(data: string): Promise<Uint8Array> {
    const encoder = new TextEncoder();
    const keyData = encoder.encode(this.secret);
    const key = await crypto.subtle.importKey('raw', keyData, { name: 'HMAC', hash: 'SHA-256' }, false, [
      'sign',
    ]);

    const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(data));
    return new Uint8Array(signature);
  }

  /**
   * Base64 URL encode
   */
  private base64UrlEncode(data: string | Uint8Array): string {
    let binary: string;

    if (typeof data === 'string') {
      binary = data;
    } else {
      binary = String.fromCharCode.apply(null, Array.from(data));
    }

    return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
  }

  /**
   * Base64 URL decode
   */
  private base64UrlDecode(data: string): string {
    const padding = '='.repeat((4 - (data.length % 4)) % 4);
    const base64 = (data + padding).replace(/-/g, '+').replace(/_/g, '/');
    return atob(base64);
  }

  /**
   * Convert buffer to hex string
   */
  private bufferToHex(buffer: ArrayBuffer): string {
    const view = new Uint8Array(buffer);
    let hex = '';
    for (let i = 0; i < view.length; i++) {
      hex += ('0' + view[i].toString(16)).slice(-2);
    }
    return hex;
  }
}
