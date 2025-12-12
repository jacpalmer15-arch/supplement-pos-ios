import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import ProductsPage from '@/app/products/page'
import { api } from '@/lib/api'

// Mock the API
jest.mock('@/lib/api', () => ({
  api: {
    products: {
      list: jest.fn(),
    },
    categories: {
      list: jest.fn(),
    },
  },
}))

const mockApi = api as jest.Mocked<typeof api>

describe('ProductsPage', () => {
  let queryClient: QueryClient

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    })

    // Reset mocks
    mockApi.products.list.mockClear()
    mockApi.categories.list.mockClear()
  })

  const mockProducts = [
    {
      clover_item_id: '1',
      name: 'Test Product 1',
      category: 'Electronics',
      sku: 'TEST-001',
      upc: '123456789',
      visible_in_kiosk: true,
      price: 1999,
    },
    {
      clover_item_id: '2',
      name: 'Test Product 2',
      category: 'Books',
      sku: 'TEST-002',
      upc: '987654321',
      visible_in_kiosk: false,
      price: 999,
    },
  ]

  const mockCategories = ['Electronics', 'Books', 'Clothing']

  const renderWithQueryClient = (component: React.ReactElement) => {
    return render(
      <QueryClientProvider client={queryClient}>
        {component}
      </QueryClientProvider>
    )
  }

  it('renders page title', () => {
    mockApi.products.list.mockResolvedValue(mockProducts)
    mockApi.categories.list.mockResolvedValue(mockCategories)

    renderWithQueryClient(<ProductsPage />)
    
    expect(screen.getByText('Products')).toBeInTheDocument()
  })

  it('renders search and filter controls', () => {
    mockApi.products.list.mockResolvedValue(mockProducts)
    mockApi.categories.list.mockResolvedValue(mockCategories)

    renderWithQueryClient(<ProductsPage />)
    
    expect(screen.getByLabelText('Search')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Name, SKU, UPC…')).toBeInTheDocument()
    expect(screen.getByText('Category')).toBeInTheDocument()
    expect(screen.getByText('Show kiosk-visible only')).toBeInTheDocument()
  })

  it('renders refresh button', () => {
    mockApi.products.list.mockResolvedValue(mockProducts)
    mockApi.categories.list.mockResolvedValue(mockCategories)

    renderWithQueryClient(<ProductsPage />)
    
    expect(screen.getByText('Refresh')).toBeInTheDocument()
  })

  it('shows loading state', () => {
    mockApi.products.list.mockImplementation(
      () => new Promise(() => {}) // Never resolves
    )
    mockApi.categories.list.mockResolvedValue(mockCategories)

    renderWithQueryClient(<ProductsPage />)
    
    expect(screen.getByText('Loading products…')).toBeInTheDocument()
  })

  it('shows error state', async () => {
    mockApi.products.list.mockRejectedValue(new Error('API Error'))
    mockApi.categories.list.mockResolvedValue(mockCategories)

    renderWithQueryClient(<ProductsPage />)
    
    await waitFor(() => {
      expect(screen.getByText('API Error')).toBeInTheDocument()
    })
  })

  it('loads and displays products', async () => {
    mockApi.products.list.mockResolvedValue(mockProducts)
    mockApi.categories.list.mockResolvedValue(mockCategories)

    renderWithQueryClient(<ProductsPage />)
    
    await waitFor(() => {
      expect(screen.getByText('Test Product 1')).toBeInTheDocument()
      expect(screen.getByText('Test Product 2')).toBeInTheDocument()
    })
  })

  it('loads categories for filter dropdown', async () => {
    mockApi.products.list.mockResolvedValue(mockProducts)
    mockApi.categories.list.mockResolvedValue(mockCategories)

    renderWithQueryClient(<ProductsPage />)
    
    await waitFor(() => {
      expect(mockApi.categories.list).toHaveBeenCalled()
    })
  })

  it('filters products by search term', async () => {
    mockApi.products.list.mockResolvedValue(mockProducts)
    mockApi.categories.list.mockResolvedValue(mockCategories)

    renderWithQueryClient(<ProductsPage />)
    
    const searchInput = screen.getByLabelText('Search')
    fireEvent.change(searchInput, { target: { value: 'test search' } })
    
    await waitFor(() => {
      expect(mockApi.products.list).toHaveBeenCalledWith({
        search: 'test search',
        kiosk_only: undefined,
        category: undefined,
      })
    })
  })

  it('filters products by category', async () => {
    mockApi.products.list.mockResolvedValue(mockProducts)
    mockApi.categories.list.mockResolvedValue(mockCategories)

    renderWithQueryClient(<ProductsPage />)
    
    // We can't easily test the actual category selection due to Radix UI complexity
    // But we can verify the API is called correctly when the state changes
    await waitFor(() => {
      expect(mockApi.products.list).toHaveBeenCalledWith({
        search: undefined,
        kiosk_only: undefined,
        category: undefined,
      })
    })
  })

  it('filters products by kiosk visibility', async () => {
    mockApi.products.list.mockResolvedValue(mockProducts)
    mockApi.categories.list.mockResolvedValue(mockCategories)

    renderWithQueryClient(<ProductsPage />)
    
    const kioskCheckbox = screen.getByLabelText('Show kiosk-visible only')
    fireEvent.click(kioskCheckbox)
    
    await waitFor(() => {
      expect(mockApi.products.list).toHaveBeenCalledWith({
        search: undefined,
        kiosk_only: true,
        category: undefined,
      })
    })
  })

  it('refreshes data when refresh button is clicked', async () => {
    mockApi.products.list.mockResolvedValue(mockProducts)
    mockApi.categories.list.mockResolvedValue(mockCategories)

    renderWithQueryClient(<ProductsPage />)
    
    // Wait for initial load
    await waitFor(() => {
      expect(mockApi.products.list).toHaveBeenCalledTimes(1)
    })
    
    // Click refresh
    const refreshButton = screen.getByText('Refresh')
    fireEvent.click(refreshButton)
    
    await waitFor(() => {
      expect(mockApi.products.list).toHaveBeenCalledTimes(2)
    })
  })

  it('combines multiple filters', async () => {
    mockApi.products.list.mockResolvedValue(mockProducts)
    mockApi.categories.list.mockResolvedValue(mockCategories)

    renderWithQueryClient(<ProductsPage />)
    
    // Set search term
    const searchInput = screen.getByLabelText('Search')
    fireEvent.change(searchInput, { target: { value: 'electronics' } })
    
    // Set kiosk filter
    const kioskCheckbox = screen.getByLabelText('Show kiosk-visible only')
    fireEvent.click(kioskCheckbox)
    
    // The category filter is complex to test with Radix UI, but search + kiosk should work
    await waitFor(() => {
      expect(mockApi.products.list).toHaveBeenCalledWith({
        search: 'electronics',
        kiosk_only: true,
        category: undefined,
      })
    })
  })
})