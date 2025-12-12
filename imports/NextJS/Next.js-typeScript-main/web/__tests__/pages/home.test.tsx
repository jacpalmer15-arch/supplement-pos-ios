import { render, screen } from '../test-utils'
import Home from '@/app/page'

// Mock Next.js Link component
jest.mock('next/link', () => {
  return function MockLink({ children, href, ...props }: any) {
    return (
      <a href={href} {...props}>
        {children}
      </a>
    )
  }
})

describe('Home Page', () => {
  test('renders main heading', () => {
    render(<Home />)
    expect(screen.getByRole('heading', { name: /xeinth admin/i })).toBeInTheDocument()
  })

  test('renders action buttons', () => {
    render(<Home />)
    expect(screen.getByRole('button', { name: /new/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /sync/i })).toBeInTheDocument()
  })

  test('renders navigation cards', () => {
    render(<Home />)
    
    // Products card
    expect(screen.getByText('Products')).toBeInTheDocument()
    expect(screen.getByText('List, search, and toggle kiosk visibility.')).toBeInTheDocument()
    
    // Inventory card
    expect(screen.getByText('Inventory')).toBeInTheDocument()
    expect(screen.getByText('Stock levels and low-stock alerts.')).toBeInTheDocument()
    
    // Sync card - use getAllByText to handle duplicate
    const syncTexts = screen.getAllByText('Sync')
    expect(syncTexts.length).toBeGreaterThan(0)
    expect(screen.getByText('Run product / inventory syncs.')).toBeInTheDocument()
  })

  test('navigation cards have correct links', () => {
    render(<Home />)
    
    const productLink = screen.getByRole('link', { name: /products list, search, and toggle kiosk visibility./i })
    const inventoryLink = screen.getByRole('link', { name: /inventory stock levels and low-stock alerts./i })
    const syncLink = screen.getByRole('link', { name: /sync run product \/ inventory syncs./i })
    
    expect(productLink).toHaveAttribute('href', '/products')
    expect(inventoryLink).toHaveAttribute('href', '/inventory')
    expect(syncLink).toHaveAttribute('href', '/sync')
  })

  test('has proper page structure', () => {
    render(<Home />)
    
    const main = screen.getByRole('main')
    expect(main).toHaveClass('min-h-dvh', 'bg-gray-50', 'text-gray-900')
    
    // Should have header section
    expect(screen.getByRole('banner')).toBeInTheDocument()
  })
})