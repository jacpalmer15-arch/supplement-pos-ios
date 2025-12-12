# Authentication Test Plan

## Overview
Test plan for Zenith Solution Self-Checkout admin authentication system using Supabase.

## Test Environment Setup

### Prerequisites
1. Create a Supabase project at https://supabase.com
2. Copy the project URL and anon key to `.env.local`
3. Enable Google OAuth in Supabase auth providers (optional)
4. Configure redirect URLs in Supabase

### Environment Configuration
```bash
# Copy .env.local.example to .env.local
cp .env.local.example .env.local

# Fill in your Supabase credentials:
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

## Manual Test Cases

### 1. Route Protection
**Test**: Unauthenticated access to protected routes
- Navigate to `http://localhost:3000`
- **Expected**: Should redirect to `/login`
- **Status**: ✅ PASS - Redirects properly to login page

### 2. Login Page UI
**Test**: Login form display and validation
- Navigate to `/login`
- **Expected**: 
  - Login form with email/password fields
  - Google sign-in button
  - Sign up toggle
  - Form validation (button disabled until fields filled)
- **Status**: ✅ PASS - All UI elements present and functional

### 3. Email/Password Authentication
**Test**: Sign up flow
- Fill email and password (6+ chars)
- Click "Create Account" toggle
- Submit form
- **Expected**: Account creation or error message
- **Status**: ⏸️ PENDING - Requires Supabase configuration

**Test**: Sign in flow  
- Fill valid credentials
- Submit form
- **Expected**: Successful login and redirect to dashboard
- **Status**: ⏸️ PENDING - Requires Supabase configuration

### 4. Google OAuth
**Test**: Google authentication
- Click "Sign in with Google"
- **Expected**: Google OAuth flow initiation
- **Status**: ⏸️ PENDING - Requires Supabase and Google OAuth setup

### 5. Authenticated Layout
**Test**: Admin navigation and user info
- After successful login
- **Expected**: 
  - Header with navigation links (Products, Inventory, Sync)
  - User email display
  - Logout button
- **Status**: ⏸️ PENDING - Requires successful authentication

### 6. Logout Flow
**Test**: Sign out functionality
- Click logout button when authenticated
- **Expected**: 
  - Successful logout
  - Redirect to login page
  - Toast notification
- **Status**: ⏸️ PENDING - Requires successful authentication

### 7. API Token Injection
**Test**: JWT attachment to API requests
- Make API requests while authenticated
- **Expected**: Authorization header with Bearer token
- **Status**: 🔄 IMPLEMENTED - Code ready, needs integration testing

## Automated Tests (Future Implementation)

### Jest/Testing Library Tests
- Authentication context provider
- Login form validation
- Route protection middleware
- API client token injection

### Cypress E2E Tests
- Complete authentication flows
- Route protection scenarios
- Session persistence

## Known Issues / Limitations

1. **Environment Setup Required**: Tests require actual Supabase project configuration
2. **Google OAuth**: Requires additional setup in Google Console
3. **Backend Integration**: API token validation needs backend implementation

## Success Criteria

- [x] Login page renders correctly
- [x] Form validation works
- [x] Route protection implemented
- [x] JWT token injection in API client
- [x] Responsive UI design
- [ ] Email/password auth flow (pending Supabase config)
- [ ] Google OAuth flow (pending setup)
- [ ] Session persistence across page reloads
- [ ] Proper logout functionality

## Security Considerations

- ✅ JWT tokens securely handled by Supabase SDK
- ✅ Environment variables for sensitive configuration
- ✅ Route-level authentication checks
- ✅ Automatic token refresh handled by Supabase
- ✅ Secure session storage