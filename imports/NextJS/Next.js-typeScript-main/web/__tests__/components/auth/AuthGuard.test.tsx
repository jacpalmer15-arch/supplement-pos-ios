import { render, screen } from '@testing-library/react'
import { AuthGuard } from '../../../components/auth/AuthGuard'
import { AuthProvider } from '../../../lib/auth-context'
import { auth } from '../../../lib/supabase'

jest.mock('../../../lib/supabase')
const mockAuth = auth as jest.Mocked<typeof auth>

const TestComponent = () => <div>Protected Content</div>

const renderWithAuthProvider = (component: React.ReactElement) => {
  return render(
    <AuthProvider>
      {component}
    </AuthProvider>
  )
}

describe('AuthGuard', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('shows loading state initially', () => {
    mockAuth.getSession.mockImplementation(() => new Promise(() => {})) // Never resolves
    mockAuth.onAuthStateChange.mockReturnValue({
      data: { subscription: { unsubscribe: jest.fn() } },
    } as any)

    renderWithAuthProvider(
      <AuthGuard>
        <TestComponent />
      </AuthGuard>
    )
    
    expect(screen.getByText('Loading...')).toBeInTheDocument()
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument()
  })

  test('renders children when user is authenticated', async () => {
    mockAuth.getSession.mockResolvedValue({
      data: {
        session: {
          user: { id: '1', email: 'test@example.com' },
          access_token: 'token',
        },
      },
      error: null,
    } as any)
    
    mockAuth.onAuthStateChange.mockReturnValue({
      data: { subscription: { unsubscribe: jest.fn() } },
    } as any)

    renderWithAuthProvider(
      <AuthGuard>
        <TestComponent />
      </AuthGuard>
    )
    
    expect(await screen.findByText('Protected Content')).toBeInTheDocument()
  })

  test('does not render children when user is not authenticated', async () => {
    mockAuth.getSession.mockResolvedValue({
      data: { session: null },
      error: null,
    } as any)
    
    mockAuth.onAuthStateChange.mockReturnValue({
      data: { subscription: { unsubscribe: jest.fn() } },
    } as any)

    renderWithAuthProvider(
      <AuthGuard>
        <TestComponent />
      </AuthGuard>
    )
    
    // Should not render protected content
    await new Promise(resolve => setTimeout(resolve, 100))
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument()
  })
})