import { render, screen } from '../../test-utils'
import userEvent from '@testing-library/user-event'
import { Input } from '@/components/ui/input'

describe('Input', () => {
  test('renders basic input', () => {
    render(<Input placeholder="Enter text" />)
    const input = screen.getByPlaceholderText('Enter text')
    expect(input).toBeInTheDocument()
    expect(input).toHaveAttribute('data-slot', 'input')
  })

  test('accepts different input types', () => {
    render(
      <div>
        <Input type="text" data-testid="text-input" />
        <Input type="email" data-testid="email-input" />
        <Input type="password" data-testid="password-input" />
        <Input type="number" data-testid="number-input" />
      </div>
    )

    expect(screen.getByTestId('text-input')).toHaveAttribute('type', 'text')
    expect(screen.getByTestId('email-input')).toHaveAttribute('type', 'email')
    expect(screen.getByTestId('password-input')).toHaveAttribute('type', 'password')
    expect(screen.getByTestId('number-input')).toHaveAttribute('type', 'number')
  })

  test('handles user input', async () => {
    const user = userEvent.setup()
    render(<Input placeholder="Type here" />)
    
    const input = screen.getByPlaceholderText('Type here')
    await user.type(input, 'Hello World')
    
    expect(input).toHaveValue('Hello World')
  })

  test('can be disabled', () => {
    render(<Input disabled placeholder="Disabled input" />)
    const input = screen.getByPlaceholderText('Disabled input')
    expect(input).toBeDisabled()
  })

  test('accepts custom className', () => {
    render(<Input className="custom-input" data-testid="custom-input" />)
    const input = screen.getByTestId('custom-input')
    expect(input).toHaveClass('custom-input')
  })

  test('supports controlled input', async () => {
    const user = userEvent.setup()
    let value = ''
    const handleChange = jest.fn((e) => {
      value = e.target.value
    })

    render(<Input value={value} onChange={handleChange} data-testid="controlled-input" />)
    
    const input = screen.getByTestId('controlled-input')
    await user.type(input, 'test')
    
    expect(handleChange).toHaveBeenCalledTimes(4) // One for each character
  })
})