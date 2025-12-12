/**
 * @jest-environment node
 */

import { api } from '@/lib/api';
import { InventoryAdjustment } from '@/lib/types';

// Mock fetch globally
const mockFetch = jest.fn();
global.fetch = mockFetch;

describe('API Client - Inventory', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('inventory.all', () => {
    it('fetches all inventory items', async () => {
      const mockResponse = [
        {
          clover_item_id: 'item1',
          name: 'Test Item',
          on_hand: 10,
          reorder_level: 5,
        },
      ];

      mockFetch.mockResolvedValueOnce({
        ok: true,
        text: () => Promise.resolve(JSON.stringify(mockResponse)),
      });

      const result = await api.inventory.all();
      
      expect(mockFetch).toHaveBeenCalledWith('/api/inventory', {
        headers: { 'Content-Type': 'application/json' },
        cache: 'no-store',
      });
      expect(result).toEqual(mockResponse);
    });

    it('handles fetch errors', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        text: () => Promise.resolve('Server error'),
      });

      await expect(api.inventory.all()).rejects.toThrow('HTTP 500 Internal Server Error');
    });
  });

  describe('inventory.lowStock', () => {
    it('fetches low stock items', async () => {
      const mockResponse = [
        {
          clover_item_id: 'item1',
          name: 'Low Stock Item',
          on_hand: 2,
          reorder_level: 5,
          low_stock: true,
        },
      ];

      mockFetch.mockResolvedValueOnce({
        ok: true,
        text: () => Promise.resolve(JSON.stringify(mockResponse)),
      });

      const result = await api.inventory.lowStock();
      
      expect(mockFetch).toHaveBeenCalledWith('/api/inventory/low-stock', {
        headers: { 'Content-Type': 'application/json' },
        cache: 'no-store',
      });
      expect(result).toEqual(mockResponse);
    });
  });

  describe('inventory.adjust', () => {
    it('adjusts inventory successfully', async () => {
      const adjustment: InventoryAdjustment = {
        clover_item_id: 'item1',
        adjustment: 5,
        reason: 'Stock received',
      };

      const mockResponse = {
        success: true,
        new_quantity: 15,
        message: 'Inventory adjusted successfully',
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        text: () => Promise.resolve(JSON.stringify(mockResponse)),
      });

      const result = await api.inventory.adjust(adjustment);
      
      expect(mockFetch).toHaveBeenCalledWith('/api/inventory/adjust', {
        method: 'POST',
        body: JSON.stringify(adjustment),
        headers: { 'Content-Type': 'application/json' },
        cache: 'no-store',
      });
      expect(result).toEqual(mockResponse);
    });

    it('handles adjustment errors', async () => {
      const adjustment: InventoryAdjustment = {
        clover_item_id: 'item1',
        adjustment: 5,
      };

      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        statusText: 'Bad Request',
        text: () => Promise.resolve('Invalid adjustment'),
      });

      await expect(api.inventory.adjust(adjustment)).rejects.toThrow('HTTP 400 Bad Request');
    });

    it('handles non-JSON responses for successful adjustments', async () => {
      const adjustment: InventoryAdjustment = {
        clover_item_id: 'item1',
        adjustment: 5,
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        text: () => Promise.resolve('Success'),
      });

      const result = await api.inventory.adjust(adjustment);
      expect(result).toBe('Success');
    });
  });
});

import { api } from '@/lib/api'

// Mock fetch
const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>

describe('API Client', () => {
  beforeEach(() => {
    mockFetch.mockClear()
  })

  describe('products', () => {
    it('lists products without filters', async () => {
      const mockProducts = [
        {
          clover_item_id: '1',
          name: 'Test Product',
          category: 'Test Category',
          price: 100,
        },
      ]

      mockFetch.mockResolvedValueOnce({
        ok: true,
        text: () => Promise.resolve(JSON.stringify(mockProducts)),
      } as Response)

      const result = await api.products.list()
      
      expect(mockFetch).toHaveBeenCalledWith('/api/products', {
        headers: { 'Content-Type': 'application/json' },
        cache: 'no-store',
      })
      expect(result).toEqual(mockProducts)
    })

    it('lists products with filters', async () => {
      const mockProducts = [
        {
          clover_item_id: '1',
          name: 'Filtered Product',
          category: 'Electronics',
          price: 200,
          visible_in_kiosk: true,
        },
      ]

      mockFetch.mockResolvedValueOnce({
        ok: true,
        text: () => Promise.resolve(JSON.stringify(mockProducts)),
      } as Response)

      const result = await api.products.list({
        search: 'filtered',
        category: 'Electronics',
        kiosk_only: true,
      })
      
      expect(mockFetch).toHaveBeenCalledWith(
        '/api/products?search=filtered&category=Electronics&kiosk_only=true',
        {
          headers: { 'Content-Type': 'application/json' },
          cache: 'no-store',
        }
      )
      expect(result).toEqual(mockProducts)
    })

    it('gets a single product', async () => {
      const mockProduct = {
        clover_item_id: '123',
        name: 'Single Product',
        category: 'Category',
        price: 150,
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        text: () => Promise.resolve(JSON.stringify(mockProduct)),
      } as Response)

      const result = await api.products.get('123')
      
      expect(mockFetch).toHaveBeenCalledWith('/api/products/123', {
        headers: { 'Content-Type': 'application/json' },
        cache: 'no-store',
      })
      expect(result).toEqual(mockProduct)
    })

    it('updates a product', async () => {
      const mockProduct = {
        clover_item_id: '123',
        name: 'Updated Product',
        visible_in_kiosk: true,
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        text: () => Promise.resolve(JSON.stringify(mockProduct)),
      } as Response)

      const update = { name: 'Updated Product', visible_in_kiosk: true }
      const result = await api.products.update('123', update)
      
      expect(mockFetch).toHaveBeenCalledWith('/api/products/123', {
        method: 'PATCH',
        body: JSON.stringify(update),
        headers: { 'Content-Type': 'application/json' },
        cache: 'no-store',
      })
      expect(result).toEqual(mockProduct)
    })

    it('handles API errors', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found',
        text: () => Promise.resolve('Product not found'),
      } as Response)

      await expect(api.products.get('nonexistent')).rejects.toThrow(
        'HTTP 404 Not Found\nProduct not found'
      )
    })
  })

  describe('categories', () => {
    it('lists categories', async () => {
      const mockCategories = ['Electronics', 'Clothing', 'Books']

      mockFetch.mockResolvedValueOnce({
        ok: true,
        text: () => Promise.resolve(JSON.stringify(mockCategories)),
      } as Response)

      const result = await api.categories.list()
      
      expect(mockFetch).toHaveBeenCalledWith('/api/categories', {
        headers: { 'Content-Type': 'application/json' },
        cache: 'no-store',
      })
      expect(result).toEqual(mockCategories)
    })
  })

  describe('sync', () => {
    it('triggers product sync', async () => {
      const mockResponse = { success: true, count: 10 }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        text: () => Promise.resolve(JSON.stringify(mockResponse)),
      } as Response)

      const result = await api.sync.products()
      
      expect(mockFetch).toHaveBeenCalledWith('/api/products/sync', {
        method: 'POST',
        body: JSON.stringify(undefined),
        headers: { 'Content-Type': 'application/json' },
        cache: 'no-store',
      })
      expect(result).toEqual(mockResponse)
    })
  })
})
