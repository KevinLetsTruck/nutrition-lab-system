# FNTP Prompt Templates

Reusable prompt structures for common development tasks based on proven FNTP application patterns.

## Database Extension Templates

### New Model Creation Template

```
Create a new [ModelName] model in the Prisma schema with the following requirements:

**Core Fields:**
- id: String @id @default(cuid())
- [specific fields based on requirements]
- createdAt: DateTime @default(now())
- updatedAt: DateTime @updatedAt

**Relationships:**
- [Define relationships to existing models]

**Indexes:**
- Add indexes for: [list foreign keys, status fields, date fields, commonly queried fields]

**Enums (if needed):**
- Create enums for status/type fields with these values: [list values]

**Migration Requirements:**
- Generate migration file
- Include proper defaults and constraints
- Add any necessary data seeding

**Follow FNTP Patterns:**
- Use CUID for primary keys
- Include comprehensive indexing strategy from Document model pattern
- Add audit trail fields if needed (hipaaRelevant, etc.)
- Use Json fields for flexible structured data where appropriate
- Include cascade delete options for cleanup

**Validation Schema:**
- Create Zod schema in /src/lib/validations/[modelname].ts
- Include create and update variants
- Export TypeScript types
```

### Database Relationship Extension Template

````
Extend the existing [Model1] and [Model2] models to create a [relationship type] relationship:

**Relationship Requirements:**
- [Model1] should [have many/have one/belong to] [Model2]
- Add proper foreign key constraints
- Include cascade delete behavior: [specify behavior]
- Add indexes for performance

**Schema Changes:**
```prisma
model [Model1] {
  [relationship field]: [Model2][]  // or single reference
}

model [Model2] {
  [foreignKey]: String
  [relationField]: [Model1] @relation(fields: [foreignKey], references: [id], onDelete: [Cascade/SetNull])

  @@index([foreignKey])
}
````

**Follow FNTP Patterns:**

- Use established index patterns from Client-Document relationship
- Include proper TypeScript types
- Add validation schemas for the new relationships
- Consider audit trail requirements

```

## Component Creation Templates

### Feature Component Template

```

Create a [ComponentName] component following FNTP patterns:

**Component Structure:**

- File: /src/components/[feature]/[ComponentName].tsx
- Use "use client" directive if client-side functionality needed
- Include proper TypeScript interface for props

**Props Interface:**

```typescript
interface [ComponentName]Props {
  [prop]: [type];
  variant?: "default" | "outline" | "secondary";
  size?: "sm" | "default" | "lg";
  onAction?: (data: [Type]) => Promise<void>;
  isLoading?: boolean;
}
```

**State Management Pattern:**

```typescript
const [isLoading, setIsLoading] = useState(false);
const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
const [error, setError] = useState<string | null>(null);
```

**UI Requirements:**

- Follow UI_DESIGN_RULES.md for text visibility
- Use explicit text color classes: text-gray-900, text-white
- Include loading states with proper icons
- Add error handling with user feedback
- Follow button variant patterns from ExportClientButton

**Error Handling:**

```typescript
try {
  setIsLoading(true);
  setError(null);

  await performAction();
  setStatus("success");
} catch (error) {
  const errorMessage =
    error instanceof Error ? error.message : "An error occurred";
  setError(errorMessage);
  setStatus("error");
} finally {
  setIsLoading(false);

  // Reset status after delay
  setTimeout(() => {
    setStatus("idle");
  }, 3000);
}
```

**Integration Requirements:**

- Use useAuth hook for authentication context
- Include proper toast notifications
- Follow modal patterns for popups
- Add keyboard navigation support

```

### Form Component Template

```

Create a [FormName] form component with validation:

**Form Structure:**

- Use react-hook-form with Zod validation
- Create validation schema in /src/lib/validations/[formname].ts
- Follow FNTP form patterns from client creation

**Validation Schema:**

```typescript
export const [formName]Schema = z.object({
  [field]: z.string().min(1, '[Field] is required'),
  [optionalField]: z.string().optional(),
  [emailField]: z.string().email('Invalid email address'),
  [dateField]: z.string().or(z.date()).optional(),
});

export type [FormName]Input = z.infer<typeof [formName]Schema>;
```

**Component Structure:**

```typescript
interface [FormName]Props {
  onSubmit: (data: [FormName]Input) => Promise<void>;
  initialData?: [FormName]Input;
  isLoading?: boolean;
}
```

**UI Requirements:**

- Use Label components with explicit text colors
- Include proper field validation and error display
- Add loading states during submission
- Follow button patterns for submit/cancel actions
- Include proper spacing and layout

**Form Implementation:**

```typescript
const form = useForm<[FormName]Input>({
  resolver: zodResolver([formName]Schema),
  defaultValues: initialData || {
    // default values
  },
});

const onSubmit = async (data: [FormName]Input) => {
  try {
    await props.onSubmit(data);
    // Success handling
  } catch (error) {
    // Error handling with form.setError if needed
  }
};
```

```

## API Endpoint Templates

### CRUD Endpoint Template

```

Create a complete CRUD API for [Resource] at /src/app/api/[resource]/route.ts:

**Authentication Pattern:**

```typescript
import { verifyAuthToken } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    // Verify authentication first
    const user = await verifyAuthToken(request);

    // Query parameters
    const searchParams = request.nextUrl.searchParams;
    const [param] = searchParams.get("[param]");

    // Database query with filtering
    const [resources] = await prisma.[resource].findMany({
      where: {
        ...([param] && { [param] }),
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json([resources]);
  } catch (error) {
    // Follow FNTP error handling pattern
    if (error instanceof Error && (error.message.includes("authorization") || error.message.includes("token"))) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }

    return NextResponse.json({ error: "Failed to fetch [resources]" }, { status: 500 });
  }
}
```

**POST Endpoint:**

```typescript
export async function POST(request: NextRequest) {
  try {
    const user = await verifyAuthToken(request);
    const body = await request.json();
    const validatedData = [resourceSchema].parse(body);

    const [resource] = await prisma.[resource].create({
      data: {
        ...validatedData,
        // Handle special fields (dates, JSON, etc.)
      },
    });

    return NextResponse.json([resource], { status: 201 });
  } catch (error) {
    // Follow FNTP error patterns
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: "Invalid input", details: error.errors },
        { status: 400 }
      );
    }

    if (error instanceof Error && error.message.includes("Unique constraint")) {
      return NextResponse.json(
        { error: "[Resource] with this [field] already exists" },
        { status: 409 }
      );
    }

    return NextResponse.json({ error: "Failed to create [resource]" }, { status: 500 });
  }
}
```

**Include Dynamic Routes:**

- Create /src/app/api/[resource]/[id]/route.ts for individual resource operations
- Follow PUT/PATCH/DELETE patterns from client endpoints
- Add transaction support for complex operations

```

### Complex API Template

```

Create an advanced API endpoint for [specific functionality]:

**File Structure:**

- Main route: /src/app/api/[feature]/[action]/route.ts
- If client-specific: /src/app/api/clients/[clientId]/[action]/route.ts

**Multi-Model Transaction Pattern:**

```typescript
export async function POST(request: NextRequest, { params }: { params: Promise<{ [paramName]: string }> }) {
  try {
    const user = await verifyAuthToken(request);
    const { [paramName] } = await params;
    const body = await request.json();

    // Validate input
    const validatedData = [schema].parse(body);

    // Perform transaction
    const result = await prisma.$transaction(async (tx) => {
      // Step 1: Create/update primary record
      const [primaryRecord] = await tx.[model].create({
        data: validatedData,
      });

      // Step 2: Create related records
      const [relatedRecords] = await tx.[relatedModel].createMany({
        data: [/* related data */],
      });

      // Step 3: Update counters or status
      await tx.[parentModel].update({
        where: { id: [parentId] },
        data: { [statusField]: "updated" },
      });

      return { [primaryRecord], [relatedRecords] };
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    // Comprehensive error handling
  }
}
```

**Performance Considerations:**

- Add appropriate database indexes
- Use select statements to limit returned fields
- Include pagination for large datasets
- Consider caching for frequently accessed data

```

## Feature Integration Templates

### Full Feature Template

```

Create a complete [FeatureName] feature with full integration:

**Database Schema:**

- Add [FeatureName] model to schema.prisma
- Include relationships to existing models
- Add necessary enums and indexes
- Create migration

**API Layer:**

- Create CRUD endpoints: /src/app/api/[feature]/
- Add validation schemas: /src/lib/validations/[feature].ts
- Include authentication and error handling

**Component Layer:**

- List component: [Feature]List.tsx
- Detail/view component: [Feature]Detail.tsx
- Form component: [Feature]Form.tsx
- Action components: [Feature]Button.tsx, etc.

**Page Integration:**

- Dashboard page: /src/app/dashboard/[feature]/page.tsx
- Detail pages: /src/app/dashboard/[feature]/[id]/page.tsx
- Create/edit pages as needed

**Types and Validation:**

- TypeScript types: /src/types/[feature].ts
- Zod schemas: /src/lib/validations/[feature].ts
- API response types

**UI Requirements:**

- Follow FNTP design patterns
- Include loading states and error handling
- Add proper text visibility classes
- Implement responsive design
- Include accessibility features

**Integration Points:**

- Add navigation links in MainNav.tsx
- Include in dashboard overview
- Add relationships to existing features
- Update any affected components

**Testing Requirements:**

- Test all CRUD operations
- Verify authentication requirements
- Test error scenarios
- Validate form submissions
- Check responsive design

```

### AI Integration Template

```

Create an AI-powered [functionality] feature:

**AI Service Setup:**

- Create service file: /src/lib/ai/[service].ts
- Use Claude/OpenAI API patterns from existing codebase
- Include proper error handling and retries

**API Integration:**

```typescript
export async function POST(request: NextRequest) {
  try {
    const user = await verifyAuthToken(request);
    const { [inputData] } = await request.json();

    // Prepare data for AI analysis
    const analysisInput = {
      [structuredData]: [inputData],
      context: [contextData],
    };

    // Call AI service
    const analysis = await [aiService].analyze(analysisInput);

    // Store results in database
    const result = await prisma.[analysisModel].create({
      data: {
        [inputId]: [inputData.id],
        analysisResults: analysis,
        analysisDate: new Date(),
        analysisVersion: "v1.0",
        status: "COMPLETED",
      },
    });

    return NextResponse.json(result);
  } catch (error) {
    // Handle AI-specific errors
    if (error.message.includes('rate limit')) {
      return NextResponse.json({ error: "Analysis service temporarily unavailable" }, { status: 429 });
    }

    // Standard error handling
  }
}
```

**UI Components:**

- Analysis trigger button with loading states
- Results display component with formatted output
- Progress indication during processing
- Error states with retry options

**Database Schema:**

- Analysis results table with JSON storage
- Link to source data
- Version tracking and audit fields
- Status management (PENDING, PROCESSING, COMPLETED, FAILED)

```

## Bug Fix Templates

### Component Bug Fix Template

```

Fix [specific issue] in [ComponentName]:

**Current Behavior:**
[Describe the current problematic behavior]

**Expected Behavior:**
[Describe what should happen instead]

**Debug Steps:**

1. Check component state management
2. Verify prop passing and types
3. Review event handlers and side effects
4. Check for missing dependencies in useEffect
5. Validate data flow and transformations

**Common FNTP Fixes:**

- Add missing text color classes (text-gray-900)
- Fix authentication token handling
- Add proper error boundaries
- Include loading states
- Fix responsive design issues
- Add missing TypeScript types

**Testing Checklist:**

- [ ] Test in both light and dark modes
- [ ] Verify responsive behavior
- [ ] Check error scenarios
- [ ] Validate loading states
- [ ] Test keyboard navigation
- [ ] Verify accessibility features

```

### API Bug Fix Template

```

Fix [specific issue] in API endpoint [endpoint path]:

**Issue Analysis:**

- Check authentication verification
- Review request/response handling
- Validate database queries
- Check error handling coverage

**Common FNTP API Fixes:**

- Add missing verifyAuthToken calls
- Fix Zod validation schemas
- Add proper error response formatting
- Include transaction handling for data integrity
- Add missing database indexes
- Fix CORS issues if applicable

**Database Investigation:**

```sql
-- Check data consistency
SELECT * FROM [table] WHERE [condition];

-- Verify relationships
SELECT [fields] FROM [table1]
JOIN [table2] ON [join_condition]
WHERE [problem_condition];
```

**Response Format Verification:**

```typescript
// Ensure consistent response structure
return NextResponse.json({
  data: result,
  message: "Success message",
  timestamp: new Date().toISOString(),
});

// For errors
return NextResponse.json(
  {
    error: "Descriptive error message",
    details: errorDetails,
  },
  { status: [appropriate_status_code] }
);
```

```

## Performance Optimization Templates

### Database Optimization Template

```

Optimize database performance for [specific area]:

**Query Analysis:**

- Review slow queries in [specific functionality]
- Check for N+1 query problems
- Analyze database execution plans

**Index Optimization:**

```prisma
// Add indexes for common query patterns
@@index([field1, field2])  // Composite index for combined filtering
@@index([foreignKey])      // Foreign key indexes
@@index([statusField])     // Status-based filtering
@@index([dateField])       // Date range queries
@@index([searchField(length: 255)])  // Text search optimization
```

**Query Optimization:**

```typescript
// Use select to limit returned fields
const optimizedQuery = await prisma.[model].findMany({
  select: {
    id: true,
    [essentialField1]: true,
    [essentialField2]: true,
    // Only include what's needed
  },
  where: conditions,
  take: pageSize,
  skip: (page - 1) * pageSize,
});

// Use include strategically
const withRelations = await prisma.[model].findMany({
  include: {
    [relation]: {
      select: {
        // Only essential relation fields
      }
    }
  }
});
```

**Caching Strategy:**

- Implement Redis caching for frequently accessed data
- Add in-memory caching for static data
- Use database query result caching
- Implement proper cache invalidation

```

### Frontend Optimization Template

```

Optimize frontend performance for [specific area]:

**Code Splitting:**

```typescript
// Dynamic imports for heavy components
const [HeavyComponent] = dynamic(() => import("@/components/[path]"), {
  loading: () => <div className="animate-pulse">[Loading placeholder]</div>,
  ssr: false, // if not needed for SSR
});
```

**State Optimization:**

```typescript
// Memoize expensive calculations
const [expensiveValue] = useMemo(() => {
  return [calculation];
}, [dependencies]);

// Memoize callbacks to prevent re-renders
const [handleAction] = useCallback((param) => {
  [action logic];
}, [dependencies]);
```

**Bundle Optimization:**

- Analyze bundle size with webpack-bundle-analyzer
- Tree-shake unused code
- Optimize image loading with Next.js Image component
- Implement proper lazy loading
- Minimize external dependencies

**Performance Monitoring:**

- Add performance metrics collection
- Monitor Core Web Vitals
- Track API response times
- Monitor error rates

```

## Usage Guidelines

### Before Using Templates

1. **Review existing code** for similar patterns
2. **Identify dependencies** and required integrations
3. **Plan database changes** and migration strategy
4. **Consider performance implications** from the start

### Template Customization

1. **Replace placeholders** with actual names and values
2. **Adapt patterns** to specific requirements
3. **Add additional validation** as needed
4. **Include proper error handling** for edge cases

### Quality Assurance

1. **Follow FNTP patterns** consistently
2. **Include comprehensive error handling**
3. **Add proper TypeScript types**
4. **Test all functionality** thoroughly
5. **Document any deviations** from standard patterns

### Template Evolution

- Update templates based on new successful patterns
- Add new templates as common use cases emerge
- Remove or deprecate templates that prove problematic
- Keep templates aligned with current FNTP architecture
```

