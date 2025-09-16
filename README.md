# Zenith Nutrition Kiosk App

A React Native (Expo) self-checkout kiosk application for Zenith Nutrition stores. This app provides a guest-only checkout experience with barcode scanning, product browsing, cart management, and payment processing.

## Features

### Core Functionality
- **Barcode Scanning**: Scan product UPCs using device camera (expo-barcode-scanner)
- **Product Browsing**: Browse and search available products with filtering
- **Cart Management**: Add, remove, and adjust quantities with real-time totals
- **Checkout Process**: Complete orders with Clover Mini integration (configurable)
- **Guest Checkout Only**: No user registration or staff login required

### UX Features
- **Large Touch Targets**: Optimized for kiosk use with finger-friendly UI
- **Idle Timer**: Auto-reset to scan screen after configurable inactivity
- **Need Help Button**: Easy access to assistance prompts
- **Clear Messaging**: Intuitive navigation and user feedback
- **Responsive Design**: Works on tablets and large phone screens

### Technical Features
- **TypeScript**: Full type safety throughout the application
- **Context API**: Global cart state management
- **Environment Configuration**: Configurable API endpoints and settings
- **Mock API**: Built-in mock data for development and testing
- **Error Handling**: Comprehensive error handling with user-friendly messages

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── Button.tsx      # Primary button component
│   ├── Header.tsx      # App header with branding
│   ├── ProductCard.tsx # Product display card
│   └── index.ts        # Component exports
├── screens/            # Main application screens
│   ├── ScanScreen.tsx      # Barcode scanning interface
│   ├── BrowseScreen.tsx    # Product browsing and search
│   ├── CartScreen.tsx      # Cart management
│   ├── CheckoutScreen.tsx  # Order review and payment
│   ├── SuccessScreen.tsx   # Order completion
│   └── index.ts            # Screen exports
├── context/            # React Context providers
│   └── CartContext.tsx # Global cart state management
├── services/           # API and external services
│   └── api.ts          # API service layer with mock data
├── constants/          # App configuration and constants
│   ├── config.ts       # Environment and API configuration
│   └── theme.ts        # Colors, sizes, and styling constants
├── types/              # TypeScript type definitions
│   └── index.ts        # Shared type definitions
└── utils/              # Utility functions and hooks
    └── useIdleTimer.ts # Idle timeout management
```

## Setup & Installation

### Prerequisites
- Node.js 18+ and npm
- Expo CLI (`npm install -g @expo/cli`)
- iOS Simulator (for iOS development) or Android Studio (for Android)

### Installation
1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd supplement-pos-ios
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create environment configuration:
   ```bash
   cp .env.example .env
   ```

4. Configure your environment variables in `.env`:
   ```env
   API_BASE=https://api.zenithnutrition.com
   MERCHANT_ID=zenith_store_001
   KIOSK_AUTH_TOKEN=your_jwt_token_or_api_key_here
   KIOSK_ID=kiosk_001
   IDLE_TIMEOUT_MINUTES=2
   AUTO_RESET_ENABLED=true
   CLOVER_MINI_ENABLED=true
   CLOVER_APP_ID=your_clover_app_id
   DEBUG_MODE=false
   ```

## Development

### Running the App
```bash
# Start the development server
npm start

# Run on iOS simulator
npm run ios

# Run on Android emulator/device
npm run android

# Run on web browser
npm run web
```

### Environment Configuration
The app uses environment variables for configuration. See `.env.example` for all available options:

- **API_BASE**: Backend API base URL
- **MERCHANT_ID**: Unique merchant identifier
- **KIOSK_AUTH_TOKEN**: Authentication token for API requests
- **KIOSK_ID**: Unique kiosk identifier
- **IDLE_TIMEOUT_MINUTES**: Minutes before auto-reset (default: 2)
- **AUTO_RESET_ENABLED**: Enable/disable idle timeout
- **CLOVER_MINI_ENABLED**: Enable Clover Mini payment integration
- **DEBUG_MODE**: Enable debug logging

### Theme and Branding
The app uses a consistent theme defined in `src/constants/theme.ts`:
- **Primary Colors**: Blue (#2B6CB0), Orange (#ED8936), Grey (#4A5568)
- **Zenith Nutrition Branding**: Logo placeholders and consistent branding
- **Large Touch Targets**: Minimum 44pt touch targets for accessibility

## API Integration

### Endpoints
The app expects these backend endpoints:

- `GET /api/products` - Get all kiosk-visible products
- `GET /api/products/upc/:upc` - Get product by UPC code
- `POST /api/checkout` - Process checkout order
- `GET /api/health` - Health check

### Mock Data
During development, the app uses built-in mock data:
- 4 sample products with different categories
- Simulated API delays for realistic testing
- Mock checkout responses with Clover Mini support

### Authentication
API requests include these headers:
- `Authorization: Bearer {KIOSK_AUTH_TOKEN}`
- `X-Kiosk-ID: {KIOSK_ID}`
- `X-Merchant-ID: {MERCHANT_ID}`

## Deployment

### Building for Production
```bash
# Create production build
expo build:ios
expo build:android

# Or using EAS Build (recommended)
eas build --platform ios
eas build --platform android
```

### Kiosk Deployment
1. Build the app for your target platform
2. Configure environment variables for production
3. Install on kiosk hardware
4. Configure kiosk mode in device settings (disable home button, etc.)
5. Set app as default launcher

### Environment Setup
For production deployment:
1. Set production API endpoints in `.env`
2. Configure authentication tokens
3. Set appropriate idle timeout values
4. Enable/disable Clover Mini integration as needed

## Configuration

### Per-Device Configuration
Each kiosk should be configured with:
- Unique `KIOSK_ID`
- Correct `MERCHANT_ID` for the store
- Valid `KIOSK_AUTH_TOKEN`
- Store-specific `API_BASE` URL

### Clover Mini Integration
If using Clover Mini devices:
1. Set `CLOVER_MINI_ENABLED=true`
2. Configure `CLOVER_APP_ID`
3. Ensure Clover Mini device is connected and configured
4. Test payment flow thoroughly

## Troubleshooting

### Common Issues
1. **Camera Permission Denied**: Ensure app has camera permissions
2. **Network Errors**: Check API endpoint configuration and connectivity
3. **Barcode Scanning Issues**: Verify lighting and barcode quality
4. **Idle Timer Not Working**: Check `AUTO_RESET_ENABLED` configuration

### Development Issues
1. **Metro bundler issues**: Try `npx expo start --clear`
2. **Dependency conflicts**: Delete `node_modules` and run `npm install`
3. **TypeScript errors**: Run `npx tsc --noEmit` to check types

## Contributing

1. Follow the existing code style and structure
2. Add TypeScript types for new features
3. Update this README for significant changes
4. Test on both iOS and Android platforms
5. Ensure accessibility compliance (large touch targets, etc.)

## License

Copyright © 2024 Zenith Nutrition. All rights reserved.