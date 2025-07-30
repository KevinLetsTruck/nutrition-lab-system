require('dotenv').config({ path: '.env.local' })

const { createClient } = require('@supabase/supabase-js')

async function testSupabaseConnection() {
  console.log('=== SUPABASE CONNECTION TEST ===\n')
  
  // Check environment variables
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  
  console.log('Environment Variables:')
  console.log(`✅ NEXT_PUBLIC_SUPABASE_URL: ${supabaseUrl ? 'SET' : 'MISSING'}`)
  console.log(`✅ NEXT_PUBLIC_SUPABASE_ANON_KEY: ${supabaseAnonKey ? 'SET' : 'MISSING'}`)
  console.log(`✅ SUPABASE_SERVICE_ROLE_KEY: ${supabaseServiceKey ? 'SET' : 'MISSING'}`)
  
  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('\n❌ Missing required Supabase environment variables')
    return
  }
  
  try {
    // Test client-side connection
    console.log('\n🔍 Testing client-side connection...')
    const supabase = createClient(supabaseUrl, supabaseAnonKey)
    
    const { data: clientData, error: clientError } = await supabase
      .from('clients')
      .select('count')
      .limit(1)
    
    if (clientError) {
      console.error('❌ Client-side connection failed:', clientError.message)
    } else {
      console.log('✅ Client-side connection successful')
    }
    
    // Test server-side connection
    if (supabaseServiceKey) {
      console.log('\n🔍 Testing server-side connection...')
      const serverSupabase = createClient(supabaseUrl, supabaseServiceKey, {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      })
      
      const { data: serverData, error: serverError } = await serverSupabase
        .from('clients')
        .select('count')
        .limit(1)
      
      if (serverError) {
        console.error('❌ Server-side connection failed:', serverError.message)
      } else {
        console.log('✅ Server-side connection successful')
      }
    }
    
    // Test storage access
    console.log('\n🔍 Testing storage access...')
    const { data: buckets, error: storageError } = await supabase.storage.listBuckets()
    
    if (storageError) {
      console.error('❌ Storage access failed:', storageError.message)
    } else {
      console.log('✅ Storage access successful')
      console.log(`   Available buckets: ${buckets?.length || 0}`)
    }
    
    console.log('\n✅ Supabase connection test completed successfully!')
    
  } catch (error) {
    console.error('\n❌ Supabase connection test failed:', error.message)
    console.error('Error details:', error)
  }
}

testSupabaseConnection().catch(console.error) 