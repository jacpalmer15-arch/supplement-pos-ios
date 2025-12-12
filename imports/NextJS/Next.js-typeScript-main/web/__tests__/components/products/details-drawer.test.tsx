import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ProductDetailsDrawer } from '@/components/products/details-drawer'
import { api } from '@/lib/api'

// Mock the API
jest.mock('@/lib/api', () => ({
  api: {
    products: {
      get: jest.fn(),
      update: jest.fn(),
    },
    categories: {
      list: jest.fn(),
    },
  },
}))

// Mock sonner toast
jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}))

// Mock React Query hooks
jest.mock('@tanstack/react-query', () => ({
  useQuery: jest.fn(),
  useMutation: jest.fn(),
  useQueryClient: jest.fn(),
  QueryClient: jest.fn(),
  QueryClientProvider: ({ children }: { children: React.ReactNode }) => children,
}))

const mockApi = api as jest.Mocked<typeof api>
const { useQuery, useMutation, useQueryClient } = require('@tanstack/react-query')

const mockProduct = {
  clover_item_id: 'test-product-id',
  name: 'Test Product',
  category_id: 'cat_protein',
  sku: 'TEST-SKU',
  upc: '123456789012',
  price_cents: 2999,
  cost_cents: 1500,
  visible_in_kiosk: true,
}

const mockCategories = [
  { id: 'cat_protein', name: 'Protein' },
  { id: 'cat_preworkout', name: 'Pre-Workout' },
  { id: 'cat_accessories', name: 'Accessories' },
]

describe('ProductDetailsDrawer', () => {
  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks()
    
    // Setup default useQueryClient mock
    useQueryClient.mockReturnValue({
      invalidateQueries: jest.fn(),
    })

    // Setup default useMutation mock
    useMutation.mockReturnValue({
      mutate: jest.fn(),
      isPending: false,
    })

    // Setup default useQuery mocks
    useQuery
      .mockReturnValueOnce({
        data: mockProduct,
        isLoading: false,
        isError: false,
        error: null,
        refetch: jest.fn(),
      })
      .mockReturnValueOnce({
        data: mockCategories,
        isLoading: false,
        isError: false,
        error: null,
      })
  })

  const renderDrawer = (props = {}) => {
    const defaultProps = {
      productId: 'test-product-id',
      isOpen: true,
      onClose: jest.fn(),
      ...props,
    }

    return render(<ProductDetailsDrawer {...defaultProps} />)
  }

  it('does not render when closed', () => {
    renderDrawer({ isOpen: false })
    expect(screen.queryByText('Product Details')).not.toBeInTheDocument()
  })

  it('renders loading state when open', async () => {
    useQuery.mockReturnValueOnce({
      data: undefined,
      isLoading: true,
      isError: false,
      error: null,
      refetch: jest.fn(),
    })

    renderDrawer()
    
    expect(screen.getByText('Product Details')).toBeInTheDocument()
    expect(screen.getByText('Loading product details...')).toBeInTheDocument()
  })

  it('renders error state', async () => {
    useQuery.mockReturnValueOnce({
      data: undefined,
      isLoading: false,
      isError: true,
      error: new Error('Failed to load'),
      refetch: jest.fn(),
    })

    renderDrawer()
    
    expect(screen.getByText('Error loading product details')).toBeInTheDocument()
  })

  it('renders product details in view mode by default', async () => {
    renderDrawer()

    expect(screen.getByText('Product Details')).toBeInTheDocument()
    expect(screen.getByText('Test Product')).toBeInTheDocument()
    expect(screen.getByText('test-product-id')).toBeInTheDocument()
    expect(screen.getByText('Protein')).toBeInTheDocument()
    expect(screen.getByText('TEST-SKU')).toBeInTheDocument()
    expect(screen.getByText('123456789012')).toBeInTheDocument()
    expect(screen.getByText('$29.99')).toBeInTheDocument()
    expect(screen.getByText('$15.00')).toBeInTheDocument()
    expect(screen.getByText('Visible')).toBeInTheDocument()
    expect(screen.getByText('Edit')).toBeInTheDocument()
  })

  it('switches to edit mode when Edit button is clicked', async () => {
    const user = userEvent.setup()
    renderDrawer()

    const editButton = screen.getByText('Edit')
    await user.click(editButton)

    expect(screen.getByText('Edit Product')).toBeInTheDocument()

    // Check that form fields are visible
    expect(screen.getByLabelText('Name')).toBeInTheDocument()
    expect(screen.getByLabelText('Category')).toBeInTheDocument()
    expect(screen.getByLabelText('SKU')).toBeInTheDocument()
    expect(screen.getByLabelText('UPC')).toBeInTheDocument()
    expect(screen.getByLabelText('Price (cents)')).toBeInTheDocument()
    expect(screen.getByLabelText('Cost (cents)')).toBeInTheDocument()
    expect(screen.getByText('Visible in kiosk')).toBeInTheDocument()
    expect(screen.getByText('Save Changes')).toBeInTheDocument()
    expect(screen.getByText('Cancel')).toBeInTheDocument()
  })

  it('populates form fields with current product data in edit mode', async () => {
    const user = userEvent.setup()
    renderDrawer()

    const editButton = screen.getByText('Edit')
    await user.click(editButton)

    await waitFor(() => {
      expect(screen.getByLabelText('Name')).toHaveValue('Test Product')
    })

    expect(screen.getByLabelText('SKU')).toHaveValue('TEST-SKU')
    expect(screen.getByLabelText('UPC')).toHaveValue('123456789012')
    expect(screen.getByLabelText('Price (cents)')).toHaveValue(2999)
    expect(screen.getByLabelText('Cost (cents)')).toHaveValue(1500)
  })

  it('calls onClose when close button clicked', async () => {
    const onClose = jest.fn()
    renderDrawer({ onClose })

    const closeButton = screen.getByLabelText('Close')
    fireEvent.click(closeButton)
    
    expect(onClose).toHaveBeenCalled()
  })

  it('calls onClose when overlay clicked', async () => {
    const onClose = jest.fn()
    const { container } = renderDrawer({ onClose })
    
    const overlay = container.querySelector('.fixed.inset-0.bg-black')
    expect(overlay).toBeInTheDocument()
    
    if (overlay) {
      fireEvent.click(overlay)
    }
    
    expect(onClose).toHaveBeenCalled()
  })

  it('handles missing optional fields', async () => {
    const productWithoutOptionals = {
      ...mockProduct,
      category_id: null,
      sku: null,
      upc: null,
      price_cents: null,
      cost_cents: null,
      visible_in_kiosk: false,
    }
    
    useQuery
      .mockReturnValueOnce({
        data: productWithoutOptionals,
        isLoading: false,
        isError: false,
        error: null,
        refetch: jest.fn(),
      })
      .mockReturnValueOnce({
        data: mockCategories,
        isLoading: false,
        isError: false,
        error: null,
      })

    renderDrawer()
    
    // Should show em dashes for missing values
    const dashElements = screen.getAllByText('—')
    expect(dashElements).toHaveLength(4) // category, price, sku, cost
    
    // Should show "Hidden" for kiosk visibility
    expect(screen.getByText('Hidden')).toBeInTheDocument()
  })

  it('does not make API call when no productId provided', () => {
    useQuery.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: false,
      error: null,
      refetch: jest.fn(),
    })

    renderDrawer({ productId: null })
    
    // The component should still render but with queries disabled
    expect(screen.queryByText('Product Details')).not.toBeInTheDocument()
  })
})