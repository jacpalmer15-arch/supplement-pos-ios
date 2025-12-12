import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { FeatureFlagsSection } from '../components/sync/FeatureFlagsSection'
import type { FeatureFlags } from '../lib/types'

describe('FeatureFlagsSection', () => {
  const mockOnUpdate = jest.fn()
  
  const defaultFlags: FeatureFlags = {
    enableKioskMode: true,
    enableInventoryTracking: true,
    enableLowStockAlerts: false,
    enableProductRecommendations: false,
    enableReports: true,
  }

  beforeEach(() => {
    mockOnUpdate.mockClear()
  })

  it('renders all feature flags with correct initial state', () => {
    render(
      <FeatureFlagsSection
        flags={defaultFlags}
        onUpdate={mockOnUpdate}
      />
    )

    expect(screen.getByText('Feature Flags')).toBeInTheDocument()
    expect(screen.getByText('Kiosk Mode')).toBeInTheDocument()
    expect(screen.getByText('Inventory Tracking')).toBeInTheDocument()
    expect(screen.getByText('Low Stock Alerts')).toBeInTheDocument()
    expect(screen.getByText('Product Recommendations')).toBeInTheDocument()
    expect(screen.getByText('Reports')).toBeInTheDocument()

    // Check switch states
    expect(screen.getByRole('switch', { name: 'Kiosk Mode' })).toBeChecked()
    expect(screen.getByRole('switch', { name: 'Inventory Tracking' })).toBeChecked()
    expect(screen.getByRole('switch', { name: 'Low Stock Alerts' })).not.toBeChecked()
    expect(screen.getByRole('switch', { name: 'Product Recommendations' })).not.toBeChecked()
    expect(screen.getByRole('switch', { name: 'Reports' })).toBeChecked()
  })

  it('shows save and reset buttons when changes are made', async () => {
    const user = userEvent.setup()
    
    render(
      <FeatureFlagsSection
        flags={defaultFlags}
        onUpdate={mockOnUpdate}
      />
    )

    // Initially no save/reset buttons
    expect(screen.queryByRole('button', { name: 'Save Changes' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Reset' })).not.toBeInTheDocument()

    // Toggle a switch
    const lowStockSwitch = screen.getByRole('switch', { name: 'Low Stock Alerts' })
    await user.click(lowStockSwitch)

    // Now save/reset buttons should appear
    expect(screen.getByRole('button', { name: 'Save Changes' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Reset' })).toBeInTheDocument()
  })

  it('calls onUpdate with correct flags when save is clicked', async () => {
    const user = userEvent.setup()
    
    render(
      <FeatureFlagsSection
        flags={defaultFlags}
        onUpdate={mockOnUpdate}
      />
    )

    // Toggle Low Stock Alerts
    const lowStockSwitch = screen.getByRole('switch', { name: 'Low Stock Alerts' })
    await user.click(lowStockSwitch)

    // Click save
    const saveButton = screen.getByRole('button', { name: 'Save Changes' })
    await user.click(saveButton)

    expect(mockOnUpdate).toHaveBeenCalledWith({
      ...defaultFlags,
      enableLowStockAlerts: true,
    })
  })

  it('resets changes when reset button is clicked', async () => {
    const user = userEvent.setup()
    
    render(
      <FeatureFlagsSection
        flags={defaultFlags}
        onUpdate={mockOnUpdate}
      />
    )

    // Toggle a switch
    const lowStockSwitch = screen.getByRole('switch', { name: 'Low Stock Alerts' })
    await user.click(lowStockSwitch)

    // Verify switch is now checked
    expect(lowStockSwitch).toBeChecked()

    // Click reset
    const resetButton = screen.getByRole('button', { name: 'Reset' })
    await user.click(resetButton)

    // Switch should be back to original state
    expect(lowStockSwitch).not.toBeChecked()
    
    // Save/reset buttons should disappear
    expect(screen.queryByRole('button', { name: 'Save Changes' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Reset' })).not.toBeInTheDocument()
  })
})