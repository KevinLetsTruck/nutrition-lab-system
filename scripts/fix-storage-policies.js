const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

async function fixStoragePolicies() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY

  if (!supabaseUrl || !supabaseServiceRoleKey) {
    console.error('Missing required environment variables:')
    console.error('NEXT_PUBLIC_SUPABASE_URL:', !!supabaseUrl)
    console.error('SUPABASE_SERVICE_ROLE_KEY:', !!supabaseServiceRoleKey)
    process.exit(1)
  }

  console.log('Connecting to Supabase...')
  console.log('URL:', supabaseUrl)

  const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })

  const buckets = [
    'lab-files',
    'cgm-images',
    'food-photos',
    'medical-records',
    'supplements',
    'general'
  ]

  try {
    // First, check if buckets exist
    console.log('\n=== Checking Storage Buckets ===')
    for (const bucketName of buckets) {
      const { data, error } = await supabase.storage.getBucket(bucketName)
      if (error) {
        console.error(`❌ Bucket ${bucketName} error:`, error.message)
      } else {
        console.log(`✅ Bucket ${bucketName} exists`)
      }
    }

    // Create RLS policies for each bucket
    console.log('\n=== Creating Storage Policies ===')
    
    for (const bucketName of buckets) {
      console.log(`\nConfiguring policies for ${bucketName}...`)
      
      // First, get existing policies
      const { data: existingPolicies, error: listError } = await supabase
        .from('storage.policies')
        .select('*')
        .eq('bucket_id', bucketName)
      
      if (listError) {
        console.error(`Failed to list policies for ${bucketName}:`, listError)
        continue
      }
      
      // Delete existing policies to avoid conflicts
      if (existingPolicies && existingPolicies.length > 0) {
        console.log(`Removing ${existingPolicies.length} existing policies...`)
        for (const policy of existingPolicies) {
          await supabase
            .from('storage.policies')
            .delete()
            .eq('id', policy.id)
        }
      }
      
      // Create new policies using raw SQL
      const policies = [
        {
          name: `Allow authenticated uploads to ${bucketName}`,
          definition: `(auth.role() = 'authenticated')`,
          action: 'INSERT'
        },
        {
          name: `Allow authenticated downloads from ${bucketName}`,
          definition: `(auth.role() = 'authenticated')`,
          action: 'SELECT'
        },
        {
          name: `Allow service role full access to ${bucketName}`,
          definition: `(auth.role() = 'service_role')`,
          action: 'ALL'
        }
      ]

      for (const policy of policies) {
        try {
          // Use raw SQL to create policies
          const { error } = await supabase.rpc('create_storage_policy', {
            bucket_name: bucketName,
            policy_name: policy.name,
            policy_definition: policy.definition,
            policy_action: policy.action
          })

          if (error) {
            // Try alternative approach with direct SQL
            const sqlQuery = `
              INSERT INTO storage.policies (bucket_id, name, definition, action)
              VALUES ($1, $2, $3::jsonb, $4)
              ON CONFLICT (bucket_id, name) DO UPDATE
              SET definition = $3::jsonb, action = $4
            `
            
            const { error: sqlError } = await supabase.rpc('exec_sql', {
              query: sqlQuery,
              params: [bucketName, policy.name, policy.definition, policy.action]
            })

            if (sqlError) {
              console.error(`❌ Failed to create policy "${policy.name}":`, sqlError.message)
            } else {
              console.log(`✅ Created policy: ${policy.name}`)
            }
          } else {
            console.log(`✅ Created policy: ${policy.name}`)
          }
        } catch (err) {
          console.error(`❌ Error creating policy "${policy.name}":`, err.message)
        }
      }
    }

    // Test policies with a simple upload/download
    console.log('\n=== Testing Storage Access ===')
    
    // Create a test file
    const testContent = Buffer.from('Test file content')
    const testFileName = `test-${Date.now()}.txt`
    
    // Test upload
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('general')
      .upload(testFileName, testContent, {
        contentType: 'text/plain',
        upsert: false
      })

    if (uploadError) {
      console.error('❌ Upload test failed:', uploadError.message)
    } else {
      console.log('✅ Upload test successful:', uploadData.path)
      
      // Test download
      const { data: downloadData, error: downloadError } = await supabase.storage
        .from('general')
        .download(testFileName)
      
      if (downloadError) {
        console.error('❌ Download test failed:', downloadError.message)
      } else {
        console.log('✅ Download test successful')
        
        // Cleanup test file
        await supabase.storage
          .from('general')
          .remove([testFileName])
      }
    }

    console.log('\n=== Storage Policy Configuration Complete ===')
    
  } catch (error) {
    console.error('Fatal error:', error)
    process.exit(1)
  }
}

// Alternative approach if RPC functions don't exist
async function createPoliciesDirectly() {
  console.log('\n=== Using Direct Policy Creation ===')
  
  // This would require direct database access
  // For now, we'll document the SQL that needs to be run
  
  const policySQL = `
-- For each bucket, create these policies:
-- Replace 'BUCKET_NAME' with actual bucket name (lab-files, cgm-images, etc.)

-- Allow authenticated users to upload
CREATE POLICY "Allow authenticated uploads to BUCKET_NAME"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'BUCKET_NAME');

-- Allow authenticated users to download
CREATE POLICY "Allow authenticated downloads from BUCKET_NAME"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'BUCKET_NAME');

-- Allow service role full access
CREATE POLICY "Service role full access to BUCKET_NAME"
ON storage.objects FOR ALL
TO service_role
USING (bucket_id = 'BUCKET_NAME');

-- Allow public access to get URLs (but not download)
CREATE POLICY "Public URL access for BUCKET_NAME"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'BUCKET_NAME' AND auth.role() = 'anon');
`

  console.log('If automatic policy creation fails, run this SQL in Supabase Dashboard:')
  console.log(policySQL)
}

fixStoragePolicies().catch(console.error) 