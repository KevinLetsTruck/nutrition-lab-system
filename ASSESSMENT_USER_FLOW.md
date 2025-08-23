# Assessment User Flow Documentation

## Overview

The FNTP Assessment System now has a complete user-facing flow for clients to take health assessments. The system provides a seamless experience from registration to assessment completion.

## User Journey

### 1. Landing Page (`/`)

- Clean, professional landing page explaining the assessment
- Two primary CTAs: "Start Your Assessment" (register) and "Already Have an Account" (login)
- Automatically redirects logged-in users to their appropriate destination

### 2. Registration (`/register`)

- Simple form requiring:
  - Full Name
  - Email
  - Password (min 6 characters)
- Creates both User and Client records
- Automatically assigns CLIENT role
- Redirects to login page after successful registration

### 3. Login (`/login`)

- Email and password authentication
- Shows success message if just registered
- CLIENT users are redirected to `/assessment`
- Admin users are redirected to `/dashboard/clients`

### 4. Assessment (`/assessment`)

- **First Visit**: Shows welcome screen with instructions
- **Progress Tracking**: Visual progress bar shows completion percentage
- **Question Types Supported**:
  - LIKERT_SCALE (1-10 numeric scale)
  - YES_NO (simple radio buttons)
  - MULTIPLE_CHOICE (single selection)
  - MULTI_SELECT (checkbox group)
  - FREQUENCY (predefined options)
  - DURATION (time-based options)
  - TEXT (free text input)
  - NUMBER (numeric input)
- **Auto-save**: Every answer is automatically saved
- **Resume Feature**: Can exit and return anytime
- **Module-based**: Progresses through SCREENING → ASSIMILATION → TRANSPORT → COMMUNICATION → STRUCTURAL

### 5. Completion (`/assessment/complete`)

- Celebration page with confetti animation
- Congratulations message
- Clear next steps explanation
- Sign out button

## Key Features

### Security & Access Control

- Protected routes requiring authentication
- CLIENT users can only access assessment pages
- Automatic session management
- JWT token-based authentication

### User Experience

- Dark theme with professional design
- Mobile-responsive layout
- Clear progress indication
- Helpful error messages
- Loading states for all async operations

### Data Persistence

- Responses saved immediately after each answer
- Assessment progress tracked in database
- Can resume from exact question where left off
- Handles page refreshes gracefully

## Technical Implementation

### Frontend Routes

- `/(auth)/register` - Registration page
- `/(auth)/login` - Login page
- `/(protected)/assessment` - Main assessment UI
- `/(protected)/assessment/complete` - Completion page

### API Endpoints

- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User authentication
- `GET /api/assessment/client/[clientId]` - Get client's assessment
- `POST /api/assessment` - Create new assessment
- `GET /api/assessment/[id]/next-question` - Get next question
- `POST /api/assessment/[id]/response` - Submit answer

### Database Updates

- User registration creates Client record automatically
- Responses stored with full context (question text, module, type)
- Assessment tracks current module and questions answered

## Testing the Flow

1. **Register a new account**:

   - Go to http://localhost:3000
   - Click "Start Your Assessment"
   - Fill in registration form
   - You'll be redirected to login

2. **Login and start assessment**:

   - Login with your credentials
   - You'll see the welcome screen
   - Click "Start Assessment"
   - Answer questions at your own pace

3. **Test resume functionality**:

   - Click "Exit" at any point
   - Login again
   - You'll continue from where you left off

4. **Complete assessment**:
   - Answer all questions
   - See the celebration page
   - Click "Sign Out" to end session

## Future Enhancements

While the current implementation is fully functional, potential improvements include:

- Email verification for new accounts
- Password reset functionality
- Progress email reminders for incomplete assessments
- PDF export of responses for clients
- Multi-language support
