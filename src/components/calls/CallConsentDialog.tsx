'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { AlertCircle, Phone, Shield } from 'lucide-react'
import { CallConsentDialogProps } from '@/types/calls'

export function CallConsentDialog({
  clientName,
  onConsent,
  onDecline,
}: CallConsentDialogProps) {
  const [isOpen, setIsOpen] = useState(true)
  const [agreed, setAgreed] = useState(false)

  const handleConsent = () => {
    if (agreed) {
      setIsOpen(false)
      onConsent()
    }
  }

  const handleDecline = () => {
    setIsOpen(false)
    onDecline()
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[525px] bg-gray-900 text-gray-100 border-gray-800">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Shield className="h-5 w-5 text-emerald-500" />
            Call Recording Consent
          </DialogTitle>
          <DialogDescription className="text-gray-400 space-y-4 pt-4">
            <div className="flex items-start gap-3">
              <Phone className="h-5 w-5 text-emerald-500 mt-0.5" />
              <div>
                              <p className="font-medium text-gray-200">
                You&apos;re about to start a recorded call with {clientName}
              </p>
                <p className="text-sm mt-1">
                  This call will be recorded for quality assurance and health documentation purposes.
                </p>
              </div>
            </div>

            <div className="bg-gray-800 rounded-lg p-4 space-y-3">
              <h4 className="font-medium text-gray-200 flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-amber-500" />
                Important Information
              </h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>• The recording will be transcribed using AI technology</li>
                <li>• Health information will be extracted and summarized</li>
                <li>• All data is stored securely and HIPAA-compliant</li>
                <li>• You can request deletion of recordings at any time</li>
                <li>• This recording complies with US and Canadian regulations</li>
              </ul>
            </div>

            <div className="border-t border-gray-800 pt-4">
              <div className="flex items-start space-x-3">
                <Checkbox
                  id="consent"
                  checked={agreed}
                  onCheckedChange={(checked) => setAgreed(checked as boolean)}
                  className="mt-1 border-gray-600 data-[state=checked]:bg-emerald-600 data-[state=checked]:border-emerald-600"
                />
                <label
                  htmlFor="consent"
                  className="text-sm font-medium leading-relaxed cursor-pointer"
                >
                  I understand and consent to the recording of this call. I acknowledge that the recording
                  will be used for health assessment and improvement purposes only.
                </label>
              </div>
            </div>
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            variant="outline"
            onClick={handleDecline}
            className="bg-transparent border-gray-700 hover:bg-gray-800 text-gray-300"
          >
            Decline
          </Button>
          <Button
            onClick={handleConsent}
            disabled={!agreed}
            className="bg-emerald-600 hover:bg-emerald-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Start Recording
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}