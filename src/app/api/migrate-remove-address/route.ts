import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    // Add basic auth check for security
    const authHeader = request.headers.get('authorization')
    const expectedAuth = `Bearer ${process.env.MIGRATION_SECRET || 'your-secret-key'}`
    
    if (authHeader !== expectedAuth) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const supabase = createServerSupabaseClient()
    
    console.log('🚀 Starting address field removal migration...')
    
    const results = {
      success: true,
      removed_columns: [] as string[],
      errors: [] as string[],
      timestamp: new Date().toISOString()
    }
    
    // List of columns to remove
    const columnsToRemove = [
      'address',
      'city', 
      'state',
      'zip_code',
      'emergency_contact',
      'emergency_phone'
    ]
    
    for (const column of columnsToRemove) {
      try {
        const { error } = await supabase.rpc('exec_sql', {
          sql: `ALTER TABLE client_onboarding DROP COLUMN IF EXISTS ${column}`
        })
        
        if (error) {
          console.error(`❌ Error removing ${column} column:`, error)
          results.errors.push(`Failed to remove ${column}: ${error.message}`)
        } else {
          console.log(`✅ Removed ${column} column`)
          results.removed_columns.push(column)
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error'
        console.error(`❌ Exception removing ${column}:`, errorMessage)
        results.errors.push(`Exception removing ${column}: ${errorMessage}`)
      }
    }
    
    // Update table comment
    try {
      const { error: commentError } = await supabase.rpc('exec_sql', {
        sql: "COMMENT ON TABLE client_onboarding IS 'Streamlined onboarding system for FNTP truck driver clients - essential info only (no address fields)'"
      })
      
      if (commentError) {
        console.error('❌ Error updating table comment:', commentError)
        results.errors.push(`Failed to update table comment: ${commentError.message}`)
      } else {
        console.log('✅ Updated table comment')
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error'
      console.error('❌ Exception updating table comment:', errorMessage)
      results.errors.push(`Exception updating table comment: ${errorMessage}`)
    }
    
    if (results.errors.length > 0) {
      results.success = false
    }
    
    console.log('🎉 Address field removal migration completed!')
    console.log('Results:', results)
    
    return NextResponse.json(results)

  } catch (error) {
    console.error('❌ Migration failed:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
} 