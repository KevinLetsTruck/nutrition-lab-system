# DestinationHealth Authentication & Onboarding System

## Overview

This document describes the comprehensive authentication and onboarding system implemented for DestinationHealth, Kevin Rutherford's FNTP practice. The system provides a complete client flow from initial interest through successful onboarding, positioning clients for consultation calls.

## System Architecture

### Authentication Infrastructure

The system includes:

- **User Management**: Secure user registration and login with JWT tokens
- **Email Verification**: Required email verification before onboarding access
- **Session Management**: 24-hour JWT tokens with secure cookie storage
- **Rate Limiting**: Protection against brute force attacks
- **Password Security**: Strong password requirements with bcrypt hashing
- **Role-Based Access**: Client and admin user roles with different permissions

### Database Schema

The authentication system uses the following tables:

- `users` - Core user authentication data
- `client_profiles` - Client-specific profile information
- `admin_profiles` - Admin user profiles and capacity data
- `email_sequences` - Email automation tracking
- `user_sessions` - JWT session management
- `rate_limits` - Rate limiting for security
- `admin_permissions` - Granular admin permissions

## Installation & Setup

### 1. Environment Variables

Add the following environment variables to your `.env.local` file:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# JWT Configuration
JWT_SECRET=your_secure_jwt_secret_key

# Email Configuration (Resend)
RESEND_API_KEY=your_resend_api_key

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Admin Configuration (optional)
ADMIN_PASSWORD=your_admin_password
```

### 2. Database Migration

Run the authentication system migration:

```bash
npm run db:migrate:auth
```

This will:
- Create all necessary database tables
- Set up the default admin user (kevin@destinationhealth.com)
- Configure admin permissions
- Test the authentication system

### 3. Dependencies

The system requires these additional dependencies:

```bash
npm install bcryptjs jsonwebtoken @types/bcryptjs @types/jsonwebtoken
```

## User Flow

### 1. Landing Page

The landing page (`/`) features:
- DestinationHealth branding with green color scheme
- Clear call-to-action buttons
- Professional truck driver health messaging
- Navigation to authentication

### 2. Authentication Flow

#### Registration (`/auth`)
- User-friendly registration form
- Password strength validation
- Email and phone number validation
- Automatic email verification sending

#### Login (`/auth`)
- Secure login with email/password
- Rate limiting protection
- JWT token generation
- Session management

#### Email Verification (`/verify-email`)
- Email verification page
- Token validation
- Success/error handling
- Automatic redirect after verification

### 3. Onboarding Integration

The existing onboarding system has been updated to:
- Remove "Owner Operator" from route type options
- Integrate with authentication system
- Require email verification before access
- Track completion status

### 4. Success Page

After completing onboarding, users see:
- Welcome message with next steps
- Clear timeline for discovery call
- Contact information
- Professional presentation

## Email Automation

### Welcome Email Sequence

The system includes a comprehensive email sequence:

1. **Immediate Welcome** (0 hours)
   - Personalized greeting
   - Next steps overview
   - Kevin's introduction

2. **Discovery Call Prep** (24 hours)
   - Call preparation tips
   - Common questions
   - Truck driver-specific advice

3. **Resource Delivery** (72 hours)
   - Free health resources
   - Truck stop nutrition guide
   - Success stories

4. **Coaching Invitation** (168 hours)
   - Session scheduling
   - Program overview
   - Special offers

### Email Templates

All emails feature:
- Professional DestinationHealth branding
- Mobile-responsive design
- Clear call-to-action buttons
- Truck driver-specific content

## Security Features

### Password Requirements
- Minimum 8 characters
- Mixed case (uppercase and lowercase)
- Numbers required
- Real-time validation

### Rate Limiting
- 5 attempts per hour for login
- 5 attempts per hour for registration
- 15-minute lockout after max attempts
- IP-based tracking

### Session Security
- 24-hour JWT token expiration
- HTTP-only cookies
- Secure cookie settings in production
- Session invalidation on logout

### Data Protection
- All passwords hashed with bcrypt (12 rounds)
- PII encrypted at rest
- HIPAA-compliant data handling
- Secure API endpoints

## API Endpoints

### Authentication Endpoints

- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `POST /api/auth/verify-email` - Email verification
- `GET /api/auth/me` - Get current user

### Request/Response Examples

#### Registration
```javascript
POST /api/auth/register
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "phone": "555-123-4567",
  "password": "SecurePass123!"
}

Response:
{
  "success": true,
  "message": "Registration successful. Please check your email to verify your account.",
  "user": {
    "id": "uuid",
    "email": "john@example.com",
    "role": "client"
  }
}
```

#### Login
```javascript
POST /api/auth/login
{
  "email": "john@example.com",
  "password": "SecurePass123!"
}

Response:
{
  "success": true,
  "message": "Login successful",
  "user": {
    "id": "uuid",
    "email": "john@example.com",
    "role": "client",
    "emailVerified": true,
    "onboardingCompleted": false
  }
}
```

## React Components & Hooks

### AuthProvider

The `AuthProvider` wraps the entire application and provides:

```javascript
const { user, profile, loading, login, register, logout, verifyEmail } = useAuth()
```

### Protected Routes

Use these hooks for route protection:

```javascript
// Require authentication
const { user, loading } = useRequireAuth()

// Require admin access
const { user, loading } = useRequireAdmin()
```

## Admin Features

### Default Admin User
- Email: kevin@destinationhealth.com
- Role: admin
- Permissions: All system permissions
- Password: Set during migration (change after first login)

### Admin Capabilities
- View all clients
- Edit client data
- Send emails
- Generate reports
- Manage protocols
- System administration

## Testing

### Manual Testing

1. **Registration Flow**
   ```bash
   # Start the development server
   npm run dev
   
   # Navigate to /auth
   # Test registration with valid data
   # Check email verification
   ```

2. **Login Flow**
   ```bash
   # Test login with verified account
   # Test login with unverified account
   # Test rate limiting
   ```

3. **Onboarding Integration**
   ```bash
   # Complete onboarding flow
   # Verify authentication requirements
   # Test success page
   ```

### Automated Testing

Run the test suite:

```bash
npm run test
```

## Deployment

### Production Checklist

- [ ] Set secure JWT_SECRET
- [ ] Configure production email service
- [ ] Update environment variables
- [ ] Run database migration
- [ ] Test all authentication flows
- [ ] Verify email templates
- [ ] Check security headers
- [ ] Test rate limiting

### Environment Variables for Production

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_production_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_production_service_key
JWT_SECRET=your_very_secure_jwt_secret
RESEND_API_KEY=your_production_resend_key
NEXT_PUBLIC_APP_URL=https://destinationhealth.com
```

## Monitoring & Analytics

### Key Metrics

- Registration completion rate (target: >85%)
- Email verification rate (target: >90%)
- Onboarding completion rate (target: >80%)
- Time from registration to first call (target: <48 hours)
- Email sequence engagement (target: >60% open rate)

### Error Tracking

The system includes comprehensive error logging:
- Authentication failures
- Email delivery issues
- Database errors
- Rate limiting events

## Troubleshooting

### Common Issues

1. **Email Verification Not Working**
   - Check RESEND_API_KEY configuration
   - Verify email template setup
   - Check spam folder

2. **Database Migration Errors**
   - Ensure Supabase service role key is correct
   - Check database permissions
   - Verify SQL syntax

3. **JWT Token Issues**
   - Verify JWT_SECRET is set
   - Check token expiration settings
   - Ensure secure cookie configuration

### Support

For technical support:
- Check the logs for error messages
- Verify environment variable configuration
- Test with the provided scripts
- Contact the development team

## Future Enhancements

### Planned Features

1. **Two-Factor Authentication**
   - SMS-based 2FA
   - Authenticator app support

2. **Advanced Email Sequences**
   - Dynamic content based on user data
   - A/B testing capabilities
   - Advanced analytics

3. **Admin Dashboard**
   - Client management interface
   - Email sequence management
   - Analytics dashboard

4. **Mobile App**
   - React Native implementation
   - Push notifications
   - Offline capabilities

## Conclusion

The DestinationHealth authentication and onboarding system provides a comprehensive, secure, and user-friendly experience for clients. The system is designed to scale with the business while maintaining security and compliance standards.

For questions or support, please contact the development team. 