import { 
  ApiProduct,
  ProductTableRow, 
  InventoryRow,
  InventoryAdjustment,
  InventoryAdjustmentResponse,
  Order, 
  OrderStatus, 
  CartItem, 
  PaymentMethod,
  CloverConnection,
  FeatureFlags,
  MerchantProfile
} from './types';
import { supabase } from './supabase';

function withQS(path: string, params?: Record<string, unknown>) {
  if (!params) return path;
  const qs = new URLSearchParams(
    Object.entries(params)
      .filter(([, v]) => v !== undefined && v !== null && v !== '')
      .map(([k, v]) => [k, String(v)])
  );
  const q = qs.toString();
  return q ? `${path}?${q}` : path;
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  // Get the current session for auth headers
  const { data: { session } } = await supabase.auth.getSession();
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  
  // Add existing headers
  if (init?.headers) {
    if (init.headers instanceof Headers) {
      init.headers.forEach((value, key) => {
        headers[key] = value;
      });
    } else if (Array.isArray(init.headers)) {
      init.headers.forEach(([key, value]) => {
        headers[key] = value;
      });
    } else {
      Object.assign(headers, init.headers);
    }
  }
  
  // Add authorization header if we have a session
  if (session?.access_token) {
    headers.Authorization = `Bearer ${session.access_token}`;
  }

  const res = await fetch(path, {
    ...init,
    headers,

    cache: 'no-store',
  });

  const raw = await res.text(); // read once so we can parse or show errors
  if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText}\n${raw}`);

  try {
    return JSON.parse(raw) as T;
  } catch {
    // allow plain text responses (e.g., sync message)
    return raw as unknown as T;
  }
}

export const api = {
  products: {
    // Now returns the true API shape!
    list: (opts?: { kiosk_only?: boolean; search?: string; category?: string }) =>
      request<ApiProduct[]>(withQS('/api/products', opts)),
    get: (id: string) => request<ApiProduct>(`/api/products/${id}`),
    update: (id: string, patch: Partial<ApiProduct>) =>
      request<ApiProduct>(`/api/products/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(patch),
      }),
    setCategoryVisibility: (categoryId: string, visible: boolean) =>
      request<{ success: boolean; updated: number; category_id: string; visible_in_kiosk: boolean }>(
        '/api/products/category-visibility',
        {
          method: 'POST',
          body: JSON.stringify({ category_id: categoryId, visible_in_kiosk: visible }),
        }
      ),
  },
  inventory: {
    all: () => request<InventoryRow[]>('/api/inventory'),
    lowStock: () => request<InventoryRow[]>('/api/inventory/low-stock'),
    adjust: (adjustment: InventoryAdjustment) =>
      request<InventoryAdjustmentResponse>('/api/inventory/adjust', {
        method: 'POST',
        body: JSON.stringify(adjustment),
      }),
  },
  orders: {
    list: (opts?: { status?: OrderStatus; customer?: string; from_date?: string; to_date?: string }) =>
      request<{ success: boolean; orders: Order[]; count: number }>(withQS('/api/orders', opts))
        .then(data => data.orders ?? []),
    get: (id: string) => request<Order>(`/api/orders/${id}`),
    updateStatus: (id: string, status: OrderStatus) =>
      request<Order>(`/api/orders/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      }),
    
    create: (orderData: {
      items: CartItem[];
      subtotal?: number;
      tax?: number;
      total?: number;
      payment_method?: PaymentMethod;
    }) => {
      // Transform UI cart into upstream orderCart.lineItems shape
      // Each quantity unit becomes a separate lineItem with the same clover_item_id
      function sanitizeQuantity(quantity: number): number {
        return Math.max(0, Number(quantity) || 0);
      }
      
      const lineItems: { item: { id: string } }[] = [];
      orderData.items.forEach((ci) => {
        const id = ci.clover_item_id;
        const qty = sanitizeQuantity(ci.quantity);
        for (let i = 0; i < qty; i++) {
          lineItems.push({ item: { id } });
        }
      });
      
      const upstreamBody = { orderCart: { lineItems } };
      
      return request<{ success: boolean; order: Order; message: string }>('/api/checkout', {
        method: 'POST',
        body: JSON.stringify(upstreamBody),
      });
    },
  },
  sync: {
    products: () =>
      request<{ success: boolean; count?: number; message?: string }>(
        '/api/products/sync',
        { method: 'POST' }
      ),
  },
  categories: {
    list: () => request<{ id: string; name: string }[]>('/api/categories'),
  },
  clover: {
    getConnection: () => request<CloverConnection>('/api/clover/connection'),
    connect: (apiKey: string) =>
      request<CloverConnection>('/api/clover/connect', {
        method: 'POST',
        body: JSON.stringify({ apiKey }),
      }),
    disconnect: () =>
      request<{ success: boolean }>('/api/clover/disconnect', {
        method: 'POST',
      }),
  },
  settings: {
    getFeatureFlags: () => request<FeatureFlags>('/api/settings/feature-flags'),
    updateFeatureFlags: (flags: FeatureFlags) =>
      request<FeatureFlags>('/api/settings/feature-flags', {
        method: 'PUT',
        body: JSON.stringify(flags),
      }),
    getMerchantProfile: () => request<MerchantProfile>('/api/settings/merchant-profile'),
    updateMerchantProfile: (profile: MerchantProfile) =>
      request<MerchantProfile>('/api/settings/merchant-profile', {
        method: 'PUT',
        body: JSON.stringify(profile),
      }),
  },
};
