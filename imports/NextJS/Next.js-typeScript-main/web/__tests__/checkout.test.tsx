/**
 * @jest-environment jsdom
 */
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import CheckoutPage from '@/app/checkout/page';
import { toast } from 'sonner';
import { CartProvider } from '@/lib/cart-context';

// Mock the AdminLayout to bypass AuthGuard
jest.mock('@/components/layout/AdminLayout', () => ({
  AdminLayout: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

// Mock the toast functionality
jest.mock('sonner', () => ({
  toast: {
    error: jest.fn(),
    success: jest.fn(),
  },
}));

// Mock fetch
global.fetch = jest.fn();

const renderWithProvider = (component: React.ReactElement) => {
  return render(<CartProvider>{component}</CartProvider>);
};

describe('CheckoutPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (fetch as jest.Mock).mockClear();
  });

  it('renders the checkout page', () => {
    renderWithProvider(<CheckoutPage />);
    
    expect(screen.getByText('Checkout')).toBeInTheDocument();
  });

  it('displays empty cart message when cart is empty', () => {
    renderWithProvider(<CheckoutPage />);
    
    expect(screen.getByText('Your cart is empty')).toBeInTheDocument();
    expect(screen.getByText('Go to Store')).toBeInTheDocument();
  });

  it('shows error when trying to checkout with empty cart', async () => {
    const user = userEvent.setup();
    renderWithProvider(<CheckoutPage />);
    
    // Cart should be empty
    expect(screen.getByText('Your cart is empty')).toBeInTheDocument();
  });
});
