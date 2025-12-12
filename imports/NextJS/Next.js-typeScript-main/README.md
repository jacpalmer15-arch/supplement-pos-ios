
# Next.js-TypeScript

Front end of Self Checkout App

## Features

### Inventory Management

The application includes a comprehensive inventory management system with the following features:

#### Inventory Page (`/inventory`)

- **Real-time inventory tracking**: View current stock levels for all items
- **Low stock monitoring**: Automatically identifies and highlights items below reorder levels
- **Search and filtering**: Find items by name or Clover item ID
- **Stock level adjustments**: Easily increase or decrease inventory quantities
- **Reason tracking**: Record reasons for inventory adjustments (e.g., "Stock received", "Damaged items")

#### Key Components

1. **InventoryTable**: Enhanced table component with:
   - Sortable columns (Name, On Hand, Reorder Level, Status)
   - Visual indicators for low stock items
   - Search functionality
   - Filter for low stock items only
   - Action buttons for each inventory item

2. **AdjustInventoryDialog**: Modal dialog for inventory adjustments:
   - Input field for adjustment amount (positive/negative)
   - Optional reason field
   - Form validation
   - Real-time feedback with toast notifications

#### Usage Instructions

1. **Viewing Inventory**:
   - Navigate to `/inventory` to see all inventory items
   - Low stock items are highlighted in red and marked with "Low Stock" badge
   - Use the search bar to find specific items

2. **Adjusting Inventory**:
   - Click the "Adjust" button next to any item
   - Enter a positive number to add inventory (e.g., +10)
   - Enter a negative number to subtract inventory (e.g., -5)
   - Optionally add a reason for the adjustment
   - Click "Adjust Inventory" to save changes

3. **Filtering and Search**:
   - Use the search box to filter by item name or Clover ID
   - Check "Show low stock only" to view items needing attention
   - View count shows filtered vs. total items

#### API Endpoints

- `GET /api/inventory` - Fetch all inventory items
- `GET /api/inventory/low-stock` - Fetch only low stock items  
- `POST /api/inventory/adjust` - Adjust inventory quantity

#### Technical Details

- Built with **Next.js 15** and **TypeScript**
- Uses **React Query** for data fetching and caching
- **Radix UI** components for accessible dialogs
- **React Hook Form** for form handling
- **Tailwind CSS** for styling
- **Toast notifications** for user feedback

## Development

### Setup

```bash
cd web
npm install
npm run dev
```

### Testing

```bash
# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

### Building

```bash
npm run build
```

## Environment Variables

Make sure to set the following environment variables:

- `BACKEND_BASE` - Base URL for the backend API service
### Products Management
- View and manage product catalog
- Filter by category and kiosk visibility
- Edit product details and pricing
- Sync products from external systems

### Orders Management
- View all orders in a sortable table
- Filter orders by:
  - Customer name or email
  - Order status (Pending, Paid, Fulfilled, Canceled)
  - Date range (From/To dates)
- Order status management:
  - Mark pending orders as paid or canceled
  - Mark paid orders as fulfilled
- Detailed order view with:
  - Customer information
  - Itemized list with quantities and prices
  - Order total and notes
  - Status-appropriate actions

### Inventory Tracking
- Monitor stock levels
- Track low stock items
- View reorder levels

## Usage Instructions

### Orders Page
1. Navigate to **Orders** from the main navigation
2. Use the filter section to narrow down orders:
   - **Customer**: Search by customer name or email
   - **Status**: Filter by order status (All, Pending, Paid, Fulfilled, Canceled)
   - **Date Range**: Filter by creation date using From/To date pickers
3. Click **Clear All Filters** to reset all filters
4. Use the **View Details** button (eye icon) to open order details
5. For pending orders: Use **Mark Paid** or **Cancel** buttons
6. For paid orders: Use **Mark Fulfilled** button
7. Click **Refresh** to reload data

### Order Details Drawer
- Opens when clicking the view details button on any order
- Shows comprehensive order information including customer details, items, and totals
- Provides status-appropriate action buttons
- Click the **X** button or click outside to close

## Development

### Setup
```bash
cd web
npm install
npm run dev
```

### Building

## Overview

A modern self-checkout application frontend built with Next.js 15, TypeScript, and Tailwind CSS. Features a comprehensive admin interface for managing products, inventory, and system settings.

## Features

### 🛍️ Product Management
- Browse and search products
- Category filtering
- Individual product editing with pricing
- Kiosk visibility controls

### 📦 Inventory Tracking
- Real-time inventory levels
- Low stock alerts and monitoring
- Automatic reorder level management

### ⚙️ Sync & Settings
- **Enhanced Product Sync**: Trigger manual syncs with backend systems
- **Clover Integration**: Connect/disconnect POS system with API key management
- **Feature Flags**: Toggle system features including:
  - Kiosk Mode
  - Inventory Tracking
  - Low Stock Alerts
  - Product Recommendations
  - Reports
- **Merchant Profile**: Manage business information and settings

## Getting Started

# Zenith Self-Checkout Admin System

Front end of Self Checkout App - A comprehensive Next.js TypeScript application for managing a self-checkout system with Point of Sale functionality.

## Features

- **Admin Authentication**: Secure login/logout with Supabase Auth and route protection
- **Product Management**: View, search, filter, and manage product inventory with inline editing
- **Inventory Tracking**: Monitor stock levels, low-stock alerts, and inventory adjustments
- **Order Management**: Complete order processing with filtering, status management, and detailed order views
- **Point of Sale (Checkout)**: Full-featured POS system for processing customer orders
- **Payment Processing**: Support for card, cash, and gift card payments with mock payment gateway
- **Sync & Settings**: Data synchronization, Clover POS integration, feature flags, and merchant profile management
- **Comprehensive Testing**: Full test coverage with Jest and React Testing Library
- **CI/CD Pipeline**: Automated testing, building, and deployment verification

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd Next.js-typeScript
```

2. Navigate to the web directory and install dependencies:
```bash
cd web
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

### Building for Production

```bash
npm run build
npm start
```

## Usage Instructions

### Sync & Settings Page

Navigate to the **Sync & Settings** page from the main navigation to access all administrative functions:

#### 🔄 Data Sync
- Click "Run Product Sync" to manually trigger synchronization with backend systems
- Monitor sync status and view detailed results
- Automatic cache invalidation ensures fresh data after sync

#### 🔗 Clover Integration
- **Connecting**: Enter your Clover API key and click "Connect"
- **Status**: View connection status, merchant ID, and last sync time
- **Disconnecting**: Click "Disconnect from Clover" to remove integration

#### 🚩 Feature Flags
- Toggle individual features on/off using the switches
- Changes are tracked automatically - save/reset buttons appear when modifications are made
- Click "Save Changes" to apply or "Reset" to revert

#### 👤 Merchant Profile
- Update business information including:
  - Business name and contact details
  - Email and phone number
  - Complete address information
  - Timezone and currency preferences
- Form validation ensures required fields are completed
- Changes are auto-detected with save/reset functionality

### Product Management
- Browse products from the main Products page
- Use search and category filters to find specific items
- Click on any product to edit details, pricing, and kiosk visibility
- Toggle "Visible in Kiosk" to control what customers can see

### Inventory Management
- View current inventory levels from the Inventory page
- Monitor low stock items with automatic alerts
- Track reorder levels and on-hand quantities

## Testing

Run the test suite:
```bash
npm test
```

Run tests in watch mode:
```bash
npm run test:watch
```

### Test Coverage
- **Unit Tests**: All sync & settings components
- **Integration Tests**: Full page functionality
- **Mock APIs**: Complete backend simulation for testing

## Architecture

### Frontend Stack
- **Next.js 15**: React framework with App Router
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first styling
- **Radix UI**: Accessible component primitives
- **React Query**: Server state management
- **React Hook Form**: Form handling with validation
- **Sonner**: Toast notifications

### API Structure
- RESTful API routes under `/api/`
- Type-safe interfaces for all data models
- Mock implementations for development/testing

### Key Components
- `CloverSection`: Clover POS integration management
- `FeatureFlagsSection`: System feature toggles
- `MerchantProfileSection`: Business profile editing
- Reusable UI components with consistent patterns

## Development

### File Structure
```
web/
├── app/                    # Next.js App Router pages
│   ├── api/               # API routes
│   ├── sync/              # Sync & Settings page
│   └── layout.tsx         # Root layout
├── components/            # Reusable components
│   ├── sync/              # Sync & Settings components
│   └── ui/                # Base UI components
├── lib/                   # Utilities and types
└── __tests__/             # Test files
```

### Adding New Features
1. Define TypeScript interfaces in `lib/types.ts`
2. Create API routes under `app/api/`
3. Build UI components in `components/`
4. Add comprehensive tests in `__tests__/`
5. Update this README with usage instructions

## Contributing

1. Create feature branches from the main development branch
2. Follow the existing TypeScript and React patterns
3. Add tests for new functionality
4. Update documentation as needed
5. Ensure all builds and tests pass before submitting

## License

[License information to be added]

- Node.js 18+ and npm

### Installation

1. Install dependencies:
```bash
cd web
npm install
```

2. Set up environment variables:
```bash
cp .env.example .env.local
```

Edit `.env.local` with your Supabase configuration:
```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

3. Set up Supabase Authentication:
   - Create a Supabase project at https://supabase.com
   - Enable Email authentication in Authentication > Settings
   - Create admin users in Authentication > Users
 Next.js 15+

### Installation

1. Clone the repository
2. Navigate to the web directory:
   ```bash
   cd web
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Set up environment variables:
   ```bash
   cp .env.local.example .env.local
   ```
   
   Edit `.env.local` with your configuration:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   ```

### Development

Start the development server:
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view the admin interface.

### Authentication Flow

1. **Unauthenticated users** are redirected to `/auth/login`
2. **Login** with email/password using Supabase Auth
3. **Authenticated users** access the admin dashboard with sidebar navigation
4. **Session management** handles token refresh and logout
5. **Route protection** ensures only authenticated users access admin features

### Testing

Run tests:

The application will be available at `http://localhost:3000`

### Building

Build the application for production:
```bash
npm run build
```
### Testing

Run the test suite:
```bash
npm test
```

Run tests in watch mode:
```bash
npm run test:watch
```

```bash
npm run test:coverage
```
### Building

Build for production:
```bash
npm run build
npm start
```
## Usage

### Authentication

The application uses Supabase authentication with route protection. All admin pages require authentication.

1. Navigate to `/auth/login`
2. Sign in with your credentials
3. Access the admin dashboard

### Admin Dashboard

Access the main dashboard at `/` to:
- View system overview
- Navigate to different modules
- Access quick actions

### Product Management (`/products`)

- View all products in the system
- Search and filter products by name, category, or SKU
- Toggle product visibility in kiosk
- Edit product details inline
- Bulk operations support

### Inventory Management (`/inventory`)

- Monitor stock levels for all products
- View low-stock alerts
- Track inventory changes
- Adjust inventory levels

### Order Management (`/orders`)

- View all orders with comprehensive filtering
- Filter by status, customer, date range
- Update order status
- View detailed order information
- Track order timeline

### Point of Sale (`/checkout`)

The checkout system provides a complete POS interface:

1. **Product Selection**: Browse available products and add them to cart
2. **Cart Management**: 
   - Add/remove items
   - Adjust quantities
   - View itemized pricing
3. **Order Calculation**:
   - Automatic subtotal calculation
   - Tax calculation (8.75%)
   - Total computation
4. **Payment Processing**:
   - Select payment method (Card, Cash, Gift Card)
   - Process payment through secure backend
   - Handle payment success/failure scenarios
5. **Order Completion**:
   - Generate order confirmation
   - Clear cart for next customer
   - Toast notifications for status updates

#### Checkout Workflow

1. Navigate to `/checkout`
2. Select products from the available list by clicking the `+` button
3. Review items in the shopping cart
4. Adjust quantities using `+`/`-` buttons or remove items with trash icon
5. Select preferred payment method
6. Click "Checkout" to process the order
7. Wait for payment confirmation
8. Order complete - cart automatically clears

### Sync Operations (`/sync`)

- Synchronize product data
- Update inventory levels
- Import/export data
### Sync & Settings (`/sync`)

- **Data Synchronization**: Sync products and inventory with external systems
- **Clover POS Integration**: Connect and sync with Clover POS systems
- **Feature Flags**: Enable/disable system features
- **Merchant Profile**: Manage business information and settings

## API Endpoints

### Orders API (`/api/orders`)

#### POST `/api/orders`
Create a new order

**Request Body:**
```json
{
  "items": [
    {
      "clover_item_id": "itm_1001",
      "name": "Product Name",
      "price": 3999,
      "quantity": 2,
      "category": "Category"
    }
  ],
  "subtotal": 7998,
  "tax": 699,
  "total": 8697,
  "payment_method": "card"
}
```

**Response:**
```json
{
  "success": true,
  "order": {
    "id": "order_123",
    "status": "completed",
    "status": "paid",
    "items": [...],
    "total": 8697,
    "created_at": "2024-01-01T00:00:00Z"
  },
  "message": "Order processed successfully"
}
```

#### GET `/api/orders`
Retrieve recent orders

**Response:**
```json
{
  "success": true,
  "orders": [...],
  "count": 10
}
```

Retrieve orders with optional filtering

**Query Parameters:**
- `status` - Filter by order status
- `customer` - Search customer name/email
- `from_date` - Filter orders from date
- `to_date` - Filter orders to date

## Architecture

- **Authentication**: Supabase Auth with route guards
- **Styling**: Tailwind CSS with shadcn/ui components
- **State Management**: React hooks + React Query for server state
- **API**: Next.js API routes with TypeScript
- **Testing**: Jest with React Testing Library
- **Icons**: Lucide React
- **CI/CD**: GitHub Actions

# Next.js App Router
│   ├── api/               # API routes
│   │   └── orders/        # Order management endpoints
│   ├── auth/login/        # Authentication pages
│   ├── checkout/          # POS/Checkout system
│   ├── orders/            # Order management
│   ├── products/          # Product management
│   ├── inventory/         # Inventory management
│   └── sync/              # Sync & Settings
├── components/            # React components
│   ├── auth/              # Authentication components
│   ├── layout/            # Layout components (sidebar, header)
│   ├── orders/            # Order-related components


## Authentication Implementation

### Components

- **AuthProvider**: Manages authentication state and session
- **AuthGuard**: Protects routes and components requiring authentication
- **LoginForm**: Handles user login with error handling
- **AdminLayout**: Secure layout with sidebar, header, and navigation
- **AdminSidebar**: Responsive navigation with user info and logout
- **AdminHeader**: Header with user details and quick logout

### Session Management

- Automatic session restoration on app load
- Token-based API authentication via Authorization headers
- Automatic redirect on session expiration
- Logout functionality with session cleanup

### Security Features

- Route protection for all admin pages
- API requests include authentication headers
- Session validation on protected routes
- Secure token storage via Supabase Auth

## API Integration

The API client automatically includes authentication headers for all requests. Configure backend services to validate the Authorization header containing the Supabase JWT token.

## Contributing

1. Create feature branch from `copilot-generated-branch`
2. Implement changes with tests
3. Run linting and tests: `npm run lint && npm test`
4. Submit pull request

## Environment Variables

See `.env.example` for required environment variables:

- `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase anonymous key
=======
│   ├── supabase.ts        # Supabase client
│   ├── types.ts           # TypeScript type definitions
│   └── api.ts             # API client
└── __tests__/             # Test files
```

## Testing

The application includes comprehensive test coverage for:
- Authentication flow and route guards
- Checkout functionality and user interactions
- Order management and status updates
- Product management features
- API endpoints and data validation
- UI components and user interactions

### Test Categories

- **Unit Tests**: Individual component testing
- **Integration Tests**: Feature workflow testing  
- **API Tests**: Endpoint validation and error handling
- **UI Tests**: User interaction and accessibility

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode (recommended for development)
npm run test:watch

# Run tests with coverage report
npm run test:coverage
```

## CI/CD Pipeline

The project uses GitHub Actions for continuous integration with the following stages:

1. **Lint**: ESLint code quality checks
2. **Type Check**: TypeScript compilation verification  
3. **Test**: Jest unit and integration tests with coverage
4. **Build**: Next.js production build verification

### Matrix Testing

Tests run on multiple Node.js versions (18, 20) to ensure compatibility.

## Development Notes

- The application uses mock data for demonstration purposes
- Payment processing includes simulated success/failure scenarios
- All monetary values are stored in cents for precision
- Tax rate is currently set to 8.75% (configurable)

## Testing

The application includes comprehensive test coverage for:
- Checkout functionality and user interactions
- API endpoints and data validation
- Order processing and payment handling
- Cart management and calculations

Tests use Jest with React Testing Library for frontend testing and Node.js environment for API testing.
- Authentication requires Supabase configuration for full functionality

## Contributing

1. Create a feature branch from `main`
2. Make your changes with appropriate tests
3. Ensure all tests pass: `npm test`
4. Ensure linting passes: `npm run lint`
5. Ensure build succeeds: `npm run build`
6. Create a pull request

The CI pipeline will automatically run tests, linting, and build verification on all pull requests.
