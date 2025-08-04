require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkStorage() {
  console.log('🔍 Checking Storage Buckets...\n');

  try {
    // List all buckets
    const { data: buckets, error: bucketsError } = await supabase
      .storage
      .listBuckets();

    if (bucketsError) {
      console.log('❌ Failed to list buckets:', bucketsError);
      return;
    }

    console.log('📦 Available buckets:');
    buckets.forEach(bucket => {
      console.log(`   - ${bucket.name} (${bucket.public ? 'public' : 'private'})`);
    });

    // Check quick-analysis bucket
    console.log('\n🔍 Checking quick-analysis bucket:');
    const { data: quickFiles, error: quickError } = await supabase
      .storage
      .from('quick-analysis')
      .list('', { limit: 10 });

    if (quickError) {
      console.log('❌ Failed to list quick-analysis files:', quickError);
    } else {
      console.log(`📄 Quick-analysis files (${quickFiles?.length || 0}):`);
      if (quickFiles && quickFiles.length > 0) {
        quickFiles.forEach(file => {
          console.log(`   - ${file.name} (${file.metadata?.size || 'unknown'} bytes)`);
        });
      } else {
        console.log('   No files found');
      }
    }

    // Check client-documents bucket
    console.log('\n🔍 Checking client-documents bucket:');
    const { data: clientFiles, error: clientError } = await supabase
      .storage
      .from('client-documents')
      .list('', { limit: 10 });

    if (clientError) {
      console.log('❌ Failed to list client-documents files:', clientError);
    } else {
      console.log(`📄 Client-documents files (${clientFiles?.length || 0}):`);
      if (clientFiles && clientFiles.length > 0) {
        clientFiles.forEach(file => {
          console.log(`   - ${file.name} (${file.metadata?.size || 'unknown'} bytes)`);
        });
      } else {
        console.log('   No files found');
      }
    }

  } catch (error) {
    console.error('❌ Check failed:', error);
  }
}

checkStorage(); 