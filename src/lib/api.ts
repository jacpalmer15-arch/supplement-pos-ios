import { API_BASE_URL, KIOSK_AUTH_TOKEN } from '@env';
import { supabase } from './supabase';

// Request helper that resolves URLs and adds authorization
export async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<{ data: T | null; error: string | null }> {
  try {
    // Resolve URL: if path is absolute, use it directly; otherwise prepend API_BASE_URL
    const url = path.startsWith('http://') || path.startsWith('https://') 
      ? path 
      : `${API_BASE_URL}${path.startsWith('/') ? path : '/' + path}`;

    // Get current Supabase session for authorization
    const { data: { session } } = await supabase.auth.getSession();
    const token = session?.access_token || KIOSK_AUTH_TOKEN;

    // Prepare headers with authorization
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    // Add Authorization header if token is available
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    // Make the request
    const response = await fetch(url, {
      ...options,
      headers,
    });

    // Parse response
    const data = await response.json();

    if (!response.ok) {
      return {
        data: null,
        error: data.message || `HTTP ${response.status}: ${response.statusText}`,
      };
    }

    return {
      data,
      error: null,
    };
  } catch (error) {
    console.error('API Request Error:', error);
    return {
      data: null,
      error: error instanceof Error ? error.message : 'Network error occurred',
    };
  }
}

// API endpoints for checkout flow
export const api = {
  // Server checkout endpoint
  async checkout(checkoutData: {
    merchant_id: string;
    kiosk_id: string;
    items: Array<{
      product_id: string;
      quantity: number;
      price: number;
    }>;
    total: number;
    payment_method: string;
  }) {
    return await request('/api/checkout', {
      method: 'POST',
      body: JSON.stringify(checkoutData),
    });
  },

  // Health check endpoint
  async healthCheck() {
    return await request('/api/health');
  },

  // Get products endpoint (if using server API instead of direct Supabase)
  async getProducts() {
    return await request('/api/products');
  },
};
