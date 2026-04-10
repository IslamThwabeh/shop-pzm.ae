const DEFAULT_TOKEN_EXPIRY_SECONDS = 24 * 60 * 60;

export interface AuthTokenPayload {
  sub: string;
  email: string;
  iat: number;
  exp: number;
  role?: string;
  type?: string;
  username?: string;
}

type AuthTokenPayloadInput = Omit<AuthTokenPayload, 'iat' | 'exp'>;

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
  async generateToken(payload: AuthTokenPayloadInput, expiresInSeconds = DEFAULT_TOKEN_EXPIRY_SECONDS): Promise<string> {
    const header = {
      alg: 'HS256',
      typ: 'JWT',
    };

    const now = Math.floor(Date.now() / 1000);

    const tokenPayload: AuthTokenPayload = {
      ...payload,
      iat: now,
      exp: now + expiresInSeconds,
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
  async verifyToken(token: string): Promise<AuthTokenPayload | null> {
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
      const payload: AuthTokenPayload = JSON.parse(payloadJson);

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
   * Verify password hash (direct comparison)
   * The frontend sends the SHA-256 hash, so we just compare it directly
   */
  async verifyPasswordHash(receivedHash: string, storedHash: string): Promise<boolean> {
    return receivedHash === storedHash;
  }

  async hashValue(value: string): Promise<string> {
    const encoder = new TextEncoder();
    const digest = await crypto.subtle.digest('SHA-256', encoder.encode(value));
    return this.base64UrlEncode(new Uint8Array(digest));
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
}
