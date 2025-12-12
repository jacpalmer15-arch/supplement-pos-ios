import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider, useMutation, useQueryClient } from '@tanstack/react-query'
import { productColumns } from '@/components/products/columns'
import { Product } from '@/lib/types'

// Mock the API
jest.mock('@/lib/api', () => ({
  api: {
    products: {
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

// Mock react-query hooks
jest.mock('@tanstack/react-query', () => ({
  ...jest.requireActual('@tanstack/react-query'),
  useMutation: jest.fn(),
  useQueryClient: jest.fn(),
}))

const mockUseMutation = useMutation as jest.MockedFunction<typeof useMutation>
const mockUseQueryClient = useQueryClient as jest.MockedFunction<typeof useQueryClient>

describe('Product Columns', () => {
  let queryClient: QueryClient
  
  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    })
    
    const mockMutation = {
      mutate: jest.fn(),
      isPending: false,
    }
    
    const mockQueryClient = {
      invalidateQueries: jest.fn(),
    }
    
    mockUseMutation.mockReturnValue(mockMutation as ReturnType<typeof useMutation>)
    mockUseQueryClient.mockReturnValue(mockQueryClient as ReturnType<typeof useQueryClient>)
  })

  const mockProduct: Product = {
    clover_item_id: '123',
    name: 'Test Product',
    category: 'Electronics',
    sku: 'TEST-123',
    upc: '123456789',
    visible_in_kiosk: true,
    price: 1999,
  }

  it('renders product name as a link', () => {
    const nameColumn = productColumns[0]
    const cellContent = nameColumn.cell!({ 
      row: { original: mockProduct } 
    } as { row: { original: typeof mockProduct } })
    
    const { container } = render(
      <QueryClientProvider client={queryClient}>
        {cellContent}
      </QueryClientProvider>
    )
    
    const link = container.querySelector('a')
    expect(link).toHaveAttribute('href', '/products/123')
    expect(link).toHaveTextContent('Test Product')
    expect(link).toHaveClass('text-blue-600', 'hover:underline')
  })

  it('renders category column', () => {
    const categoryColumn = productColumns[1]
    expect(categoryColumn.accessorKey).toBe('category')
    expect(categoryColumn.header).toBe('Category')
  })

  it('renders UPC column', () => {
    const upcColumn = productColumns[2]
    expect(upcColumn.accessorKey).toBe('upc')
    expect(upcColumn.header).toBe('UPC')
  })

  it('renders SKU column', () => {
    const skuColumn = productColumns[3]
    expect(skuColumn.accessorKey).toBe('sku')
    expect(skuColumn.header).toBe('SKU')
  })

  it('renders kiosk toggle column', () => {
    const kioskColumn = productColumns[4]
    expect(kioskColumn.id).toBe('kiosk')
    expect(kioskColumn.header).toBe('Kiosk')
    
    const cellContent = kioskColumn.cell!({ 
      row: { original: mockProduct } 
    } as { row: { original: typeof mockProduct } })
    
    const { container } = render(
      <QueryClientProvider client={queryClient}>
        {cellContent}
      </QueryClientProvider>
    )
    
    // Should render a switch component
    expect(container.querySelector('[role="switch"]')).toBeInTheDocument()
  })

  it('calls mutation when kiosk toggle is clicked', async () => {
    const mockMutate = jest.fn()
    mockUseMutation.mockReturnValue({
      mutate: mockMutate,
      isPending: false,
    } as ReturnType<typeof useMutation>)

    const kioskColumn = productColumns[4]
    const cellContent = kioskColumn.cell!({ 
      row: { original: mockProduct } 
    } as ReturnType<typeof useMutation>)
    
    render(
      <QueryClientProvider client={queryClient}>
        {cellContent}
      </QueryClientProvider>
    )
    
    const toggle = screen.getByRole('switch')
    fireEvent.click(toggle)
    
    await waitFor(() => {
      expect(mockMutate).toHaveBeenCalled()
    })
  })

  it('disables kiosk toggle when mutation is pending', () => {
    mockUseMutation.mockReturnValue({
      mutate: jest.fn(),
      isPending: true,
    } as ReturnType<typeof useMutation>)

    const kioskColumn = productColumns[4]
    const cellContent = kioskColumn.cell!({ 
      row: { original: mockProduct } 
    } as ReturnType<typeof useMutation>)
    
    render(
      <QueryClientProvider client={queryClient}>
        {cellContent}
      </QueryClientProvider>
    )
    
    const toggle = screen.getByRole('switch')
    expect(toggle).toBeDisabled()
  })
})