import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing required environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function createCallRecordingsBucket() {
  try {
    // Check if bucket already exists
    const { data: buckets, error: listError } = await supabase.storage.listBuckets()
    
    if (listError) {
      console.error('Error listing buckets:', listError)
      return
    }

    const bucketExists = buckets?.some(bucket => bucket.name === 'call-recordings')
    
    if (bucketExists) {
      console.log('✓ Bucket "call-recordings" already exists')
      return
    }

    // Create the bucket
    const { data, error } = await supabase.storage.createBucket('call-recordings', {
      public: false,
      fileSizeLimit: 524288000, // 500MB limit for audio files
      allowedMimeTypes: ['audio/webm', 'audio/mp4', 'audio/mpeg', 'audio/wav', 'audio/ogg']
    })

    if (error) {
      console.error('Error creating bucket:', error)
      return
    }

    console.log('✅ Successfully created "call-recordings" bucket')

    // Set up storage policies
    const policies = [
      {
        name: 'Allow authenticated users to upload',
        definition: `
          CREATE POLICY "Allow authenticated uploads" ON storage.objects
          FOR INSERT TO authenticated
          WITH CHECK (bucket_id = 'call-recordings');
        `
      },
      {
        name: 'Allow authenticated users to read own files',
        definition: `
          CREATE POLICY "Allow authenticated reads" ON storage.objects
          FOR SELECT TO authenticated
          USING (bucket_id = 'call-recordings');
        `
      },
      {
        name: 'Allow authenticated users to delete own files',
        definition: `
          CREATE POLICY "Allow authenticated deletes" ON storage.objects
          FOR DELETE TO authenticated
          USING (bucket_id = 'call-recordings');
        `
      }
    ]

    console.log('✅ Storage bucket "call-recordings" has been configured')
    console.log('\nNote: You may need to run the following SQL policies in your Supabase dashboard:')
    policies.forEach(policy => {
      console.log(`\n-- ${policy.name}`)
      console.log(policy.definition.trim())
    })

  } catch (error) {
    console.error('Unexpected error:', error)
  }
}

// Run the initialization
createCallRecordingsBucket()