'use client';

import { Order, OrderStatus } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { X } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { toast } from 'sonner';

interface OrderDetailDrawerProps {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
}

function formatPrice(cents: number) {
  return `$${(cents / 100).toFixed(2)}`;
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function getStatusColor(status: OrderStatus): string {
  switch (status) {
    case 'pending':
      return 'bg-yellow-100 text-yellow-800';
    case 'paid':
      return 'bg-blue-100 text-blue-800';
    case 'fulfilled':
      return 'bg-green-100 text-green-800';
    case 'canceled':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}

export function OrderDetailDrawer({ order, isOpen, onClose }: OrderDetailDrawerProps) {
  const queryClient = useQueryClient();

  const updateStatusMutation = useMutation({
    mutationFn: (newStatus: OrderStatus) => 
      order ? api.orders.updateStatus(order.id, newStatus) : Promise.reject('No order'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      toast.success('Order status updated successfully');
    },
    onError: (error) => {
      toast.error(`Failed to update order status: ${error.message}`);
    },
  });

  const handleStatusChange = (newStatus: OrderStatus) => {
    updateStatusMutation.mutate(newStatus);
  };

  if (!isOpen || !order) {
    return null;
  }

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-40"
        onClick={onClose}
      />
      
      {/* Drawer */}
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-xl z-50 overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold">Order Details</h2>
            <Button
              variant="outline"
              size="sm"
              onClick={onClose}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Order Info */}
          <Card className="p-4 mb-6">
            <div className="space-y-3">
              <div className="flex justify-between items-start">
                <div>
                  <div className="font-medium text-lg">Order {order.id}</div>
                  <div className="text-sm text-gray-600">
                    Created: {formatDate(order.created_at)}
                  </div>
                  {order.updated_at !== order.created_at && (
                    <div className="text-sm text-gray-600">
                      Updated: {formatDate(order.updated_at)}
                    </div>
                  )}
                </div>
                <Badge className={`${getStatusColor(order.status)} border-0`}>
                  {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                </Badge>
              </div>

              {/* Customer Info */}
              {(order.customer_name || order.customer_email) && (
                <div className="pt-3 border-t">
                  <div className="font-medium mb-1">Customer</div>
                  {order.customer_name && (
                    <div className="text-sm">{order.customer_name}</div>
                  )}
                  {order.customer_email && (
                    <div className="text-sm text-gray-600">{order.customer_email}</div>
                  )}
                </div>
              )}

              {/* Notes */}
              {order.notes && (
                <div className="pt-3 border-t">
                  <div className="font-medium mb-1">Notes</div>
                  <div className="text-sm text-gray-600">{order.notes}</div>
                </div>
              )}
            </div>
          </Card>

          {/* Order Items */}
          <div className="mb-6">
            <h3 className="font-medium mb-3">Items ({order.items.length})</h3>
            <div className="space-y-3">
              {order.items.map((item) => (
                <Card key={item.id} className="p-3">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="font-medium">{item.name}</div>
                      <div className="text-sm text-gray-600">
                        Qty: {item.quantity} × {formatPrice(item.unit_price)}
                      </div>
                    </div>
                    <div className="font-medium">{formatPrice(item.total_price)}</div>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* Total */}
          <Card className="p-4 mb-6">
            <div className="flex justify-between items-center">
              <div className="font-semibold text-lg">Total</div>
              <div className="font-semibold text-lg">{formatPrice(order.total_amount)}</div>
            </div>
          </Card>

          {/* Actions */}
          <div className="space-y-2">
            {order.status === 'pending' && (
              <>
                <Button
                  className="w-full"
                  onClick={() => handleStatusChange('paid')}
                  disabled={updateStatusMutation.isPending}
                >
                  Mark as Paid
                </Button>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => handleStatusChange('canceled')}
                  disabled={updateStatusMutation.isPending}
                >
                  Cancel Order
                </Button>
              </>
            )}
            
            {order.status === 'paid' && (
              <Button
                className="w-full"
                onClick={() => handleStatusChange('fulfilled')}
                disabled={updateStatusMutation.isPending}
              >
                Mark as Fulfilled
              </Button>
            )}

            {(order.status === 'fulfilled' || order.status === 'canceled') && (
              <div className="text-center py-4 text-gray-500">
                No actions available for {order.status} orders
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}