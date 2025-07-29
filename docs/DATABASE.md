# Nutrition Lab Database System

This document provides comprehensive information about the database layer and query system for the Nutrition Lab Management System.

## Overview

The database system is built on Supabase (PostgreSQL) and includes:

- **Complete Schema**: Tables for clients, lab reports, test results, and processing queue
- **Interactive Query Runner**: Terminal-based SQL interface
- **Migration System**: Automated schema management
- **Database Utilities**: TypeScript/JavaScript utilities for CRUD operations
- **Sample Data**: Seeding scripts for development and testing

## Database Schema

### Core Tables

#### `clients`
Stores client information including medical history and contact details.

```sql
CREATE TABLE clients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    date_of_birth DATE,
    phone VARCHAR(20),
    address TEXT,
    emergency_contact VARCHAR(255),
    medical_history TEXT,
    allergies TEXT,
    current_medications TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### `lab_reports`
Main container for all types of lab reports and assessments.

```sql
CREATE TABLE lab_reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    report_type report_type NOT NULL,
    report_date DATE NOT NULL,
    status processing_status DEFAULT 'pending',
    file_path VARCHAR(500),
    file_size INTEGER,
    analysis_results JSONB,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### `nutriq_results`
Stores NutriQ/NAQ assessment results with detailed scoring.

#### `kbmo_results`
Stores KBMO food sensitivity test results.

#### `dutch_results`
Stores Dutch hormone test results.

#### `cgm_data`
Stores continuous glucose monitoring data points.

#### `food_photos`
Stores food photo analysis results.

#### `processing_queue`
Manages background processing tasks.

### Enums

```sql
CREATE TYPE report_type AS ENUM ('nutriq', 'kbmo', 'dutch', 'cgm', 'food_photo');
CREATE TYPE processing_status AS ENUM ('pending', 'processing', 'completed', 'failed');
CREATE TYPE meal_type AS ENUM ('breakfast', 'lunch', 'dinner', 'snack');
```

## Setup Instructions

### 1. Environment Variables

Create a `.env.local` file with your Supabase credentials:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### 2. Run Migrations

```bash
# Run all pending migrations
npm run db:migrate

# Check migration status
node scripts/migrate.js status

# Create a new migration
node scripts/migrate.js create add_new_table
```

### 3. Seed Sample Data

```bash
# Seed with sample data
npm run db:seed

# Clear all data
node scripts/seed.js clear

# Reset (clear + seed)
node scripts/seed.js reset
```

## Interactive Query Runner

The query runner provides a powerful terminal interface for database operations.

### Usage

```bash
# Start interactive mode
npm run db:query

# Run specific commands
npm run db:query tables
npm run db:query clients
npm run db:query reports
npm run db:query test
```

### Commands

- `tables` - Show all database tables
- `clients` - Show clients (first 20)
- `reports` - Show lab reports (first 20)
- `queue` - Show processing queue (first 20)
- `summary` - Show client summary
- `desc <table>` - Describe table structure
- `file <path>` - Execute SQL from file
- `help` - Show help
- `exit` or `quit` - Exit the program

### Examples

```sql
-- Direct SQL queries
SELECT * FROM clients LIMIT 5;
SELECT COUNT(*) FROM lab_reports WHERE status = 'completed';

-- Describe table structure
desc lab_reports

-- Execute SQL file
file ./queries/client_report.sql
```

## Database Utilities

The `src/lib/supabase.ts` file provides comprehensive database utilities.

### Basic Usage

```typescript
import { db, dbAdmin } from '@/lib/supabase'

// Test connection
const result = await db.testConnection()
console.log(result)

// Get clients
const clients = await db.getClients(10, 0)

// Create client
const newClient = await db.createClient({
  email: 'john@example.com',
  first_name: 'John',
  last_name: 'Doe',
  date_of_birth: '1990-01-01'
})

// Get lab reports
const reports = await db.getLabReports()

// Create lab report
const report = await db.createLabReport({
  client_id: clientId,
  report_type: 'nutriq',
  report_date: '2024-01-15'
})
```

### Available Methods

#### Client Operations
- `getClients(limit?, offset?)`
- `getClientById(id)`
- `createClient(clientData)`
- `updateClient(id, updates)`
- `deleteClient(id)`
- `searchClients(searchTerm)`

#### Lab Report Operations
- `getLabReports(clientId?, limit?, offset?)`
- `getLabReportById(id)`
- `createLabReport(reportData)`
- `updateLabReport(id, updates)`
- `getReportsByType(reportType)`

#### Test Results Operations
- `getNutriQResults(labReportId)`
- `createNutriQResults(resultsData)`
- `getKBMOResults(labReportId)`
- `createKBMOResults(resultsData)`
- `getDutchResults(labReportId)`
- `createDutchResults(resultsData)`

#### CGM Data Operations
- `getCGMData(labReportId, limit?)`
- `createCGMDataPoint(dataPoint)`

#### Food Photos Operations
- `getFoodPhotos(labReportId)`
- `createFoodPhoto(photoData)`

#### Processing Queue Operations
- `getProcessingQueue(status?)`
- `addToProcessingQueue(queueItem)`
- `updateProcessingQueueStatus(id, status, errorMessage?)`

#### File Storage Operations
- `uploadFile(bucket, path, file, contentType?)`
- `getFileUrl(bucket, path)`
- `deleteFile(bucket, path)`

#### Utility Operations
- `getClientReportsSummary()`
- `testConnection()`

## Migration System

The migration system tracks schema changes and allows for version control of your database.

### Migration Files

Migrations are stored in `database/migrations/` and follow the naming convention:
`YYYYMMDDHHMMSS_description.sql`

### Migration Commands

```bash
# Run migrations
node scripts/migrate.js run

# Check status
node scripts/migrate.js status

# Create new migration
node scripts/migrate.js create add_new_feature

# Rollback last N migrations
node scripts/migrate.js rollback 2

# Initialize migration system
node scripts/migrate.js init
```

### Migration Tracking

Migrations are tracked in the `schema_migrations` table:

```sql
CREATE TABLE schema_migrations (
    id SERIAL PRIMARY KEY,
    filename VARCHAR(255) UNIQUE NOT NULL,
    executed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    checksum VARCHAR(64),
    execution_time_ms INTEGER
);
```

## Sample Data

The seeding system provides realistic sample data for development and testing.

### Sample Data Includes

- **5 Clients** with complete medical histories
- **6 Lab Reports** of various types and statuses
- **NutriQ Results** with detailed scoring
- **KBMO Results** with food sensitivity data
- **Dutch Results** with hormone levels
- **CGM Data** with glucose readings
- **Food Photos** with AI analysis
- **Processing Queue** items

### Seeding Commands

```bash
# Seed with sample data
node scripts/seed.js seed

# Clear all data
node scripts/seed.js clear

# Reset database
node scripts/seed.js reset
```

## Security

### Row Level Security (RLS)

All tables have RLS enabled with basic policies. You should customize these based on your authentication requirements.

### Service Role vs Anon Key

- Use the **anon key** for client-side operations
- Use the **service role key** for server-side operations and admin tasks

### SQL Injection Prevention

The `exec_sql` function is designed for development use only. In production, use parameterized queries through the Supabase client.

## Best Practices

### 1. Use Database Utilities

Always use the provided database utilities instead of raw SQL when possible:

```typescript
// ✅ Good
const clients = await db.getClients()

// ❌ Avoid
const { data } = await supabase.from('clients').select('*')
```

### 2. Handle Errors Gracefully

```typescript
try {
  const result = await db.createClient(clientData)
  console.log('Client created:', result)
} catch (error) {
  console.error('Failed to create client:', error.message)
}
```

### 3. Use Transactions for Complex Operations

```typescript
const { data, error } = await supabase.rpc('create_client_with_reports', {
  client_data: clientData,
  reports_data: reportsData
})
```

### 4. Monitor Performance

Use the query runner to monitor slow queries:

```sql
SELECT query, mean_time, calls 
FROM pg_stat_statements 
ORDER BY mean_time DESC 
LIMIT 10;
```

## Troubleshooting

### Common Issues

1. **Connection Failed**
   - Check environment variables
   - Verify Supabase URL and keys
   - Test with `npm run db:query test`

2. **Migration Errors**
   - Check migration file syntax
   - Verify no conflicting table names
   - Use `node scripts/migrate.js status` to check state

3. **Permission Errors**
   - Ensure service role key is used for admin operations
   - Check RLS policies
   - Verify table permissions

4. **Query Runner Issues**
   - Ensure `exec_sql` function exists
   - Check Supabase function permissions
   - Verify SQL syntax

### Debug Commands

```bash
# Test database connection
npm run db:query test

# Check migration status
node scripts/migrate.js status

# View table structure
npm run db:query
db> desc clients

# Check recent errors
SELECT * FROM processing_queue WHERE status = 'failed' ORDER BY created_at DESC LIMIT 10;
```

## Next Steps

1. **Customize RLS Policies**: Implement proper authentication-based policies
2. **Add Indexes**: Monitor query performance and add indexes as needed
3. **Backup Strategy**: Set up automated database backups
4. **Monitoring**: Implement query performance monitoring
5. **Testing**: Create comprehensive database tests

For more information, see the API documentation and individual component guides. 