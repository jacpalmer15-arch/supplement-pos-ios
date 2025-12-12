import { createClient } from '@supabase/supabase-js';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '@env';

// Create Supabase client with options matching Next.js frontend behavior
export const supabase = createClient(
  SUPABASE_URL || '',
  SUPABASE_ANON_KEY || '',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      // Align with Next.js client behavior for session handling
      detectSessionInUrl: true,
    },
  }
);

// Database query helpers
export const db = {
  // Get all products visible in kiosk
  async getProducts() {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('visible_in_kiosk', true)
      .eq('active', true)
      .order('name');

    if (error) {
      console.error('Error fetching products:', error);
      return { data: [], error };
    }

    return { data: data || [], error: null };
  },

  // Get products in API-friendly shape used by Next.js web app
  async getProductsApiShape() {
    const { data, error } = await supabase
      .from('products')
      .select(
        [
          'clover_item_id',
          'name',
          'category_id',
          'sku',
          'upc',
          'price_cents',
          'cost_cents',
          'visible_in_kiosk',
        ].join(',')
      )
      .eq('visible_in_kiosk', true)
      .order('name');

    if (error) {
      console.error('Error fetching products (API shape):', error);
      return { data: [], error };
    }

    // If your table stores price in dollars, map to cents
    const mapped = (data || []).map((p: any) => ({
      clover_item_id: p.clover_item_id,
      name: p.name,
      category_id: p.category_id ?? null,
      sku: p.sku ?? null,
      upc: p.upc ?? null,
      price_cents:
        p.price_cents !== undefined && p.price_cents !== null
          ? p.price_cents
          : typeof p.price === 'number'
          ? Math.round(p.price * 100)
          : null,
      cost_cents:
        p.cost_cents !== undefined && p.cost_cents !== null
          ? p.cost_cents
          : typeof p.cost === 'number'
          ? Math.round(p.cost * 100)
          : null,
      visible_in_kiosk: !!p.visible_in_kiosk,
    }));

    return { data: mapped, error: null };
  },

  // Get product by UPC (for barcode scanning)
  async getProductByUPC(upc: string) {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('upc', upc)
      .eq('visible_in_kiosk', true)
      .eq('in_stock', true)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 is "not found"
      console.error('Error fetching product by UPC:', error);
      return { data: null, error };
    }

    return { data: data || null, error: null };
  },

  // Get unique categories from products
  async getCategories() {
    // Prefer categories table if available, else fall back to product.category
    const { data: categoriesTable, error: catErr } = await supabase
      .from('categories')
      .select('id, name')
      .order('name');

    if (!catErr && Array.isArray(categoriesTable) && categoriesTable.length > 0) {
      return {
        data: categoriesTable.map((c: any) => c.name).filter(Boolean),
        error: null,
      };
    }

    const { data, error } = await supabase
      .from('products')
      .select('category')
      .eq('visible_in_kiosk', true)
      .eq('in_stock', true);

    if (error) {
      console.error('Error fetching categories:', error);
      return { data: [], error };
    }

    // Extract unique categories
    const categories = [...new Set(data?.map(item => item.category).filter(Boolean))] as string[];
    
    return { data: categories, error: null };
  }
};
