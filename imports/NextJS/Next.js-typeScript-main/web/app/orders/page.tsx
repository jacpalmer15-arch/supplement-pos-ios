'use client';

import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { Transaction, TransactionItem } from '@/lib/types';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/utils';
import { ChevronDown, ChevronRight, RefreshCw } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function OrdersPage() {
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [expandedOrders, setExpandedOrders] = useState<Set<string>>(new Set());

  const { data: transactions = [], isLoading, isError, refetch } = useQuery({
    queryKey: ['transactions', { 
      status: statusFilter, 
      from_date: fromDate, 
      to_date: toDate 
    }],
    queryFn: async () => {
      // Fetch ALL transactions with line items (paginated to avoid 1000 row limit)
      let allTransactions: Transaction[] = [];
      let hasMore = true;
      let offset = 0;
      const limit = 1000;

      while (hasMore) {
        // Build Supabase query for transactions with line items
        let query = supabase
          .from('transactions')
          .select('*, transaction_items(*)')
          .order('created_at', { ascending: false })
          .range(offset, offset + limit - 1);

        // Apply filters
        if (statusFilter !== 'all') {
          query = query.eq('status', statusFilter.toUpperCase());
        }
        if (fromDate) {
          query = query.gte('created_at', fromDate);
        }
        if (toDate) {
          query = query.lte('created_at', toDate);
        }

        const { data, error } = await query;

        if (error) {
          console.error('Error fetching transactions:', error);
          throw error;
        }

        if (data && data.length > 0) {
          allTransactions = [...allTransactions, ...data as Transaction[]];
          offset += limit;
          hasMore = data.length === limit;
        } else {
          hasMore = false;
        }
      }

      return allTransactions;
    },
  });

  const toggleExpanded = (orderId: string) => {
    setExpandedOrders(prev => {
      const newSet = new Set(prev);
      if (newSet.has(orderId)) {
        newSet.delete(orderId);
      } else {
        newSet.add(orderId);
      }
      return newSet;
    });
  };

  const clearFilters = () => {
    setStatusFilter('all');
    setFromDate('');
    setToDate('');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'bg-green-100 text-green-800';
      case 'OPEN':
        return 'bg-yellow-100 text-yellow-800';
      case 'FAILED':
        return 'bg-red-100 text-red-800';
      case 'REFUNDED':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  return (
    <main className="mx-auto max-w-7xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Orders</h1>
        <Button onClick={() => refetch()} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Filters */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <div className="grid gap-4 md:grid-cols-3">
          <div>
            <Label htmlFor="status-filter">Status</Label>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="open">Open</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
                <SelectItem value="refunded">Refunded</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="from-date">From Date</Label>
            <Input
              id="from-date"
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="to-date">To Date</Label>
            <Input
              id="to-date"
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
            />
          </div>
        </div>

        <div className="mt-4 flex gap-2">
          <Button onClick={clearFilters} variant="outline" size="sm">
            Clear Filters
          </Button>
          <Button onClick={() => refetch()} size="sm">
            Apply Filters
          </Button>
        </div>
      </div>

      {/* Order Stats */}
      {!isLoading && (
        <div className="mb-6 text-sm text-gray-600">
          Showing {transactions.length} orders
        </div>
      )}

      {/* Orders Table */}
      {isLoading && <div className="text-center py-8">Loading orders...</div>}
      
      {isError && (
        <div className="text-center py-8 text-red-600">
          <p>Failed to load orders</p>
          <Button onClick={() => refetch()} className="mt-2">
            Try Again
          </Button>
        </div>
      )}
      
      {!isLoading && !isError && (
        <div className="bg-white rounded-lg shadow">
          {transactions.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No orders found
            </div>
          ) : (
            <div className="divide-y">
              {transactions.map((transaction) => {
                const isExpanded = expandedOrders.has(transaction.id);
                const items = transaction.items || transaction.transaction_items || [];
                
                return (
                  <div key={transaction.id} className="p-4">
                    {/* Main Order Row */}
                    <div className="flex items-center gap-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleExpanded(transaction.id)}
                        className="p-1"
                      >
                        {isExpanded ? (
                          <ChevronDown className="h-5 w-5" />
                        ) : (
                          <ChevronRight className="h-5 w-5" />
                        )}
                      </Button>

                      <div className="flex-1 grid grid-cols-1 md:grid-cols-5 gap-4 items-center">
                        <div>
                          <div className="text-xs text-gray-500">Order ID</div>
                          <div className="font-mono text-sm">{transaction.external_id}</div>
                        </div>

                        <div>
                          <div className="text-xs text-gray-500">Payment</div>
                          <div className="text-sm">{transaction.payment_method || 'N/A'}</div>
                        </div>

                        <div>
                          <div className="text-xs text-gray-500">Status</div>
                          <span className={`inline-flex px-2 py-1 text-xs rounded-full font-medium ${getStatusColor(transaction.status)}`}>
                            {transaction.status}
                          </span>
                        </div>

                        <div>
                          <div className="text-xs text-gray-500">Total</div>
                          <div className="font-semibold">{formatCurrency(transaction.total_cents)}</div>
                        </div>

                        <div>
                          <div className="text-xs text-gray-500">Date</div>
                          <div className="text-sm">
                            {new Date(transaction.created_at).toLocaleDateString()} {new Date(transaction.created_at).toLocaleTimeString()}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Expanded Line Items */}
                    {isExpanded && items.length > 0 && (
                      <div className="mt-4 ml-12 pl-4 border-l-2 border-gray-200">
                        <h4 className="text-sm font-semibold mb-2 text-gray-700">Line Items</h4>
                        <div className="space-y-2">
                          {items.map((item: TransactionItem) => (
                            <div key={item.id} className="flex items-center justify-between bg-gray-50 p-3 rounded">
                              <div className="flex-1">
                                <div className="font-medium text-sm">{item.product_name}</div>
                                {item.variant_info && (
                                  <div className="text-xs text-gray-500">{item.variant_info}</div>
                                )}
                              </div>
                              <div className="text-sm text-gray-600 mr-4">
                                Qty: {item.quantity}
                              </div>
                              <div className="text-sm text-gray-600 mr-4">
                                @ {formatCurrency(item.unit_price_cents)}
                              </div>
                              <div className="font-semibold text-sm">
                                {formatCurrency(item.line_total_cents)}
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Order Summary */}
                        <div className="mt-4 p-3 bg-gray-100 rounded space-y-1">
                          <div className="flex justify-between text-sm">
                            <span>Subtotal:</span>
                            <span>{formatCurrency(transaction.subtotal_cents)}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>Tax:</span>
                            <span>{formatCurrency(transaction.tax_cents)}</span>
                          </div>
                          {transaction.discount_cents > 0 && (
                            <div className="flex justify-between text-sm text-green-600">
                              <span>Discount:</span>
                              <span>-{formatCurrency(transaction.discount_cents)}</span>
                            </div>
                          )}
                          <div className="flex justify-between font-semibold text-base pt-2 border-t">
                            <span>Total:</span>
                            <span>{formatCurrency(transaction.total_cents)}</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </main>
  );
}
