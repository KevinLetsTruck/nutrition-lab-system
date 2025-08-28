# FNTP Project Standards

Established conventions and standards derived from the successful patterns in the FNTP nutrition system application.

## File Organization Standards

### Directory Structure

```
src/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # Route groups for layout organization
│   │   ├── login/
│   │   └── register/
│   ├── (dashboard)/              # Protected dashboard routes
│   │   ├── clients/
│   │   ├── documents/
│   │   └── protocols/
│   ├── api/                      # API endpoints
│   │   ├── auth/                 # Authentication endpoints
│   │   ├── clients/              # Client management
│   │   │   └── [clientId]/       # Dynamic client routes
│   │   └── admin/                # Administrative endpoints
│   ├── dashboard/                # Dashboard pages
│   │   ├── clients/
│   │   │   ├── [id]/            # Dynamic client detail routes
│   │   │   └── new/             # New client creation
│   │   └── protocols/
│   └── globals.css               # Global styles
├── components/                   # React components
│   ├── analysis/                 # Feature-specific components
│   ├── auth/
│   ├── clients/
│   ├── documents/
│   ├── medical/
│   ├── navigation/
│   ├── notes/
│   ├── pdf/
│   ├── protocols/
│   ├── simple-assessment/
│   └── ui/                       # Base UI components (shadcn/ui)
├── lib/                          # Utility libraries and services
│   ├── ai/                       # AI integration services
│   ├── api/                      # API client utilities
│   ├── auth/                     # Authentication utilities
│   ├── data/                     # Static data and configurations
│   ├── db/                       # Database utilities
│   ├── medical/                  # Medical processing services
│   ├── services/                 # External services
│   ├── simple-assessment/        # Assessment-specific logic
│   ├── templates/                # Template utilities
│   ├── theme/                    # Theme and styling utilities
│   ├── utils/                    # General utilities
│   ├── validations/              # Zod validation schemas
│   └── websocket/                # WebSocket utilities
├── types/                        # TypeScript type definitions
│   ├── auth.ts                   # Authentication types
│   └── index.ts                  # Re-exports and general types
└── middleware.ts                 # Next.js middleware
```

### File Naming Conventions

#### Component Files

- **React Components**: `PascalCase.tsx`
  - Examples: `ExportClientButton.tsx`, `ClientDocumentViewer.tsx`
  - Feature prefix: `ClientStatus.tsx`, `ProtocolBuilder.tsx`

#### API Routes

- **Route Files**: Always `route.ts` in Next.js App Router
- **Directory Names**: `kebab-case` for multi-word endpoints
  - Examples: `client-analysis/route.ts`, `export-for-analysis/route.ts`

#### Utility Files

- **Utility Functions**: `camelCase.ts`
  - Examples: `authHelpers.ts`, `pdfUtils.ts`
- **Service Files**: `kebab-case.ts`
  - Examples: `email-service.ts`, `pdf-service.ts`

#### Type Definition Files

- **Type Files**: `camelCase.ts`
  - Examples: `auth.ts`, `client.ts`, `assessment.ts`

#### Validation Files

- **Zod Schemas**: Match the feature name
  - Examples: `client.ts`, `auth.ts`, `assessment.ts`

### Directory Naming Rules

1. **Feature-Based Organization**: Group by domain/feature
2. **Kebab-Case**: Use for multi-word directory names
3. **Singular Names**: Use singular form unless collection makes more sense
4. **Route Groups**: Use parentheses for layout organization: `(auth)`, `(dashboard)`

## Code Style Standards

### TypeScript Standards

#### Interface and Type Definitions

```typescript
// ✅ CORRECT: Use PascalCase for interfaces
interface ClientFormProps {
  clientId: string;
  initialData?: Client;
  onSubmit: (data: CreateClientInput) => Promise<void>;
  isLoading?: boolean;
}

// ✅ CORRECT: Use descriptive names for generic types
interface APIResponse<TData> {
  data: TData;
  message?: string;
  error?: string;
}

// ✅ CORRECT: Export type inference from schemas
export type CreateClientInput = z.infer<typeof createClientSchema>;
export type UpdateClientInput = z.infer<typeof updateClientSchema>;
```

#### Function Declarations

```typescript
// ✅ CORRECT: Named exports for utilities
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

// ✅ CORRECT: Arrow functions for components
export const ExportClientButton: React.FC<ExportClientButtonProps> = ({
  clientId,
  clientName,
  variant = "outline",
  size = "sm",
}) => {
  // Component logic
};

// ✅ CORRECT: Proper error typing
export async function verifyAuthToken(request: Request): Promise<User> {
  // Implementation
}
```

#### Import Organization

```typescript
// ✅ CORRECT: Import order
import { NextRequest, NextResponse } from "next/server"; // External libraries
import { prisma } from "@/lib/db"; // Internal utilities
import { createClientSchema } from "@/lib/validations/client"; // Internal modules
import { ZodError } from "zod"; // External libraries (alphabetical)
import { verifyAuthToken } from "@/lib/auth"; // Internal utilities (alphabetical)
```

### React Component Standards

#### Component Structure

```typescript
"use client"; // Include when client-side functionality needed

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";

// External imports
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

// Internal imports
import { useAuth } from "@/lib/auth-context";

interface ComponentProps {
  // Props definition
}

export function ComponentName({
  prop1,
  prop2 = "defaultValue",
}: ComponentProps) {
  // State declarations
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Hook calls
  const router = useRouter();
  const { token } = useAuth();

  // Effect hooks
  useEffect(() => {
    // Effects
  }, [dependencies]);

  // Callback functions
  const handleAction = useCallback(async () => {
    // Implementation
  }, [dependencies]);

  // Render functions (if needed)
  const renderContent = () => {
    // Helper render logic
  };

  // Main render
  return <div>{/* Component JSX */}</div>;
}
```

#### State Management Patterns

```typescript
// ✅ CORRECT: Consistent state naming
const [isLoading, setIsLoading] = useState(false);
const [error, setError] = useState<string | null>(null);
const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
const [data, setData] = useState<DataType[]>([]);

// ✅ CORRECT: Memoization for expensive operations
const expensiveValue = useMemo(() => {
  return data.reduce((acc, item) => acc + item.value, 0);
}, [data]);

// ✅ CORRECT: Callback memoization
const handleSubmit = useCallback(
  async (formData: FormData) => {
    setIsLoading(true);
    setError(null);

    try {
      await submitData(formData);
      setStatus("success");
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      setStatus("error");
    } finally {
      setIsLoading(false);
    }
  },
  [submitData]
);
```

### CSS and Styling Standards

#### Tailwind CSS Usage

```typescript
// ✅ CORRECT: Explicit text colors (CRITICAL RULE)
<div className="text-gray-900 bg-white">
  <h1 className="text-xl font-bold text-gray-900">Title</h1>
  <p className="text-gray-600">Description</p>
</div>

// ✅ CORRECT: Consistent spacing and layout
<div className="p-4 space-y-4">
  <div className="flex items-center justify-between">
    <span className="text-gray-900 font-medium">Label</span>
  </div>
</div>

// ✅ CORRECT: Responsive design
<div className="w-full md:w-1/2 lg:w-1/3">
  {/* Content */}
</div>
```

#### Class Name Organization

```typescript
// ✅ CORRECT: Logical grouping of classes
<Button className="
  inline-flex items-center justify-center gap-2     // Layout
  px-4 py-2 rounded-lg                              // Spacing & borders
  bg-blue-600 text-white                            // Colors
  hover:bg-blue-700 focus:ring-2 focus:ring-blue-500  // States
  disabled:opacity-50 disabled:cursor-not-allowed   // Disabled state
  transition-all duration-200                       // Animations
">
```

## Database Standards

### Schema Naming Conventions

#### Table Names

- **Models**: `PascalCase` singular
  - Examples: `User`, `Client`, `Document`, `ClientAnalysis`

#### Field Names

- **Standard Fields**: `camelCase`
  - Examples: `firstName`, `lastName`, `createdAt`, `updatedAt`
- **Foreign Keys**: `[modelName]Id`
  - Examples: `clientId`, `userId`, `documentId`

#### Enum Values

- **Enum Names**: `PascalCase`
  - Examples: `StatusType`, `DocumentType`, `ProcessingStatus`
- **Enum Values**: `SCREAMING_SNAKE_CASE`
  - Examples: `SIGNED_UP`, `IN_PROGRESS`, `COMPLETED`

### Required Schema Patterns

#### Standard Model Fields

```prisma
model ModelName {
  id        String   @id @default(cuid())    // Always CUID
  createdAt DateTime @default(now())         // Always include
  updatedAt DateTime @updatedAt              // Always include

  // Model-specific fields

  @@index([commonlyQuerydField])             // Performance indexes
}
```

#### Relationship Patterns

```prisma
model Client {
  id    String @id @default(cuid())
  notes Note[]
}

model Note {
  id       String @id @default(cuid())
  clientId String
  client   Client @relation(fields: [clientId], references: [id], onDelete: Cascade)

  @@index([clientId])                        // Foreign key indexes
}
```

#### Audit and Compliance Fields

```prisma
model SensitiveModel {
  // Standard fields
  id        String   @id @default(cuid())
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  // Audit fields
  createdBy     String?
  lastAccessedAt DateTime?

  // HIPAA compliance fields
  containsPHI     Boolean @default(false)
  encryptionKey   String?
  isEncrypted     Boolean @default(true)

  // Performance indexes
  @@index([containsPHI])
  @@index([createdAt])
}
```

## API Standards

### Endpoint Naming Conventions

#### REST Endpoints

- **Collection endpoints**: `/api/[resource]`

  - `GET /api/clients` - List all clients
  - `POST /api/clients` - Create new client

- **Individual resource**: `/api/[resource]/[id]`

  - `GET /api/clients/[id]` - Get specific client
  - `PUT /api/clients/[id]` - Update client
  - `DELETE /api/clients/[id]` - Delete client

- **Nested resources**: `/api/[parent]/[parentId]/[resource]`

  - `GET /api/clients/[clientId]/notes`
  - `POST /api/clients/[clientId]/documents`

- **Actions**: `/api/[resource]/[action]` or `/api/[resource]/[id]/[action]`
  - `POST /api/clients/[clientId]/export-for-analysis`
  - `PUT /api/documents/[id]/process`

### Request/Response Standards

#### Standard Response Format

```typescript
// ✅ Success responses
return NextResponse.json(data, { status: 200 });

// ✅ Created resources
return NextResponse.json(newResource, { status: 201 });

// ✅ Error responses
return NextResponse.json(
  { error: "Descriptive error message" },
  { status: 400 }
);

// ✅ Validation errors
return NextResponse.json(
  { error: "Invalid input", details: zodError.errors },
  { status: 400 }
);
```

#### Authentication Pattern

```typescript
export async function GET(request: NextRequest) {
  try {
    // ALWAYS verify authentication first
    const user = await verifyAuthToken(request);

    // Process request
    // ...

    return NextResponse.json(result);
  } catch (error) {
    // Standard error handling
    if (
      error instanceof Error &&
      (error.message.includes("authorization") ||
        error.message.includes("token"))
    ) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
```

## Validation Standards

### Zod Schema Conventions

#### Schema Naming

```typescript
// ✅ CORRECT: Descriptive schema names
export const createClientSchema = z.object({...});
export const updateClientSchema = createClientSchema.partial();
export const clientFilterSchema = z.object({...});

// ✅ CORRECT: Export inferred types
export type CreateClientInput = z.infer<typeof createClientSchema>;
export type UpdateClientInput = z.infer<typeof updateClientSchema>;
```

#### Common Validation Patterns

```typescript
// ✅ CORRECT: Standard field validations
export const baseSchema = z.object({
  // Required string fields
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),

  // Email validation
  email: z.string().email("Invalid email address"),

  // Optional fields
  phone: z.string().optional(),

  // Date handling
  dateOfBirth: z.string().or(z.date()).optional(),

  // Enums
  gender: z.enum(["male", "female"]).optional(),

  // Boolean with defaults
  isTruckDriver: z.boolean().default(true),

  // Arrays
  healthGoals: z.array(z.string()).optional(),

  // Complex objects
  medications: z
    .array(
      z.object({
        name: z.string(),
        dosage: z.string().optional(),
        frequency: z.string().optional(),
      })
    )
    .optional(),
});
```

## Error Handling Standards

### Client-Side Error Handling

#### Component Error Patterns

```typescript
// ✅ CORRECT: Comprehensive error state management
const [error, setError] = useState<string | null>(null);
const [isLoading, setIsLoading] = useState(false);

const handleAction = async () => {
  try {
    setIsLoading(true);
    setError(null);

    await performAction();

    // Success handling
    toast.success("Action completed successfully");
  } catch (err) {
    const errorMessage =
      err instanceof Error ? err.message : "An unexpected error occurred";
    setError(errorMessage);

    // User feedback
    toast.error("Action failed", {
      description: errorMessage,
    });
  } finally {
    setIsLoading(false);
  }
};
```

#### Error Boundary Usage

```typescript
// ✅ CORRECT: Wrap components that might fail
<ErrorBoundary>
  <ComplexComponent />
</ErrorBoundary>

// ✅ CORRECT: Component-specific error boundaries
<SimpleAssessmentErrorBoundary>
  <SimpleAssessmentForm />
</SimpleAssessmentErrorBoundary>
```

### Server-Side Error Handling

#### API Error Patterns

```typescript
// ✅ CORRECT: Comprehensive API error handling
export async function POST(request: NextRequest) {
  try {
    const user = await verifyAuthToken(request);
    const body = await request.json();
    const validatedData = schema.parse(body);

    const result = await performOperation(validatedData);

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
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

    // Database constraint errors
    if (error instanceof Error && error.message.includes("Unique constraint")) {
      return NextResponse.json(
        { error: "Resource already exists" },
        { status: 409 }
      );
    }

    // Generic server errors
    console.error("API Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
```

## Documentation Standards

### Code Documentation

#### JSDoc Comments

```typescript
/**
 * Exports client data for AI analysis
 * @param clientId - The unique identifier for the client
 * @param includeDocuments - Whether to include uploaded documents
 * @param format - Export format (json, pdf, zip)
 * @returns Promise resolving to export data or file stream
 * @throws {Error} When client not found or access denied
 */
export async function exportClientForAnalysis(
  clientId: string,
  includeDocuments = true,
  format: "json" | "pdf" | "zip" = "zip"
): Promise<ExportResult> {
  // Implementation
}
```

#### Component Documentation

````typescript
/**
 * Button component for exporting client data for AI analysis
 *
 * Features:
 * - Loading states with spinner
 * - Success/error visual feedback
 * - Automatic file download
 * - Toast notifications
 * - Accessibility support
 *
 * @example
 * ```tsx
 * <ExportClientButton
 *   clientId="client_123"
 *   clientName="John Doe"
 *   variant="outline"
 *   size="sm"
 * />
 * ```
 */
interface ExportClientButtonProps {
  /** Unique client identifier */
  clientId: string;
  /** Display name for notifications */
  clientName: string;
  /** Button visual variant */
  variant?: "default" | "outline" | "secondary";
  /** Button size */
  size?: "sm" | "default" | "lg";
}
````

### API Documentation

#### Endpoint Documentation

```typescript
/**
 * GET /api/clients
 *
 * Retrieves a paginated list of clients with optional filtering
 *
 * Query Parameters:
 * - status: Filter by client status
 * - search: Search in name/email fields
 * - page: Page number (default: 1)
 * - limit: Items per page (default: 20)
 *
 * Returns:
 * - 200: Array of client objects
 * - 401: Authentication required
 * - 500: Server error
 *
 * Example:
 * GET /api/clients?status=ONGOING&search=john&page=1&limit=10
 */
```

### README Documentation

#### Feature Documentation Template

```markdown
# Feature Name

Brief description of what the feature does and why it exists.

## Usage

Basic usage examples with code snippets.

## API Endpoints

List of related endpoints with brief descriptions.

## Components

List of key components with their purposes.

## Database Schema

Relevant database models and relationships.

## Configuration

Any environment variables or configuration needed.

## Development

Instructions for local development and testing.

## Troubleshooting

Common issues and solutions.
```

## Performance Standards

### Frontend Performance

#### Bundle Size Management

- Keep bundle chunks under 250KB gzipped
- Use dynamic imports for large components
- Optimize images with Next.js Image component
- Minimize external dependencies

#### React Performance

```typescript
// ✅ CORRECT: Memoize expensive calculations
const expensiveValue = useMemo(() => {
  return heavyCalculation(data);
}, [data]);

// ✅ CORRECT: Memoize callbacks to prevent re-renders
const handleClick = useCallback(
  (id: string) => {
    onItemClick(id);
  },
  [onItemClick]
);

// ✅ CORRECT: Dynamic imports for heavy components
const HeavyComponent = dynamic(() => import("./HeavyComponent"), {
  loading: () => <Spinner />,
  ssr: false,
});
```

### Backend Performance

#### Database Query Optimization

```prisma
// ✅ CORRECT: Strategic indexing
model Document {
  clientId     String
  status       ProcessingStatus
  uploadedAt   DateTime @default(now())
  documentType DocumentType

  // Performance indexes
  @@index([clientId])           // Foreign key
  @@index([status])            // Status filtering
  @@index([uploadedAt])        // Date sorting
  @@index([documentType])      // Type filtering
  @@index([clientId, status])  // Composite for common queries
}
```

#### API Response Optimization

```typescript
// ✅ CORRECT: Selective field querying
const clients = await prisma.client.findMany({
  select: {
    id: true,
    firstName: true,
    lastName: true,
    email: true,
    status: true,
    // Only include needed fields
  },
  take: 20, // Pagination
  skip: (page - 1) * 20,
});
```

## Security Standards

### Authentication Security

- Always verify JWT tokens on protected endpoints
- Use strong JWT secrets (minimum 256 bits)
- Implement proper token expiration (7 days default)
- Clear tokens on logout

### Data Protection

```typescript
// ✅ CORRECT: PHI data handling
const encryptedData = await encrypt(sensitiveData, encryptionKey);
await prisma.document.create({
  data: {
    ...documentData,
    containsPHI: true,
    isEncrypted: true,
    encryptionKey: hashedKey,
  },
});

// Audit logging for PHI access
await createAuditLog({
  action: "READ",
  resource: "CLIENT",
  resourceId: clientId,
  userId: user.id,
  hipaaRelevant: true,
});
```

### Input Validation

- Validate all inputs with Zod schemas on both client and server
- Sanitize user inputs before database storage
- Use parameterized queries (Prisma handles this)
- Implement rate limiting for sensitive endpoints

## Testing Standards

### Component Testing

```typescript
// ✅ CORRECT: Component test structure
describe("ExportClientButton", () => {
  const mockProps = {
    clientId: "test-client-id",
    clientName: "Test Client",
  };

  it("renders with correct initial state", () => {
    render(<ExportClientButton {...mockProps} />);
    expect(screen.getByText("Export for Analysis")).toBeInTheDocument();
  });

  it("shows loading state during export", async () => {
    render(<ExportClientButton {...mockProps} />);

    const button = screen.getByRole("button");
    fireEvent.click(button);

    expect(screen.getByText("Exporting...")).toBeInTheDocument();
  });
});
```

### API Testing

```typescript
// ✅ CORRECT: API endpoint testing
describe("/api/clients", () => {
  beforeEach(async () => {
    // Setup test data
  });

  it("requires authentication", async () => {
    const response = await request(app).get("/api/clients");
    expect(response.status).toBe(401);
  });

  it("returns clients for authenticated user", async () => {
    const response = await request(app)
      .get("/api/clients")
      .set("Authorization", `Bearer ${validToken}`);

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
  });
});
```

## Version Control Standards

### Commit Message Format

```
type(scope): description

feat(client): add export functionality for AI analysis
fix(auth): resolve token expiration handling
docs(api): update endpoint documentation
refactor(components): extract reusable form validation
test(client): add comprehensive component tests
```

### Branch Naming

- Feature branches: `feature/description-of-feature`
- Bug fixes: `fix/description-of-bug`
- Hotfixes: `hotfix/critical-issue`
- Refactoring: `refactor/area-being-refactored`

### Pull Request Standards

- Include descriptive title and detailed description
- Reference related issues or tickets
- Include testing instructions
- Add screenshots for UI changes
- Ensure all checks pass before requesting review

These standards provide a solid foundation for consistent, maintainable, and scalable development based on the proven patterns in the FNTP application.

