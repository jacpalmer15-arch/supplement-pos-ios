import { NextRequest } from 'next/server';
import {
  getAuthHeader,
  createBackendHeaders,
  validateAuthHeader,
  unauthorizedResponse,
} from '@/lib/auth-utils';

// Mock NextRequest
const createMockRequest = (headers: Record<string, string> = {}) => {
  const request = {
    headers: {
      get: (key: string) => headers[key.toLowerCase()] || null,
    },
  } as NextRequest;
  return request;
};

describe('Auth Utils', () => {
  describe('getAuthHeader', () => {
    it('should extract authorization header when present', () => {
      const req = createMockRequest({ authorization: 'Bearer test-token' });
      const result = getAuthHeader(req);
      expect(result).toEqual({ Authorization: 'Bearer test-token' });
    });

    it('should return empty object when no authorization header', () => {
      const req = createMockRequest();
      const result = getAuthHeader(req);
      expect(result).toEqual({});
    });
  });

  describe('createBackendHeaders', () => {
    it('should create headers with content type and auth', () => {
      const req = createMockRequest({ authorization: 'Bearer test-token' });
      const result = createBackendHeaders(req);
      expect(result).toEqual({
        'Content-Type': 'application/json',
        'Authorization': 'Bearer test-token',
      });
    });

    it('should include additional headers', () => {
      const req = createMockRequest({ authorization: 'Bearer test-token' });
      const additional = { 'X-Custom': 'value' };
      const result = createBackendHeaders(req, additional);
      expect(result).toEqual({
        'Content-Type': 'application/json',
        'Authorization': 'Bearer test-token',
        'X-Custom': 'value',
      });
    });

    it('should work without authorization header', () => {
      const req = createMockRequest();
      const result = createBackendHeaders(req);
      expect(result).toEqual({
        'Content-Type': 'application/json',
      });
    });
  });

  describe('validateAuthHeader', () => {
    it('should return true when authorization header is present', () => {
      const req = createMockRequest({ authorization: 'Bearer test-token' });
      expect(validateAuthHeader(req)).toBe(true);
    });

    it('should return false when authorization header is missing', () => {
      const req = createMockRequest();
      expect(validateAuthHeader(req)).toBe(false);
    });
  });

  describe('unauthorizedResponse', () => {
    it('should return a 401 response with proper structure', () => {
      const response = unauthorizedResponse();
      expect(response.status).toBe(401);
      expect(response.headers.get('Content-Type')).toBe('application/json');
    });
  });
});