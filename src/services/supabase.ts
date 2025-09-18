import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { CONFIG } from '../constants/config';
import { Product, CheckoutRequest, CheckoutResponse, ApiResponse } from '../types';

class SupabaseService {
  private client: SupabaseClient;

  constructor() {
    if (!CONFIG.SUPABASE_URL || !CONFIG.SUPABASE_ANON_KEY) {
      throw new Error('Supabase URL and Anon Key must be configured in environment variables');
    }
    
    this.client = createClient(CONFIG.SUPABASE_URL, CONFIG.SUPABASE_ANON_KEY);
  }

  // Get all products visible in kiosk
  async getProducts(): Promise<ApiResponse<Product[]>> {
    try {
      const { data, error } = await this.client
        .from('products')
        .select('*')
        .eq('visible_in_kiosk', true)
        .eq('in_stock', true)
        .order('name');

      if (error) {
        return {
          data: [],
          success: false,
          error: error.message
        };
      }

      return {
        data: data || [],
        success: true
      };
    } catch (error) {
      return {
        data: [],
        success: false,
        error: 'Failed to fetch products from Supabase'
      };
    }
  }

  // Get product by UPC (for barcode scanning)
  async getProductByUPC(upc: string): Promise<ApiResponse<Product | null>> {
    try {
      const { data, error } = await this.client
        .from('products')
        .select('*')
        .eq('upc', upc)
        .eq('visible_in_kiosk', true)
        .eq('in_stock', true)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 is "not found"
        return {
          data: null,
          success: false,
          error: error.message
        };
      }

      return {
        data: data || null,
        success: true
      };
    } catch (error) {
      return {
        data: null,
        success: false,
        error: 'Failed to fetch product by UPC from Supabase'
      };
    }
  }

  // Get categories
  async getCategories(): Promise<ApiResponse<string[]>> {
    try {
      const { data, error } = await this.client
        .from('products')
        .select('category')
        .eq('visible_in_kiosk', true)
        .eq('in_stock', true);

      if (error) {
        return {
          data: [],
          success: false,
          error: error.message
        };
      }

      // Extract unique categories
      const categories = [...new Set(data?.map(item => item.category).filter(Boolean))];
      
      return {
        data: categories,
        success: true
      };
    } catch (error) {
      return {
        data: [],
        success: false,
        error: 'Failed to fetch categories from Supabase'
      };
    }
  }

  // Process checkout
  async checkout(checkoutData: CheckoutRequest): Promise<ApiResponse<CheckoutResponse>> {
    try {
      // Insert checkout record into Supabase
      const { data, error } = await this.client
        .from('checkouts')
        .insert([{
          merchant_id: checkoutData.merchant_id,
          kiosk_id: checkoutData.kiosk_id,
          items: checkoutData.items,
          total: checkoutData.total,
          payment_method: checkoutData.payment_method,
          payment_status: 'pending',
          created_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (error) {
        return {
          data: {
            success: false,
            payment_status: 'failed',
            message: error.message
          },
          success: false,
          error: error.message
        };
      }

      // For now, we'll simulate successful payment
      // In a real implementation, this would integrate with payment processing
      const response: CheckoutResponse = {
        success: true,
        transaction_id: data.id?.toString() || `tx_${Date.now()}`,
        payment_status: CONFIG.CLOVER_MINI_ENABLED ? 'pending' : 'completed',
        message: CONFIG.CLOVER_MINI_ENABLED 
          ? 'Please complete payment on the Clover Mini device'
          : 'Payment processed successfully',
        clover_payment_required: CONFIG.CLOVER_MINI_ENABLED
      };

      return {
        data: response,
        success: true
      };
    } catch (error) {
      return {
        data: {
          success: false,
          payment_status: 'failed',
          message: 'Checkout failed'
        },
        success: false,
        error: 'Failed to process checkout'
      };
    }
  }

  // Health check
  async healthCheck(): Promise<ApiResponse<{ status: string }>> {
    try {
      // Simple query to test Supabase connection
      const { error } = await this.client
        .from('products')
        .select('id')
        .limit(1);

      if (error) {
        return {
          data: { status: 'error' },
          success: false,
          error: error.message
        };
      }

      return {
        data: { status: 'healthy' },
        success: true
      };
    } catch (error) {
      return {
        data: { status: 'error' },
        success: false,
        error: 'Supabase connection failed'
      };
    }
  }
}

export const supabaseService = new SupabaseService();