# FNTP Assessment System - Project Rules & Standards

## 🎯 Core Development Principles

### 1. **AI-First, Not AI-Only**
- Claude handles complex decisions (branching, scoring, analysis)
- Simple logic stays in code (navigation, validation, UI state)
- Never hardcode medical advice - always defer to AI analysis
- Store AI reasoning for audit trails

### 2. **Progressive Enhancement**
- Build working features first, optimize later
- Start with basic UI, add animations/polish in final phase
- Get core assessment flow working before edge cases
- Manual testing before automated testing

### 3. **Data Integrity Above All**
- Never lose client responses - autosave everything
- Keep response history immutable (don't update, create new)
- Store both structured data AND original AI context
- Backup critical data before migrations

## 📁 Project Structure Rules

### File Organization
```
/app
  /api
    /assessment
      /[id]           # RESTful endpoints
        /start
        /response
        /analysis
    /ai               # AI service endpoints
      /analyze
      /score
      /recommend
  /(dashboard)        # Protected routes
    /assessments
      /[id]
        /page.tsx     # Assessment taking interface
      /new
      /page.tsx       # Assessment list
  /(public)          # Public routes
    /assessment      # Client-facing assessment

/components
  /assessment
    /questions       # Question type components
      /LikertScale.tsx
      /MultipleChoice.tsx
    /modules         # Module-specific components
    /progress        # Progress tracking components
  /ui               # Reuse existing shadcn components

/lib
  /assessment
    /types.ts       # All TypeScript interfaces
    /questions      # Question bank data
    /modules        # Module definitions
    /scoring        # Scoring logic
  /ai
    /assessment-ai.ts    # Claude integration
    /prompts.ts         # AI prompt templates
  /api              # API utilities

/prisma
  /migrations       # Keep migrations clean
  /schema.prisma    # Single source of truth
```

### Naming Conventions
- **Files**: kebab-case (`assessment-service.ts`)
- **Components**: PascalCase (`AssessmentQuestion.tsx`)
- **Functions**: camelCase (`calculateNodeScore`)
- **Database**: snake_case (`client_assessment`)
- **API Routes**: RESTful (`/api/assessment/[id]/response`)
- **Types/Interfaces**: PascalCase with descriptive names

## 🔧 Technical Standards

### 1. **TypeScript Strict Mode**
```typescript
// Always define types - no 'any' unless absolutely necessary
interface AssessmentResponse {
  questionId: string;
  value: unknown; // Use unknown instead of any
  timestamp: Date;
}

// Use discriminated unions for complex types
type QuestionResponse = 
  | { type: 'LIKERT'; value: number }
  | { type: 'TEXT'; value: string }
  | { type: 'MULTI_SELECT'; value: string[] }
```

### 2. **Database Rules**
- Every table has `id`, `createdAt`, `updatedAt`
- Use transactions for multi-table operations
- Index foreign keys and frequently queried fields
- Store large JSON in separate tables if > 1MB
- One migration per feature

### 3. **API Design**
```typescript
// Consistent response format
interface APIResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
  metadata?: {
    timestamp: string;
    version: string;
  };
}

// Always use proper HTTP status codes
// 200: Success
// 201: Created
// 400: Bad Request
// 401: Unauthorized
// 404: Not Found
// 500: Server Error
```

### 4. **Error Handling**
```typescript
// Create custom error classes
class AssessmentError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number
  ) {
    super(message);
  }
}

// Always catch and log errors
try {
  // operation
} catch (error) {
  logger.error('Assessment error:', error);
  // Return user-friendly message
  throw new AssessmentError(
    'Unable to process assessment',
    'ASSESSMENT_PROCESSING_ERROR',
    500
  );
}
```

## 🤖 AI Integration Rules

### 1. **Claude API Management**
- Cache AI responses when appropriate
- Implement retry logic with exponential backoff
- Store prompts in version-controlled templates
- Log all AI interactions for debugging
- Set token limits to prevent runaway costs

### 2. **Prompt Engineering Standards**
```typescript
// Always include context, instruction, and format
const promptTemplate = `
Context: ${assessmentContext}
Task: ${specificTask}
Constraints: ${limitations}
Output Format: ${expectedFormat}
`;

// Version your prompts
interface PromptTemplate {
  id: string;
  version: string;
  template: string;
  changelog: string[];
}
```

### 3. **AI Response Validation**
- Always validate AI responses against schema
- Implement fallback behavior for AI failures
- Never trust AI output without validation
- Store raw AI response for debugging

## 🧪 Testing Strategy

### 1. **Test Priorities**
1. Critical path: Assessment start → complete → analysis
2. Data persistence and recovery
3. AI response handling
4. Edge cases and error states
5. UI responsiveness

### 2. **Test Types Required**
```typescript
// Unit tests for utilities
describe('scoreCalculator', () => {
  it('should calculate node scores correctly', () => {});
  it('should handle missing responses', () => {});
});

// Integration tests for API
describe('POST /api/assessment/response', () => {
  it('should save response and trigger AI', () => {});
  it('should handle concurrent submissions', () => {});
});

// E2E tests for critical flows
describe('Assessment Flow', () => {
  it('should complete full assessment', () => {});
  it('should resume interrupted assessment', () => {});
});
```

## 🚀 Development Workflow

### 1. **Git Commit Rules**
```bash
# Format: <type>(<scope>): <subject>
feat(assessment): add likert scale component
fix(ai): handle timeout in Claude API
docs(readme): update setup instructions
refactor(db): optimize question queries
test(assessment): add response validation tests

# Types: feat, fix, docs, style, refactor, test, chore
```

### 2. **Branch Strategy**
```bash
main                 # Production-ready code
├── develop         # Integration branch
    ├── feat/assessment-core    # Feature branches
    ├── feat/ai-integration
    └── fix/response-validation # Bug fixes
```

### 3. **Code Review Checklist**
- [ ] TypeScript types defined
- [ ] Error handling implemented
- [ ] Database migrations tested
- [ ] API responses consistent
- [ ] AI prompts versioned
- [ ] Loading states handled
- [ ] Mobile responsive
- [ ] Accessibility considered

## 📊 Performance Standards

### 1. **Response Times**
- Page load: < 3 seconds
- API response: < 2 seconds (excluding AI)
- AI response: < 5 seconds
- Database queries: < 100ms
- UI interactions: < 100ms

### 2. **Optimization Rules**
- Lazy load modules after screening
- Paginate large result sets
- Implement virtual scrolling for long lists
- Cache static content
- Optimize images and assets

## 🔐 Security Requirements

### 1. **Data Protection**
- Encrypt sensitive health data at rest
- Use HTTPS for all communications
- Implement rate limiting on APIs
- Sanitize all user inputs
- Validate on both client and server

### 2. **Authentication & Authorization**
- Clients can only access their own assessments
- Practitioners have role-based access
- Session timeout after 30 minutes inactive
- Audit log for all data access

## 📝 Documentation Standards

### 1. **Code Documentation**
```typescript
/**
 * Calculates the composite score for a functional node
 * @param responses - Array of client responses for the node
 * @param weights - Scoring weights for each question
 * @returns Normalized score between 0-100
 * @throws AssessmentError if responses are invalid
 */
function calculateNodeScore(
  responses: ClientResponse[],
  weights: ScoreWeight[]
): number {
  // Implementation
}
```

### 2. **Required Documentation**
- README.md with setup instructions
- API documentation (OpenAPI/Swagger)
- Database schema documentation
- AI prompt documentation
- Deployment guide

## 🎯 Definition of Done

A feature is complete when:
1. ✅ Code passes TypeScript compilation
2. ✅ Database migrations successful
3. ✅ API endpoints return consistent format
4. ✅ Error handling implemented
5. ✅ Loading states visible to user
6. ✅ Mobile responsive design works
7. ✅ Manual testing passed
8. ✅ Code reviewed and approved
9. ✅ Documentation updated
10. ✅ Deployed to staging environment

## 🚫 Anti-Patterns to Avoid

1. **Don't store PHI in logs** - Use IDs only
2. **Don't hardcode medical thresholds** - Use AI or config
3. **Don't modify response history** - Create new records
4. **Don't trust client-side validation** - Always validate server-side
5. **Don't expose internal errors** - Provide user-friendly messages
6. **Don't skip loading states** - Users need feedback
7. **Don't ignore mobile users** - Test on small screens
8. **Don't forget timezone handling** - Store in UTC
9. **Don't cache sensitive data** - Only cache public content
10. **Don't deploy Friday afternoons** - Save it for Monday

## 📅 Sprint Rules

### Daily Development Cycle
1. **Morning**: Review plan, set daily goal
2. **Coding**: Focus on one feature at a time
3. **Testing**: Test as you build
4. **Commit**: Small, frequent commits
5. **Document**: Update docs before moving on

### Weekly Milestones
- **Monday**: Plan sprint, review architecture
- **Tue-Thu**: Core development
- **Friday**: Testing, documentation, cleanup

### Communication with AI Assistant (Claude)
1. One feature per conversation thread
2. Provide full context in each request
3. Test code before requesting next feature
4. Report bugs before moving forward
5. Ask for clarification when needed

---

## 🎉 Success Metrics

We're building correctly if:
- **Code Quality**: < 5 bugs per feature
- **Performance**: All standards met
- **Maintainability**: New dev can understand in < 1 hour
- **Reliability**: 99.9% uptime
- **User Satisfaction**: > 4.5/5 rating
- **Development Speed**: 1-2 features per day

---

**Remember**: These rules ensure we build a production-ready system, not a prototype. Follow them consistently, and we'll create a robust, scalable assessment platform that serves your clients effectively.
