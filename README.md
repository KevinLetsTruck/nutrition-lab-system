# FNTP Nutrition System

A comprehensive functional medicine assessment and nutrition protocol system designed for practitioners to efficiently manage client health data, conduct AI-powered assessments, and generate personalized treatment protocols.

## 🚀 Key Features

- **AI-Powered Assessments**: Claude AI dynamically selects questions and analyzes responses
- **Medical Document Processing**: OCR and AI analysis of lab reports and health documents
- **Functional Medicine Protocols**: Generate personalized supplement and lifestyle recommendations
- **Seed Oil Analysis**: Special focus on identifying and addressing seed oil damage
- **HIPAA-Compliant**: Secure handling of protected health information
- **Real-time Processing**: Live updates via WebSocket connections

## 📋 Development Guidelines

This project follows strict development standards documented in:

1. **[PROJECT_RULES.md](./PROJECT_RULES.md)** - Core automation and development workflow rules
2. **[ASSESSMENT_SYSTEM_RULES.md](./ASSESSMENT_SYSTEM_RULES.md)** - Assessment-specific technical standards and best practices

**All developers must read both rule documents before contributing.**

## 🏗️ System Architecture

- **Frontend**: Next.js 15.4.6 with TypeScript
- **Backend**: Next.js API routes
- **Database**: PostgreSQL with Prisma ORM
- **AI Integration**: Claude (Anthropic) for intelligent analysis
- **File Storage**: AWS S3 / Cloudinary
- **Queue System**: BullMQ with Redis
- **OCR Services**: Google Vision API

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL 14+
- Redis (for queue system)
- API Keys: Anthropic (Claude), Google Vision, AWS/Cloudinary

### Environment Setup

1. Copy the environment template:
   ```bash
   cp .env.example .env.local
   ```

2. Fill in your API keys and configuration in `.env.local`

3. See [ENV_CONFIG.md](./ENV_CONFIG.md) for detailed configuration instructions

### Installation

```bash
# Install dependencies
npm install

# Generate Prisma client
npm run db:generate

# Run database migrations
npm run db:migrate

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

## 📁 Project Structure

```
/app              # Next.js app directory
  /api           # API routes
  /(dashboard)   # Protected routes
/components      # React components
/lib             # Core business logic
  /ai           # AI integration services
  /assessment   # Assessment logic
  /medical      # Medical document processing
/prisma         # Database schema and migrations
/scripts        # Utility scripts
/public         # Static assets
```

## 🧪 Testing

```bash
# Run AI assessment tests
npx tsx scripts/test-assessment-ai.ts

# Test medical document processing
npm run test:medical

# Run all tests
npm test
```

## 📚 Documentation

- [FNTP Master System Overview](./FNTP_MASTER_SYSTEM_README.md)
- [Medical System Documentation](./MEDICAL_SYSTEM_README.md)
- [Functional Medicine Assessment Setup](./FUNCTIONAL_MEDICINE_ASSESSMENT_SETUP.md)
- [Deployment Guide](./DEPLOYMENT_GUIDE.md)
- [Database Setup](./DATABASE_SETUP.md)

## 🔒 Security

- All PHI is encrypted at rest
- HTTPS required for all communications
- Session timeout after 30 minutes
- Rate limiting on all API endpoints
- Audit logging for compliance

## 🚀 Deployment

See [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) for detailed deployment instructions.

## 🤝 Contributing

1. Read [PROJECT_RULES.md](./PROJECT_RULES.md) and [ASSESSMENT_SYSTEM_RULES.md](./ASSESSMENT_SYSTEM_RULES.md)
2. Follow the git commit conventions
3. Ensure all TypeScript types are defined
4. Add appropriate error handling
5. Test your changes thoroughly
6. Update documentation as needed

## 📄 License

Private and confidential. All rights reserved.