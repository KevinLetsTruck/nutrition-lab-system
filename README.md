# Nutrition Lab Management System

A comprehensive web application for managing nutrition lab results, analyzing PDF reports, and providing health insights.

## Features

- 📄 PDF Lab Report Parsing
- 🧪 Lab Results Analysis
- 📊 Data Visualization with Charts
- 🔐 Secure Authentication with Supabase
- 📧 Email Notifications with Resend
- 🤖 AI Analysis with Claude (Anthropic)
- 📱 Responsive Design

## Tech Stack

- **Frontend**: Next.js 14, React, TypeScript
- **Styling**: Tailwind CSS, Radix UI Components
- **Backend**: Next.js API Routes
- **Database**: Supabase (PostgreSQL)
- **File Processing**: pdf-parse, sharp, canvas
- **Charts**: Recharts, Chart.js
- **AI**: Anthropic Claude API
- **Email**: Resend

## Project Structure

```
nutrition-lab-system/
├── src/
│   ├── app/                 # Next.js App Router
│   ├── components/
│   │   ├── ui/             # Reusable UI components
│   │   └── lab/            # Lab-specific components
│   ├── lib/
│   │   ├── lab-analyzers/  # PDF parsing for each test type
│   │   ├── supabase.ts     # Supabase client
│   │   ├── file-utils.ts   # File handling utilities
│   │   └── utils.ts        # General utilities
│   └── pages/              # API routes (if using Pages Router)
├── database/
│   ├── migrations/         # Database migrations
│   └── queries/           # Database queries
├── uploads/
│   ├── pdfs/              # Uploaded PDF files
│   └── images/            # Uploaded images
├── scripts/               # Utility scripts
└── docs/                  # Documentation
```

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase account
- Anthropic API key
- Resend API key

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd nutrition-lab-system
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env.local
   ```
   
   Edit `.env.local` with your actual API keys and configuration.

4. Run the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Environment Variables

Create a `.env.local` file with the following variables:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Anthropic API (Claude) for AI Analysis
ANTHROPIC_API_KEY=your_anthropic_api_key

# Resend API for Email Notifications
RESEND_API_KEY=your_resend_api_key

# File Upload Settings
MAX_FILE_SIZE=10485760
ALLOWED_FILE_TYPES=pdf,jpg,jpeg,png
UPLOAD_DIR=./uploads
```

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript type checking

### Code Style

This project uses:
- TypeScript for type safety
- ESLint for code linting
- Prettier for code formatting
- Tailwind CSS for styling

## Database Setup

1. Create a Supabase project
2. Run database migrations (to be created)
3. Set up authentication and storage policies

## API Routes

The application includes the following API routes:

- `POST /api/upload` - File upload endpoint
- `POST /api/analyze` - PDF analysis endpoint
- `GET /api/results` - Lab results retrieval
- `POST /api/notify` - Email notification endpoint

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.
