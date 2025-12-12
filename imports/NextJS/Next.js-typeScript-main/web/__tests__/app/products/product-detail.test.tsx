import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import ProductDetailPage from '@/app/products/[id]/page'
import { api } from '@/lib/api'

// Mock the API
jest.mock('@/lib/api', () => ({
  api: {
    products: {
      get: jest.fn(),
      update: jest.fn(),
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

const mockApi = api as jest.Mocked<typeof api>

// Mock useParams to return a test ID
jest.mock('next/navigation', () => ({
  useParams: () => ({ id: 'test-id' }),
  useRouter: () => ({
    back: jest.fn(),
  }),
}))

describe('ProductDetailPage', () => {
  let queryClient: QueryClient

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    })

    // Reset mocks
    mockApi.products.get.mockClear()
    mockApi.products.update.mockClear()
  })

  const mockProduct = {
    clover_item_id: 'test-id',
    name: 'Test Product',
    category: 'Electronics',
    sku: 'TEST-001',
    upc: '123456789',
    visible_in_kiosk: true,
    price: 1999,
  }

  const renderWithQueryClient = (component: React.ReactElement) => {
    return render(
      <QueryClientProvider client={queryClient}>
        {component}
      </QueryClientProvider>
    )
  }

  it('shows loading state', () => {
    mockApi.products.get.mockImplementation(
      () => new Promise(() => {}) // Never resolves
    )

    renderWithQueryClient(<ProductDetailPage />)
    
    expect(screen.getByText('Loading…')).toBeInTheDocument()
  })

  it('shows error state', async () => {
    mockApi.products.get.mockRejectedValue(new Error('Product not found'))

    renderWithQueryClient(<ProductDetailPage />)
    
    await waitFor(() => {
      expect(screen.getByText('Error: Product not found')).toBeInTheDocument()
    })
  })

  it('loads and displays product details', async () => {
    mockApi.products.get.mockResolvedValue(mockProduct)

    renderWithQueryClient(<ProductDetailPage />)
    
    await waitFor(() => {
      expect(screen.getByText('Test Product')).toBeInTheDocument()
      expect(screen.getByText('Clover Item ID: test-id')).toBeInTheDocument()
      expect(screen.getByDisplayValue('Test Product')).toBeInTheDocument()
      expect(screen.getByDisplayValue('Electronics')).toBeInTheDocument()
      expect(screen.getByDisplayValue('TEST-001')).toBeInTheDocument()
      expect(screen.getByDisplayValue('123456789')).toBeInTheDocument()
      expect(screen.getByDisplayValue('1999')).toBeInTheDocument()
    })
  })

  it('renders back button', async () => {
    mockApi.products.get.mockResolvedValue(mockProduct)

    renderWithQueryClient(<ProductDetailPage />)
    
    await waitFor(() => {
      expect(screen.getByText('← Back')).toBeInTheDocument()
    })
  })

  it('renders form fields', async () => {
    mockApi.products.get.mockResolvedValue(mockProduct)

    renderWithQueryClient(<ProductDetailPage />)
    
    await waitFor(() => {
      expect(screen.getByLabelText('Name')).toBeInTheDocument()
      expect(screen.getByLabelText('Category')).toBeInTheDocument()
      expect(screen.getByLabelText('Price (cents)')).toBeInTheDocument()
      expect(screen.getByLabelText('SKU')).toBeInTheDocument()
      expect(screen.getByLabelText('UPC')).toBeInTheDocument()
      expect(screen.getByText('Visible in kiosk')).toBeInTheDocument()
    })
  })

  it('renders kiosk visibility toggle', async () => {
    mockApi.products.get.mockResolvedValue(mockProduct)

    renderWithQueryClient(<ProductDetailPage />)
    
    await waitFor(() => {
      const toggle = screen.getByRole('switch')
      expect(toggle).toBeInTheDocument()
      expect(toggle).toBeChecked()
    })
  })

  it('disables save button when form is not dirty', async () => {
    mockApi.products.get.mockResolvedValue(mockProduct)

    renderWithQueryClient(<ProductDetailPage />)
    
    await waitFor(() => {
      const saveButton = screen.getByText('Save')
      expect(saveButton).toBeDisabled()
    })
  })

  it('enables save button when form is dirty', async () => {
    mockApi.products.get.mockResolvedValue(mockProduct)

    renderWithQueryClient(<ProductDetailPage />)
    
    await waitFor(() => {
      const nameInput = screen.getByLabelText('Name')
      fireEvent.change(nameInput, { target: { value: 'Updated Product' } })
    })
    
    await waitFor(() => {
      const saveButton = screen.getByText('Save')
      expect(saveButton).not.toBeDisabled()
    })
  })

  it('submits form with updated data', async () => {
    mockApi.products.get.mockResolvedValue(mockProduct)
    mockApi.products.update.mockResolvedValue({
      ...mockProduct,
      name: 'Updated Product',
    })

    renderWithQueryClient(<ProductDetailPage />)
    
    // Wait for form to load
    await waitFor(() => {
      expect(screen.getByDisplayValue('Test Product')).toBeInTheDocument()
    })
    
    // Update the name
    const nameInput = screen.getByLabelText('Name')
    fireEvent.change(nameInput, { target: { value: 'Updated Product' } })
    
    // Submit the form
    const saveButton = screen.getByText('Save')
    fireEvent.click(saveButton)
    
    await waitFor(() => {
      expect(mockApi.products.update).toHaveBeenCalledWith('test-id', {
        name: 'Updated Product',
        category: 'Electronics',
        sku: 'TEST-001',
        upc: '123456789',
        visible_in_kiosk: true,
        price: 1999,
      })
    })
  })

  it('handles price field correctly', async () => {
    mockApi.products.get.mockResolvedValue(mockProduct)
    mockApi.products.update.mockResolvedValue(mockProduct)

    renderWithQueryClient(<ProductDetailPage />)
    
    // Wait for form to load
    await waitFor(() => {
      expect(screen.getByDisplayValue('1999')).toBeInTheDocument()
    })
    
    // Clear price field (should become undefined)
    const priceInput = screen.getByLabelText('Price (cents)')
    fireEvent.change(priceInput, { target: { value: '' } })
    
    // Submit the form
    const saveButton = screen.getByText('Save')
    fireEvent.click(saveButton)
    
    await waitFor(() => {
      expect(mockApi.products.update).toHaveBeenCalledWith('test-id', 
        expect.objectContaining({
          price: undefined,
        })
      )
    })
  })

  it('toggles kiosk visibility', async () => {
    mockApi.products.get.mockResolvedValue(mockProduct)
    mockApi.products.update.mockResolvedValue({
      ...mockProduct,
      visible_in_kiosk: false,
    })

    renderWithQueryClient(<ProductDetailPage />)
    
    // Wait for form to load
    await waitFor(() => {
      const toggle = screen.getByRole('switch')
      expect(toggle).toBeChecked()
    })
    
    // Toggle the switch
    const toggle = screen.getByRole('switch')
    fireEvent.click(toggle)
    
    // Submit the form
    const saveButton = screen.getByText('Save')
    fireEvent.click(saveButton)
    
    await waitFor(() => {
      expect(mockApi.products.update).toHaveBeenCalledWith('test-id',
        expect.objectContaining({
          visible_in_kiosk: false,
        })
      )
    })
  })

  it('shows validation error for required name field', async () => {
    mockApi.products.get.mockResolvedValue(mockProduct)

    renderWithQueryClient(<ProductDetailPage />)
    
    // Wait for form to load
    await waitFor(() => {
      expect(screen.getByDisplayValue('Test Product')).toBeInTheDocument()
    })
    
    // Clear the name field
    const nameInput = screen.getByLabelText('Name')
    fireEvent.change(nameInput, { target: { value: '' } })
    
    // Try to submit
    const saveButton = screen.getByText('Save')
    fireEvent.click(saveButton)
    
    await waitFor(() => {
      expect(screen.getByText('Required')).toBeInTheDocument()
    })
  })
})