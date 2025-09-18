import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { CONFIG } from '../constants/config';
import { Product, CheckoutRequest, CheckoutResponse, ApiResponse } from '../types';

// Mock data for testing when Supabase is not configured
const MOCK_PRODUCTS: Product[] = [
  {
    id: '1',
    name: 'Whey Protein Powder',
    description: 'High-quality whey protein for muscle building',
    price: 39.99,
    upc: '123456789012',
    sku: 'ZN-WP-001',
    category: 'Protein',
    brand: 'Zenith Nutrition',
    image_url: 'https://via.placeholder.com/300x300?text=Whey+Protein',
    visible_in_kiosk: true,
    in_stock: true,
    stock_quantity: 25
  },
  {
    id: '2',
    name: 'Multivitamin Complex',
    description: 'Complete daily vitamin and mineral support',
    price: 29.99,
    upc: '123456789013',
    sku: 'ZN-MVC-001',
    category: 'Vitamins',
    brand: 'Zenith Nutrition',
    image_url: 'https://via.placeholder.com/300x300?text=Multivitamin',
    visible_in_kiosk: true,
    in_stock: true,
    stock_quantity: 50
  },
  {
    id: '3',
    name: 'Creatine Monohydrate',
    description: 'Pure creatine for strength and power',
    price: 24.99,
    upc: '123456789014',
    sku: 'ZN-CM-001',
    category: 'Performance',
    brand: 'Zenith Nutrition',
    image_url: 'https://via.placeholder.com/300x300?text=Creatine',
    visible_in_kiosk: true,
    in_stock: true,
    stock_quantity: 30
  },
  {
    id: '4',
    name: 'Omega-3 Fish Oil',
    description: 'High-potency fish oil for heart and brain health',
    price: 19.99,
    upc: '123456789015',
    sku: 'ZN-FO-001',
    category: 'Health',
    brand: 'Zenith Nutrition',
    image_url: 'https://via.placeholder.com/300x300?text=Fish+Oil',
    visible_in_kiosk: true,
    in_stock: true,
    stock_quantity: 40
  }
];

class SupabaseService {
  private client: SupabaseClient | null = null;
  private useMockData: boolean = false;

  constructor() {
    if (!CONFIG.SUPABASE_URL || !CONFIG.SUPABASE_ANON_KEY || 
        CONFIG.SUPABASE_URL === 'https://your-project.supabase.co' || 
        CONFIG.SUPABASE_ANON_KEY === 'your-anon-key-here') {
      console.warn('Supabase not properly configured, using mock data for testing');
      this.useMockData = true;
    } else {
      try {
        this.client = createClient(CONFIG.SUPABASE_URL, CONFIG.SUPABASE_ANON_KEY);
      } catch (error) {
        console.error('Failed to initialize Supabase client, using mock data:', error);
        this.useMockData = true;
      }
    }
  }

  // Get all products visible in kiosk
  async getProducts(): Promise<ApiResponse<Product[]>> {
    if (this.useMockData) {
      return {
        data: MOCK_PRODUCTS,
        success: true
      };
    }

    try {
      const { data, error } = await this.client!
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
    if (this.useMockData) {
      const product = MOCK_PRODUCTS.find(p => p.upc === upc);
      return {
        data: product || null,
        success: true
      };
    }

    try {
      const { data, error } = await this.client!
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
    if (this.useMockData) {
      const categories = [...new Set(MOCK_PRODUCTS.map(p => p.category))];
      return {
        data: categories,
        success: true
      };
    }

    try {
      const { data, error } = await this.client!
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
    if (this.useMockData) {
      // Simulate checkout processing
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const response: CheckoutResponse = {
        success: true,
        transaction_id: `mock_tx_${Date.now()}`,
        payment_status: CONFIG.CLOVER_MINI_ENABLED ? 'pending' : 'completed',
        message: CONFIG.CLOVER_MINI_ENABLED 
          ? 'Please complete payment on the Clover Mini device'
          : 'Payment processed successfully (mock)',
        clover_payment_required: CONFIG.CLOVER_MINI_ENABLED
      };

      return {
        data: response,
        success: true
      };
    }

    try {
      // Insert checkout record into Supabase
      const { data, error } = await this.client!
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
    if (this.useMockData) {
      return {
        data: { status: 'healthy (mock)' },
        success: true
      };
    }

    try {
      // Simple query to test Supabase connection
      const { error } = await this.client!
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