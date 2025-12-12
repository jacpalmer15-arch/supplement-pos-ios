'use client';

import { Button } from "@/components/ui/button";
import { Plus, Minus, Trash2, ShoppingCart, X } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { useCart } from '@/lib/cart-context';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { ApiProduct } from '@/lib/types';
import { useRouter } from 'next/navigation';

export default function StorePage() {
  const router = useRouter();
  const {
    cart,
    isCartOpen,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    setIsCartOpen,
    subtotal,
    tax,
    total,
    cartItemCount,
  } = useCart();

  // Fetch live products from API
  const { data: products = [], isLoading, isError } = useQuery<ApiProduct[]>({
    queryKey: ['products', { kiosk_only: true }],
    queryFn: () => api.products.list({ kiosk_only: true }),
  });

  const availableProducts = products.filter(p => p.visible_in_kiosk && p.price_cents);

  return (
    <div className="p-6">
      <div className="relative min-h-screen">
        {/* Header with Cart Toggle */}
        <header className="sticky top-0 z-10 bg-white border-b shadow-sm px-6 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Store</h1>
          <Button 
            variant="default"
            size="lg"
            onClick={() => setIsCartOpen(!isCartOpen)}
            className="relative"
          >
            <ShoppingCart className="h-5 w-5 mr-2" />
            Cart
            {cartItemCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center">
                {cartItemCount}
              </span>
            )}
          </Button>
        </header>

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading products...</p>
            </div>
          </div>
        )}

        {/* Error State */}
        {isError && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <p className="text-red-600">Failed to load products. Please try again.</p>
          </div>
        )}

        {/* Product Grid */}
        {!isLoading && !isError && (
          <div className="p-6 pb-24">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {availableProducts.map((product) => (
              <div
                key={product.clover_item_id}
                onClick={() => addToCart(product.clover_item_id, product)}
                className="group relative bg-white border-2 border-gray-200 rounded-2xl p-4 cursor-pointer transition-all duration-200 hover:border-blue-500 hover:shadow-lg active:scale-95"
              >
                {/* Product Image Placeholder */}
                <div className="aspect-square bg-gradient-to-br from-blue-100 to-purple-100 rounded-xl mb-3 flex items-center justify-center">
                  <div className="text-4xl font-bold text-blue-500 opacity-50">
                    {product.name.charAt(0)}
                  </div>
                </div>
                
                {/* Product Info */}
                <div className="space-y-1">
                  <h3 className="font-semibold text-sm line-clamp-2 min-h-[2.5rem]">{product.name}</h3>
                  <p className="text-lg font-bold text-blue-600">{formatCurrency(product.price_cents!)}</p>
                  {product.category_id && (
                    <p className="text-xs text-gray-500 truncate">{product.category_id}</p>
                  )}
                </div>

                {/* Add Icon */}
                <div className="absolute top-2 right-2 bg-blue-500 text-white rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Plus className="h-4 w-4" />
                </div>
              </div>
              ))}
            </div>
          </div>
        )}

        {/* Sliding Cart Sidebar */}
        <div
          className={`fixed top-0 right-0 h-full w-full sm:w-96 bg-white shadow-2xl transform transition-transform duration-300 ease-in-out z-50 ${
            isCartOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
        >
          {/* Cart Header */}
          <div className="flex items-center justify-between p-4 border-b bg-gray-50">
            <div className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5" />
              <h2 className="text-lg font-semibold">Shopping Cart ({cart.length} items)</h2>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsCartOpen(false)}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Cart Content */}
          <div className="flex flex-col h-[calc(100%-4rem)]">
            {cart.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-gray-500 p-6">
                <ShoppingCart className="h-16 w-16 mb-4 opacity-30" />
                <p className="text-lg font-medium">Cart is empty</p>
                <p className="text-sm text-center mt-2">Add products to get started</p>
              </div>
            ) : (
              <>
                {/* Cart Items */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {cart.map((item) => (
                    <div
                      key={item.clover_item_id}
                      className="bg-gray-50 rounded-xl p-3 border border-gray-200"
                    >
                      <div className="flex items-start gap-3">
                        {/* Item Image Placeholder */}
                        <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <div className="text-xl font-bold text-blue-500 opacity-50">
                            {item.name.charAt(0)}
                          </div>
                        </div>
                        
                        {/* Item Details */}
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-sm truncate">{item.name}</h4>
                          <p className="text-xs text-gray-600 mt-0.5">
                            {formatCurrency(item.price)} each
                          </p>
                          
                          {/* Quantity Controls */}
                          <div className="flex items-center gap-2 mt-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updateQuantity(item.clover_item_id, item.quantity - 1)}
                              className="h-7 w-7 p-0 rounded-full"
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            <span className="w-8 text-center font-medium">{item.quantity}</span>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updateQuantity(item.clover_item_id, item.quantity + 1)}
                              className="h-7 w-7 p-0 rounded-full"
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => removeFromCart(item.clover_item_id)}
                              className="h-7 w-7 p-0 ml-auto text-red-600 hover:text-red-700 hover:bg-red-50 rounded-full"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                        
                        {/* Item Total */}
                        <div className="text-right">
                          <p className="font-bold text-sm">
                            {formatCurrency(item.price * item.quantity)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Cart Footer */}
                <div className="border-t bg-white p-4 space-y-4">
                  {/* Clear Cart Button */}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={clearCart}
                    className="w-full"
                  >
                    Clear Cart
                  </Button>

                  {/* Order Summary */}
                  <div className="space-y-2 py-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Subtotal:</span>
                      <span className="font-medium">{formatCurrency(subtotal)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Tax (8.75%):</span>
                      <span className="font-medium">{formatCurrency(tax)}</span>
                    </div>
                    <div className="flex justify-between text-lg font-bold border-t pt-2">
                      <span>Total:</span>
                      <span className="text-blue-600">{formatCurrency(total)}</span>
                    </div>
                  </div>

                  {/* Proceed to Checkout Button */}
                  <Button
                    className="w-full h-12 text-base font-semibold rounded-xl"
                    size="lg"
                    onClick={() => router.push('/checkout')}
                  >
                    Proceed to Checkout - {formatCurrency(total)}
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Overlay - lighter opacity for better UX */}
        {isCartOpen && (
          <div
            className="fixed inset-0 bg-black/30 z-40 transition-opacity"
            onClick={() => setIsCartOpen(false)}
          />
        )}
      </div>
    </div>
  );
}
