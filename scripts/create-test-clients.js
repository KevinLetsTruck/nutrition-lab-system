const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing required environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function createTestClients() {
  console.log('🚀 Creating test clients...')

  const testClients = [
    {
      first_name: 'John',
      last_name: 'Smith',
      email: 'john.smith@test.com',
      phone: '(555) 123-4567',
      date_of_birth: '1985-03-15',
      medical_history: 'Hypertension, currently taking blood pressure medication',
      allergies: 'None known',
      current_medications: 'Lisinopril 10mg daily'
    },
    {
      first_name: 'Sarah',
      last_name: 'Johnson',
      email: 'sarah.johnson@test.com',
      phone: '(555) 234-5678',
      date_of_birth: '1990-07-22',
      medical_history: 'Anxiety, occasional migraines',
      allergies: 'Pollen',
      current_medications: 'None'
    },
    {
      first_name: 'Mike',
      last_name: 'Wilson',
      email: 'mike.wilson@test.com',
      phone: '(555) 345-6789',
      date_of_birth: '1988-11-08',
      medical_history: 'Type 2 diabetes, family history of heart disease',
      allergies: 'None known',
      current_medications: 'Metformin 500mg twice daily'
    }
  ]

  try {
    for (const clientData of testClients) {
      const { data, error } = await supabase
        .from('clients')
        .insert(clientData)
        .select()

      if (error) {
        console.error('❌ Error creating client:', error)
      } else {
        console.log('✅ Created client:', data[0].id, `${data[0].first_name} ${data[0].last_name}`)
      }
    }

    console.log('🎉 Test clients creation completed!')
  } catch (error) {
    console.error('❌ Error:', error)
  }
}

createTestClients() 