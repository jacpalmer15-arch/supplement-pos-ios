'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Order, OrderStatus } from '@/lib/types'
import { formatCurrency, formatDateTime } from '@/lib/utils'
import { X, User, Mail, Calendar, Package, DollarSign } from 'lucide-react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { toast } from 'sonner'

interface OrderDetailDrawerProps {
  order: Order | null
  isOpen: boolean
  onClose: () => void
}

const statusOptions: { value: OrderStatus; label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }[] = [
  { value: 'pending', label: 'Pending', variant: 'secondary' },
  { value: 'paid', label: 'Paid', variant: 'default' },
  { value: 'fulfilled', label: 'Fulfilled', variant: 'outline' },
  { value: 'canceled', label: 'Canceled', variant: 'destructive' },
]

export function OrderDetailDrawer({ order, isOpen, onClose }: OrderDetailDrawerProps) {
  const [isUpdating, setIsUpdating] = useState(false)
  const queryClient = useQueryClient()

  const updateOrderMutation = useMutation({
    mutationFn: ({ orderId, status }: { orderId: string; status: OrderStatus }) =>
      api.orders.updateStatus(orderId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] })
      toast.success('Order status updated')
    },
    onError: (error) => {
      toast.error(`Failed to update order: ${error instanceof Error ? error.message : 'Unknown error'}`)
    },
  })

  const handleStatusUpdate = async (newStatus: OrderStatus) => {
    if (!order) return
    
    setIsUpdating(true)
    try {
      await updateOrderMutation.mutateAsync({ orderId: order.id, status: newStatus })
    } finally {
      setIsUpdating(false)
    }
  }

  if (!isOpen || !order) return null

  const currentStatus = statusOptions.find(s => s.value === order.status)

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-end">
      <div className="w-full max-w-md bg-white h-full shadow-xl overflow-y-auto">
        <div className="sticky top-0 bg-white border-b z-10">
          <div className="flex items-center justify-between p-6">
            <h2 className="text-lg font-semibold">Order Details</h2>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Order Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Order #{order.id}
              </CardTitle>
              <CardDescription>
                Created {formatDateTime(order.created_at)}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-medium">Status:</span>
                <Badge variant={currentStatus?.variant || 'default'}>
                  {currentStatus?.label || order.status}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-medium">Total:</span>
                <span className="font-bold text-lg">
                  {formatCurrency(order.total_amount)}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Customer Info */}
          {(order.customer_name || order.customer_email) && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Customer
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {order.customer_name && (
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-gray-500" />
                    <span>{order.customer_name}</span>
                  </div>
                )}
                {order.customer_email && (
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-gray-500" />
                    <span>{order.customer_email}</span>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Order Items */}
          <Card>
            <CardHeader>
              <CardTitle>Items</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {order.items.map((item, index) => (
                  <div key={item.id || index} className="flex items-center justify-between border-b pb-2 last:border-b-0">
                    <div className="flex-1">
                      <p className="font-medium">{item.name}</p>
                      <p className="text-sm text-gray-500">
                        Qty: {item.quantity} × {formatCurrency(item.unit_price)}
                      </p>
                    </div>
                    <span className="font-medium">
                      {formatCurrency(item.total_price)}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Notes */}
          {order.notes && (
            <Card>
              <CardHeader>
                <CardTitle>Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700">{order.notes}</p>
              </CardContent>
            </Card>
          )}

          {/* Status Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Update Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-2">
                {statusOptions.map((statusOption) => (
                  <Button
                    key={statusOption.value}
                    variant={order.status === statusOption.value ? 'default' : 'outline'}
                    size="sm"
                    disabled={isUpdating || order.status === statusOption.value}
                    onClick={() => handleStatusUpdate(statusOption.value)}
                    className="justify-start"
                  >
                    {statusOption.label}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Timestamps */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Timeline
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-gray-600">
              <div>Created: {formatDateTime(order.created_at)}</div>
              <div>Last updated: {formatDateTime(order.updated_at)}</div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}