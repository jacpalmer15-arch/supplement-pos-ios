import { CONFIG, API_ENDPOINTS } from '../constants/config';
import { Product, CheckoutRequest, CheckoutResponse, ApiResponse } from '../types';

class ApiService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = CONFIG.API_BASE;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': CONFIG.KIOSK_AUTH_TOKEN ? `Bearer ${CONFIG.KIOSK_AUTH_TOKEN}` : '',
        'X-Kiosk-ID': CONFIG.KIOSK_ID,
        'X-Merchant-ID': CONFIG.MERCHANT_ID,
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        return {
          data: {} as T,
          success: false,
          error: data.message || `HTTP ${response.status}: ${response.statusText}`,
        };
      }

      return {
        data,
        success: true,
      };
    } catch (error) {
      console.error('API Request Error:', error);
      return {
        data: {} as T,
        success: false,
        error: error instanceof Error ? error.message : 'Network error occurred',
      };
    }
  }

  // Get all products visible in kiosk
  async getProducts(): Promise<ApiResponse<Product[]>> {
    // For now, return mock data since this is scaffolding
    const mockProducts: Product[] = [
      {
        id: '1',
        name: 'Whey Protein Powder',
        description: 'High-quality whey protein for muscle building',
        price: 49.99,
        upc: '123456789012',
        sku: 'ZN-WPP-001',
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
        description: 'Complete daily vitamin and mineral supplement',
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
        description: 'Essential fatty acids for heart and brain health',
        price: 34.99,
        upc: '123456789015',
        sku: 'ZN-O3-001',
        category: 'Health',
        brand: 'Zenith Nutrition',
        image_url: 'https://via.placeholder.com/300x300?text=Omega-3',
        visible_in_kiosk: true,
        in_stock: true,
        stock_quantity: 20
      }
    ];

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));

    return {
      data: mockProducts,
      success: true
    };
  }

  // Get product by UPC (for barcode scanning)
  async getProductByUPC(upc: string): Promise<ApiResponse<Product | null>> {
    const productsResponse = await this.getProducts();
    
    if (!productsResponse.success) {
      return {
        data: null,
        success: false,
        error: productsResponse.error
      };
    }

    const product = productsResponse.data.find(p => p.upc === upc);
    
    return {
      data: product || null,
      success: true
    };
  }

  // Process checkout
  async checkout(checkoutData: CheckoutRequest): Promise<ApiResponse<CheckoutResponse>> {
    // Mock checkout response for scaffolding
    await new Promise(resolve => setTimeout(resolve, 1000));

    const mockResponse: CheckoutResponse = {
      success: true,
      transaction_id: `txn_${Date.now()}`,
      payment_status: CONFIG.CLOVER_MINI_ENABLED ? 'pending' : 'completed',
      message: CONFIG.CLOVER_MINI_ENABLED 
        ? 'Please complete payment on Clover Mini'
        : 'Payment processed successfully',
      clover_payment_required: CONFIG.CLOVER_MINI_ENABLED
    };

    return {
      data: mockResponse,
      success: true
    };
  }

  // Health check
  async healthCheck(): Promise<ApiResponse<{ status: string }>> {
    return await this.request<{ status: string }>(API_ENDPOINTS.HEALTH);
  }
}

export const apiService = new ApiService();