'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { Order, OrderStatus } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/lib/utils';
import { toast } from 'sonner';
import { ArrowLeft } from 'lucide-react';

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

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const orderId = params?.id as string;

  const { data: order, isLoading, isError } = useQuery<Order>({
    queryKey: ['orders', orderId],
    queryFn: () => api.orders.get(orderId),
    enabled: !!orderId,
  });

  const updateStatusMutation = useMutation({
    mutationFn: (newStatus: OrderStatus) => api.orders.updateStatus(orderId, newStatus),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders', orderId] });
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      toast.success('Order status updated successfully');
    },
    onError: (error) => {
      toast.error(`Failed to update order status: ${error.message}`);
    },
  });

  const handleStatusChange = (newStatus: OrderStatus) => {
    // TODO: Integrate with Clover Mini for payment processing
    // Before marking as paid, verify payment was captured on Clover device
    updateStatusMutation.mutate(newStatus);
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading order details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (isError || !order) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <p className="text-red-600 mb-4">Failed to load order details</p>
          <Button onClick={() => router.push('/orders')} variant="outline">
            Back to Orders
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push('/orders')}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Orders
        </Button>
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Order Details</h1>
          <Badge className={getStatusColor(order.status)}>
            {order.status}
          </Badge>
        </div>
      </div>

      {/* Order Info Card */}
      <Card className="p-6 mb-6">
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <p className="text-sm text-gray-600">Order ID</p>
            <p className="font-mono font-semibold">{order.id}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Customer</p>
            <p className="font-semibold">
              {order.customer_name || order.customer_email || 'Guest'}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Created</p>
            <p>{formatDate(order.created_at)}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Last Updated</p>
            <p>{formatDate(order.updated_at)}</p>
          </div>
        </div>
        {order.notes && (
          <div className="mt-4 pt-4 border-t">
            <p className="text-sm text-gray-600 mb-1">Notes</p>
            <p className="text-gray-900">{order.notes}</p>
          </div>
        )}
      </Card>

      {/* Order Items */}
      <Card className="p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Order Items</h2>
        <div className="space-y-3">
          {order.items.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
            >
              <div className="flex-1">
                <p className="font-medium">{item.name}</p>
                <p className="text-sm text-gray-600">
                  {formatCurrency(item.unit_price)} × {item.quantity}
                </p>
              </div>
              <p className="font-semibold">
                {formatCurrency(item.total_price)}
              </p>
            </div>
          ))}
        </div>
        
        {/* Order Total */}
        <div className="mt-4 pt-4 border-t">
          <div className="flex justify-between text-xl font-bold">
            <span>Total</span>
            <span className="text-blue-600">{formatCurrency(order.total_amount)}</span>
          </div>
        </div>
      </Card>

      {/* Actions */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">Actions</h2>
        <div className="space-y-3">
          {order.status === 'pending' && (
            <>
              <Button
                className="w-full"
                onClick={() => handleStatusChange('paid')}
                disabled={updateStatusMutation.isPending}
              >
                {updateStatusMutation.isPending ? 'Updating...' : 'Mark as Paid'}
              </Button>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => handleStatusChange('canceled')}
                disabled={updateStatusMutation.isPending}
              >
                {updateStatusMutation.isPending ? 'Updating...' : 'Cancel Order'}
              </Button>
            </>
          )}
          
          {order.status === 'paid' && (
            <Button
              className="w-full"
              onClick={() => handleStatusChange('fulfilled')}
              disabled={updateStatusMutation.isPending}
            >
              {updateStatusMutation.isPending ? 'Updating...' : 'Mark as Fulfilled'}
            </Button>
          )}

          {(order.status === 'fulfilled' || order.status === 'canceled') && (
            <div className="text-center py-4 text-gray-500">
              No actions available for {order.status} orders
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
