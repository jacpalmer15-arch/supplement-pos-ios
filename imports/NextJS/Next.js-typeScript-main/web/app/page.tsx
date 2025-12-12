'use client';

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { formatCurrency } from '@/lib/utils';
import { Package, AlertTriangle, ShoppingCart, Clock, DollarSign, TrendingUp } from 'lucide-react';

type DashboardStats = {
  totalProducts: number;
  lowStockItems: number;
  totalOrders: number;
  openOrders: number;
  totalRevenue: number;
  statusBreakdown: {
    OPEN: { count: number; total: number };
    COMPLETED: { count: number; total: number };
    FAILED: { count: number; total: number };
    REFUNDED: { count: number; total: number };
  };
};

export default function Home() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      // Fetch total products
      const { count: totalProducts } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true });

      // Fetch low stock items
      const { data: inventory } = await supabase
        .from('inventory')
        .select('on_hand, reorder_level');
      
      const lowStockItems = inventory?.filter(
        item => item.reorder_level !== null && item.on_hand <= item.reorder_level
      ).length || 0;

      // Fetch total order count
      const { count: totalOrders } = await supabase
        .from('transactions')
        .select('*', { count: 'exact', head: true });

      // Fetch open orders count
      const { count: openOrders } = await supabase
        .from('transactions')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'OPEN');

      // For status breakdown and totals, we need to fetch all transactions
      // Use range to get all rows (Supabase default limit is 1000)
      let allTransactions: { status: string; total_cents: number }[] = [];
      let hasMore = true;
      let offset = 0;
      const limit = 1000;

      while (hasMore) {
        const { data, error } = await supabase
          .from('transactions')
          .select('status, total_cents')
          .range(offset, offset + limit - 1);
        
        if (error) throw error;
        
        if (data && data.length > 0) {
          allTransactions = [...allTransactions, ...data];
          offset += limit;
          hasMore = data.length === limit;
        } else {
          hasMore = false;
        }
      }

      const totalRevenue = allTransactions.reduce((sum, t) => sum + (t.total_cents || 0), 0) || 0;

      // Calculate status breakdown
      const statusBreakdown = {
        OPEN: { count: 0, total: 0 },
        COMPLETED: { count: 0, total: 0 },
        FAILED: { count: 0, total: 0 },
        REFUNDED: { count: 0, total: 0 },
      };

      allTransactions.forEach(t => {
        if (statusBreakdown[t.status as keyof typeof statusBreakdown]) {
          statusBreakdown[t.status as keyof typeof statusBreakdown].count++;
          statusBreakdown[t.status as keyof typeof statusBreakdown].total += t.total_cents;
        }
      });

      return {
        totalProducts: totalProducts || 0,
        lowStockItems,
        totalOrders,
        openOrders,
        totalRevenue,
        statusBreakdown,
      } as DashboardStats;
    },
  });

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-2">Welcome to Zenith Admin. Here's your store overview.</p>
        </header>
        
        {/* Main Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {/* Total Products */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Products</p>
                <p className="text-3xl font-bold text-blue-600 mt-2">
                  {isLoading ? '-' : stats?.totalProducts}
                </p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <Package className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          {/* Low Stock Items */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Low Stock Items</p>
                <p className="text-3xl font-bold text-orange-600 mt-2">
                  {isLoading ? '-' : stats?.lowStockItems}
                </p>
              </div>
              <div className="p-3 bg-orange-100 rounded-full">
                <AlertTriangle className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </div>

          {/* Total Orders */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Orders</p>
                <p className="text-3xl font-bold text-purple-600 mt-2">
                  {isLoading ? '-' : stats?.totalOrders}
                </p>
              </div>
              <div className="p-3 bg-purple-100 rounded-full">
                <ShoppingCart className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </div>

          {/* Open Orders */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Open Orders</p>
                <p className="text-3xl font-bold text-yellow-600 mt-2">
                  {isLoading ? '-' : stats?.openOrders}
                </p>
              </div>
              <div className="p-3 bg-yellow-100 rounded-full">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </div>

          {/* Total Revenue */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-3xl font-bold text-green-600 mt-2">
                  {isLoading ? '-' : formatCurrency(stats?.totalRevenue || 0)}
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Orders by Status */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center gap-2 mb-6">
            <TrendingUp className="h-5 w-5 text-gray-700" />
            <h2 className="text-lg font-semibold text-gray-900">Orders by Status</h2>
          </div>
          
          {isLoading ? (
            <div className="text-center py-4 text-gray-500">Loading...</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Completed */}
              <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-green-900">Completed</span>
                  <span className="text-xs px-2 py-1 bg-green-200 text-green-900 rounded-full">
                    {stats?.statusBreakdown.COMPLETED.count || 0}
                  </span>
                </div>
                <p className="text-xl font-bold text-green-700">
                  {formatCurrency(stats?.statusBreakdown.COMPLETED.total || 0)}
                </p>
              </div>

              {/* Open */}
              <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-yellow-900">Open</span>
                  <span className="text-xs px-2 py-1 bg-yellow-200 text-yellow-900 rounded-full">
                    {stats?.statusBreakdown.OPEN.count || 0}
                  </span>
                </div>
                <p className="text-xl font-bold text-yellow-700">
                  {formatCurrency(stats?.statusBreakdown.OPEN.total || 0)}
                </p>
              </div>

              {/* Failed */}
              <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-red-900">Failed</span>
                  <span className="text-xs px-2 py-1 bg-red-200 text-red-900 rounded-full">
                    {stats?.statusBreakdown.FAILED.count || 0}
                  </span>
                </div>
                <p className="text-xl font-bold text-red-700">
                  {formatCurrency(stats?.statusBreakdown.FAILED.total || 0)}
                </p>
              </div>

              {/* Refunded */}
              <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-900">Refunded</span>
                  <span className="text-xs px-2 py-1 bg-gray-200 text-gray-900 rounded-full">
                    {stats?.statusBreakdown.REFUNDED.count || 0}
                  </span>
                </div>
                <p className="text-xl font-bold text-gray-700">
                  {formatCurrency(stats?.statusBreakdown.REFUNDED.total || 0)}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
