import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase'
import { CallType, AICallSummary, CallPriority, NoteType } from '@/types/calls'
import { getAIService } from '@/lib/ai'

export async function POST(request: NextRequest) {
  try {
    console.log('[CALL-PROCESSING] Starting recording processing...')
    
    // Get AI service for analysis
    const aiService = getAIService()
    
    // NOTE: OpenAI Whisper transcription is not yet supported by the AI service
    // So we need to use direct OpenAI client for transcription
    let openai: any
    if (process.env.OPENAI_API_KEY) {
      try {
        const OpenAI = require('openai').default
        openai = new OpenAI({
          apiKey: process.env.OPENAI_API_KEY,
        })
      } catch (error) {
        console.error('[CALL-PROCESSING] Failed to initialize OpenAI client:', error)
      }
    }
    
    // Parse form data
    const formData = await request.formData()
    const audioFile = formData.get('audio') as File
    const clientId = formData.get('clientId') as string
    const callType = formData.get('callType') as CallType
    const duration = parseInt(formData.get('duration') as string || '0')

    if (!audioFile || !clientId || !callType) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }

    console.log('[CALL-PROCESSING] Processing call:', {
      clientId,
      callType,
      audioSize: audioFile.size,
      duration,
    })

    // Initialize Supabase client
    const supabase = createServerSupabaseClient()

    // 1. Upload audio to Supabase storage
    const timestamp = Date.now()
    const fileName = `${clientId}/${callType}_${timestamp}.webm`
    
    const arrayBuffer = await audioFile.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    
    console.log('[CALL-PROCESSING] Uploading to storage...')
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('call-recordings')
      .upload(fileName, buffer, {
        contentType: audioFile.type || 'audio/webm',
        upsert: false,
      })

    if (uploadError) {
      console.error('[CALL-PROCESSING] Upload error:', uploadError)
      return NextResponse.json(
        { success: false, error: 'Failed to upload recording' },
        { status: 500 }
      )
    }

    // Get public URL for the recording
    const { data: urlData } = supabase.storage
      .from('call-recordings')
      .getPublicUrl(fileName)

    const recordingUrl = urlData.publicUrl

    // 2. Create initial call recording entry
    const { data: callRecording, error: dbError } = await supabase
      .from('call_recordings')
      .insert({
        client_id: clientId,
        call_type: callType,
        recording_url: recordingUrl,
        duration_seconds: duration,
        consent_given: true,
      })
      .select()
      .single()

    if (dbError) {
      console.error('[CALL-PROCESSING] Database error:', dbError)
      return NextResponse.json(
        { success: false, error: 'Failed to save recording info' },
        { status: 500 }
      )
    }

    // 3. Transcribe audio using OpenAI Whisper
    console.log('[CALL-PROCESSING] Starting transcription...')
    try {
      // Convert buffer to File for OpenAI API
      const transcriptionFile = new File([buffer], 'audio.webm', { type: audioFile.type })
      
      if (!openai) {
        throw new Error('OpenAI client not initialized. Whisper transcription requires OPENAI_API_KEY.')
      }
      
      const transcription = await openai.audio.transcriptions.create({
        file: transcriptionFile,
        model: 'whisper-1',
        language: 'en',
      })

      const transcript = transcription.text
      console.log('[CALL-PROCESSING] Transcription complete, length:', transcript.length)

      // Update recording with transcript
      await supabase
        .from('call_recordings')
        .update({ transcript })
        .eq('id', callRecording.id)

      // 4. Analyze transcript with Claude
      console.log('[CALL-PROCESSING] Analyzing with Claude...')
      const systemPrompt = `You are a health assessment AI specializing in analyzing calls with truck drivers about their health. Extract structured information from call transcripts.`

      const userPrompt = `Analyze this ${callType} call transcript for a truck driver health client:

TRANSCRIPT: ${transcript}

Extract and organize as JSON with this exact structure:
{
  "callSummary": "2-3 sentence summary of the main points discussed",
  "healthUpdates": {
    "newSymptoms": ["list of any new symptoms mentioned"],
    "symptomChanges": ["list of changes to existing symptoms"],
    "compliance": "summary of medication/treatment compliance"
  },
  "lifestyleFactors": {
    "driving": "any mentions of driving schedule, routes, or work conditions",
    "sleep": "sleep patterns, quality, or issues mentioned",
    "diet": "dietary habits, changes, or concerns",
    "exercise": "physical activity levels or limitations"
  },
  "concerns": ["list of health concerns or worries expressed"],
  "actionItems": ["specific action items or follow-ups needed"],
  "nextSteps": "recommended next steps based on the conversation",
  "priority": "normal|high|urgent based on content severity"
}

Focus on FNTP-relevant health information for truck drivers. If information for a field is not mentioned, use empty string or empty array as appropriate.`

      const response = await aiService.complete(userPrompt, {
        systemPrompt,
        temperature: 0,
        maxTokens: 2000,
        provider: 'anthropic',
        useCache: false
      })
      
      const message = { content: [{ type: 'text', text: response.content }] }

      let aiSummary: AICallSummary
      try {
        const responseText = message.content[0].type === 'text' ? message.content[0].text : ''
        // Extract JSON from the response
        const jsonMatch = responseText.match(/\{[\s\S]*\}/)
        if (jsonMatch) {
          aiSummary = JSON.parse(jsonMatch[0])
        } else {
          throw new Error('No JSON found in response')
        }
      } catch (parseError) {
        console.error('[CALL-PROCESSING] Failed to parse AI response:', parseError)
        // Create a fallback summary
        aiSummary = {
          callSummary: 'Call transcript analyzed but structured data extraction failed.',
          healthUpdates: { newSymptoms: [], symptomChanges: [], compliance: '' },
          lifestyleFactors: { driving: '', sleep: '', diet: '', exercise: '' },
          concerns: [],
          actionItems: [],
          nextSteps: '',
          priority: 'normal' as CallPriority,
        }
      }

      // Update recording with AI summary
      await supabase
        .from('call_recordings')
        .update({ ai_summary: aiSummary })
        .eq('id', callRecording.id)

      // 5. Extract and save individual call notes
      const callNotes: Array<{
        call_recording_id: string
        note_type: NoteType
        content: string
        priority: CallPriority
      }> = []

      // Add notes for new symptoms
      aiSummary.healthUpdates.newSymptoms.forEach(symptom => {
        callNotes.push({
          call_recording_id: callRecording.id,
          note_type: 'symptom_update',
          content: `New symptom: ${symptom}`,
          priority: aiSummary.priority,
        })
      })

      // Add notes for concerns
      aiSummary.concerns.forEach(concern => {
        callNotes.push({
          call_recording_id: callRecording.id,
          note_type: 'concern',
          content: concern,
          priority: aiSummary.priority,
        })
      })

      // Add compliance note if present
      if (aiSummary.healthUpdates.compliance) {
        callNotes.push({
          call_recording_id: callRecording.id,
          note_type: 'compliance',
          content: aiSummary.healthUpdates.compliance,
          priority: 'normal',
        })
      }

      // Save all notes
      if (callNotes.length > 0) {
        const { error: notesError } = await supabase
          .from('call_notes')
          .insert(callNotes)

        if (notesError) {
          console.error('[CALL-PROCESSING] Failed to save notes:', notesError)
        }
      }

      console.log('[CALL-PROCESSING] Processing complete!')
      
      return NextResponse.json({
        success: true,
        callRecordingId: callRecording.id,
        summary: aiSummary,
      })

    } catch (transcriptionError: any) {
      console.error('[CALL-PROCESSING] Transcription error:', transcriptionError)
      
      // Update recording with error status
      await supabase
        .from('call_recordings')
        .update({ 
          transcript: 'Transcription failed',
          ai_summary: {
            callSummary: 'Transcription failed - unable to process audio',
            healthUpdates: { newSymptoms: [], symptomChanges: [], compliance: '' },
            lifestyleFactors: { driving: '', sleep: '', diet: '', exercise: '' },
            concerns: [],
            actionItems: [],
            nextSteps: 'Please try recording again or contact support',
            priority: 'normal',
          }
        })
        .eq('id', callRecording.id)

      return NextResponse.json(
        { 
          success: false, 
          error: 'Failed to transcribe audio. Please ensure your OpenAI API key is configured.',
          callRecordingId: callRecording.id,
        },
        { status: 500 }
      )
    }

  } catch (error: any) {
    console.error('[CALL-PROCESSING] Unexpected error:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}

// OPTIONS handler for CORS
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  })
}