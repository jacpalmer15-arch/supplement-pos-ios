import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MerchantProfileSection } from '../components/sync/MerchantProfileSection'
import type { MerchantProfile } from '../lib/types'

describe('MerchantProfileSection', () => {
  const mockOnUpdate = jest.fn()
  
  const defaultProfile: MerchantProfile = {
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
  }

  beforeEach(() => {
    mockOnUpdate.mockClear()
  })

  it('renders all profile fields with correct initial values', () => {
    render(
      <MerchantProfileSection
        profile={defaultProfile}
        onUpdate={mockOnUpdate}
      />
    )

    expect(screen.getByText('Merchant Profile')).toBeInTheDocument()
    
    // Check form fields
    expect(screen.getByDisplayValue('Zenith Supplements')).toBeInTheDocument()
    expect(screen.getByDisplayValue('John Doe')).toBeInTheDocument()
    expect(screen.getByDisplayValue('john@zenithsupplements.com')).toBeInTheDocument()
    expect(screen.getByDisplayValue('(555) 123-4567')).toBeInTheDocument()
    expect(screen.getByDisplayValue('123 Main St')).toBeInTheDocument()
    expect(screen.getByDisplayValue('Anytown')).toBeInTheDocument()
    expect(screen.getByDisplayValue('CA')).toBeInTheDocument()
    expect(screen.getByDisplayValue('12345')).toBeInTheDocument()
  })

  it('shows save and reset buttons when changes are made', async () => {
    const user = userEvent.setup()
    
    render(
      <MerchantProfileSection
        profile={defaultProfile}
        onUpdate={mockOnUpdate}
      />
    )

    // Initially no save/reset buttons
    expect(screen.queryByRole('button', { name: 'Save Changes' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Reset' })).not.toBeInTheDocument()

    // Change business name
    const businessNameInput = screen.getByDisplayValue('Zenith Supplements')
    await user.clear(businessNameInput)
    await user.type(businessNameInput, 'New Business Name')

    // Now save/reset buttons should appear
    expect(screen.getByRole('button', { name: 'Save Changes' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Reset' })).toBeInTheDocument()
  })

  it('calls onUpdate with correct profile when save is clicked', async () => {
    const user = userEvent.setup()
    
    render(
      <MerchantProfileSection
        profile={defaultProfile}
        onUpdate={mockOnUpdate}
      />
    )

    // Change business name
    const businessNameInput = screen.getByDisplayValue('Zenith Supplements')
    await user.clear(businessNameInput)
    await user.type(businessNameInput, 'Updated Business')

    // Change email
    const emailInput = screen.getByDisplayValue('john@zenithsupplements.com')
    await user.clear(emailInput)
    await user.type(emailInput, 'updated@email.com')

    // Click save
    const saveButton = screen.getByRole('button', { name: 'Save Changes' })
    await user.click(saveButton)

    expect(mockOnUpdate).toHaveBeenCalledWith({
      ...defaultProfile,
      businessName: 'Updated Business',
      email: 'updated@email.com',
    })
  })

  it('updates nested address fields correctly', async () => {
    const user = userEvent.setup()
    
    render(
      <MerchantProfileSection
        profile={defaultProfile}
        onUpdate={mockOnUpdate}
      />
    )

    // Change street address
    const streetInput = screen.getByDisplayValue('123 Main St')
    await user.clear(streetInput)
    await user.type(streetInput, '456 Oak Ave')

    // Change city
    const cityInput = screen.getByDisplayValue('Anytown')
    await user.clear(cityInput)
    await user.type(cityInput, 'Newtown')

    // Wait for save button to appear
    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Save Changes' })).toBeInTheDocument()
    })

    // Click save
    const saveButton = screen.getByRole('button', { name: 'Save Changes' })
    await user.click(saveButton)

    expect(mockOnUpdate).toHaveBeenCalledWith({
      ...defaultProfile,
      address: {
        ...defaultProfile.address,
        street: '456 Oak Ave',
        city: 'Newtown',
      },
    })
  })

  it('resets changes when reset button is clicked', async () => {
    const user = userEvent.setup()
    
    render(
      <MerchantProfileSection
        profile={defaultProfile}
        onUpdate={mockOnUpdate}
      />
    )

    // Change business name
    const businessNameInput = screen.getByDisplayValue('Zenith Supplements')
    await user.clear(businessNameInput)
    await user.type(businessNameInput, 'Changed Name')

    // Verify change
    expect(businessNameInput).toHaveValue('Changed Name')

    // Click reset
    const resetButton = screen.getByRole('button', { name: 'Reset' })
    await user.click(resetButton)

    // Should be back to original value
    expect(businessNameInput).toHaveValue('Zenith Supplements')
    
    // Save/reset buttons should disappear
    expect(screen.queryByRole('button', { name: 'Save Changes' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Reset' })).not.toBeInTheDocument()
  })
})