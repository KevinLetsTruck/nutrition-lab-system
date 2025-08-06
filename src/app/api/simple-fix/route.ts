import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET(request: NextRequest) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
  
  try {
    // Simple hardcoded fix - just update file_url
    const updates = [
      {
        id: '713f5d32-2385-458c-b3b4-173289fca9f6',
        file_url: 'https://qmuvbhfpgwtdcxijgmyn.supabase.co/storage/v1/object/public/lab-files/clients/336ac9e9-dda3-477f-89d5-241df47b8745/1754455407444_corkadel_carole_fit176_report_07jul25.pdf'
      },
      {
        id: 'ec99b292-e5cb-4442-9404-0c3622ab5657',
        file_url: 'https://qmuvbhfpgwtdcxijgmyn.supabase.co/storage/v1/object/public/lab-files/clients/336ac9e9-dda3-477f-89d5-241df47b8745/1754455407444_corkadel_carole_fit176_report_07jul25.pdf'
      },
      {
        id: '49f40728-89bf-4706-bcaf-fcca5c453c98',
        file_url: 'https://qmuvbhfpgwtdcxijgmyn.supabase.co/storage/v1/object/public/lab-files/clients/336ac9e9-dda3-477f-89d5-241df47b8745/1754455408916_Symptom-Burden-Bar-Graph-17-1.pdf'
      }
    ]
    
    const results = []
    
    for (const update of updates) {
      const { data, error } = await supabase
        .from('lab_reports')
        .update({ file_url: update.file_url })
        .eq('id', update.id)
        .select()
      
      results.push({
        id: update.id,
        success: !error,
        error: error?.message,
        data
      })
    }
    
    return NextResponse.json({
      success: true,
      message: 'Simple fix applied - only updated file_url',
      results,
      nextStep: 'Refresh your client page'
    })
  } catch (error) {
    return NextResponse.json({ 
      error: 'Simple fix failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}