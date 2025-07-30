import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

export function formatDateTime(date: Date | string): string {
  return new Date(date).toLocaleString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

export function generateId(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
}

/**
 * Safe form data processor to prevent trim errors
 */
export const processSafeFormData = (rawData: any) => {
  const safeString = (value: any): string => {
    if (value === null || value === undefined) return ''
    if (typeof value === 'string') return value.trim()
    return String(value).trim()
  }

  const safeNumber = (value: any): number => {
    if (value === null || value === undefined) return 0
    const num = parseFloat(String(value))
    return isNaN(num) ? 0 : num
  }

  const safeDate = (value: any): string => {
    if (!value) return ''
    if (value instanceof Date) return value.toISOString().split('T')[0]
    return String(value)
  }

  return {
    // Personal information
    firstName: safeString(rawData.firstName),
    lastName: safeString(rawData.lastName),
    email: safeString(rawData.email),
    phone: safeString(rawData.phone),
    dateOfBirth: safeDate(rawData.dateOfBirth),
    gender: safeString(rawData.gender),
    occupation: safeString(rawData.occupation),
    
    // Emergency contact
    emergencyContactName: safeString(rawData.emergencyContactName),
    emergencyContactPhone: safeString(rawData.emergencyContactPhone),
    emergencyContactRelationship: safeString(rawData.emergencyContactRelationship),
    
    // Communication preferences
    preferredCommunication: safeString(rawData.preferredCommunication),
    
    // Insurance
    insuranceProvider: safeString(rawData.insuranceProvider),
    insuranceId: safeString(rawData.insuranceId),
    
    // Health information
    currentDiet: safeString(rawData.currentDiet),
    allergies: safeString(rawData.allergies),
    medications: safeString(rawData.medications),
    healthGoals: safeString(rawData.healthGoals),
    
    // Lifestyle
    activityLevel: safeString(rawData.activityLevel),
    sleepHours: safeNumber(rawData.sleepHours),
    stressLevel: safeNumber(rawData.stressLevel),
    
    // DOT specific (for streamlined onboarding)
    dotStatus: safeString(rawData.dotStatus),
    truckInfo: safeString(rawData.truckInfo),
    
    // Client information
    clientName: safeString(rawData.clientName),
    clientEmail: safeString(rawData.clientEmail),
    clientFirstName: safeString(rawData.clientFirstName),
    clientLastName: safeString(rawData.clientLastName),
    assessmentDate: safeDate(rawData.assessmentDate)
  }
}

/**
 * Validate form data and return errors
 */
export const validateFormData = (formData: any): { valid: boolean; errors: Record<string, string> } => {
  const errors: Record<string, string> = {}

  // Required fields validation
  if (!formData.firstName?.trim()) {
    errors.firstName = 'First name is required'
  }
  
  if (!formData.lastName?.trim()) {
    errors.lastName = 'Last name is required'
  }
  
  if (!formData.email?.trim()) {
    errors.email = 'Email is required'
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
    errors.email = 'Please enter a valid email address'
  }
  
  if (!formData.phone?.trim()) {
    errors.phone = 'Phone number is required'
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors
  }
}

/**
 * Debug logging for form data processing
 */
export const debugFormData = (formData: any, context: string = 'Form Data') => {
  console.log(`=== ${context} DEBUG ===`)
  console.log('1. Raw form data received:', formData)
  console.log('2. Form data type:', typeof formData)
  
  if (formData && typeof formData === 'object') {
    Object.keys(formData).forEach(key => {
      const value = formData[key]
      console.log(`3. ${key}:`, value, `(type: ${typeof value})`)
    })
  }
  
  console.log('=== END DEBUG ===')
}
