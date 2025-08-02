'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Phone, History, Loader2 } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useToast } from '@/components/ui/use-toast'
import { CallConsentDialog } from './CallConsentDialog'
import { CallRecorder } from './CallRecorder'
import { CallNotesSummary } from './CallNotesSummary'
import { CallType, CallRecording } from '@/types/calls'
import { format } from 'date-fns'

interface CallRecordingIntegrationProps {
  clientId: string
  clientName: string
}

export function CallRecordingIntegration({ clientId, clientName }: CallRecordingIntegrationProps) {
  const [showConsent, setShowConsent] = useState(false)
  const [showRecorder, setShowRecorder] = useState(false)
  const [selectedCallType, setSelectedCallType] = useState<CallType>('follow_up')
  const [callRecordings, setCallRecordings] = useState<CallRecording[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  
  const { toast } = useToast()

  // Fetch existing call recordings
  useEffect(() => {
    const fetchCallRecordings = async () => {
      setIsLoading(true)
      try {
        const { data, error } = await supabase
          .from('call_recordings')
          .select('*')
          .eq('client_id', clientId)
          .order('call_date', { ascending: false })
        
        if (error) throw error
        setCallRecordings(data || [])
      } catch (error) {
        console.error('Error fetching call recordings:', error)
        toast({
          title: 'Error',
          description: 'Failed to load call history',
          variant: 'destructive',
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchCallRecordings()
  }, [clientId, toast])

  const handleStartCall = (callType: CallType) => {
    setSelectedCallType(callType)
    setShowConsent(true)
  }

  const handleConsent = () => {
    setShowConsent(false)
    setShowRecorder(true)
  }

  const handleDecline = () => {
    setShowConsent(false)
    toast({
      title: 'Call cancelled',
      description: 'The call was not started as consent was not provided.',
    })
  }

  const handleRecordingComplete = async (recording: Blob, duration: number) => {
    setShowRecorder(false)
    setIsProcessing(true)
    
    try {
      // Create FormData for the API
      const formData = new FormData()
      formData.append('audio', recording, 'recording.webm')
      formData.append('clientId', clientId)
      formData.append('callType', selectedCallType)
      formData.append('duration', duration.toString())

      // Send to API for processing
      const response = await fetch('/api/calls/process-recording', {
        method: 'POST',
        body: formData,
      })

      const result = await response.json()

      if (result.success) {
        toast({
          title: 'Recording processed',
          description: 'Your call has been transcribed and analyzed.',
        })
        
        // Refresh call recordings
        const { data, error } = await supabase
          .from('call_recordings')
          .select('*')
          .eq('client_id', clientId)
          .order('call_date', { ascending: false })
        
        if (!error) {
          setCallRecordings(data || [])
        }
      } else {
        throw new Error(result.error || 'Processing failed')
      }
    } catch (error: any) {
      console.error('Error processing recording:', error)
      toast({
        title: 'Processing failed',
        description: error.message || 'Failed to process the recording',
        variant: 'destructive',
      })
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Call Recording Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Call Recording</CardTitle>
          <CardDescription>
            Record and transcribe calls with AI-powered health insights
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!showRecorder ? (
            <div className="flex flex-wrap gap-3">
              <Button onClick={() => handleStartCall('onboarding')}>
                <Phone className="h-4 w-4 mr-2" />
                Onboarding Call
              </Button>
              <Button onClick={() => handleStartCall('follow_up')} variant="secondary">
                <Phone className="h-4 w-4 mr-2" />
                Follow-up Call
              </Button>
              <Button onClick={() => handleStartCall('assessment')} variant="secondary">
                <Phone className="h-4 w-4 mr-2" />
                Assessment Call
              </Button>
            </div>
          ) : (
            <CallRecorder
              clientId={clientId}
              callType={selectedCallType}
              onRecordingComplete={handleRecordingComplete}
            />
          )}
          
          {isProcessing && (
            <div className="mt-4 p-4 bg-gray-800 rounded-lg flex items-center gap-3">
              <Loader2 className="h-5 w-5 animate-spin text-emerald-500" />
              <div>
                <p className="font-medium text-gray-200">Processing recording...</p>
                <p className="text-sm text-gray-400">This may take a minute</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Call History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Call History
          </CardTitle>
          <CardDescription>
            View past calls and AI-generated summaries
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            </div>
          ) : callRecordings.length === 0 ? (
            <p className="text-center py-8 text-gray-400">
              No call recordings yet. Start a call to begin tracking health conversations.
            </p>
          ) : (
            <Tabs defaultValue={callRecordings[0]?.id} className="w-full">
              <TabsList className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 h-auto">
                {callRecordings.map((recording) => (
                  <TabsTrigger
                    key={recording.id}
                    value={recording.id}
                    className="flex flex-col items-start p-3 h-auto"
                  >
                    <div className="font-medium">
                      {recording.call_type.charAt(0).toUpperCase() + 
                       recording.call_type.slice(1).replace('_', ' ')}
                    </div>
                    <div className="text-xs text-gray-400">
                      {format(new Date(recording.call_date), 'MMM d, yyyy')}
                    </div>
                  </TabsTrigger>
                ))}
              </TabsList>
              
              {callRecordings.map((recording) => (
                <TabsContent key={recording.id} value={recording.id} className="mt-6">
                  <CallNotesSummary callRecording={recording} />
                  
                  {/* Additional Actions */}
                  <div className="mt-4 flex gap-2">
                    {recording.recording_url && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(recording.recording_url, '_blank')}
                      >
                        Play Recording
                      </Button>
                    )}
                    {recording.transcript && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          // You could implement a modal to show the full transcript
                          console.log('Show transcript:', recording.transcript)
                        }}
                      >
                        View Transcript
                      </Button>
                    )}
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          )}
        </CardContent>
      </Card>

      {/* Consent Dialog */}
      {showConsent && (
        <CallConsentDialog
          clientName={clientName}
          onConsent={handleConsent}
          onDecline={handleDecline}
        />
      )}
    </div>
  )
}