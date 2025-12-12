import { render, screen } from '../../test-utils'
import {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardAction,
  CardDescription,
  CardContent,
} from '@/components/ui/card'

describe('Card Components', () => {
  test('Card renders with default props', () => {
    render(<Card>Card content</Card>)
    const card = screen.getByText('Card content')
    expect(card).toBeInTheDocument()
    expect(card).toHaveAttribute('data-slot', 'card')
  })

  test('Card accepts custom className', () => {
    render(<Card className="custom-card">Card with custom class</Card>)
    const card = screen.getByText('Card with custom class')
    expect(card).toHaveClass('custom-card')
  })

  test('CardHeader renders correctly', () => {
    render(<CardHeader>Header content</CardHeader>)
    const header = screen.getByText('Header content')
    expect(header).toBeInTheDocument()
    expect(header).toHaveAttribute('data-slot', 'card-header')
  })

  test('CardTitle renders correctly', () => {
    render(<CardTitle>Card Title</CardTitle>)
    const title = screen.getByText('Card Title')
    expect(title).toBeInTheDocument()
    expect(title).toHaveAttribute('data-slot', 'card-title')
  })

  test('CardDescription renders correctly', () => {
    render(<CardDescription>Card description text</CardDescription>)
    const description = screen.getByText('Card description text')
    expect(description).toBeInTheDocument()
    expect(description).toHaveAttribute('data-slot', 'card-description')
  })

  test('CardAction renders correctly', () => {
    render(<CardAction>Action content</CardAction>)
    const action = screen.getByText('Action content')
    expect(action).toBeInTheDocument()
    expect(action).toHaveAttribute('data-slot', 'card-action')
  })

  test('CardContent renders correctly', () => {
    render(<CardContent>Content text</CardContent>)
    const content = screen.getByText('Content text')
    expect(content).toBeInTheDocument()
    expect(content).toHaveAttribute('data-slot', 'card-content')
  })

  test('CardFooter renders correctly', () => {
    render(<CardFooter>Footer content</CardFooter>)
    const footer = screen.getByText('Footer content')
    expect(footer).toBeInTheDocument()
    expect(footer).toHaveAttribute('data-slot', 'card-footer')
  })

  test('Complete card structure renders correctly', () => {
    render(
      <Card>
        <CardHeader>
          <CardTitle>Test Card</CardTitle>
          <CardDescription>This is a test card</CardDescription>
          <CardAction>
            <button>Action</button>
          </CardAction>
        </CardHeader>
        <CardContent>
          <p>This is the card content</p>
        </CardContent>
        <CardFooter>
          <p>Footer text</p>
        </CardFooter>
      </Card>
    )

    expect(screen.getByText('Test Card')).toBeInTheDocument()
    expect(screen.getByText('This is a test card')).toBeInTheDocument()
    expect(screen.getByText('This is the card content')).toBeInTheDocument()
    expect(screen.getByText('Footer text')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /action/i })).toBeInTheDocument()
  })
})