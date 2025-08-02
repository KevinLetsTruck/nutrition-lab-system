'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Mic, MicOff, Phone, PhoneOff, Loader2, AlertCircle } from 'lucide-react'
import { CallRecorderProps } from '@/types/calls'
import { useToast } from '@/components/ui/use-toast'

export function CallRecorder({
  clientId,
  callType,
  onRecordingComplete,
}: CallRecorderProps) {
  const [isRecording, setIsRecording] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const [audioLevel, setAudioLevel] = useState(0)
  const [error, setError] = useState<string | null>(null)
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const streamRef = useRef<MediaStream | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const animationFrameRef = useRef<number | null>(null)
  const startTimeRef = useRef<number | null>(null)
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  
  const { toast } = useToast()

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current)
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop())
      }
    }
  }, [])

  // Format time display
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  // Monitor audio levels
  const monitorAudioLevels = () => {
    if (!analyserRef.current) return

    const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount)
    analyserRef.current.getByteFrequencyData(dataArray)
    
    const average = dataArray.reduce((a, b) => a + b) / dataArray.length
    setAudioLevel(Math.min(100, (average / 128) * 100))
    
    animationFrameRef.current = requestAnimationFrame(monitorAudioLevels)
  }

  // Start recording
  const startRecording = async () => {
    try {
      setError(null)
      
      // Request microphone permission
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100,
        }
      })
      
      streamRef.current = stream

      // Set up audio analyser for visualization
      const audioContext = new AudioContext()
      const source = audioContext.createMediaStreamSource(stream)
      const analyser = audioContext.createAnalyser()
      analyser.fftSize = 256
      source.connect(analyser)
      analyserRef.current = analyser

      // Set up MediaRecorder
      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? 'audio/webm;codecs=opus'
        : 'audio/webm'
      
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType,
        audioBitsPerSecond: 128000,
      })
      
      mediaRecorderRef.current = mediaRecorder
      audioChunksRef.current = []

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data)
        }
      }

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: mimeType })
        const duration = recordingTime
        onRecordingComplete(audioBlob, duration)
      }

      // Start recording
      mediaRecorder.start(1000) // Collect data every second
      setIsRecording(true)
      startTimeRef.current = Date.now()
      
      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1)
      }, 1000)
      
      // Start audio level monitoring
      monitorAudioLevels()
      
      toast({
        title: 'Recording started',
        description: 'Your call is now being recorded.',
      })
      
    } catch (err) {
      console.error('Error starting recording:', err)
      setError('Failed to access microphone. Please check your permissions.')
      toast({
        title: 'Recording failed',
        description: 'Could not access your microphone.',
        variant: 'destructive',
      })
    }
  }

  // Stop recording
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      
      // Stop all tracks
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop())
      }
      
      // Clear timers
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
      
      // Stop audio monitoring
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
      
      setIsRecording(false)
      setIsPaused(false)
      setAudioLevel(0)
      
      toast({
        title: 'Recording stopped',
        description: 'Processing your recording...',
      })
    }
  }

  // Pause/Resume recording
  const togglePause = () => {
    if (!mediaRecorderRef.current || !isRecording) return

    if (isPaused) {
      mediaRecorderRef.current.resume()
      setIsPaused(false)
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1)
      }, 1000)
      monitorAudioLevels()
    } else {
      mediaRecorderRef.current.pause()
      setIsPaused(true)
      if (timerRef.current) clearInterval(timerRef.current)
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current)
      setAudioLevel(0)
    }
  }

  return (
    <Card className="bg-gray-900 border-gray-800 p-6">
      <div className="space-y-6">
        {/* Header */}
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-100">
            {callType.charAt(0).toUpperCase() + callType.slice(1).replace('_', ' ')} Call
          </h3>
          <p className="text-sm text-gray-400 mt-1">
            {isRecording ? 'Recording in progress' : 'Ready to record'}
          </p>
        </div>

        {/* Error display */}
        {error && (
          <div className="bg-red-900/20 border border-red-800 rounded-lg p-3 flex items-start gap-2">
            <AlertCircle className="h-4 w-4 text-red-500 mt-0.5" />
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}

        {/* Recording visualization */}
        <div className="relative">
          <div className="h-24 bg-gray-800 rounded-lg flex items-center justify-center overflow-hidden">
            {isRecording && !isPaused ? (
              <div className="flex items-center gap-2 w-full px-4">
                <Mic className="h-5 w-5 text-emerald-500" />
                <div className="flex-1 flex items-center gap-1">
                  {Array.from({ length: 20 }).map((_, i) => (
                    <div
                      key={i}
                      className="flex-1 bg-emerald-600 rounded-full transition-all duration-150"
                      style={{
                        height: `${Math.max(4, (audioLevel / 100) * 60 * Math.sin(i * 0.5 + Date.now() * 0.002))}px`,
                        opacity: audioLevel > 0 ? 1 : 0.3,
                      }}
                    />
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-gray-500">
                {isPaused ? (
                  <MicOff className="h-8 w-8" />
                ) : (
                  <Mic className="h-8 w-8" />
                )}
              </div>
            )}
          </div>
          
          {/* Recording time */}
          {(isRecording || recordingTime > 0) && (
            <div className="absolute top-2 right-2 bg-gray-700 px-2 py-1 rounded text-xs font-mono text-gray-200">
              {formatTime(recordingTime)}
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-3">
          {!isRecording ? (
            <Button
              onClick={startRecording}
              size="lg"
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              <Phone className="h-5 w-5 mr-2" />
              Start Recording
            </Button>
          ) : (
            <>
              <Button
                onClick={togglePause}
                variant="outline"
                size="lg"
                className="bg-transparent border-gray-700 hover:bg-gray-800 text-gray-300"
              >
                {isPaused ? (
                  <>
                    <Mic className="h-5 w-5 mr-2" />
                    Resume
                  </>
                ) : (
                  <>
                    <MicOff className="h-5 w-5 mr-2" />
                    Pause
                  </>
                )}
              </Button>
              <Button
                onClick={stopRecording}
                size="lg"
                variant="destructive"
                className="bg-red-600 hover:bg-red-700"
              >
                <PhoneOff className="h-5 w-5 mr-2" />
                End Call
              </Button>
            </>
          )}
        </div>

        {/* Instructions */}
        <div className="text-center text-sm text-gray-400">
          {!isRecording ? (
            <p>Click &quot;Start Recording&quot; when you&apos;re ready to begin the call</p>
          ) : (
            <p>Speak clearly into your microphone. You can pause or end the recording at any time.</p>
          )}
        </div>
      </div>
    </Card>
  )
}