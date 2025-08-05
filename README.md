# Nutrition Lab Management System

A comprehensive web application for managing nutrition lab reports, client data, and AI-powered analysis.

## Features

- **Lab Report Management**: Upload and analyze various types of lab reports (NutriQ, KBMO, Dutch, CGM, Food Photos)
- **Client Management**: Complete client profiles with medical history and contact information
- **AI Analysis**: Claude-powered analysis of lab reports and food photos
- **Interactive Database**: Terminal-based query interface for database operations
- **Migration System**: Automated database schema management
- **Sample Data**: Comprehensive seeding system for development

## Quick Start

### 1. Environment Setup

Create a `.env.local` file with your Supabase credentials:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
ANTHROPIC_API_KEY=your_claude_api_key
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Database Setup

```bash
# Run database migrations
npm run db:migrate

# Seed with sample data
npm run db:seed

# Test database connection
npm run db:query test
```

### 4. Start Development Server

```bash
npm run dev
```

## Database System

The system includes a powerful database layer with:

### Interactive Query Runner

```bash
# Start interactive mode
npm run db:query

# Quick commands
npm run db:query tables    # Show all tables
npm run db:query clients   # Show clients
npm run db:query reports   # Show lab reports
npm run db:query summary   # Show client summary
```

### Migration System

```bash
# Run migrations
npm run db:migrate

# Check status
node scripts/migrate.js status

# Create new migration
node scripts/migrate.js create add_new_feature
```

### Database Utilities

```typescript
import { db } from '@/lib/supabase'

// Get clients
const clients = await db.getClients()

// Create lab report
const report = await db.createLabReport({
  client_id: clientId,
  report_type: 'nutriq',
  report_date: '2024-01-15'
})
```

## Project Structure

```
nutrition-lab-system/
├── database/
│   └── migrations/          # Database schema files
├── docs/
│   ├── API.md              # API documentation
│   └── DATABASE.md         # Database system guide
├── scripts/
│   ├── query-runner.js     # Interactive SQL interface
│   ├── migrate.js          # Migration system
│   └── seed.js             # Sample data seeder
├── src/
│   ├── app/                # Next.js app router
│   ├── components/         # React components
│   └── lib/
│       ├── supabase.ts     # Database utilities
│       └── lab-analyzers/  # AI analysis modules
└── uploads/                # File uploads
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run db:query` - Interactive database query runner
- `npm run db:migrate` - Run database migrations
- `npm run db:seed` - Seed database with sample data

## Database Schema

The system supports multiple types of lab reports:

- **NutriQ/NAQ**: Nutritional assessment questionnaires
- **KBMO**: Food sensitivity testing
- **Dutch**: Hormone testing
- **CGM**: Continuous glucose monitoring
- **Food Photos**: AI-powered food analysis

## Documentation

- [Database System Guide](docs/DATABASE.md) - Complete database documentation
- [API Documentation](docs/API.md) - API endpoints and usage

## Development

### Adding New Features

1. Create a migration: `node scripts/migrate.js create feature_name`
2. Update database utilities in `src/lib/supabase.ts`
3. Add components in `src/components/`
4. Update API routes in `src/app/api/`

### Testing Database Changes

```bash
# Test connection
npm run db:query test

# View table structure
npm run db:query
db> desc table_name

# Run custom queries
db> SELECT * FROM clients LIMIT 5;
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - see LICENSE file for details.
# Build fix applied
# Trigger deployment
# Force deployment Tue Aug  5 05:20:09 PDT 2025
