import { Context } from 'hono';
import { generateId as sharedGenerateId, validateRequired as sharedValidateRequired } from '../../shared/utils';

/**
 * Get CORS headers
 */
export function getCorsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };
}

/**
 * Handle CORS preflight requests
 */
export function handleCors(c: Context) {
  if (c.req.method === 'OPTIONS') {
    return c.json({}, 200, getCorsHeaders());
  }
}

/**
 * Generate unique ID with prefix
 */
export function generateId(prefix: string): string {
  return sharedGenerateId(prefix);
}

/**
 * Validate required fields
 */
export function validateRequired(obj: Record<string, any>, fields: string[]): string | null {
  return sharedValidateRequired(obj, fields);
}

/**
 * Parse JSON request body
 */
export async function parseRequestBody(c: Context): Promise<Record<string, any> | null> {
  try {
    const contentType = c.req.header('Content-Type');

    if (contentType?.includes('application/json')) {
      return await c.req.json();
    }

    if (contentType?.includes('multipart/form-data')) {
      const formData = await c.req.formData();
      const obj: Record<string, any> = {};

      for (const [key, value] of formData.entries()) {
        obj[key] = value;
      }

      return obj;
    }

    return null;
  } catch (error) {
    console.error('Error parsing request body:', error);
    return null;
  }
}

/**
 * Create success response
 */
export function successResponse<T>(data: T, status: number = 200) {
  return {
    data,
    status,
  };
}

/**
 * Create error response
 */
export function errorResponse(error: string, status: number = 500) {
  return {
    error,
    status,
  };
}

/**
 * Sanitize object for logging (remove sensitive data)
 */
export function sanitizeForLogging(obj: any): any {
  const sensitiveFields = ['password', 'password_hash', 'token', 'secret', 'api_key'];
  const sanitized = { ...obj };

  for (const field of sensitiveFields) {
    if (field in sanitized) {
      sanitized[field] = '***';
    }
  }

  return sanitized;
}

/**
 * Log request
 */
export function logRequest(method: string, path: string, data?: any) {
  const sanitized = data ? sanitizeForLogging(data) : undefined;
  console.log(`[${new Date().toISOString()}] ${method} ${path}`, sanitized || '');
}

/**
 * Log error
 */
export function logError(error: any, context?: string) {
  const timestamp = new Date().toISOString();
  const message = error instanceof Error ? error.message : String(error);
  console.error(`[${timestamp}] ERROR${context ? ` (${context})` : ''}: ${message}`);
}
