# Zenith Admin Frontend

Front end of Self Checkout App - A Next.js TypeScript application for managing products, inventory, and sync operations.

# Next.js TypeScript - Self Checkout App Frontend

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Features

### Products Management
The application includes a comprehensive products management system with:

- **Product Listing** (`/products`): Browse all products with advanced filtering and search
- **Product Details** (`/products/[id]`): View and edit individual product information
- **Inventory Tracking** (`/inventory`): Monitor stock levels and low-stock alerts
- **Data Synchronization** (`/sync`): Sync product data with backend systems

## Products Page Features

### Core Functionality
- **Search & Filter**: Filter products by name, SKU, UPC, category, and kiosk visibility
- **Sortable Table**: Click column headers to sort products
- **Pagination**: Navigate through large product catalogs efficiently
- **Real-time Updates**: Changes reflect immediately across the application

### Advanced Features
- **Inline Editing**: Click any cell in the product table to edit values directly
- **Details Drawer**: Click the eye icon to view product details in a slide-out panel
- **Kiosk Toggle**: Quickly toggle product visibility for kiosk displays
- **Responsive Design**: Works seamlessly on desktop and mobile devices

### Inline Editing
- Click any editable cell (Category, UPC, SKU, Price) to edit inline
- Press `Enter` to save changes or `Escape` to cancel
- Price is automatically formatted and validated
- Changes are saved immediately to the backend

### Details Drawer
- Click the eye icon in any row to open the details drawer
- View all product information in a clean, organized layout
- Quick access to edit the full product via "Edit Product" button
- Click outside the drawer or the X button to close

## Environment Variables

Before running the application, you need to set up the following environment variables:

### Required Environment Variables

Create a `.env.local` file in the root directory with:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

- `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase project URL (found in Project Settings > API)
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase anon public key (found in Project Settings > API)

### Database Schema

The application expects a `products` table in Supabase with the following structure:

```sql
CREATE TABLE products (
  clover_item_id TEXT PRIMARY KEY,
  name TEXT,
  category TEXT,
  sku TEXT,
  upc TEXT,
  visible_in_kiosk BOOLEAN DEFAULT FALSE,
  price INTEGER -- price in cents
);
```

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn package manager

### Installation

```bash
# Install dependencies
npm install

# Run the development server
# Clone the repository
git clone <repository-url>
cd Next.js-typeScript/web

# Install dependencies
npm install

# Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Available Scripts

- `npm run dev` - Start the development server with Turbopack
- `npm run build` - Build the application for production
- `npm run start` - Start the production server
- `npm run lint` - Run ESLint for code quality checks
- `npm run test` - Run the test suite
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Run tests with coverage report

## Testing

This project uses Jest and React Testing Library for testing.

### Test Structure

```
__tests__/
├── components/
│   ├── ui/           # UI component tests
│   └── products/     # Product-related component tests
├── pages/            # Page-level integration tests
└── test-utils.tsx    # Testing utilities and custom render
```

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode (recommended for development)
npm run test:watch

# Run tests with coverage report
npm run test:coverage
```

### Writing Tests

Tests should follow these conventions:
- Use the custom `render` function from `test-utils.tsx` for components that need providers
- Mock external dependencies (APIs, Next.js router, etc.) in `jest.setup.js`
- Focus on testing user interactions and component behavior
- Use React Testing Library best practices (query by role, accessible name, etc.)

Example test:
```tsx
import { render, screen } from '../test-utils'
import userEvent from '@testing-library/user-event'
import { MyComponent } from '@/components/MyComponent'

describe('MyComponent', () => {
  test('handles user interaction', async () => {
    const user = userEvent.setup()
    render(<MyComponent />)
    
    const button = screen.getByRole('button', { name: /click me/i })
    await user.click(button)
    
    expect(screen.getByText('Clicked!')).toBeInTheDocument()
  })
})
```

## CI/CD Pipeline

The project uses GitHub Actions for continuous integration with the following workflow:

### Workflow Stages

1. **Lint**: ESLint code quality checks
2. **Type Check**: TypeScript compilation verification  
3. **Test**: Jest unit and integration tests with coverage
4. **Build**: Next.js production build verification

> **Note**: The current codebase has some existing ESLint and TypeScript issues that need to be addressed separately. The CI pipeline is configured to run checks but may fail on these pre-existing issues. The test suite, however, is fully functional and validates the test infrastructure and new components.
### Available Scripts

```bash
# Development server with Turbopack
npm run dev

# Production build
npm run build

# Start production server
npm start

# Lint code
npm run lint

# Run tests
npm test

# Run tests in watch mode
npm test:watch

# Generate test coverage report
npm test:coverage
```

## Environment Variables

Create a `.env.local` file in the web directory:

```env
# Backend API URL
BACKEND_BASE=http://localhost:8000

# Sync timeout (optional)
SYNC_TIMEOUT_MS=60000
```

## Testing

The application includes comprehensive test coverage using Jest and React Testing Library:

- **Unit Tests**: All components and utilities
- **Integration Tests**: API client and data flow
- **UI Tests**: User interactions and state management

Run tests with coverage:
```bash
npm run test:coverage
```

## API Integration

The application communicates with a backend API for:
- Product CRUD operations
- Category management
- Inventory tracking
- Data synchronization

API endpoints are automatically normalized to handle different backend response formats.

## Technology Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI primitives
- **State Management**: TanStack Query (React Query)
- **Data Tables**: TanStack Table
- **Form Handling**: React Hook Form with Zod validation
- **Testing**: Jest + React Testing Library
- **Build Tool**: Turbopack

## Project Structure

```
web/
├── app/                    # Next.js App Router pages
│   ├── products/          # Products pages
│   ├── inventory/         # Inventory pages
│   ├── sync/             # Sync utilities
│   └── api/              # API routes
├── components/            # Reusable UI components
│   ├── products/         # Product-specific components
│   └── ui/               # Base UI components
├── lib/                  # Utilities and shared code
│   ├── api.ts           # API client
│   ├── types.ts         # TypeScript definitions
│   └── utils.ts         # Helper functions
└── __tests__/            # Test files
    ├── components/       # Component tests
    ├── lib/             # Utility tests
    └── app/             # Page tests
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass: `npm test`
6. Ensure linting passes: `npm run lint`
7. Ensure build succeeds: `npm run build`
8. Submit a pull request

### Workflow Triggers

- Push to `main` or `develop` branches
- Pull requests to `main` or `develop` branches

### Matrix Testing

Tests run on multiple Node.js versions:
- Node.js 18
- Node.js 20

### Artifacts

- Test coverage reports (uploaded to Codecov)
- Build artifacts (retained for 7 days)

## Project Structure

```
web/
├── app/                    # Next.js App Router pages and API routes
│   ├── api/               # API endpoints
│   ├── products/          # Product management pages
│   ├── inventory/         # Inventory management pages
│   └── sync/              # Sync operations pages
├── components/            # React components
│   ├── ui/               # Base UI components
│   └── products/         # Product-related components
├── lib/                   # Utility functions and types
├── __tests__/            # Test files
└── public/               # Static assets
```

## Technology Stack

- **Framework**: Next.js 15.5.3 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI
- **State Management**: React Query (TanStack Query)
- **Forms**: React Hook Form with Zod validation
- **Database**: Supabase
- **Testing**: Jest + React Testing Library
- **Linting**: ESLint with Next.js configuration

## Contributing

1. Create a feature branch from `develop`
2. Make your changes with appropriate tests
3. Ensure all tests pass: `npm test`
4. Ensure linting passes: `npm run lint`
5. Ensure build succeeds: `npm run build`
6. Create a pull request

The CI pipeline will automatically run tests, linting, and build verification on all pull requests.
