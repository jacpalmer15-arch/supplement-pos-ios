// API response type
export interface ApiProduct {
  clover_item_id: string;
  name: string;
  category_id: string | null;
  sku: string | null;
  upc: string | null;
  price_cents: number | null;
  cost_cents: number | null;
  visible_in_kiosk: boolean;
  // Add any other fields from your API response as needed
}

// Database/Backend Product type (what's stored in DB)
export interface Product {
  clover_item_id: string;
  name: string;
  category_id: string | null; // Note: DB stores category, not category_id
  sku: string | null;
  upc: string | null;
  price_cents: number | null; // Note: DB stores price in cents
  cost_cents: number | null; // Note: DB stores cost in cents
  visible_in_kiosk: boolean;
}

// UI-friendly type (optional, for table display)
export type ProductTableRow = {
  clover_item_id: string;
  name: string;
  category_id: string | null; // <-- Required
  category: string;           // Display name
  sku: string | null;
  upc: string | null;
  visible_in_kiosk: boolean;
  price_cents: number | null;
  cost_cents: number | null;
};

export type InventoryRow = {
  clover_item_id: string;
  name?: string | null;
  on_hand: number;
  reorder_level: number | null;
  low_stock?: boolean;
};

export type InventoryAdjustment = {
  clover_item_id: string;
  adjustment: number; // positive for increase, negative for decrease
  reason?: string;
};

export type InventoryAdjustmentResponse = {
  success: boolean;
  new_quantity?: number;
  message?: string;
};

// Authentication Types
export interface User {
  id: string;
  email: string;
  created_at?: string;
  updated_at?: string;
}

export interface Session {
  user: User;
  access_token: string;
  refresh_token?: string;
  expires_in?: number;
  expires_at?: number;
}

export interface AuthState {
  user: User | null;
  session: Session | null;
  loading: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

// Order Management Types
export type OrderStatus = 'pending' | 'paid' | 'fulfilled' | 'canceled';
export type TransactionStatus = 'OPEN' | 'COMPLETED' | 'FAILED' | 'REFUNDED';

export type OrderItem = {
  id: string;
  clover_item_id: string;
  name: string;
  quantity: number;
  unit_price: number; // cents
  total_price: number; // cents
};

export type Order = {
  id: string;
  customer_name?: string | null;
  customer_email?: string | null;
  status: OrderStatus;
  created_at: string;
  updated_at: string;
  total_amount: number; // cents
  items: OrderItem[];
  notes?: string | null;
};

// Transaction Types (from database)
export type TransactionItem = {
  id: string;
  transaction_id: string;
  product_id: string | null;
  clover_item_id: string | null;
  product_name: string;
  variant_info: string | null;
  quantity: number;
  unit_price_cents: number;
  discount_cents: number;
  line_total_cents: number;
  created_at: string;
};

export type Transaction = {
  id: string;
  merchant_id: string | null;
  device_id: string | null;
  external_id: string;
  clover_order_id: string | null;
  clover_payment_id: string | null;
  subtotal_cents: number;
  tax_cents: number;
  discount_cents: number;
  total_cents: number;
  payment_method: string | null;
  status: TransactionStatus;
  completed_at: string | null;
  created_at: string;
  order_from_sc: boolean;
  items?: TransactionItem[]; // Optional join
  transaction_items?: TransactionItem[]; // Supabase join key
};

export type TransactionWithItems = Transaction & {
  items: TransactionItem[];
};

// Checkout/POS Types
export type CartItem = {
  clover_item_id: string;
  name: string;
  price: number; // cents
  quantity: number;
  category?: string | null;
  sku?: string | null;
};

export type PaymentMethod = 'card' | 'cash' | 'gift_card';

export type CheckoutOrderStatus = 'pending' | 'processing' | 'completed' | 'cancelled';

export type CheckoutOrder = {
  id: string;
  items: CartItem[];
  total: number; // cents
  tax: number; // cents
  subtotal: number; // cents
  payment_method: PaymentMethod;
  status: CheckoutOrderStatus;
  created_at: Date;
  completed_at?: Date | null;
};

// Settings & Sync Types
export type CloverConnection = {
  isConnected: boolean;
  merchantId?: string;
  lastSyncAt?: Date;
  apiKey?: string;
};

export type FeatureFlags = {
  enableKioskMode: boolean;
  enableInventoryTracking: boolean;
  enableLowStockAlerts: boolean;
  enableProductRecommendations: boolean;
  enableReports: boolean;
};

export type MerchantProfile = {
  businessName: string;
  contactName: string;
  email: string;
  phone: string;
  address: {
    street: string;
    city: string;
    state: string;
    zip: string;
  };
  timezone: string;
  currency: string;
};
