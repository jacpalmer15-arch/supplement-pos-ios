'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PaymentMethod } from '@/lib/types';
import { Minus, Plus, Trash2, CreditCard, Banknote, Gift, ShoppingCart } from 'lucide-react';
import { toast } from "sonner";
import { formatCurrency } from '@/lib/utils';
import { useCart } from '@/lib/cart-context';
import { api } from '@/lib/api';

export default function CheckoutPage() {
  const [isProcessing, setIsProcessing] = useState(false);
  const router = useRouter();
  
  const {
    cart,
    paymentMethod,
    setPaymentMethod,
    updateQuantity,
    removeFromCart,
    clearCart,
    subtotal,
    tax,
    total,
  } = useCart();

  // Process checkout
  const handleCheckout = async () => {
    if (cart.length === 0) {
      toast.error('Cart is empty');
      return;
    }

    setIsProcessing(true);
    
    try {
      // api.orders.create will transform the UI cart into the upstream orderCart.lineItems shape
      const result = await api.orders.create({ 
        items: cart, 
        subtotal, 
        tax, 
        total, 
        payment_method: paymentMethod 
      });

      console.log('Order creation result:', result);

      // Check if order was created successfully
      if (!result || result.success === false) {
        throw new Error(result?.message || 'Failed to create order');
      }

      // Order created successfully
      const message = result.message || 'Order created successfully';
      toast.success(`${message} - Total: ${formatCurrency(total)}`);
      clearCart();
      setPaymentMethod('card');
      
      // Redirect to orders page (or specific order if ID is available)
      if (result.order?.id) {
        router.push(`/orders/${result.order.id}`);
      } else {
        router.push('/orders');
      }
    } catch (error) {
      console.error('Checkout error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to process order. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="p-6">
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white border-b shadow-sm px-6 py-4">
          <h1 className="text-2xl font-semibold">Checkout</h1>
        </header>

        {/* Main Content */}
        <div className="max-w-4xl mx-auto p-6">
          {cart.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm p-12 text-center">
              <ShoppingCart className="h-20 w-20 mx-auto mb-4 text-gray-300" />
              <h2 className="text-2xl font-semibold text-gray-800 mb-2">Your cart is empty</h2>
              <p className="text-gray-600 mb-6">Add some products from the store to get started</p>
              <Button
                onClick={() => router.push('/store')}
                size="lg"
              >
                Go to Store
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Cart Items - Takes 2 columns */}
              <div className="lg:col-span-2 space-y-4">
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <h2 className="text-xl font-semibold mb-4">Order Items</h2>
                  <div className="space-y-3">
                    {cart.map((item) => (
                      <div
                        key={item.clover_item_id}
                        className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200"
                      >
                        {/* Item Image Placeholder */}
                        <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <div className="text-2xl font-bold text-blue-500 opacity-50">
                            {item.name.charAt(0)}
                          </div>
                        </div>
                        
                        {/* Item Details */}
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-base">{item.name}</h4>
                          <p className="text-sm text-gray-600 mt-1">
                            {formatCurrency(item.price)} each
                          </p>
                          
                          {/* Quantity Controls */}
                          <div className="flex items-center gap-3 mt-3">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updateQuantity(item.clover_item_id, item.quantity - 1)}
                              className="h-8 w-8 p-0 rounded-full"
                            >
                              <Minus className="h-4 w-4" />
                            </Button>
                            <span className="w-10 text-center font-medium text-base">{item.quantity}</span>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updateQuantity(item.clover_item_id, item.quantity + 1)}
                              className="h-8 w-8 p-0 rounded-full"
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => removeFromCart(item.clover_item_id)}
                              className="ml-auto text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="h-4 w-4 mr-1" />
                              Remove
                            </Button>
                          </div>
                        </div>
                        
                        {/* Item Total */}
                        <div className="text-right">
                          <p className="font-bold text-lg">
                            {formatCurrency(item.price * item.quantity)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Order Summary & Payment - Takes 1 column */}
              <div className="space-y-4">
                {/* Order Summary */}
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
                  <div className="space-y-3">
                    <div className="flex justify-between text-base">
                      <span className="text-gray-600">Subtotal:</span>
                      <span className="font-medium">{formatCurrency(subtotal)}</span>
                    </div>
                    <div className="flex justify-between text-base">
                      <span className="text-gray-600">Tax (8.75%):</span>
                      <span className="font-medium">{formatCurrency(tax)}</span>
                    </div>
                    <div className="border-t pt-3 flex justify-between text-xl font-bold">
                      <span>Total:</span>
                      <span className="text-blue-600">{formatCurrency(total)}</span>
                    </div>
                  </div>
                </div>

                {/* Payment */}
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <h2 className="text-xl font-semibold mb-4">Payment Method</h2>
                  <Select
                    value={paymentMethod}
                    onValueChange={(value: PaymentMethod) => setPaymentMethod(value)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="card">
                        <div className="flex items-center gap-2">
                          <CreditCard className="h-4 w-4" />
                          Credit/Debit Card
                        </div>
                      </SelectItem>
                      <SelectItem value="cash">
                        <div className="flex items-center gap-2">
                          <Banknote className="h-4 w-4" />
                          Cash
                        </div>
                      </SelectItem>
                      <SelectItem value="gift_card">
                        <div className="flex items-center gap-2">
                          <Gift className="h-4 w-4" />
                          Gift Card
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>

                  {/* Complete Payment Button */}
                  <Button
                    className="w-full mt-6 h-12 text-base font-semibold"
                    size="lg"
                    onClick={handleCheckout}
                    disabled={isProcessing}
                  >
                    {isProcessing ? 'Processing...' : `Complete Payment - ${formatCurrency(total)}`}
                  </Button>

                  {/* Clear Cart Button */}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={clearCart}
                    className="w-full mt-3"
                  >
                    Clear Cart
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}