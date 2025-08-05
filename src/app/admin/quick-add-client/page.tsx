'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { FileUploadSection } from '@/components/ui/file-upload-section'
import { toast } from 'sonner'

interface QuickAddClientData {
  firstName: string
  lastName: string
  age: string
  email: string
  healthConcerns: string
  goals: string
  files: File[]
}

export default function QuickAddClientPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState<QuickAddClientData>({
    firstName: '',
    lastName: '',
    age: '',
    email: '',
    healthConcerns: '',
    goals: '',
    files: []
  })

  const handleInputChange = (field: keyof QuickAddClientData, value: string | File[]) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleFileUpload = (files: File[]) => {
    setFormData(prev => ({
      ...prev,
      files: [...prev.files, ...files]
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const formDataToSend = new FormData()
      formDataToSend.append('firstName', formData.firstName)
      formDataToSend.append('lastName', formData.lastName)
      formDataToSend.append('age', formData.age)
      formDataToSend.append('email', formData.email)
      formDataToSend.append('healthConcerns', formData.healthConcerns)
      formDataToSend.append('goals', formData.goals)
      
      formData.files.forEach((file, index) => {
        formDataToSend.append(`files`, file)
      })

      const response = await fetch('/api/admin/quick-add-client', {
        method: 'POST',
        body: formDataToSend,
        credentials: 'include'
      })

      const result = await response.json()

      if (response.ok) {
        toast.success('Client added successfully! Welcome email sent.')
        setFormData({
          firstName: '',
          lastName: '',
          age: '',
          email: '',
          healthConcerns: '',
          goals: '',
          files: []
        })
        router.push('/clients')
      } else {
        toast.error(result.error || 'Failed to add client')
      }
    } catch (error) {
      console.error('Error adding client:', error)
      toast.error('An error occurred while adding the client')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-900 py-8">
      <div className="container mx-auto px-4 max-w-2xl">
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-white">
              Quick Add Client
            </CardTitle>
            <CardDescription className="text-slate-400">
              Add a new client and automatically create their account with welcome email
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName" className="text-white">
                    First Name *
                  </Label>
                  <Input
                    id="firstName"
                    type="text"
                    required
                    value={formData.firstName}
                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                    className="bg-slate-700 border-slate-600 text-white"
                    placeholder="Enter first name"
                  />
                </div>
                <div>
                  <Label htmlFor="lastName" className="text-white">
                    Last Name *
                  </Label>
                  <Input
                    id="lastName"
                    type="text"
                    required
                    value={formData.lastName}
                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                    className="bg-slate-700 border-slate-600 text-white"
                    placeholder="Enter last name"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="age" className="text-white">
                    Age *
                  </Label>
                  <Input
                    id="age"
                    type="number"
                    required
                    min="1"
                    max="120"
                    value={formData.age}
                    onChange={(e) => handleInputChange('age', e.target.value)}
                    className="bg-slate-700 border-slate-600 text-white"
                    placeholder="Enter age"
                  />
                </div>
                <div>
                  <Label htmlFor="email" className="text-white">
                    Email *
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className="bg-slate-700 border-slate-600 text-white"
                    placeholder="Enter email address"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="healthConcerns" className="text-white">
                  Primary Health Concerns
                </Label>
                <Textarea
                  id="healthConcerns"
                  value={formData.healthConcerns}
                  onChange={(e) => handleInputChange('healthConcerns', e.target.value)}
                  className="bg-slate-700 border-slate-600 text-white min-h-[100px]"
                  placeholder="Describe the client's main health concerns..."
                />
              </div>

              <div>
                <Label htmlFor="goals" className="text-white">
                  Health Goals
                </Label>
                <Textarea
                  id="goals"
                  value={formData.goals}
                  onChange={(e) => handleInputChange('goals', e.target.value)}
                  className="bg-slate-700 border-slate-600 text-white min-h-[100px]"
                  placeholder="What are the client's health goals?"
                />
              </div>

              <div>
                <Label className="text-white">Upload Files (Optional)</Label>
                <div className="border-2 border-dashed border-slate-600 rounded-lg p-6 text-center">
                  <input
                    type="file"
                    multiple
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) => {
                      const files = Array.from(e.target.files || [])
                      handleFileUpload(files)
                    }}
                    className="hidden"
                    id="file-upload"
                  />
                  <label htmlFor="file-upload" className="cursor-pointer">
                    <div className="text-slate-400 hover:text-white transition-colors">
                      <svg className="mx-auto h-12 w-12 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                      <p>Click to upload files or drag and drop</p>
                      <p className="text-sm">PDF, JPG, PNG up to 10MB each</p>
                    </div>
                  </label>
                </div>
                {formData.files.length > 0 && (
                  <div className="mt-4">
                    <p className="text-sm text-slate-400 mb-2">Selected files:</p>
                    <ul className="space-y-1">
                      {formData.files.map((file, index) => (
                        <li key={index} className="text-sm text-white flex items-center justify-between">
                          <span>{file.name}</span>
                          <button
                            type="button"
                            onClick={() => {
                              const newFiles = formData.files.filter((_, i) => i !== index)
                              handleInputChange('files', newFiles)
                            }}
                            className="text-red-400 hover:text-red-300"
                          >
                            Remove
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              <div className="flex gap-4 pt-4">
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {isLoading ? 'Adding Client...' : 'Add Client & Send Welcome Email'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push('/clients')}
                  className="border-slate-600 text-slate-300 hover:bg-slate-700"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 