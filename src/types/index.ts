export interface Product {
  id: string;
  clover_item_id?: string;
  name: string;
  description?: string;
  price: number;
  upc?: string;
  sku: string;
  category: string;
  brand?: string;
  image_url?: string;
  visible_in_kiosk: boolean;
  in_stock: boolean;
  stock_quantity?: number;
}

export interface CartItem {
  product: Product;
  quantity: number;
  clover_item_id?: string; // For checkout API compatibility
  name?: string;
  price?: number;
  category?: string;
  sku?: string;
}

export interface Cart {
  items: CartItem[];
  total: number;
  itemCount: number;
}

export interface CheckoutRequest {
  merchant_id: string;
  kiosk_id: string;
  items: Array<{
    product_id: string;
    quantity: number;
    price: number;
  }>;
  total: number;
  payment_method: 'clover_mini' | 'cash' | 'card';
}

export interface CheckoutResponse {
  success: boolean;
  transaction_id?: string;
  payment_status: 'pending' | 'completed' | 'failed';
  message?: string;
  clover_payment_required?: boolean;
}

export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
  error?: string;
}

export type NavigationScreen = 'Home' | 'Scan' | 'Browse' | 'Cart' | 'Checkout' | 'Success' | 'Debug';

export interface IdleTimer {
  isActive: boolean;
  timeRemaining: number;
  onTimeout: () => void;
  reset: () => void;
}