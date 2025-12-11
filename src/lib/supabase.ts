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
      detectSessionInUrl: false
    }
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
      .eq('in_stock', true)
      .order('name');

    if (error) {
      console.error('Error fetching products:', error);
      return { data: [], error };
    }

    return { data: data || [], error: null };
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
