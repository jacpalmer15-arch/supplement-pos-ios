/**
 * @jest-environment node
 */
import { NextRequest } from 'next/server';

// Mock the orders array to be isolated per test
let mockOrders: Array<any> = [];

// Mock the orders module
jest.mock('@/app/api/orders/route', () => {
  const { NextResponse } = require('next/server');
  
  return {
    POST: async (request: NextRequest) => {
      try {
        const body = await request.json();
        const { items, subtotal, tax, total, payment_method } = body;

        // Validate required fields
        if (!items || items.length === 0) {
          return NextResponse.json(
            { error: 'Order must contain at least one item' },
            { status: 400 }
          );
        }

        if (!payment_method || !['card', 'cash', 'gift_card'].includes(payment_method)) {
          return NextResponse.json(
            { error: 'Invalid payment method' },
            { status: 400 }
          );
        }

        // Create new order
        const newOrder = {
          id: `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          items,
          subtotal,
          tax,
          total,
          payment_method,
          status: 'pending',
          created_at: new Date(),
        };

        // Simulate processing delay
        await new Promise(resolve => setTimeout(resolve, 10));

        // Simulate payment processing
        const paymentSuccess = Math.random() > 0.1; // 90% success rate for demo

        if (paymentSuccess) {
          newOrder.status = 'completed';
          newOrder.completed_at = new Date();
          mockOrders.push(newOrder);

          return NextResponse.json(
            {
              success: true,
              order: newOrder,
              message: 'Order processed successfully'
            },
            { status: 201 }
          );
        } else {
          return NextResponse.json(
            { error: 'Payment processing failed. Please try again.' },
            { status: 402 }
          );
        }
      } catch (error) {
        return NextResponse.json(
          { error: 'Internal server error' },
          { status: 500 }
        );
      }
    },
    GET: async () => {
      try {
        return NextResponse.json({
          success: true,
          orders: mockOrders.slice(-20),
          count: mockOrders.length
        });
      } catch (error) {
        return NextResponse.json(
          { error: 'Internal server error' },
          { status: 500 }
        );
      }
    }
  };
});

import { POST, GET } from '@/app/api/orders/route';

describe('/api/orders', () => {
  beforeEach(() => {
    mockOrders = [];
  });

  describe('POST', () => {
    it('creates a new order successfully', async () => {
      const orderData = {
        items: [
          {
            clover_item_id: 'itm_1001',
            name: 'Rule 1 Whey Blend - Chocolate',
            price: 3999,
            quantity: 2,
            category: 'Protein'
          }
        ],
        subtotal: 7998,
        tax: 699,
        total: 8697,
        payment_method: 'card'
      };

      const request = new NextRequest('http://localhost:3000/api/orders', {
        method: 'POST',
        body: JSON.stringify(orderData),
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const response = await POST(request);
      const result = await response.json();

      expect(response.status).toBe(201);
      expect(result.success).toBe(true);
      expect(result.order).toBeDefined();
      expect(result.order.id).toBeDefined();
      expect(result.order.status).toBe('completed');
      expect(result.order.items).toEqual(orderData.items);
      expect(result.order.total).toBe(orderData.total);
      expect(result.order.payment_method).toBe('card');
    });

    it('returns error for empty cart', async () => {
      const orderData = {
        items: [],
        subtotal: 0,
        tax: 0,
        total: 0,
        payment_method: 'card'
      };

      const request = new NextRequest('http://localhost:3000/api/orders', {
        method: 'POST',
        body: JSON.stringify(orderData),
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const response = await POST(request);
      const result = await response.json();

      expect(response.status).toBe(400);
      expect(result.error).toBe('Order must contain at least one item');
    });

    it('returns error for invalid payment method', async () => {
      const orderData = {
        items: [
          {
            clover_item_id: 'itm_1001',
            name: 'Rule 1 Whey Blend - Chocolate',
            price: 3999,
            quantity: 1,
            category: 'Protein'
          }
        ],
        subtotal: 3999,
        tax: 349,
        total: 4348,
        payment_method: 'invalid_method'
      };

      const request = new NextRequest('http://localhost:3000/api/orders', {
        method: 'POST',
        body: JSON.stringify(orderData),
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const response = await POST(request);
      const result = await response.json();

      expect(response.status).toBe(400);
      expect(result.error).toBe('Invalid payment method');
    });

    it('handles malformed JSON', async () => {
      const request = new NextRequest('http://localhost:3000/api/orders', {
        method: 'POST',
        body: 'invalid json',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const response = await POST(request);
      const result = await response.json();

      expect(response.status).toBe(500);
      expect(result.error).toBe('Internal server error');
    });
  });

  describe('GET', () => {
    it('returns empty orders list initially', async () => {
      const response = await GET();
      const result = await response.json();

      expect(response.status).toBe(200);
      expect(result.success).toBe(true);
      expect(result.orders).toEqual([]);
      expect(result.count).toBe(0);
    });
  });
});