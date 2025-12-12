import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { CloverSection } from '../components/sync/CloverSection'
import type { CloverConnection } from '../lib/types'

describe('CloverSection', () => {
  const mockConnect = jest.fn()
  const mockDisconnect = jest.fn()

  beforeEach(() => {
    mockConnect.mockClear()
    mockDisconnect.mockClear()
  })

  describe('when disconnected', () => {
    const disconnectedConnection: CloverConnection = {
      isConnected: false,
    }

    it('renders disconnect state with connect form', () => {
      render(
        <CloverSection
          connection={disconnectedConnection}
          onConnect={mockConnect}
          onDisconnect={mockDisconnect}
        />
      )

      expect(screen.getByText('Clover Integration')).toBeInTheDocument()
      expect(screen.getByText('Disconnected')).toBeInTheDocument()
      expect(screen.getByText(/Connect your Clover account/)).toBeInTheDocument()
      expect(screen.getByLabelText('Clover API Key')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Connect' })).toBeInTheDocument()
    })

    it('calls onConnect when form is submitted with API key', async () => {
      const user = userEvent.setup()
      
      render(
        <CloverSection
          connection={disconnectedConnection}
          onConnect={mockConnect}
          onDisconnect={mockDisconnect}
        />
      )

      const apiKeyInput = screen.getByLabelText('Clover API Key')
      const connectButton = screen.getByRole('button', { name: 'Connect' })

      await user.type(apiKeyInput, 'test-api-key-123')
      await user.click(connectButton)

      expect(mockConnect).toHaveBeenCalledWith('test-api-key-123')
    })

    it('disables connect button when API key is empty', () => {
      render(
        <CloverSection
          connection={disconnectedConnection}
          onConnect={mockConnect}
          onDisconnect={mockDisconnect}
        />
      )

      const connectButton = screen.getByRole('button', { name: 'Connect' })
      expect(connectButton).toBeDisabled()
    })
  })

  describe('when connected', () => {
    const connectedConnection: CloverConnection = {
      isConnected: true,
      merchantId: 'MERCHANT_ABC123',
      lastSyncAt: new Date('2025-01-01T12:00:00Z'),
    }

    it('renders connected state with merchant info', () => {
      render(
        <CloverSection
          connection={connectedConnection}
          onConnect={mockConnect}
          onDisconnect={mockDisconnect}
        />
      )

      expect(screen.getByText('Connected')).toBeInTheDocument()
      expect(screen.getByText('MERCHANT_ABC123')).toBeInTheDocument()
      expect(screen.getByText(/Last sync:/)).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Disconnect from Clover' })).toBeInTheDocument()
    })

    it('calls onDisconnect when disconnect button is clicked', async () => {
      const user = userEvent.setup()
      
      render(
        <CloverSection
          connection={connectedConnection}
          onConnect={mockConnect}
          onDisconnect={mockDisconnect}
        />
      )

      const disconnectButton = screen.getByRole('button', { name: 'Disconnect from Clover' })
      await user.click(disconnectButton)

      expect(mockDisconnect).toHaveBeenCalled()
    })
  })
})