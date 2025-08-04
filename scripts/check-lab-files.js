require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkLabFiles() {
  console.log('🔍 Checking lab-files bucket...\n');

  try {
    // Check 2025 directory
    console.log('📁 Checking 2025/ directory...');
    const { data: files2025, error: error2025 } = await supabase
      .storage
      .from('lab-files')
      .list('2025', { limit: 100 });

    if (error2025) {
      console.log('❌ Failed to list 2025 directory:', error2025);
    } else {
      console.log(`📄 Files in 2025/ (${files2025?.length || 0}):`);
      if (files2025 && files2025.length > 0) {
        files2025.forEach(file => {
          console.log(`   - ${file.name} (${file.metadata?.size || 'unknown'} bytes)`);
          console.log(`     Created: ${file.created_at}`);
          console.log(`     Updated: ${file.updated_at}`);
        });
      } else {
        console.log('   No files found');
      }
    }

    // Check 2025/08 directory
    console.log('\n📁 Checking 2025/08/ directory...');
    const { data: files202508, error: error202508 } = await supabase
      .storage
      .from('lab-files')
      .list('2025/08', { limit: 100 });

    if (error202508) {
      console.log('❌ Failed to list 2025/08 directory:', error202508);
    } else {
      console.log(`📄 Files in 2025/08/ (${files202508?.length || 0}):`);
      if (files202508 && files202508.length > 0) {
        files202508.forEach(file => {
          console.log(`   - ${file.name} (${file.metadata?.size || 'unknown'} bytes)`);
          console.log(`     Created: ${file.created_at}`);
          console.log(`     Updated: ${file.updated_at}`);
        });
      } else {
        console.log('   No files found');
      }
    }

    // Check 2025/08/04 directory
    console.log('\n📁 Checking 2025/08/04/ directory...');
    const { data: files20250804, error: error20250804 } = await supabase
      .storage
      .from('lab-files')
      .list('2025/08/04', { limit: 100 });

    if (error20250804) {
      console.log('❌ Failed to list 2025/08/04 directory:', error20250804);
    } else {
      console.log(`📄 Files in 2025/08/04/ (${files20250804?.length || 0}):`);
      if (files20250804 && files20250804.length > 0) {
        files20250804.forEach(file => {
          console.log(`   - ${file.name} (${file.metadata?.size || 'unknown'} bytes)`);
          console.log(`     Created: ${file.created_at}`);
          console.log(`     Updated: ${file.updated_at}`);
        });
      } else {
        console.log('   No files found');
      }
    }

  } catch (error) {
    console.error('❌ Check failed:', error);
  }
}

checkLabFiles(); 