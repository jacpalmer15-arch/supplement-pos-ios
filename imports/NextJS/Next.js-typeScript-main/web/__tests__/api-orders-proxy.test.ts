/**
 * @jest-environment node
 */

import { NextRequest } from 'next/server';
import { POST, GET } from '@/app/api/orders/route';

// Mock the auth utils
jest.mock('@/lib/auth-utils', () => ({
  validateAuthHeader: jest.fn(() => true),
  unauthorizedResponse: jest.fn(() => new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })),
  createBackendHeaders: jest.fn(() => ({ 'Content-Type': 'application/json', 'Authorization': 'Bearer test-token' })),
}));

describe('/api/orders proxy route', () => {
  beforeEach(() => {
    // Clear any environment variables
    delete process.env.BACKEND_BASE;
  });

  describe('POST', () => {
    it('returns simulated order when BACKEND_BASE is not configured', async () => {
      const orderCartBody = {
        orderCart: {
          lineItems: [
            { item: { id: '5VH00EF5Q3T9C' } },
            { item: { id: 'X2T3Y2ZTSYT7M' } },
          ],
        },
      };

      const request = new NextRequest('http://localhost:3000/api/orders', {
        method: 'POST',
        body: JSON.stringify(orderCartBody),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer test-token',
        },
      });

      const response = await POST(request);
      const result = await response.json();

      expect(response.status).toBe(200);
      expect(result.success).toBe(true);
      expect(result.order).toBeDefined();
      expect(result.order.id).toMatch(/^ord_\d+$/);
      expect(result.message).toContain('simulated');
    });

    it('returns error for invalid JSON when BACKEND_BASE is not configured', async () => {
      const request = new NextRequest('http://localhost:3000/api/orders', {
        method: 'POST',
        body: 'invalid json',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer test-token',
        },
      });

      const response = await POST(request);
      const result = await response.json();

      expect(response.status).toBe(400);
      expect(result.success).toBe(false);
      expect(result.message).toBe('Invalid request body');
    });

    it('forwards to upstream when BACKEND_BASE is configured', async () => {
      // Mock fetch for upstream
      const mockUpstreamResponse = {
        success: true,
        order: { id: 'ord_upstream_123' },
        message: 'Order created',
      };

      global.fetch = jest.fn(() =>
        Promise.resolve({
          status: 201,
          headers: {
            get: (name: string) => (name === 'content-type' ? 'application/json' : null),
          },
          text: () => Promise.resolve(JSON.stringify(mockUpstreamResponse)),
        })
      ) as jest.Mock;

      process.env.BACKEND_BASE = 'https://backend.example.com';

      const orderCartBody = {
        orderCart: {
          lineItems: [
            { item: { id: '5VH00EF5Q3T9C' } },
          ],
        },
      };

      const request = new NextRequest('http://localhost:3000/api/orders', {
        method: 'POST',
        body: JSON.stringify(orderCartBody),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer test-token',
        },
      });

      const response = await POST(request);
      const result = await response.json();

      expect(global.fetch).toHaveBeenCalledWith(
        'https://backend.example.com/api/orders',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(orderCartBody),
        })
      );
      expect(response.status).toBe(201);
      expect(result.order.id).toBe('ord_upstream_123');
    });
  });

  describe('GET', () => {
    it('returns mock orders list', async () => {
      const response = await GET();
      const result = await response.json();

      expect(response.status).toBe(200);
      expect(result.success).toBe(true);
      expect(result.orders).toBeDefined();
      expect(Array.isArray(result.orders)).toBe(true);
      expect(result.count).toBeDefined();
    });
  });
});
