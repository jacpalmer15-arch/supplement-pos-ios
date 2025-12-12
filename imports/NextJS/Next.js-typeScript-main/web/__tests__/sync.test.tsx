import { render, screen, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import SyncSettingsPage from '../app/sync/page'

// Helper to wrap components with QueryClient
const renderWithQueryClient = (ui: React.ReactElement) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        staleTime: Infinity,
      },
    },
  })
  return render(
    <QueryClientProvider client={queryClient}>
      {ui}
    </QueryClientProvider>
  )
}

// Mock the API module
jest.mock('../lib/api', () => ({
  api: {
    clover: {
      getConnection: jest.fn(() => Promise.resolve({ isConnected: false })),
    },
    settings: {
      getFeatureFlags: jest.fn(() => Promise.resolve({
        enableKioskMode: true,
        enableInventoryTracking: true,
        enableLowStockAlerts: false,
        enableProductRecommendations: false,
        enableReports: true,
      })),
      getMerchantProfile: jest.fn(() => Promise.resolve({
        businessName: 'Zenith Supplements',
        contactName: 'John Doe',
        email: 'john@zenithsupplements.com',
        phone: '(555) 123-4567',
        address: {
          street: '123 Main St',
          city: 'Anytown',
          state: 'CA',
          zip: '12345',
        },
        timezone: 'America/Los_Angeles',
        currency: 'USD',
      })),
    },
  },
}))

describe('SyncSettingsPage', () => {
  it('renders sync & settings page with all sections', async () => {
    renderWithQueryClient(<SyncSettingsPage />)
    
    // Check main title
    expect(screen.getByText('Sync & Settings')).toBeInTheDocument()
    
    // Wait for all sections to load
    await waitFor(() => {
      expect(screen.getByText('Data Sync')).toBeInTheDocument()
    })
    
    expect(screen.getByText('Clover Integration')).toBeInTheDocument()
    expect(screen.getByText('Feature Flags')).toBeInTheDocument()
    expect(screen.getByText('Merchant Profile')).toBeInTheDocument()
    
    // Check sync section
    expect(screen.getByRole('button', { name: 'Run Product Sync' })).toBeInTheDocument()
  })

  it('displays clover connection status', async () => {
    renderWithQueryClient(<SyncSettingsPage />)
    
    // Should show disconnected status
    await waitFor(() => {
      expect(screen.getByText('Disconnected')).toBeInTheDocument()
    })
    expect(screen.getByText(/Connect your Clover account/)).toBeInTheDocument()
  })

  it('displays feature flags with toggles', async () => {
    renderWithQueryClient(<SyncSettingsPage />)
    
    // Wait for feature flags section to load
    await waitFor(() => {
      expect(screen.getByText('Kiosk Mode')).toBeInTheDocument()
    })
    expect(screen.getByText('Inventory Tracking')).toBeInTheDocument()
    expect(screen.getByText('Low Stock Alerts')).toBeInTheDocument()
    expect(screen.getByText('Product Recommendations')).toBeInTheDocument()
    expect(screen.getByText('Reports')).toBeInTheDocument()
  })

  it('displays merchant profile form', async () => {
    renderWithQueryClient(<SyncSettingsPage />)
    
    // Wait for merchant profile section to load
    await waitFor(() => {
      expect(screen.getByDisplayValue('Zenith Supplements')).toBeInTheDocument()
    })
    expect(screen.getByDisplayValue('John Doe')).toBeInTheDocument()
    expect(screen.getByDisplayValue('john@zenithsupplements.com')).toBeInTheDocument()
    expect(screen.getByDisplayValue('(555) 123-4567')).toBeInTheDocument()
  })
})