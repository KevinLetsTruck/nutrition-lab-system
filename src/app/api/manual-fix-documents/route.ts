import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET(request: NextRequest) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
  
  try {
    // Hardcoded fix for Kevin's documents
    const updates = [
      {
        reportId: '713f5d32-2385-458c-b3b4-173289fca9f6',
        file_url: 'https://ajwudhwruxxdshqjeqij.supabase.co/storage/v1/object/public/lab-files/clients/336ac9e9-dda3-477f-89d5-241df47b8745/1754455407444_corkadel_carole_fit176_report_07jul25.pdf',
        storage_path: 'clients/336ac9e9-dda3-477f-89d5-241df47b8745/1754455407444_corkadel_carole_fit176_report_07jul25.pdf',
        file_name: 'corkadel_carole_fit176_report_07jul25.pdf'
      },
      {
        reportId: 'ec99b292-e5cb-4442-9404-0c3622ab5657',
        file_url: 'https://ajwudhwruxxdshqjeqij.supabase.co/storage/v1/object/public/lab-files/clients/336ac9e9-dda3-477f-89d5-241df47b8745/1754455407444_corkadel_carole_fit176_report_07jul25.pdf',
        storage_path: 'clients/336ac9e9-dda3-477f-89d5-241df47b8745/1754455407444_corkadel_carole_fit176_report_07jul25.pdf',
        file_name: 'corkadel_carole_fit176_report_07jul25.pdf'
      },
      {
        reportId: '49f40728-89bf-4706-bcaf-fcca5c453c98',
        file_url: 'https://ajwudhwruxxdshqjeqij.supabase.co/storage/v1/object/public/lab-files/clients/336ac9e9-dda3-477f-89d5-241df47b8745/1754455408916_Symptom-Burden-Bar-Graph-17-1.pdf',
        storage_path: 'clients/336ac9e9-dda3-477f-89d5-241df47b8745/1754455408916_Symptom-Burden-Bar-Graph-17-1.pdf',
        file_name: 'Symptom-Burden-Bar-Graph-17 (1).pdf'
      }
    ]
    
    const results = []
    
    for (const update of updates) {
      const { error } = await supabase
        .from('lab_reports')
        .update({
          file_url: update.file_url,
          storage_path: update.storage_path,
          file_path: update.storage_path,
          updated_at: new Date().toISOString()
        })
        .eq('id', update.reportId)
      
      if (!error) {
        results.push({
          reportId: update.reportId,
          fileName: update.file_name,
          success: true
        })
      } else {
        results.push({
          reportId: update.reportId,
          fileName: update.file_name,
          success: false,
          error: error.message
        })
      }
    }
    
    return NextResponse.json({
      success: true,
      message: 'Manual fix applied',
      results,
      nextStep: 'Refresh your client page to see the View PDF buttons!'
    })
  } catch (error) {
    return NextResponse.json({ 
      error: 'Failed to apply manual fix',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}