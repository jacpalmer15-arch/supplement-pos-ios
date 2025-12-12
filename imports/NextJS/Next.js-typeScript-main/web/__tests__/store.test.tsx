/**
 * @jest-environment jsdom
 */
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import StorePage from '@/app/store/page';
import { mockProducts } from '@/lib/mock';
import { CartProvider } from '@/lib/cart-context';

// Mock the AdminLayout to bypass AuthGuard
jest.mock('@/components/layout/AdminLayout', () => ({
  AdminLayout: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

const renderWithProvider = (component: React.ReactElement) => {
  return render(<CartProvider>{component}</CartProvider>);
};

describe('Store Page', () => {
  it('renders the store page', () => {
    renderWithProvider(<StorePage />);
    
    expect(screen.getByText('Store')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /cart/i })).toBeInTheDocument();
  });

  it('displays available products', () => {
    renderWithProvider(<StorePage />);
    
    const availableProducts = mockProducts.filter(p => p.visible_in_kiosk && p.price_cents);
    
    // Check that product names are displayed
    availableProducts.forEach(product => {
      expect(screen.getByText(product.name)).toBeInTheDocument();
    });
  });

  it('adds product to cart when clicked', async () => {
    const user = userEvent.setup();
    renderWithProvider(<StorePage />);
    
    const availableProducts = mockProducts.filter(p => p.visible_in_kiosk && p.price_cents);
    
    // Find and click first product card
    const productCards = screen.getAllByText(availableProducts[0].name);
    await user.click(productCards[0]);
    
    // Verify item was added to cart and cart opened
    await waitFor(() => {
      expect(screen.getByText('Shopping Cart (1 items)')).toBeInTheDocument();
      expect(screen.getByText('Subtotal:')).toBeInTheDocument();
      expect(screen.getByText('Tax (8.75%):')).toBeInTheDocument();
      expect(screen.getByText('Total:')).toBeInTheDocument();
    });
  });

  it('clears cart when clear button is clicked', async () => {
    const user = userEvent.setup();
    renderWithProvider(<StorePage />);
    
    const availableProducts = mockProducts.filter(p => p.visible_in_kiosk && p.price_cents);
    
    // Add item to cart first
    const productCards = screen.getAllByText(availableProducts[0].name);
    await user.click(productCards[0]);
    
    await waitFor(() => {
      expect(screen.getByText('Shopping Cart (1 items)')).toBeInTheDocument();
    });
    
    // Clear cart
    const clearButton = screen.getByText('Clear Cart');
    await user.click(clearButton);
    
    expect(screen.getByText('Shopping Cart (0 items)')).toBeInTheDocument();
    expect(screen.getByText('Cart is empty')).toBeInTheDocument();
  });
});
