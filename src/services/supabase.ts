import { SupabaseClient } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
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
    if (!CONFIG.SUPABASE_URL || !CONFIG.SUPABASE_ANON_KEY) {
      console.warn('Supabase not configured, using mock data');
      this.useMockData = true;
      return;
    }

    try {
      // Use the singleton client from lib/supabase to avoid multiple instances
      this.client = supabase;
    } catch (error) {
      console.error('Failed to initialize Supabase client, using mock data:', error);
      this.useMockData = true;
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
        .select(
          [
            'id',
            'clover_item_id',
            'name',
            'brand',
            'description',
            'image_url',
            'sku',
            'upc',
            'price_cents',
            'visible_in_kiosk',
            'active',
            'category_id',
            'category:categories(name)'
          ].join(',')
        )
        .eq('visible_in_kiosk', true)
        .eq('active', true)
        .order('name');

      if (error) {
        return {
          data: [],
          success: false,
          error: error.message
        };
      }

      const mapped: Product[] = (data || []).map((p: any) => ({
        id: p.id,
        clover_item_id: p.clover_item_id,
        name: p.name,
        description: p.description ?? undefined,
        price: typeof p.price_cents === 'number' ? p.price_cents / 100 : 0,
        upc: p.upc ?? undefined,
        sku: p.sku ?? '',
        category: p.category?.name ?? '',
        brand: p.brand ?? undefined,
        image_url: p.image_url ?? undefined,
        visible_in_kiosk: !!p.visible_in_kiosk,
        in_stock: true,
        stock_quantity: undefined,
      }));

      return {
        data: mapped,
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
        .select(
          [
            'id',
            'name',
            'brand',
            'description',
            'image_url',
            'sku',
            'upc',
            'price_cents',
            'visible_in_kiosk',
            'active',
            'category:categories(name)'
          ].join(',')
        )
        .eq('upc', upc)
        .eq('visible_in_kiosk', true)
        .eq('active', true)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 is "not found"
        return {
          data: null,
          success: false,
          error: error.message
        };
      }

      const product: Product | null = data
        ? {
            id: data.id,
            name: data.name,
            description: data.description ?? undefined,
            price: typeof data.price_cents === 'number' ? data.price_cents / 100 : 0,
            upc: data.upc ?? undefined,
            sku: data.sku ?? '',
            category: data.category?.name ?? '',
            brand: data.brand ?? undefined,
            image_url: data.image_url ?? undefined,
            visible_in_kiosk: !!data.visible_in_kiosk,
            in_stock: true,
            stock_quantity: undefined,
          }
        : null;

      return {
        data: product,
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
      // Prefer categories table
      const { data: categoriesData, error: catError } = await this.client!
        .from('categories')
        .select('name, active')
        .eq('active', true)
        .order('name');

      if (!catError && categoriesData) {
        const names = (categoriesData || [])
          .map((c: any) => c.name)
          .filter(Boolean);
        return { data: names, success: true };
      }

      // Fallback: derive from products currently visible in kiosk
      const { data, error } = await this.client!
        .from('products')
        .select('category:categories(name), visible_in_kiosk, active')
        .eq('visible_in_kiosk', true)
        .eq('active', true);

      if (error) {
        return {
          data: [],
          success: false,
          error: error.message
        };
      }

      const names = [...new Set((data || []).map((r: any) => r.category?.name).filter(Boolean))];
      return { data: names, success: true };
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