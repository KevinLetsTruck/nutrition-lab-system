# App Directory Structure

This directory uses Next.js 13+ App Router structure.

## Key Directories:

- **`/api`** - API routes for backend functionality
  - `/auth` - Authentication endpoints
  - `/clients` - Client CRUD operations
  - `/documents` - Document upload and processing
  - `/analysis` - AI analysis endpoints

- **`/(dashboard)`** - Grouped route for authenticated dashboard pages
  - `/clients` - Client management pages
  - `/documents` - Document management pages
  - `/analysis` - Analysis and reporting pages
  - `/protocols` - Nutrition protocols and templates

The parentheses in `(dashboard)` create a route group that doesn't affect the URL structure but allows for shared layouts.
