import { createClient } from '@supabase/supabase-js';

// Environment variables for Supabase connection
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl) {
  throw new Error('Missing environment variable: NEXT_PUBLIC_SUPABASE_URL');
}

if (!supabaseAnonKey) {
  throw new Error('Missing environment variable: NEXT_PUBLIC_SUPABASE_ANON_KEY');
}

// Create and export Supabase client for direct database operations
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * This Supabase client can be used for:
 * - Direct database queries for products, inventory, and categories
 * - Real-time subscriptions to data changes
 * - Future reporting endpoints that need to aggregate data
 * - Analytics queries for business intelligence
 * 
 * Usage examples for future reporting endpoints:
 * 
 * // Product sales analytics
 * const { data } = await supabase
 *   .from('products')
 *   .select('*, sales_count, revenue')
 *   .gte('created_at', startDate)
 *   .lte('created_at', endDate);
 * 
 * // Low stock reports
 * const { data } = await supabase
 *   .from('inventory')
 *   .select('*, products(name, category)')
 *   .lt('on_hand', supabase.rpc('reorder_level'));
 * 
 * // Category performance
 * const { data } = await supabase
 *   .rpc('category_sales_summary', { date_range: '30 days' });
 */