export interface User {
  id: string
  email: string
  created_at?: string
  updated_at?: string
}

export interface Session {
  user: User
  access_token: string
  refresh_token?: string
  expires_in?: number
  expires_at?: number
}

export interface AuthState {
  user: User | null
  session: Session | null
  loading: boolean
}

export interface LoginCredentials {
  email: string
  password: string
}

// Add auth-related types to existing types
export type Product = {
  clover_item_id: string;
  name: string;
  category?: string | null;
  sku?: string | null;
  upc?: string | null;
  visible_in_kiosk?: boolean;
  price?: number | null; // cents
};

export type InventoryRow = {
  clover_item_id: string;
  name?: string | null;
  on_hand: number;
  reorder_level: number | null;
  low_stock?: boolean;
};