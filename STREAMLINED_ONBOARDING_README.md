# Streamlined FNTP Client Onboarding System

## Overview

A mobile-first, truck driver-optimized onboarding system designed to collect essential client information in 5-10 minutes. This system focuses on information NOT covered in NutriQ assessments to avoid redundancy and respect the time of busy professionals.

## Key Features

### 🎯 **Streamlined Design**
- **6 essential steps** instead of 8+ comprehensive steps
- **Mobile-first responsive design** with large touch targets
- **Progressive disclosure** - show relevant fields only when needed
- **Auto-save functionality** to prevent data loss

### 🚛 **Truck Driver Optimized**
- **Large touch targets** for easy mobile interaction
- **Simple language** and clear instructions
- **Minimal typing** - dropdowns, sliders, and checkboxes where possible
- **Truck-specific questions** (route type, schedule pattern, DOT status)

### 📱 **Mobile-First Experience**
- **Responsive design** that works on all screen sizes
- **Touch-friendly interface** with 44px+ touch targets
- **Optimized for one-handed use** on mobile devices
- **Fast loading** with minimal network requests

## Database Schema

### `client_onboarding` Table

```sql
CREATE TABLE client_onboarding (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  
  -- Basic Demographics
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  
  -- Current Diet Approach
  current_diet_approach VARCHAR(50) NOT NULL, -- 'low_carb_paleo', 'keto_paleo', 'carnivore'
  diet_duration_months INTEGER,
  
  -- Current Prescriptions/Supplements
  current_medications TEXT,
  current_supplements TEXT,
  
  -- Coaching Priority
  primary_health_goal TEXT NOT NULL,
  
  -- Truck Driver Specific Information
  years_driving INTEGER,
  route_type VARCHAR(20), -- 'otr', 'regional', 'local'
  schedule_pattern VARCHAR(20), -- 'standard', 'irregular', 'night_shifts'
  
  -- DOT Medical Status
  dot_medical_status VARCHAR(20), -- 'current', 'expired', 'upcoming'
  dot_expiry_date DATE,
  
  -- Progress Tracking
  current_step VARCHAR(50) DEFAULT 'demographics',
  progress_percentage INTEGER DEFAULT 0,
  is_completed BOOLEAN DEFAULT FALSE,
  
  -- Session Management
  session_token VARCHAR(255) UNIQUE,
  last_activity TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP,
  
  -- Timestamps
  started_at TIMESTAMP DEFAULT NOW(),
  completed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

## Onboarding Steps

### 1. **Basic Demographics** (1-2 minutes)
- First Name
- Last Name
- Email Address
- Phone Number

### 2. **Current Diet** (1-2 minutes)
- Diet Approach (Low Carb Paleo, Keto with Paleo Rules, Carnivore)
- Duration (optional)

### 3. **Medications & Supplements** (1-2 minutes)
- Current prescription medications (text area)
- Current supplements (text area)
- Quick-add buttons for common items

### 4. **Health Goals** (1-2 minutes)
- Primary health goal (text area)
- Pre-defined goal suggestions for quick selection

### 5. **Truck Driver Information** (2-3 minutes)
- Years of professional driving (slider)
- Route type (OTR/Regional/Local)
- Schedule pattern (Standard/Irregular/Night shifts)

### 6. **DOT Medical Status** (1-2 minutes)
- Current/Expired/Upcoming status
- Expiry date (conditional field)

## Installation & Setup

### 1. Install Dependencies

```bash
npm install zod react-hook-form @hookform/resolvers
```

### 2. Run Database Migration

```bash
npm run db:migrate:streamlined
```

### 3. Access the Onboarding

Navigate to `/streamlined-onboarding` in your application.

## API Endpoints

### POST `/api/streamlined-onboarding`

**Actions:**
- `create_session` - Create new onboarding session
- `get_session` - Retrieve existing session
- `save_step` - Save step data
- `complete_onboarding` - Mark onboarding as complete

**Example:**
```javascript
const response = await fetch('/api/streamlined-onboarding', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    action: 'save_step',
    data: { step: 'demographics', stepData: { first_name: 'John', last_name: 'Doe' } }
  })
})
```

### GET `/api/streamlined-onboarding`

**Actions:**
- `get_session` - Get current session
- `get_data` - Get onboarding data

**Example:**
```javascript
const response = await fetch('/api/streamlined-onboarding?action=get_session')
```

## Components Structure

```
src/components/onboarding/
├── streamlined-onboarding-wizard.tsx    # Main wizard component
├── streamlined-progress.tsx             # Progress indicator
└── steps/
    ├── streamlined-demographics.tsx     # Basic info step
    ├── streamlined-diet.tsx             # Diet approach step
    ├── streamlined-medications.tsx      # Medications step
    ├── streamlined-goals.tsx            # Health goals step
    ├── streamlined-truck-info.tsx       # Truck driver info step
    └── streamlined-dot-status.tsx       # DOT status step
```

## Validation Schemas

All form validation is handled by Zod schemas in `src/lib/onboarding-schemas.ts`:

- `demographicsSchema` - Basic contact information
- `dietSchema` - Current diet approach
- `medicationsSchema` - Medications and supplements
- `goalsSchema` - Health goals
- `truckDriverSchema` - Truck driver information
- `dotStatusSchema` - DOT medical status

## Session Management

### Features
- **24-hour session expiry** for security
- **Auto-save on every field change** to prevent data loss
- **Resume from where you left off** using session cookies
- **Cross-device compatibility** via session tokens

### Session Flow
1. User starts onboarding → Session created
2. Session token stored in HTTP-only cookie
3. Data auto-saved on each step
4. Session activity updated on each interaction
5. On completion → Session marked complete and cookie cleared

## Mobile Optimization

### Design Principles
- **44px minimum touch targets** for accessibility
- **Large, readable fonts** (16px minimum)
- **High contrast colors** for visibility
- **Simple navigation** with clear back/forward buttons

### Responsive Breakpoints
- **Mobile**: 320px - 768px (primary target)
- **Tablet**: 768px - 1024px
- **Desktop**: 1024px+ (fallback)

## Integration with Existing System

### Client Management
- Links to existing `clients` table via `client_id`
- Maintains compatibility with current client workflow
- Can be used alongside existing comprehensive onboarding

### Lab Analysis Workflow
- Onboarding data available for lab report analysis
- Truck driver context enhances personalized recommendations
- DOT status helps prioritize health interventions

## Testing

### Manual Testing Checklist
- [ ] Mobile responsiveness on various screen sizes
- [ ] Touch target accessibility (44px minimum)
- [ ] Auto-save functionality
- [ ] Session persistence across browser refresh
- [ ] Form validation on all steps
- [ ] Progress indicator accuracy
- [ ] Error handling and recovery

### Automated Testing
```bash
# Run linting
npm run lint

# Run type checking
npx tsc --noEmit

# Run build test
npm run build
```

## Performance Considerations

### Optimization Features
- **Lazy loading** of step components
- **Minimal re-renders** with React.memo
- **Efficient state management** with useCallback
- **Optimized database queries** with proper indexing

### Monitoring
- Session creation/expiry rates
- Step completion times
- Error rates by step
- Mobile vs desktop usage patterns

## Security

### Data Protection
- **HTTP-only cookies** for session management
- **Input validation** on both client and server
- **SQL injection prevention** via parameterized queries
- **Session expiry** to prevent unauthorized access

### Privacy
- **Minimal data collection** - only essential information
- **Clear data usage** policies
- **Secure data transmission** via HTTPS
- **Data retention** policies for incomplete sessions

## Troubleshooting

### Common Issues

**Session not persisting:**
- Check cookie settings and domain configuration
- Verify session token generation
- Check browser privacy settings

**Form validation errors:**
- Verify Zod schema definitions
- Check input field types and constraints
- Review error message display logic

**Mobile display issues:**
- Test on actual mobile devices
- Check viewport meta tag
- Verify CSS media queries

### Debug Mode
Enable debug logging by setting `NODE_ENV=development` and checking browser console for detailed error messages.

## Future Enhancements

### Planned Features
- **Multi-language support** for international truck drivers
- **Voice input** for hands-free completion
- **Offline support** with local storage
- **Integration with DOT medical providers**
- **Automated reminder system** for incomplete onboarding

### Analytics Integration
- **Step completion tracking**
- **Time spent per step**
- **Drop-off point analysis**
- **Mobile vs desktop conversion rates**

## Support

For technical support or questions about the streamlined onboarding system:

1. Check this README for common solutions
2. Review the component documentation
3. Test with the provided migration script
4. Contact the development team for complex issues

---

**Last Updated**: December 2024
**Version**: 1.0.0
**Compatibility**: Next.js 14+, Supabase 2.x 