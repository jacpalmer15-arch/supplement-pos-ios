import { render, screen } from '../../test-utils'
import userEvent from '@testing-library/user-event'
import { Button } from '@/components/ui/button'

describe('Button', () => {
  test('renders with default props', () => {
    render(<Button>Click me</Button>)
    const button = screen.getByRole('button', { name: /click me/i })
    expect(button).toBeInTheDocument()
    expect(button).toHaveAttribute('data-slot', 'button')
  })

  test('renders different variants', () => {
    render(
      <div>
        <Button variant="default">Default</Button>
        <Button variant="destructive">Destructive</Button>
        <Button variant="outline">Outline</Button>
        <Button variant="secondary">Secondary</Button>
        <Button variant="ghost">Ghost</Button>
        <Button variant="link">Link</Button>
      </div>
    )

    expect(screen.getByRole('button', { name: /default/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /destructive/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /outline/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /secondary/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /ghost/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /link/i })).toBeInTheDocument()
  })

  test('renders different sizes', () => {
    render(
      <div>
        <Button size="default">Default Size</Button>
        <Button size="sm">Small Size</Button>
        <Button size="lg">Large Size</Button>
        <Button size="icon" aria-label="Icon button">🔥</Button>
      </div>
    )

    expect(screen.getByRole('button', { name: /default size/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /small size/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /large size/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /icon button/i })).toBeInTheDocument()
  })

  test('handles click events', async () => {
    const user = userEvent.setup()
    const handleClick = jest.fn()
    
    render(<Button onClick={handleClick}>Click me</Button>)
    const button = screen.getByRole('button', { name: /click me/i })
    
    await user.click(button)
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  test('can be disabled', () => {
    render(<Button disabled>Disabled Button</Button>)
    const button = screen.getByRole('button', { name: /disabled button/i })
    expect(button).toBeDisabled()
  })

  test('accepts custom className', () => {
    render(<Button className="custom-class">Custom</Button>)
    const button = screen.getByRole('button', { name: /custom/i })
    expect(button).toHaveClass('custom-class')
  })

  test('renders as child when asChild is true', () => {
    render(
      <Button asChild>
        <a href="/test">Link Button</a>
      </Button>
    )
    const link = screen.getByRole('link', { name: /link button/i })
    expect(link).toBeInTheDocument()
    expect(link).toHaveAttribute('href', '/test')
  })
})