# FNTP Daily Workflow App

A simplified, production-ready practice management system for nutrition professionals.

## Overview

This is the simplified version of the FNTP Nutrition System focused exclusively on daily practice management without AI or assessment features. It provides core functionality for managing clients, appointments, and session notes.

## Core Features

### ✅ **Client Management**

- Add, edit, and organize client information
- Track contact details and health goals
- Client status tracking (active, inactive, archived)
- Search and filter functionality

### ✅ **Appointment Scheduling**

- Schedule client appointments
- Thursday calls management
- Calendar integration
- Appointment history tracking

### ✅ **Session Notes**

- Create detailed session notes
- Progress tracking
- Searchable note archive
- Client-specific note organization

### ✅ **Document Management** (Basic)

- Upload client documents
- Basic file organization
- Secure document storage

## What's NOT Included (Simplified)

❌ AI-powered analysis  
❌ 246-question health assessments  
❌ Automated document processing  
❌ Complex medical data extraction  
❌ AI-generated recommendations

## Tech Stack (Simplified)

- **Frontend**: Next.js 15, React 19, TypeScript
- **UI**: Tailwind CSS, Radix UI
- **Database**: PostgreSQL with Prisma
- **Auth**: JWT-based authentication
- **Deployment**: Vercel-ready

## Getting Started

1. **Install dependencies**:

   ```bash
   npm install
   ```

2. **Set up environment variables**:

   ```bash
   cp .env.example .env.local
   # Add your database URL and JWT secret
   ```

3. **Set up database**:

   ```bash
   npm run db:migrate
   ```

4. **Start development server**:
   ```bash
   npm run dev
   ```

## Project Structure

```
src/
├── app/
│   ├── dashboard/
│   │   ├── clients/          # Client management
│   │   └── scheduled/        # Appointment scheduling
│   ├── api/
│   │   ├── clients/          # Client CRUD operations
│   │   └── notes/           # Notes management
│   └── (auth)/              # Login/signup
├── components/
│   ├── clients/             # Client-related components
│   ├── notes/               # Note-taking components
│   └── ui/                  # Reusable UI components
└── lib/
    ├── auth-context.tsx     # Authentication
    └── database/            # Database utilities
```

## Environment Variables

```env
# Database
DATABASE_URL="postgresql://..."

# Auth
JWT_SECRET="your-secret-key"
NEXTAUTH_SECRET="your-nextauth-secret"

# App
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

## Deployment

This app is optimized for Vercel deployment:

```bash
npm run build
# Deploy to Vercel
```

## Key Differences from Full Version

This simplified version focuses on core practice management:

1. **No AI Dependencies**: Removed Claude AI, AWS services, Google Vision
2. **No Assessment System**: Removed complex health questionnaires
3. **Simplified Document Handling**: Basic upload without AI processing
4. **Streamlined UI**: Focused on essential workflows
5. **Reduced Complexity**: ~70% fewer dependencies

## Development Philosophy

This version follows the "fntp-practice" approach:

- **Production-ready**: Stable, tested features only
- **Simple maintenance**: Minimal dependencies
- **Fast performance**: No heavy AI processing
- **Reliable workflows**: Core features that "just work"

## Daily Workflow Features

### Client Management Dashboard

- View all clients at a glance
- Quick client search and filtering
- Client status updates
- Contact information management

### Appointment System

- Thursday calls scheduling
- Individual client appointments
- Calendar view of upcoming sessions
- Session history tracking

### Note Taking System

- Session-specific notes
- Progress tracking
- Searchable note database
- Template-based note creation

### Document Organization

- Basic file upload for client documents
- Secure document storage
- File organization by client
- Download and viewing capabilities

## Support

For support with the simplified daily workflow app:

1. Check existing client and note management features
2. Review appointment scheduling functionality
3. Test document upload capabilities

Built for nutrition professionals who want reliable practice management without complexity.

## Version History

- **v1.0.0** - Initial simplified daily workflow app
- Removed AI assessment features
- Focus on core practice management
- Production-ready stability
