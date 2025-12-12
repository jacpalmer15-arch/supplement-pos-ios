import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { InventoryTable } from '@/components/inventory/inventory-table';
import { InventoryRow } from '@/lib/types';

// Mock toast
jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

// Mock API
jest.mock('@/lib/api', () => ({
  api: {
    inventory: {
      adjust: jest.fn(),
    },
  },
}));

const mockInventoryData: InventoryRow[] = [
  {
    clover_item_id: 'item1',
    name: 'Test Item 1',
    on_hand: 10,
    reorder_level: 5,
  },
  {
    clover_item_id: 'item2',
    name: 'Test Item 2',
    on_hand: 2,
    reorder_level: 5,
    low_stock: true,
  },
  {
    clover_item_id: 'item3',
    name: null,
    on_hand: 20,
    reorder_level: null,
  },
];

const renderWithQueryClient = (component: React.ReactElement) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      {component}
    </QueryClientProvider>
  );
};

describe('InventoryTable', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders inventory items correctly', () => {
    renderWithQueryClient(
      <InventoryTable rows={mockInventoryData} empty="No items" />
    );

    expect(screen.getByText('Test Item 1')).toBeInTheDocument();
    expect(screen.getByText('Test Item 2')).toBeInTheDocument();
    expect(screen.getByText('10')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('20')).toBeInTheDocument();
  });

  it('shows low stock badge for items below reorder level', () => {
    renderWithQueryClient(
      <InventoryTable rows={mockInventoryData} empty="No items" />
    );

    const lowStockBadges = screen.getAllByText('Low Stock');
    expect(lowStockBadges).toHaveLength(1);
    
    const inStockBadges = screen.getAllByText('In Stock');
    expect(inStockBadges).toHaveLength(2);
  });

  it('displays empty message when no items', () => {
    renderWithQueryClient(
      <InventoryTable rows={[]} empty="No inventory items" />
    );

    expect(screen.getByText('No inventory items')).toBeInTheDocument();
  });

  it('filters items by search term when filter is enabled', async () => {
    const user = userEvent.setup();
    
    renderWithQueryClient(
      <InventoryTable rows={mockInventoryData} empty="No items" showFilter={true} />
    );

    const searchInput = screen.getByPlaceholderText('Search by name or item ID...');
    await user.type(searchInput, 'Test Item 1');

    expect(screen.getByText('Test Item 1')).toBeInTheDocument();
    expect(screen.queryByText('Test Item 2')).not.toBeInTheDocument();
  });

  it('filters to show only low stock items when checkbox is checked', async () => {
    const user = userEvent.setup();
    
    renderWithQueryClient(
      <InventoryTable rows={mockInventoryData} empty="No items" showFilter={true} />
    );

    const lowStockCheckbox = screen.getByLabelText('Show low stock only');
    await user.click(lowStockCheckbox);

    expect(screen.getByText('Test Item 2')).toBeInTheDocument();
    expect(screen.queryByText('Test Item 1')).not.toBeInTheDocument();
    expect(screen.getByText('Showing 1 of 3 items')).toBeInTheDocument();
  });

  it('shows adjust buttons for all items', () => {
    renderWithQueryClient(
      <InventoryTable rows={mockInventoryData} empty="No items" />
    );

    const adjustButtons = screen.getAllByText('Adjust');
    expect(adjustButtons).toHaveLength(3);
  });

  it('handles null/undefined item names gracefully', () => {
    renderWithQueryClient(
      <InventoryTable rows={mockInventoryData} empty="No items" />
    );

    // The third item has name: null, should show a dash
    const dashElements = screen.getAllByText('-');
    expect(dashElements.length).toBeGreaterThanOrEqual(1);
  });
});