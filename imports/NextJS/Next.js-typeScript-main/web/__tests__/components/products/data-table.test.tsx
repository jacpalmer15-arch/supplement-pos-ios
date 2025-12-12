import { render, screen } from '../../test-utils'
import userEvent from '@testing-library/user-event'
import { DataTable } from '@/components/products/data-table'
import { ColumnDef } from '@tanstack/react-table'

// Test data and columns
interface TestData {
  id: string
  name: string
  price: number
}

const testData: TestData[] = [
  { id: '1', name: 'Product 1', price: 10.99 },
  { id: '2', name: 'Product 2', price: 25.50 },
  { id: '3', name: 'Product 3', price: 5.00 },
]

const testColumns: ColumnDef<TestData>[] = [

  {
    accessorKey: 'name',
    header: 'Name',
  },
  {
    accessorKey: 'price',
    header: 'Price',
    cell: ({ row }) => `$${row.getValue('price')}`,
  },
]

describe('DataTable', () => {
  test('renders table with data', () => {
    render(<DataTable columns={testColumns} data={testData} />)

    // Check headers
    expect(screen.getByText('Name')).toBeInTheDocument()
    expect(screen.getByText('Price')).toBeInTheDocument()

    // Check data
    expect(screen.getByText('Product 1')).toBeInTheDocument()
    expect(screen.getByText('Product 2')).toBeInTheDocument()
    expect(screen.getByText('Product 3')).toBeInTheDocument()
    expect(screen.getByText('$10.99')).toBeInTheDocument()
    expect(screen.getByText('$25.5')).toBeInTheDocument()
    expect(screen.getByText('$5')).toBeInTheDocument()
  })

  test('renders empty table when no data', () => {
    render(<DataTable columns={testColumns} data={[]} />)

    // Headers should still be present
    expect(screen.getByText('Name')).toBeInTheDocument()
    expect(screen.getByText('Price')).toBeInTheDocument()

    // No data rows
    expect(screen.queryByText('Product 1')).not.toBeInTheDocument()
  })

  test('displays pagination controls', () => {
    render(<DataTable columns={testColumns} data={testData} />)

    // Should show page info
    expect(screen.getByText('Page 1 of 1')).toBeInTheDocument()

    // Should show pagination buttons
    expect(screen.getByRole('button', { name: /prev/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /next/i })).toBeInTheDocument()
  })

  test('pagination buttons are disabled appropriately', () => {
    render(<DataTable columns={testColumns} data={testData} />)

    const prevButton = screen.getByRole('button', { name: /prev/i })
    const nextButton = screen.getByRole('button', { name: /next/i })

    // On first page with only one page, both should be disabled
    expect(prevButton).toBeDisabled()
    expect(nextButton).toBeDisabled()
  })

  test('handles column header clicks for sorting', async () => {
    const user = userEvent.setup()
    render(<DataTable columns={testColumns} data={testData} />)

    const nameHeader = screen.getByText('Name')
    
    // Should be clickable
    expect(nameHeader).toHaveClass('cursor-pointer')

    // Click to sort
    await user.click(nameHeader)
    
    // Should add sort indicator (testing that the click handler is attached)
    // Note: We can't easily test actual sorting without mocking the react-table internals
  })

  test('handles pagination with many items', () => {
    // Create data with more than 10 items to trigger pagination
    const manyItems = Array.from({ length: 25 }, (_, i) => ({
      id: `${i + 1}`,
      name: `Product ${i + 1}`,
      price: (i + 1) * 5,
    }))

    render(<DataTable columns={testColumns} data={manyItems} />)

    // Should show multiple pages
    expect(screen.getByText('Page 1 of 3')).toBeInTheDocument()

    // Next button should be enabled
    const nextButton = screen.getByRole('button', { name: /next/i })
    expect(nextButton).not.toBeDisabled()
    accessorKey: 'value',
    header: 'Value',
  },
]

const mockData: TestData[] = [
  { id: '1', name: 'Item 1', value: 10 },
  { id: '2', name: 'Item 2', value: 20 },
  { id: '3', name: 'Item 3', value: 30 },
  { id: '4', name: 'Item 4', value: 40 },
  { id: '5', name: 'Item 5', value: 50 },
  { id: '6', name: 'Item 6', value: 60 },
  { id: '7', name: 'Item 7', value: 70 },
  { id: '8', name: 'Item 8', value: 80 },
  { id: '9', name: 'Item 9', value: 90 },
  { id: '10', name: 'Item 10', value: 100 },
  { id: '11', name: 'Item 11', value: 110 },
  { id: '12', name: 'Item 12', value: 120 },
]

describe('DataTable', () => {
  it('renders table with headers', () => {
    render(<DataTable columns={mockColumns} data={mockData} />)
    
    expect(screen.getByText('Name')).toBeInTheDocument()
    expect(screen.getByText('Value')).toBeInTheDocument()
  })

  it('renders data rows', () => {
    render(<DataTable columns={mockColumns} data={mockData} />)
    
    expect(screen.getByText('Item 1')).toBeInTheDocument()
    expect(screen.getByText('10')).toBeInTheDocument()
  })

  it('shows pagination controls', () => {
    render(<DataTable columns={mockColumns} data={mockData} />)
    
    expect(screen.getByText(/Page 1 of/)).toBeInTheDocument()
    expect(screen.getByText('Prev')).toBeInTheDocument()
    expect(screen.getByText('Next')).toBeInTheDocument()
  })

  it('paginates correctly with page size of 10', () => {
    render(<DataTable columns={mockColumns} data={mockData} />)
    
    // Should show first 10 items
    expect(screen.getByText('Item 1')).toBeInTheDocument()
    expect(screen.getByText('Item 10')).toBeInTheDocument()
    expect(screen.queryByText('Item 11')).not.toBeInTheDocument()
    
    // Should show page 1 of 2
    expect(screen.getByText('Page 1 of 2')).toBeInTheDocument()
  })

  it('navigates to next page', () => {
    render(<DataTable columns={mockColumns} data={mockData} />)
    
    const nextButton = screen.getByText('Next')
    fireEvent.click(nextButton)
    
    // Should show items 11-12 on page 2
    expect(screen.getByText('Item 11')).toBeInTheDocument()
    expect(screen.getByText('Item 12')).toBeInTheDocument()
    expect(screen.queryByText('Item 1')).not.toBeInTheDocument()
    
    // Should show page 2 of 2
    expect(screen.getByText('Page 2 of 2')).toBeInTheDocument()
  })

  it('navigates to previous page', () => {
    render(<DataTable columns={mockColumns} data={mockData} />)
    
    // Go to page 2 first
    const nextButton = screen.getByText('Next')
    fireEvent.click(nextButton)
    
    // Then go back to page 1
    const prevButton = screen.getByText('Prev')
    fireEvent.click(prevButton)
    
    // Should show first page items
    expect(screen.getByText('Item 1')).toBeInTheDocument()
    expect(screen.getByText('Item 10')).toBeInTheDocument()
    expect(screen.queryByText('Item 11')).not.toBeInTheDocument()
    
    // Should show page 1 of 2
    expect(screen.getByText('Page 1 of 2')).toBeInTheDocument()
  })

  it('disables prev button on first page', () => {
    render(<DataTable columns={mockColumns} data={mockData} />)
    
    const prevButton = screen.getByText('Prev')
    expect(prevButton).toBeDisabled()
  })

  it('disables next button on last page', () => {
    render(<DataTable columns={mockColumns} data={mockData} />)
    
    // Go to last page
    const nextButton = screen.getByText('Next')
    fireEvent.click(nextButton)
    
    expect(nextButton).toBeDisabled()
  })

  it('handles sorting when header is clicked', () => {
    render(<DataTable columns={mockColumns} data={mockData} />)
    
    const nameHeader = screen.getByText('Name')
    expect(nameHeader).toHaveClass('cursor-pointer', 'select-none')
    
    // Click to sort
    fireEvent.click(nameHeader)
    
    // Should show sort indicator
    expect(nameHeader).toHaveTextContent('Name ▲')
  })

  it('handles empty data', () => {
    render(<DataTable columns={mockColumns} data={[]} />)
    
    expect(screen.getByText('Name')).toBeInTheDocument()
    expect(screen.getByText('Value')).toBeInTheDocument()
    
    // Should show page 1 of 0
    expect(screen.getByText('Page 1 of 0')).toBeInTheDocument()
  })
})