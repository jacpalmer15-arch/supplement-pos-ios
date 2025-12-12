import { NextRequest } from 'next/server';

/**
 * Extracts the authorization header from the incoming request
 * to forward to backend API calls
 */
export function getAuthHeader(req: NextRequest): Record<string, string> {
  const authHeader = req.headers.get('authorization');
  
  if (authHeader) {
    return {
      'Authorization': authHeader,
    };
  }
  
  return {};
}

/**
 * Creates headers object for backend API calls with authentication
 * and content type
 */
export function createBackendHeaders(req: NextRequest, additionalHeaders: Record<string, string> = {}): Record<string, string> {
  return {
    'Content-Type': 'application/json',
    ...getAuthHeader(req),
    ...additionalHeaders,
  };
}

/**
 * Validates that an authorization header is present
 */
export function validateAuthHeader(req: NextRequest): boolean {
  return !!req.headers.get('authorization');
}

/**
 * Returns a 401 response for unauthorized requests
 */
export function unauthorizedResponse(): Response {
  return new Response(
    JSON.stringify({ 
      error: 'Unauthorized', 
      message: 'Authentication required' 
    }), 
    { 
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    }
  );
}