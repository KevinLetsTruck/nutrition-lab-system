# Supabase to Prisma Database & Storage Migration Guide

## Database Query Migration

### 1. SELECT Queries

**OLD (Supabase):**
```typescript
const { data, error } = await supabase
  .from('clients')
  .select('*')
```

**NEW (Prisma):**
```typescript
const clients = await prisma.client.findMany()
```

### 2. SELECT with Filters

**OLD (Supabase):**
```typescript
const { data, error } = await supabase
  .from('users')
  .select('*')
  .eq('role', 'client')
  .eq('email_verified', true)
```

**NEW (Prisma):**
```typescript
const users = await prisma.user.findMany({
  where: {
    role: 'CLIENT',
    emailVerified: true
  }
})
```

### 3. SELECT with Relations

**OLD (Supabase):**
```typescript
const { data, error } = await supabase
  .from('users')
  .select(`
    *,
    client_profiles(*),
    lab_results(*)
  `)
  .eq('id', userId)
```

**NEW (Prisma):**
```typescript
const user = await prisma.user.findUnique({
  where: { id: userId },
  include: {
    clientProfile: true,
    labResults: true
  }
})
```

### 4. INSERT

**OLD (Supabase):**
```typescript
const { data, error } = await supabase
  .from('lab_results')
  .insert({
    client_id: clientId,
    file_name: fileName,
    status: 'pending'
  })
  .select()
```

**NEW (Prisma):**
```typescript
const labResult = await prisma.labResult.create({
  data: {
    clientId,
    fileName,
    status: 'pending'
  }
})
```

### 5. UPDATE

**OLD (Supabase):**
```typescript
const { data, error } = await supabase
  .from('users')
  .update({ last_login: new Date() })
  .eq('id', userId)
```

**NEW (Prisma):**
```typescript
const user = await prisma.user.update({
  where: { id: userId },
  data: { lastLogin: new Date() }
})
```

### 6. DELETE

**OLD (Supabase):**
```typescript
const { error } = await supabase
  .from('user_sessions')
  .delete()
  .eq('user_id', userId)
```

**NEW (Prisma):**
```typescript
await prisma.userSession.deleteMany({
  where: { userId }
})
```

### 7. Complex Queries

**OLD (Supabase):**
```typescript
const { data, error } = await supabase
  .from('lab_results')
  .select('*')
  .eq('client_id', clientId)
  .in('status', ['pending', 'processing'])
  .order('created_at', { ascending: false })
  .limit(10)
```

**NEW (Prisma):**
```typescript
const labResults = await prisma.labResult.findMany({
  where: {
    clientId,
    status: {
      in: ['pending', 'processing']
    }
  },
  orderBy: {
    createdAt: 'desc'
  },
  take: 10
})
```

## Storage Migration

### 1. File Upload

**OLD (Supabase Storage):**
```typescript
const { data, error } = await supabase.storage
  .from('documents')
  .upload(path, file)

const { data: { publicUrl } } = supabase.storage
  .from('documents')
  .getPublicUrl(path)
```

**NEW (Temporary Local Storage):**
```typescript
import { writeFile } from 'fs/promises'
import path from 'path'

// In API route
export async function POST(request: NextRequest) {
  const formData = await request.formData()
  const file = formData.get('file') as File
  
  // Generate unique filename
  const timestamp = Date.now()
  const filename = `${timestamp}-${file.name}`
  const filepath = path.join(process.cwd(), 'public/uploads', filename)
  
  // Convert file to buffer and save
  const bytes = await file.arrayBuffer()
  const buffer = Buffer.from(bytes)
  await writeFile(filepath, buffer)
  
  // Store file info in database
  const document = await prisma.document.create({
    data: {
      filename: file.name,
      filepath: `/uploads/${filename}`,
      filesize: file.size,
      mimetype: file.type,
      uploadedBy: userId
    }
  })
  
  return NextResponse.json({
    url: `/uploads/${filename}`,
    document
  })
}
```

### 2. File Retrieval

**OLD (Supabase Storage):**
```typescript
const { data, error } = await supabase.storage
  .from('documents')
  .download(path)
```

**NEW (Local Storage):**
```typescript
import { readFile } from 'fs/promises'
import path from 'path'

// In API route
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const filename = searchParams.get('filename')
  
  const filepath = path.join(process.cwd(), 'public/uploads', filename)
  const file = await readFile(filepath)
  
  return new Response(file, {
    headers: {
      'Content-Type': 'application/octet-stream',
      'Content-Disposition': `attachment; filename="${filename}"`
    }
  })
}
```

### 3. File Deletion

**OLD (Supabase Storage):**
```typescript
const { error } = await supabase.storage
  .from('documents')
  .remove([path])
```

**NEW (Local Storage):**
```typescript
import { unlink } from 'fs/promises'
import path from 'path'

// Delete file
const filepath = path.join(process.cwd(), 'public/uploads', filename)
await unlink(filepath)

// Remove from database
await prisma.document.delete({
  where: { id: documentId }
})
```

## Common Patterns

### 1. Transaction Example

**OLD (Supabase - No built-in transactions):**
```typescript
// Had to handle manually with multiple queries
const { data: user } = await supabase.from('users').insert({...})
const { data: profile } = await supabase.from('profiles').insert({...})
```

**NEW (Prisma - Built-in transactions):**
```typescript
const result = await prisma.$transaction(async (tx) => {
  const user = await tx.user.create({
    data: { email, passwordHash }
  })
  
  const profile = await tx.clientProfile.create({
    data: { userId: user.id, firstName, lastName }
  })
  
  return { user, profile }
})
```

### 2. Counting Records

**OLD (Supabase):**
```typescript
const { count, error } = await supabase
  .from('lab_results')
  .select('*', { count: 'exact', head: true })
  .eq('client_id', clientId)
```

**NEW (Prisma):**
```typescript
const count = await prisma.labResult.count({
  where: { clientId }
})
```

### 3. Aggregations

**OLD (Supabase):**
```typescript
// Limited aggregation support
```

**NEW (Prisma):**
```typescript
const stats = await prisma.labResult.aggregate({
  where: { clientId },
  _count: true,
  _avg: {
    confidenceScore: true
  },
  _max: {
    createdAt: true
  }
})
```

## Directory Structure for Local Storage

```
public/
  uploads/
    documents/
      [timestamp]-[filename].pdf
    images/
      [timestamp]-[filename].jpg
    lab-results/
      [clientId]/
        [timestamp]-[filename].pdf
```

## Security Considerations

1. **Local Storage Security:**
   - Add `.gitignore` entry for `/public/uploads`
   - Implement access control in API routes
   - Validate file types and sizes

2. **Database Security:**
   - Always use parameterized queries (Prisma handles this)
   - Validate input data
   - Use transactions for related operations

## Migration Checklist

- [ ] Replace all `supabase.from()` queries with Prisma
- [ ] Update file upload endpoints to use local storage
- [ ] Create `/public/uploads` directory structure
- [ ] Add uploads to `.gitignore`
- [ ] Update file URLs in database records
- [ ] Test all CRUD operations
- [ ] Plan S3 migration for production

## Future S3 Migration

When ready for production, replace local storage with S3:

```typescript
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'

const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  }
})

// Upload to S3
const command = new PutObjectCommand({
  Bucket: process.env.S3_BUCKET,
  Key: `uploads/${filename}`,
  Body: buffer,
  ContentType: file.type
})

await s3.send(command)
```
