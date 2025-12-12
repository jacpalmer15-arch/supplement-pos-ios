'use client';

import { ColumnDef } from '@tanstack/react-table';
import { Order, OrderStatus } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import { Eye } from 'lucide-react';

function formatPrice(cents: number) {
  return `$${(cents / 100).toFixed(2)}`;
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
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

function StatusBadge({ status }: { status: OrderStatus }) {
  return (
    <Badge className={`${getStatusColor(status)} border-0`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </Badge>
  );
}

interface OrderActionsProps {
  order: Order;
  onViewDetails: (order: Order) => void;
}

function OrderActions({ order, onViewDetails }: OrderActionsProps) {
  const queryClient = useQueryClient();

  const updateStatusMutation = useMutation({
    mutationFn: (newStatus: OrderStatus) => 
      api.orders.updateStatus(order.id, newStatus),
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

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={() => onViewDetails(order)}
      >
        <Eye className="h-4 w-4" />
      </Button>
      
      {order.status === 'pending' && (
        <>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleStatusChange('paid')}
            disabled={updateStatusMutation.isPending}
          >
            Mark Paid
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleStatusChange('canceled')}
            disabled={updateStatusMutation.isPending}
          >
            Cancel
          </Button>
        </>
      )}
      
      {order.status === 'paid' && (
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleStatusChange('fulfilled')}
          disabled={updateStatusMutation.isPending}
        >
          Mark Fulfilled
        </Button>
      )}
    </div>
  );
}

export function createOrderColumns(
  onViewDetails: (order: Order) => void
): ColumnDef<Order>[] {
  return [
    {
      accessorKey: 'id',
      header: 'Order ID',
      cell: ({ row }) => (
        <code className="text-sm">{row.original.id}</code>
      ),
    },
    {
      accessorKey: 'customer_name',
      header: 'Customer',
      cell: ({ row }) => (
        <div>
          <div className="font-medium">{row.original.customer_name || 'Anonymous'}</div>
          {row.original.customer_email && (
            <div className="text-sm text-gray-500">{row.original.customer_email}</div>
          )}
        </div>
      ),
    },
    {
      accessorKey: 'created_at',
      header: 'Date',
      cell: ({ row }) => formatDate(row.original.created_at),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => <StatusBadge status={row.original.status} />,
    },
    {
      accessorKey: 'total_amount',
      header: 'Total',
      cell: ({ row }) => (
        <span className="font-medium">{formatPrice(row.original.total_amount)}</span>
      ),
    },
    {
      accessorKey: 'items',
      header: 'Items',
      cell: ({ row }) => (
        <span className="text-sm text-gray-600">
          {row.original.items.length} item{row.original.items.length !== 1 ? 's' : ''}
        </span>
      ),
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <OrderActions order={row.original} onViewDetails={onViewDetails} />
      ),
    },
  ];
}