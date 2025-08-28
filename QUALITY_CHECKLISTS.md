# FNTP Quality Checklists

Comprehensive checklists for ensuring consistency and quality across all development phases, based on proven FNTP application patterns.

## Pre-Development Checklist

### Requirements Analysis

- [ ] **Business Logic Clarification**

  - [ ] Understand the specific use case and user needs
  - [ ] Identify integration points with existing features
  - [ ] Define success metrics and acceptance criteria
  - [ ] Clarify edge cases and error scenarios

- [ ] **Technical Requirements**

  - [ ] Identify database schema changes needed
  - [ ] Plan API endpoints and data flow
  - [ ] Consider authentication and authorization requirements
  - [ ] Evaluate performance implications
  - [ ] Plan mobile responsiveness needs

- [ ] **Design Integration Points**
  - [ ] Review existing UI patterns to maintain consistency
  - [ ] Identify reusable components and create new ones as needed
  - [ ] Plan navigation and user flow integration
  - [ ] Consider accessibility requirements (WCAG compliance)

### Architecture Planning

- [ ] **Database Design**

  - [ ] Follow FNTP schema patterns (CUID IDs, proper indexes, enums)
  - [ ] Plan relationships and cascade behaviors
  - [ ] Consider audit trail and HIPAA compliance requirements
  - [ ] Design for performance with proper indexing strategy

- [ ] **API Design**

  - [ ] Plan endpoint structure following REST conventions
  - [ ] Design request/response schemas
  - [ ] Plan authentication and authorization patterns
  - [ ] Consider rate limiting and caching needs

- [ ] **Component Architecture**

  - [ ] Identify reusable vs feature-specific components
  - [ ] Plan state management approach
  - [ ] Consider component composition patterns
  - [ ] Plan error boundaries and loading states

- [ ] **Security Considerations**
  - [ ] Plan data encryption for PHI (if applicable)
  - [ ] Consider authentication token management
  - [ ] Plan input validation and sanitization
  - [ ] Review HIPAA compliance requirements

## Development Checklist

### Database Development

- [ ] **Schema Creation**

  - [ ] Use `String @id @default(cuid())` for all primary keys
  - [ ] Include `createdAt DateTime @default(now())` and `updatedAt DateTime @updatedAt` fields
  - [ ] Add proper indexes for all foreign keys and frequently queried fields
  - [ ] Use enums for status and type fields
  - [ ] Include proper cascade delete behaviors

- [ ] **Migration Quality**

  - [ ] Generate and review migration files
  - [ ] Include proper defaults and constraints
  - [ ] Test migration on development database
  - [ ] Plan rollback strategy if needed

- [ ] **Data Validation**
  - [ ] Create Zod schemas in `/src/lib/validations/[feature].ts`
  - [ ] Include both create and update schema variants
  - [ ] Export TypeScript types from schemas
  - [ ] Test validation with edge cases

### API Development

- [ ] **Authentication**

  - [ ] All endpoints include `verifyAuthToken(request)` call
  - [ ] Proper error handling for invalid/expired tokens
  - [ ] Return 401 for authentication failures
  - [ ] Include proper user context in operations

- [ ] **Request Handling**

  - [ ] Validate input data with Zod schemas
  - [ ] Handle query parameters properly
  - [ ] Support filtering and pagination where appropriate
  - [ ] Use transactions for multi-model operations

- [ ] **Error Handling**

  ```typescript
  // Authentication errors
  if (error instanceof jwt.JsonWebTokenError) {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }

  // Validation errors
  if (error instanceof ZodError) {
    return NextResponse.json(
      { error: "Invalid input", details: error.errors },
      { status: 400 }
    );
  }

  // Constraint errors
  if (error instanceof Error && error.message.includes("Unique constraint")) {
    return NextResponse.json(
      { error: "Resource already exists" },
      { status: 409 }
    );
  }

  // Generic fallback
  return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  ```

- [ ] **Response Format**
  - [ ] Consistent JSON response structure
  - [ ] Appropriate HTTP status codes
  - [ ] Include relevant metadata (timestamps, counts, etc.)
  - [ ] Follow established error response patterns

### Component Development

- [ ] **UI Text Visibility (CRITICAL)**

  - [ ] **ALL text elements have explicit color classes**: `text-gray-900`, `text-white`, etc.
  - [ ] **NO white text on white backgrounds**
  - [ ] Labels use: `className="text-gray-900 font-medium"`
  - [ ] Headings use: `className="text-gray-900"`
  - [ ] Secondary text uses: `className="text-gray-600"`
  - [ ] Test in both light and dark browser modes

- [ ] **Component Structure**

  - [ ] Use proper TypeScript interfaces for props
  - [ ] Include proper default values and optional props
  - [ ] Follow established naming conventions
  - [ ] Use `"use client"` directive when needed

- [ ] **State Management**

  - [ ] Include loading states: `const [isLoading, setIsLoading] = useState(false)`
  - [ ] Include error states: `const [error, setError] = useState<string | null>(null)`
  - [ ] Include status states: `const [status, setStatus] = useState<"idle" | "success" | "error">("idle")`
  - [ ] Use memoization for expensive calculations and callbacks

- [ ] **Error Handling**

  - [ ] Wrap components in error boundaries where appropriate
  - [ ] Display user-friendly error messages
  - [ ] Provide recovery actions (retry buttons, etc.)
  - [ ] Log errors for debugging

- [ ] **Loading States**

  - [ ] Show loading indicators during async operations
  - [ ] Disable form submissions during processing
  - [ ] Provide visual feedback for long-running operations
  - [ ] Include proper loading animations/spinners

- [ ] **Accessibility**
  - [ ] Include proper ARIA labels and descriptions
  - [ ] Ensure keyboard navigation works correctly
  - [ ] Test with screen readers
  - [ ] Include focus management for modals

### Form Development

- [ ] **Form Setup**

  - [ ] Use `react-hook-form` with Zod resolver
  - [ ] Create validation schema in appropriate validations file
  - [ ] Include proper TypeScript types
  - [ ] Set appropriate default values

- [ ] **Field Validation**

  - [ ] Client-side validation with Zod schemas
  - [ ] Server-side validation on API endpoints
  - [ ] Display validation errors clearly
  - [ ] Prevent form submission with invalid data

- [ ] **User Experience**
  - [ ] Clear visual indication of required fields
  - [ ] Helpful error messages and validation feedback
  - [ ] Auto-save functionality where appropriate
  - [ ] Proper tab order and keyboard navigation

### Testing Requirements

- [ ] **Manual Testing**

  - [ ] Test all CRUD operations thoroughly
  - [ ] Test error scenarios and edge cases
  - [ ] Verify authentication requirements
  - [ ] Test form submissions and validations
  - [ ] Check responsive design on multiple screen sizes
  - [ ] Test keyboard navigation and accessibility

- [ ] **Browser Testing**

  - [ ] Test in Chrome, Firefox, Safari, and Edge
  - [ ] Test on mobile devices (iOS Safari, Chrome Mobile)
  - [ ] Verify text visibility in both light and dark modes
  - [ ] Check performance on slower devices/connections

- [ ] **Data Integrity**
  - [ ] Verify database constraints work correctly
  - [ ] Test cascade deletes and relationships
  - [ ] Verify transaction rollbacks work properly
  - [ ] Test data migration scenarios

## Pre-Deployment Checklist

### Code Quality

- [ ] **TypeScript Compliance**

  - [ ] No TypeScript errors: `npm run type-check`
  - [ ] No `any` types without proper justification
  - [ ] All imports and exports properly typed
  - [ ] Proper error type handling

- [ ] **Linting and Formatting**

  - [ ] No ESLint errors: `npm run lint`
  - [ ] Code properly formatted: `npm run format`
  - [ ] Follow established code style guidelines
  - [ ] Remove debugging code and console.logs

- [ ] **Bundle Analysis**
  - [ ] No significant bundle size increases
  - [ ] Proper code splitting for large components
  - [ ] Optimized image loading and assets
  - [ ] Remove unused dependencies

### Security Review

- [ ] **Authentication & Authorization**

  - [ ] All protected routes have proper authentication
  - [ ] User roles and permissions correctly implemented
  - [ ] No sensitive data exposed in client-side code
  - [ ] Proper session management and token handling

- [ ] **Data Protection**

  - [ ] PHI data properly encrypted where required
  - [ ] No sensitive data in logs or error messages
  - [ ] Proper input sanitization and validation
  - [ ] SQL injection prevention verified

- [ ] **API Security**
  - [ ] Rate limiting implemented where appropriate
  - [ ] Proper CORS configuration
  - [ ] No sensitive data in API responses
  - [ ] Audit logging for HIPAA compliance

### Performance Review

- [ ] **Database Performance**

  - [ ] All queries have appropriate indexes
  - [ ] No N+1 query problems
  - [ ] Query execution times within acceptable limits
  - [ ] Database connection pooling configured

- [ ] **Frontend Performance**

  - [ ] Page load times under 3 seconds
  - [ ] API response times under 2 seconds
  - [ ] AI response times under 5 seconds (where applicable)
  - [ ] Proper lazy loading and code splitting
  - [ ] Images optimized and properly sized

- [ ] **Caching Strategy**
  - [ ] Static assets properly cached
  - [ ] API responses cached where appropriate
  - [ ] Cache invalidation strategies implemented
  - [ ] CDN configuration optimized

### Error Handling & Monitoring

- [ ] **Error Boundaries**

  - [ ] Components wrapped in error boundaries
  - [ ] Proper error logging and reporting
  - [ ] User-friendly error messages
  - [ ] Recovery actions provided where possible

- [ ] **Logging & Monitoring**

  - [ ] Proper application logging implemented
  - [ ] Error tracking configured (Sentry, etc.)
  - [ ] Performance monitoring setup
  - [ ] Health check endpoints working

- [ ] **Backup & Recovery**
  - [ ] Database backup strategy verified
  - [ ] Rollback procedures documented and tested
  - [ ] Data recovery procedures in place
  - [ ] Disaster recovery plan updated

### Integration Testing

- [ ] **API Integration**

  - [ ] All API endpoints respond correctly
  - [ ] Error scenarios handled properly
  - [ ] Authentication flows work end-to-end
  - [ ] Data validation works at all levels

- [ ] **Third-Party Integrations**

  - [ ] External API calls work correctly
  - [ ] Error handling for service failures
  - [ ] Rate limiting respected
  - [ ] API key management secure

- [ ] **Database Integration**
  - [ ] All migrations applied successfully
  - [ ] Database constraints working
  - [ ] Relationship integrity maintained
  - [ ] Performance within acceptable limits

### Documentation & Communication

- [ ] **Code Documentation**

  - [ ] Complex functions have JSDoc comments
  - [ ] README files updated with new functionality
  - [ ] API documentation updated
  - [ ] Database schema changes documented

- [ ] **Deployment Documentation**

  - [ ] Environment variables documented
  - [ ] Configuration changes noted
  - [ ] Migration instructions provided
  - [ ] Rollback procedures documented

- [ ] **User Documentation**
  - [ ] Feature documentation updated
  - [ ] Help text and tooltips added
  - [ ] User guides updated if needed
  - [ ] Change log entries created

## Feature-Specific Checklists

### Client Management Features

- [ ] **HIPAA Compliance**

  - [ ] PHI data properly encrypted
  - [ ] Audit logging for all PHI access
  - [ ] Proper user permissions for client data
  - [ ] Data retention policies followed

- [ ] **Client Data Integrity**
  - [ ] All client relationships properly maintained
  - [ ] Cascade deletes work correctly
  - [ ] Data export functionality tested
  - [ ] Data import validation working

### Document Processing Features

- [ ] **File Upload Security**

  - [ ] File type validation implemented
  - [ ] File size limits enforced
  - [ ] Malware scanning if required
  - [ ] Secure file storage configured

- [ ] **OCR & AI Processing**
  - [ ] Error handling for processing failures
  - [ ] Retry logic for transient failures
  - [ ] Progress tracking for long operations
  - [ ] Results validation and review workflows

### Authentication Features

- [ ] **Security Standards**

  - [ ] Password complexity requirements
  - [ ] Account lockout protection
  - [ ] Session timeout configuration
  - [ ] Multi-factor authentication (if implemented)

- [ ] **Token Management**
  - [ ] JWT token expiration handling
  - [ ] Refresh token mechanism (if used)
  - [ ] Secure token storage
  - [ ] Token revocation capabilities

## Quality Gates

### Must-Pass Requirements

- [ ] All TypeScript compilation passes without errors
- [ ] All ESLint rules pass without errors
- [ ] All manual tests pass successfully
- [ ] No security vulnerabilities identified
- [ ] Performance requirements met
- [ ] UI text visibility verified (no white on white)

### Code Review Requirements

- [ ] Code follows FNTP development patterns
- [ ] Security review completed
- [ ] Performance implications assessed
- [ ] Accessibility requirements met
- [ ] Error handling comprehensive

### Deployment Readiness

- [ ] Environment variables properly configured
- [ ] Database migrations tested
- [ ] Backup procedures verified
- [ ] Rollback plan prepared
- [ ] Monitoring and alerts configured

## Emergency Procedures

### Critical Bug Response

1. **Immediate Actions**

   - [ ] Assess severity and user impact
   - [ ] Document reproduction steps
   - [ ] Implement hotfix if possible
   - [ ] Communicate with stakeholders

2. **Resolution Process**
   - [ ] Create isolated fix branch
   - [ ] Test fix thoroughly
   - [ ] Deploy to staging environment
   - [ ] Verify fix resolves issue
   - [ ] Deploy to production

### Rollback Procedures

1. **Database Rollback**

   - [ ] Stop application to prevent data corruption
   - [ ] Execute rollback migration
   - [ ] Verify data integrity
   - [ ] Restart application

2. **Application Rollback**
   - [ ] Deploy previous stable version
   - [ ] Verify all functionality works
   - [ ] Monitor for any issues
   - [ ] Document lessons learned

## Continuous Improvement

### Pattern Updates

- [ ] Review and update patterns based on new successful implementations
- [ ] Remove or deprecate patterns that prove problematic
- [ ] Add new checklist items based on discovered issues
- [ ] Keep checklists aligned with current architecture

### Process Refinement

- [ ] Regularly review checklist effectiveness
- [ ] Gather feedback from development team
- [ ] Update based on production issues
- [ ] Maintain alignment with industry best practices

Use these checklists systematically to ensure consistent, high-quality development that maintains the standards established in the FNTP application.

