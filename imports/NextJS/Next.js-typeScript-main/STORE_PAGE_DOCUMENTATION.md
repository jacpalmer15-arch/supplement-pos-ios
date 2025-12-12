# Store Page Implementation Documentation

## Overview

This implementation adds a new **Store page** (`/store`) that separates product browsing and cart building from the checkout/payment flow, matching the iOS app's user experience.

## Architecture

### Cart State Management

The cart state is now managed globally using React Context, allowing state to be shared between the Store and Checkout pages.

```
┌─────────────────────────────────────────┐
│           App Providers                  │
│  AuthProvider → QueryClient → CartProvider │
└─────────────────────────────────────────┘
                    ↓
    ┌───────────────────────────────┐
    │      CartContext State         │
    ├───────────────────────────────┤
    │ - cart: CartItem[]             │
    │ - paymentMethod: PaymentMethod │
    │ - isCartOpen: boolean          │
    │ - subtotal, tax, total         │
    │ - Add/Remove/Update functions  │
    └───────────────────────────────┘
            ↓                 ↓
    ┌─────────────┐   ┌──────────────┐
    │ Store Page   │   │ Checkout Page │
    │  /store      │   │  /checkout    │
    └─────────────┘   └──────────────┘
```

### Key Files

1. **`web/lib/cart-context.tsx`** (NEW)
   - Manages cart state globally
   - Provides hooks for cart operations
   - Calculates totals automatically

2. **`web/app/store/page.tsx`** (NEW)
   - Product grid display
   - Cart sidebar with real-time updates
   - "Proceed to Checkout" flow

3. **`web/app/checkout/page.tsx`** (MODIFIED)
   - Displays built cart only
   - Payment method selection
   - Order completion

4. **`web/app/providers.tsx`** (MODIFIED)
   - Added CartProvider to app tree

5. **`web/components/layout/AdminSidebar.tsx`** (MODIFIED)
   - Added "Store" navigation item

## Page Flows

### Store Page Flow

```
User lands on /store
    ↓
Views product grid (2-6 columns based on screen size)
    ↓
Clicks product card to add to cart
    ↓
Cart sidebar slides in from right (auto-opens)
    ↓
User can:
  - Add more products (click product cards)
  - Increase/decrease quantity (+ - buttons)
  - Remove items (trash icon)
  - Clear entire cart (Clear Cart button)
    ↓
Click "Proceed to Checkout" button
    ↓
Navigate to /checkout page with cart intact
```

### Checkout Page Flow

```
User lands on /checkout (from Store or directly)
    ↓
If cart empty: Show "Go to Store" message
If cart has items: Show cart review + payment
    ↓
Review order items (with quantity controls)
    ↓
View order summary (subtotal, tax, total)
    ↓
Select payment method (Card, Cash, Gift Card)
    ↓
Click "Complete Payment"
    ↓
Payment processed via API
    ↓
Success: Cart cleared, confirmation shown
Failure: Error message, cart retained
```

## Responsive Design

### Store Page

#### Product Grid
- **Mobile** (< 640px): 2 columns
- **Small** (640px+): 3 columns
- **Medium** (768px+): 4 columns
- **Large** (1024px+): 5 columns
- **XL** (1280px+): 6 columns

```css
grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6
```

#### Cart Sidebar
- **Mobile**: Full width overlay (`w-full`)
- **Desktop**: Fixed 384px width (`sm:w-96`)

```css
w-full sm:w-96
```

### Checkout Page

#### Layout
- **Mobile**: Single column (items + payment stacked)
- **Desktop**: 3-column grid
  - Cart items: 2 columns (`lg:col-span-2`)
  - Payment: 1 column

```css
grid-cols-1 lg:grid-cols-3
```

## Component Structure

### Store Page Components

```tsx
<AdminLayout>
  <div>
    {/* Header with Cart Button */}
    <header>
      <h1>Store</h1>
      <Button onClick={() => setIsCartOpen(true)}>
        Cart (badge with count)
      </Button>
    </header>

    {/* Product Grid */}
    <div className="grid ...">
      {products.map(product => (
        <ProductCard onClick={() => addToCart(product.id)}>
          <div>Product Image Placeholder</div>
          <h3>{product.name}</h3>
          <p>{formatCurrency(product.price)}</p>
          <div>Category</div>
          <div>+ Icon on hover</div>
        </ProductCard>
      ))}
    </div>

    {/* Sliding Cart Sidebar */}
    <div className={isCartOpen ? 'slide-in' : 'slide-out'}>
      <header>
        <h2>Shopping Cart ({cart.length} items)</h2>
        <Button onClick={() => setIsCartOpen(false)}>X</Button>
      </header>
      
      {cart.length === 0 ? (
        <EmptyCartMessage />
      ) : (
        <>
          {/* Cart Items */}
          <div>{cart.map(item => <CartItem />)}</div>
          
          {/* Cart Footer */}
          <div>
            <Button>Clear Cart</Button>
            <OrderSummary />
            <Button onClick={navigateToCheckout}>
              Proceed to Checkout
            </Button>
          </div>
        </>
      )}
    </div>

    {/* Overlay */}
    {isCartOpen && <div onClick={() => setIsCartOpen(false)} />}
  </div>
</AdminLayout>
```

### Checkout Page Components

```tsx
<AdminLayout>
  <div>
    <header>
      <h1>Checkout</h1>
    </header>

    {cart.length === 0 ? (
      <EmptyCartState>
        <ShoppingCartIcon />
        <h2>Your cart is empty</h2>
        <p>Add some products from the store</p>
        <Button onClick={navigateToStore}>Go to Store</Button>
      </EmptyCartState>
    ) : (
      <div className="grid grid-cols-1 lg:grid-cols-3">
        {/* Cart Items Section (2 columns) */}
        <div className="lg:col-span-2">
          <h2>Order Items</h2>
          {cart.map(item => (
            <CartItemCard>
              <ProductImage />
              <ItemDetails />
              <QuantityControls />
              <RemoveButton />
              <ItemTotal />
            </CartItemCard>
          ))}
        </div>

        {/* Payment Section (1 column) */}
        <div>
          {/* Order Summary */}
          <Card>
            <h2>Order Summary</h2>
            <div>Subtotal: {subtotal}</div>
            <div>Tax (8.75%): {tax}</div>
            <div>Total: {total}</div>
          </Card>

          {/* Payment Method */}
          <Card>
            <h2>Payment Method</h2>
            <Select value={paymentMethod}>
              <option>Card</option>
              <option>Cash</option>
              <option>Gift Card</option>
            </Select>
            <Button onClick={handleCheckout}>
              Complete Payment - {total}
            </Button>
            <Button onClick={clearCart}>Clear Cart</Button>
          </Card>
        </div>
      </div>
    )}
  </div>
</AdminLayout>
```

## Cart Context API

### Available Hooks

```typescript
const {
  // State
  cart,              // CartItem[]
  paymentMethod,     // 'card' | 'cash' | 'gift_card'
  isCartOpen,        // boolean
  cartItemCount,     // number

  // Computed values
  subtotal,          // number (in cents)
  tax,               // number (in cents)
  total,             // number (in cents)

  // Actions
  addToCart,         // (productId: string) => void
  updateQuantity,    // (productId: string, quantity: number) => void
  removeFromCart,    // (productId: string) => void
  clearCart,         // () => void
  setPaymentMethod,  // (method: PaymentMethod) => void
  setIsCartOpen,     // (open: boolean) => void
} = useCart();
```

### Example Usage

```typescript
import { useCart } from '@/lib/cart-context';

function MyComponent() {
  const { cart, addToCart, total } = useCart();

  return (
    <div>
      <button onClick={() => addToCart('product-id')}>
        Add Product
      </button>
      <div>Cart has {cart.length} items</div>
      <div>Total: {formatCurrency(total)}</div>
    </div>
  );
}
```

## Testing

### Test Coverage

1. **Store Page Tests** (`__tests__/store.test.tsx`)
   - Renders Store page correctly
   - Displays available products
   - Adds products to cart on click
   - Clears cart when Clear Cart button is clicked

2. **Checkout Page Tests** (`__tests__/checkout.test.tsx`)
   - Renders Checkout page correctly
   - Shows empty cart message when cart is empty
   - Displays "Go to Store" button

3. **Checkout Simple Tests** (`__tests__/checkout-simple.test.tsx`)
   - Basic rendering and functionality

All tests use `CartProvider` wrapper to provide context.

### Running Tests

```bash
# Run all Store and Checkout tests
npm test -- --testPathPatterns="checkout|store"

# Run specific test file
npm test -- __tests__/store.test.tsx

# Run with watch mode
npm test -- --watch
```

## Navigation

The Store page is accessible from the admin sidebar:

```
Dashboard
Products
Inventory
Orders
Store          ← NEW
Checkout
Sync & Settings
```

## Future Enhancements

1. **Product Images**: Replace gradient placeholders with actual product images
2. **Search/Filter**: Add search and category filtering to Store page
3. **Cart Persistence**: Save cart to localStorage or database
4. **Product Details**: Add product detail modal/page
5. **Stock Validation**: Check inventory before allowing add to cart
6. **Promotions**: Add discount codes and special offers
7. **Favorites**: Allow users to save favorite products

## Migration Notes

### Breaking Changes
- The old Checkout page behavior (with product grid) is replaced
- Tests for old Checkout page product selection have been removed
- Cart state is now managed by CartContext instead of local component state

### Backward Compatibility
- All existing API endpoints remain unchanged
- Product data structure remains the same
- Payment processing flow remains the same
- Order creation flow remains the same

## Deployment Checklist

- [x] All tests passing
- [x] Build successful
- [x] TypeScript compilation clean
- [x] Responsive design implemented
- [x] Cart state management working
- [x] Navigation updated
- [x] Documentation complete

## Support

For questions or issues related to the Store page implementation, refer to:
- This documentation
- Code comments in `web/lib/cart-context.tsx`
- Test files in `web/__tests__/store.test.tsx` and `web/__tests__/checkout.test.tsx`
