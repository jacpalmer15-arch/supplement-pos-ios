import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import LoginForm from '../../../components/auth/LoginForm'
import { AuthProvider } from '../../../lib/auth-context'
import { auth } from '../../../lib/supabase'

// Mock the auth module
jest.mock('../../../lib/supabase')
const mockAuth = auth as jest.Mocked<typeof auth>

// Mock toast
jest.mock('sonner', () => ({
  toast: {
    error: jest.fn(),
    success: jest.fn(),
  },
}))

const renderWithAuthProvider = (component: React.ReactElement) => {
  return render(
    <AuthProvider>
      {component}
    </AuthProvider>
  )
}

describe('LoginForm', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    
    // Mock initial session as null (not authenticated)
    mockAuth.getSession.mockResolvedValue({
      data: { session: null },
      error: null,
    } as any)
    
    mockAuth.onAuthStateChange.mockReturnValue({
      data: { subscription: { unsubscribe: jest.fn() } },
    } as any)
  })

  test('renders login form with email and password fields', () => {
    renderWithAuthProvider(<LoginForm />)
    
    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument()
  })

  test('displays form validation errors for empty fields', async () => {
    const user = userEvent.setup()
    renderWithAuthProvider(<LoginForm />)
    
    const signInButton = screen.getByRole('button', { name: /sign in/i })
    await user.click(signInButton)
    
    // Note: HTML5 form validation will prevent submission
    expect(mockAuth.signInWithPassword).not.toHaveBeenCalled()
  })

  test('calls signIn when form is submitted with valid data', async () => {
    const user = userEvent.setup()
    mockAuth.signInWithPassword.mockResolvedValue({
      data: { user: { id: '1', email: 'test@example.com' }, session: {} },
      error: null,
    } as any)

    renderWithAuthProvider(<LoginForm />)
    
    const emailInput = screen.getByLabelText(/email address/i)
    const passwordInput = screen.getByLabelText(/password/i)
    const signInButton = screen.getByRole('button', { name: /sign in/i })
    
    await user.type(emailInput, 'test@example.com')
    await user.type(passwordInput, 'password123')
    await user.click(signInButton)
    
    await waitFor(() => {
      expect(mockAuth.signInWithPassword).toHaveBeenCalledWith('test@example.com', 'password123')
    })
  })

  test('displays error message when login fails', async () => {
    const user = userEvent.setup()
    const mockToast = require('sonner').toast
    
    mockAuth.signInWithPassword.mockResolvedValue({
      data: { user: null, session: null },
      error: { message: 'Invalid credentials' },
    } as any)

    renderWithAuthProvider(<LoginForm />)
    
    const emailInput = screen.getByLabelText(/email address/i)
    const passwordInput = screen.getByLabelText(/password/i)
    const signInButton = screen.getByRole('button', { name: /sign in/i })
    
    await user.type(emailInput, 'test@example.com')
    await user.type(passwordInput, 'wrongpassword')
    await user.click(signInButton)
    
    await waitFor(() => {
      expect(mockToast.error).toHaveBeenCalledWith('Invalid credentials')
    })
  })
})