import { BACKEND_BASE } from '@env';
import { authService } from './auth';
import { CartItem } from '../types';

export interface CheckoutPayload {
  orderCart: {
    lineItems: Array<{
      item: {
        id: string; // clover_item_id
      };
    }>;
  };
}

export interface CheckoutResponse {
  success: boolean;
  order?: {
    id: string;
    total_amount: number;
    status: string;
    items: Array<{
      clover_item_id: string;
      name: string;
      quantity: number;
      unit_price: number;
    }>;
  };
  message?: string;
  error?: string;
}

class CheckoutService {
  /**
   * Transform cart items into Clover-compatible orderCart format
   * Each quantity unit becomes a separate lineItem
   */
  private transformCartToOrderCart(items: CartItem[]): CheckoutPayload {
    const lineItems: Array<{ item: { id: string } }> = [];

    items.forEach((cartItem) => {
      const quantity = Math.max(0, Number(cartItem.quantity) || 0);
      
      // Get clover_item_id from either cartItem or its product
      const cloverId = cartItem.clover_item_id || cartItem.product.clover_item_id;
      
      if (!cloverId) {
        console.warn(`Item ${cartItem.product.name} missing clover_item_id, skipping`);
        return;
      }
      
      // Each unit of quantity becomes a separate lineItem
      for (let i = 0; i < quantity; i++) {
        lineItems.push({
          item: {
            id: cloverId,
          },
        });
      }
    });

    return {
      orderCart: {
        lineItems,
      },
    };
  }

  /**
   * Submit checkout to backend API
   */
  async checkout(items: CartItem[]): Promise<CheckoutResponse> {
    if (!BACKEND_BASE) {
      return {
        success: false,
        error: 'Backend URL not configured',
      };
    }

    if (!items || items.length === 0) {
      return {
        success: false,
        error: 'Cart is empty',
      };
    }

    try {
      // Transform cart to backend format
      const payload = this.transformCartToOrderCart(items);

      // Make authenticated request
      const response = await authService.authenticatedFetch(
        `${BACKEND_BASE}/api/checkout`,
        {
          method: 'POST',
          body: JSON.stringify(payload),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.message || data.error || `HTTP ${response.status}`,
        };
      }

      return {
        success: true,
        order: data.order,
        message: data.message || 'Order created successfully',
      };
    } catch (error) {
      console.error('Checkout error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error',
      };
    }
  }

  /**
   * Test checkout with sample items (for debugging)
   */
  async testCheckout(): Promise<CheckoutResponse> {
    const testItems: CartItem[] = [
      {
        product: {
          id: 'test-uuid-1',
          clover_item_id: 'TEST_ITEM_1',
          name: 'Test Product 1',
          price: 19.99,
          sku: 'TEST-SKU-1',
          category: 'Test',
          visible_in_kiosk: true,
          in_stock: true,
        },
        quantity: 2,
        clover_item_id: 'TEST_ITEM_1',
      },
      {
        product: {
          id: 'test-uuid-2',
          clover_item_id: 'TEST_ITEM_2',
          name: 'Test Product 2',
          price: 29.99,
          sku: 'TEST-SKU-2',
          category: 'Test',
          visible_in_kiosk: true,
          in_stock: true,
        },
        quantity: 1,
        clover_item_id: 'TEST_ITEM_2',
      },
    ];

    return this.checkout(testItems);
  }
}

export const checkoutService = new CheckoutService();
