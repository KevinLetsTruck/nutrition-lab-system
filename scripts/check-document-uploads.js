#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.VITE_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials. Please check your .env.local file.')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkDocumentUploads() {
  console.log('🔍 Checking document uploads for kevin2@letstruck.com...\n')

  try {
    // Find kevin2@letstruck.com in both tables
    console.log('📊 Finding kevin2@letstruck.com in client_profiles...')
    const { data: profiles, error: profilesError } = await supabase
      .from('client_profiles')
      .select('*, users!client_profiles_user_id_fkey(email)')
      .eq('users.email', 'kevin2@letstruck.com')

    if (profilesError) {
      console.error('❌ Error fetching profiles:', profilesError)
      return
    }

    console.log(`Found ${profiles.length} profile(s) for kevin2@letstruck.com`)
    const profileIds = profiles.map(p => p.id)
    console.log('Profile IDs:', profileIds)

    console.log('\n📊 Finding kevin2@letstruck.com in clients table...')
    const { data: clients, error: clientsError } = await supabase
      .from('clients')
      .select('*')
      .eq('email', 'kevin2@letstruck.com')

    if (clientsError) {
      console.error('❌ Error fetching clients:', clientsError)
      return
    }

    console.log(`Found ${clients.length} client(s) for kevin2@letstruck.com`)
    const clientIds = clients.map(c => c.id)
    console.log('Client IDs:', clientIds)

    // Check lab_reports for both sets of IDs
    console.log('\n📊 Checking lab_reports for profile IDs...')
    for (const id of profileIds) {
      const { data: reports, error } = await supabase
        .from('lab_reports')
        .select('*')
        .eq('client_id', id)

      if (!error) {
        console.log(`  ID ${id}: ${reports.length} documents`)
        if (reports.length > 0) {
          reports.forEach(r => {
            console.log(`    - ${r.report_type} (${r.created_at}) - ${r.file_path || 'No file'}`)
          })
        }
      }
    }

    console.log('\n📊 Checking lab_reports for client IDs...')
    for (const id of clientIds) {
      const { data: reports, error } = await supabase
        .from('lab_reports')
        .select('*')
        .eq('client_id', id)

      if (!error) {
        console.log(`  ID ${id}: ${reports.length} documents`)
        if (reports.length > 0) {
          reports.forEach(r => {
            console.log(`    - ${r.report_type} (${r.created_at}) - ${r.file_path || 'No file'}`)
          })
        }
      }
    }

    // Show all recent uploads
    console.log('\n📊 Recent uploads (last 10):')
    const { data: recentReports, error: recentError } = await supabase
      .from('lab_reports')
      .select('*, clients!lab_reports_client_id_fkey(email, first_name, last_name)')
      .order('created_at', { ascending: false })
      .limit(10)

    if (!recentError && recentReports) {
      recentReports.forEach(r => {
        console.log(`  ${r.created_at} - ${r.clients?.email || 'Unknown'} - ${r.report_type} - Client ID: ${r.client_id}`)
      })
    }

    console.log('\n💡 DIAGNOSIS:')
    console.log('The client detail page is using the client_profiles ID to fetch documents,')
    console.log('but uploads are being linked to the clients table ID.')
    console.log('\nThis is why you see a success message but no documents appear.')

  } catch (error) {
    console.error('❌ Error:', error)
  }
}

checkDocumentUploads()