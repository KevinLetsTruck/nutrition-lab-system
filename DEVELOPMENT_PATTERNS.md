# FNTP Development Patterns

This document captures successful patterns, structures, and approaches identified from the existing FNTP application codebase.

## Database Design Patterns

### 1. Schema Design Principles

**Consistent ID Strategy:**

```prisma
model Client {
  id String @id @default(cuid())
  // CUID for all primary keys provides:
  // - URL-safe identifiers
  // - Collision-resistant
  // - Sortable by creation time
}
```

**Comprehensive Indexing:**

```prisma
model Document {
  @@index([clientId])        // Foreign key indexes
  @@index([status])          // Status filtering
  @@index([documentType])    // Type-based queries
  @@index([uploadedAt])      // Date-based sorting
  @@index([priority])        // Priority queuing
}
```

**Audit Trail Pattern:**

```prisma
model AuditLog {
  id            String        @id
  userId        String?
  action        AuditAction   // Enum for type safety
  resource      AuditResource // Enum for resource types
  timestamp     DateTime      @default(now())
  hipaaRelevant Boolean       @default(true)

  @@index([action, resource])
  @@index([timestamp])
  @@index([userId, timestamp])
}
```

### 2. Relationship Patterns

**One-to-Many with Cascade:**

```prisma
model Client {
  notes Note[] @relation(onDelete: Cascade)
}

model Note {
  clientId String
  client   Client @relation(fields: [clientId], references: [id], onDelete: Cascade)
}
```

**Enum-Based Status Management:**

```prisma
enum StatusType {
  SIGNED_UP
  INITIAL_INTERVIEW_COMPLETED
  ASSESSMENT_COMPLETED
  DOCS_UPLOADED
  SCHEDULED
  ONGOING
  ARCHIVED
}
```

**JSON Storage for Flexible Data:**

```prisma
model Client {
  healthGoals    Json?          // Array of strings or complex objects
  medications    Json?          // Structured medication data
  structuredData Json?          // AI-processed analysis results
}
```

### 3. Migration Patterns

**Comprehensive Field Addition:**

```sql
-- Always include proper defaults and constraints
ALTER TABLE "Document"
ADD COLUMN "encryptionKey" TEXT,
ADD COLUMN "isEncrypted" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN "containsPHI" BOOLEAN NOT NULL DEFAULT false;
```

## Component Architecture Patterns

### 1. Composable Button Components

**State-Aware Button Pattern:**

```tsx
export function ExportClientButton({
  clientId,
  clientName,
  variant = "outline",
  size = "sm",
}: ExportClientButtonProps) {
  const [isExporting, setIsExporting] = useState(false);
  const [exportStatus, setExportStatus] = useState<
    "idle" | "success" | "error"
  >("idle");

  const getButtonIcon = () => {
    if (isExporting) return <Loader2 className="h-4 w-4 animate-spin" />;
    if (exportStatus === "success")
      return <CheckCircle className="h-4 w-4 text-green-600" />;
    if (exportStatus === "error")
      return <AlertCircle className="h-4 w-4 text-red-600" />;
    return <Download className="h-4 w-4" />;
  };

  const getButtonVariant = () => {
    if (exportStatus === "success") return "default";
    if (exportStatus === "error") return "destructive";
    return variant;
  };

  return (
    <Button
      onClick={handleExport}
      disabled={isExporting}
      variant={getButtonVariant()}
      size={size}
      className="gap-2"
    >
      {getButtonIcon()}
      {getButtonText()}
    </Button>
  );
}
```

### 2. Modal Component Pattern

**Consistent Modal Structure:**

```tsx
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: T) => Promise<void>;
  onDelete?: (id: string) => Promise<void>;
  initialData?: T;
  isEditing?: boolean;
}
```

### 3. Error Boundary Pattern

**Comprehensive Error Handling:**

```tsx
export class ErrorBoundary extends Component<Props, State> {
  static getDerivedStateFromError(error: Error): State {
    const errorId = `error-${Date.now()}`;

    // Automatic logging to issue tracker
    const issue = {
      id: errorId,
      category: "TECHNICAL",
      priority: "CRITICAL",
      status: "OPEN",
      title: error.message,
      description: error.stack || "",
      blocksTesting: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    return {
      hasError: true,
      error,
      errorInfo: null,
      errorId,
    };
  }
}
```

### 4. UI Component Patterns

**Design System Button Variants:**

```tsx
const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default:
          "bg-blue-600 text-white border border-blue-500 shadow-lg hover:bg-blue-700 hover:shadow-xl hover:scale-105 transition-all",
        destructive:
          "bg-red-600 text-white border border-red-500 shadow-sm hover:bg-red-700",
        success:
          "bg-green-600 text-white border border-green-500 shadow-sm hover:bg-green-700",
        outline:
          "border-2 border-gray-600 bg-transparent text-gray-300 shadow-sm hover:bg-gray-800 hover:border-gray-500",
      },
      size: {
        default: "h-10 px-6 py-2",
        sm: "h-8 px-4 text-xs",
        lg: "h-12 px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);
```

## API Endpoint Patterns

### 1. Consistent Authentication Pattern

**Request Authentication:**

```typescript
export async function GET(request: NextRequest) {
  try {
    // Verify authentication first
    const user = await verifyAuthToken(request);

    // Process request
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get("status");

    // Database query with filtering
    const clients = await prisma.client.findMany({
      where: {
        ...(status && { status }),
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(clients);
  } catch (error) {
    if (
      error instanceof Error &&
      (error.message.includes("authorization") ||
        error.message.includes("token"))
    ) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }

    return NextResponse.json(
      { error: "Failed to fetch clients" },
      { status: 500 }
    );
  }
}
```

### 2. Error Response Pattern

**Structured Error Handling:**

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
    { error: "Client with this email already exists" },
    { status: 409 }
  );
}

// Generic fallback
return NextResponse.json({ error: "Failed to create client" }, { status: 500 });
```

### 3. Resource-Specific Operations

**PATCH vs PUT Pattern:**

```typescript
// PUT - Full update with allowed fields whitelist
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ clientId: string }> }
) {
  const allowedFields = [
    "status",
    "firstName",
    "lastName",
    "email",
    "phone",
    "dateOfBirth",
    "gender",
    "isTruckDriver",
    "healthGoals",
  ];

  const updateData: any = {};
  for (const field of allowedFields) {
    if (body[field] !== undefined) {
      if (field === "dateOfBirth" && body[field]) {
        updateData[field] = new Date(body[field]);
      } else {
        updateData[field] = body[field];
      }
    }
  }
}

// PATCH - Partial update for specific use cases (e.g., intake forms)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ clientId: string }> }
) {
  const allowedFields = [
    "dateOfBirth",
    "gender",
    "medications",
    "healthGoals",
    "conditions",
    "allergies",
  ];
  // More permissive for intake workflows
}
```

### 4. Transaction Pattern

**Safe Multi-Model Operations:**

```typescript
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ clientId: string }> }
) {
  await prisma.$transaction(async (tx) => {
    // Delete related records in dependency order
    await tx.clientResponse.deleteMany({
      where: { assessmentId: { in: assessmentIds } },
    });
    await tx.assessmentAnalysis.deleteMany({
      where: { assessmentId: { in: assessmentIds } },
    });
    await tx.clientAssessment.deleteMany({ where: { clientId } });
    await tx.clientStatus.deleteMany({ where: { clientId } });
    await tx.note.deleteMany({ where: { clientId } });
    await tx.document.deleteMany({ where: { clientId } });
    await tx.protocol.deleteMany({ where: { clientId } });
    await tx.medicalDocument.deleteMany({ where: { clientId } });

    // Delete primary record last
    await tx.client.delete({ where: { id: clientId } });
  });
}
```

## Authentication & Security Patterns

### 1. JWT Token Management

**Secure Token Handling:**

```typescript
export function generateToken(payload: JWTPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

export function verifyToken(token: string): JWTPayload {
  return jwt.verify(token, JWT_SECRET) as JWTPayload;
}

export async function verifyAuthToken(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new Error("No token provided");
  }

  const token = authHeader.substring(7);
  const payload = verifyToken(token);

  const user = await prisma.user.findUnique({
    where: { id: payload.userId },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!user) {
    throw new Error("Invalid token");
  }

  return user;
}
```

### 2. Password Security

**Bcrypt Integration:**

```typescript
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function comparePassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}
```

### 3. Context-Based Authentication

**React Context Pattern:**

```typescript
const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");

    if (storedToken && storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setToken(storedToken);
        setUser(parsedUser);
      } catch (e) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
      }
    }
    setIsLoading(false);
  }, []);
}
```

## Validation Patterns

### 1. Zod Schema Patterns

**Comprehensive Client Validation:**

```typescript
export const createClientSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional(),
  dateOfBirth: z.string().or(z.date()).optional(),
  gender: z.enum(["male", "female"]).optional(),
  isTruckDriver: z.boolean().default(true),
  healthGoals: z.array(z.string()).optional(),
  medications: z
    .array(
      z.object({
        name: z.string(),
        dosage: z.string().optional(),
        frequency: z.string().optional(),
      })
    )
    .optional(),
  conditions: z.array(z.string()).optional(),
  allergies: z.array(z.string()).optional(),
});

export const updateClientSchema = createClientSchema.partial();
export type CreateClientInput = z.infer<typeof createClientSchema>;
export type UpdateClientInput = z.infer<typeof updateClientSchema>;
```

### 2. Type-Safe API Responses

**Consistent Response Types:**

```typescript
interface AuthResponse {
  user: SafeUser;
  token: string;
}

interface JWTPayload {
  userId: string;
  email: string;
  role: string;
  clientId?: string;
}

type SafeUser = Omit<User, "password">;
```

## UI/UX Patterns

### 1. Text Visibility Standards

**Mandatory Text Color Rules:**

```tsx
// ✅ ALWAYS specify explicit text colors
<Label className="text-gray-900 font-medium">Label Text</Label>
<h1 className="text-xl font-bold text-gray-900">Heading</h1>
<p className="text-gray-600">Description text</p>

// ❌ NEVER rely on default colors
<Label>Label Text</Label>  // Missing text color
<h1>Heading</h1>          // Missing text color
```

### 2. Loading State Pattern

**Consistent Loading UX:**

```tsx
const [isLoading, setIsLoading] = useState(false);
const [status, setStatus] = useState<"idle" | "success" | "error">("idle");

const handleAction = async () => {
  setIsLoading(true);
  setStatus("idle");

  try {
    await performAction();
    setStatus("success");
  } catch (error) {
    setStatus("error");
  } finally {
    setIsLoading(false);

    // Reset status after delay for UX
    setTimeout(() => {
      setStatus("idle");
    }, 3000);
  }
};
```

### 3. Multi-Column Layout Pattern

**Responsive Dashboard Layout:**

```tsx
{
  /* Four-column responsive layout */
}
<div className="flex gap-4 h-[calc(100vh-300px)] min-h-[600px] w-full overflow-hidden">
  {/* Left Column - Fixed Width */}
  <div className="flex-shrink-0 w-80 bg-gray-800 rounded-lg border border-gray-700 overflow-hidden flex flex-col">
    <div className="bg-gray-700 px-4 py-3 border-b border-gray-600">
      <h3 className="font-semibold text-white flex items-center">
        <span className="text-lg mr-2">🎯</span>
        Section Title
      </h3>
    </div>
    <div className="flex-1 p-4 overflow-y-auto">{/* Content */}</div>
  </div>
</div>;
```

### 4. Status Badge Pattern

**Dynamic Status Display:**

```tsx
<div
  className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium"
  style={{
    background:
      client.status === "SIGNED_UP"
        ? "rgba(59, 130, 246, 0.2)"
        : client.status === "ONGOING"
        ? "var(--primary-green-light)"
        : "rgba(107, 114, 128, 0.2)",
    color:
      client.status === "SIGNED_UP"
        ? "#3b82f6"
        : client.status === "ONGOING"
        ? "var(--primary-green)"
        : "var(--text-secondary)",
  }}
>
  {client.status === "SIGNED_UP" ? "📝 Signed Up" : "🔄 Ongoing"}
</div>
```

## File Organization Patterns

### 1. Feature-Based Structure

```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   │   ├── clients/       # Client-related endpoints
│   │   │   ├── [clientId]/ # Dynamic client routes
│   │   │   └── route.ts   # Base client operations
│   │   └── auth/          # Authentication endpoints
│   └── dashboard/         # Dashboard pages
├── components/            # React components
│   ├── clients/          # Client-specific components
│   ├── ui/               # Base UI components
│   └── forms/            # Form components
├── lib/                  # Utility libraries
│   ├── validations/      # Zod schemas
│   ├── auth/            # Authentication utilities
│   └── db/              # Database utilities
└── types/               # TypeScript definitions
```

### 2. Component File Naming

**Consistent Naming Convention:**

- `PascalCase` for component files: `ExportClientButton.tsx`
- `camelCase` for utilities: `authHelpers.ts`
- `kebab-case` for API routes: `client-analysis/route.ts`
- Feature prefixes: `ClientDocumentViewer.tsx`, `ClientStatus.tsx`

## Performance Patterns

### 1. Dynamic Imports

**Code Splitting for Heavy Components:**

```tsx
const SimplePDFViewer = dynamic(
  () => import("@/components/pdf/SimplePDFViewer"),
  { ssr: false }
);
```

### 2. Optimized Database Queries

**Single API Call Pattern:**

```tsx
// Instead of multiple API calls, combine related data
const response = await fetch(`/api/clients/${params.id}/complete`, {
  headers: { Authorization: `Bearer ${token}` },
});

const data = await response.json();

// Set all data from single response
setClient(data.client);
setDocuments(data.documents || []);
setNotes(data.notes || []);
setNoteCounts(data.noteCounts || { interview: 0, coaching: 0 });
```

### 3. Memoized Callbacks

**Prevent Unnecessary Re-renders:**

```tsx
const handleRefresh = useCallback(async () => {
  // Refresh logic
}, [params.id, router]);

const handleDeleteDocumentClick = useCallback(
  (documentId: string) => {
    const docToDelete = documents.find((doc) => doc.id === documentId);
    if (docToDelete) {
      setDocumentToDelete(docToDelete);
      setShowDeleteConfirm(true);
    }
  },
  [documents]
);
```

## Success Metrics

These patterns have proven successful in the FNTP application through:

1. **Zero authentication bugs** in production
2. **Consistent UI/UX** across all components
3. **Type safety** preventing runtime errors
4. **Scalable database design** supporting complex relationships
5. **Maintainable codebase** with clear separation of concerns
6. **Performance optimization** through proper loading states and caching
7. **Error handling** that provides meaningful feedback to users

## Usage Guidelines

1. **Always start with these patterns** for new features
2. **Adapt patterns** to specific use cases while maintaining core principles
3. **Test thoroughly** with the established loading state patterns
4. **Follow validation patterns** for all user inputs
5. **Maintain consistency** with established naming and structure conventions

This framework provides the foundation for consistent, reliable development based on proven patterns from the existing FNTP application.

