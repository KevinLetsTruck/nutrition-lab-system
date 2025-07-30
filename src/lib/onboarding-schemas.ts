import { z } from 'zod'

// Basic demographics schema (simplified - no address fields)
export const demographicsSchema = z.object({
  first_name: z.string().min(1, 'First name is required').max(100, 'First name too long'),
  last_name: z.string().min(1, 'Last name is required').max(100, 'Last name too long'),
  email: z.string().email('Please enter a valid email address')
})

// Diet approach schema
export const dietSchema = z.object({
  current_diet_approach: z.enum(['low_carb_paleo', 'keto_paleo', 'carnivore']).refine((val) => val !== undefined, {
    message: 'Please select your current diet approach'
  }),
  diet_duration_months: z.number().min(0).max(120).optional()
})

// Medications schema
export const medicationsSchema = z.object({
  current_medications: z.string().optional(),
  current_supplements: z.string().optional()
})

// Goals schema
export const goalsSchema = z.object({
  primary_health_goal: z.string().min(1, 'Please describe your primary health goal').max(500, 'Goal description too long')
})

// Truck driver schema
export const truckDriverSchema = z.object({
  years_driving: z.number().min(0).max(50).optional(),
  route_type: z.enum(['otr', 'regional', 'local']).refine((val) => val !== undefined, {
    message: 'Please select your route type'
  }),
  schedule_pattern: z.enum(['standard', 'irregular', 'night_shifts']).refine((val) => val !== undefined, {
    message: 'Please select your schedule pattern'
  })
})

// DOT status schema
export const dotStatusSchema = z.object({
  dot_medical_status: z.enum(['current', 'expired', 'upcoming']).refine((val) => val !== undefined, {
    message: 'Please select your DOT medical status'
  }),
  dot_expiry_date: z.string().optional().refine((val) => {
    if (!val) return true
    const date = new Date(val)
    return !isNaN(date.getTime())
  }, 'Please enter a valid expiry date')
})

// Complete onboarding schema (updated to match simplified structure)
export const completeOnboardingSchema = z.object({
  // Demographics (simplified)
  first_name: demographicsSchema.shape.first_name,
  last_name: demographicsSchema.shape.last_name,
  email: demographicsSchema.shape.email,
  
  // Diet
  current_diet_approach: dietSchema.shape.current_diet_approach,
  diet_duration_months: dietSchema.shape.diet_duration_months,
  
  // Medications
  current_medications: medicationsSchema.shape.current_medications,
  current_supplements: medicationsSchema.shape.current_supplements,
  
  // Goals
  primary_health_goal: goalsSchema.shape.primary_health_goal,
  
  // Truck driver info
  years_driving: truckDriverSchema.shape.years_driving,
  route_type: truckDriverSchema.shape.route_type,
  schedule_pattern: truckDriverSchema.shape.schedule_pattern,
  
  // DOT status
  dot_medical_status: dotStatusSchema.shape.dot_medical_status,
  dot_expiry_date: dotStatusSchema.shape.dot_expiry_date
})

// Step-specific schemas for progressive validation
export const stepSchemas = {
  demographics: demographicsSchema,
  diet: dietSchema,
  medications: medicationsSchema,
  goals: goalsSchema,
  truck_info: truckDriverSchema,
  dot_status: dotStatusSchema
}

// Type exports for TypeScript
export type DemographicsData = z.infer<typeof demographicsSchema>
export type DietData = z.infer<typeof dietSchema>
export type MedicationsData = z.infer<typeof medicationsSchema>
export type GoalsData = z.infer<typeof goalsSchema>
export type TruckDriverData = z.infer<typeof truckDriverSchema>
export type DotStatusData = z.infer<typeof dotStatusSchema>
export type CompleteOnboardingData = z.infer<typeof completeOnboardingSchema>

// Helper function to validate step data
export function validateStepData(step: string, data: any) {
  const schema = stepSchemas[step as keyof typeof stepSchemas]
  if (!schema) {
    throw new Error(`Unknown step: ${step}`)
  }
  return schema.parse(data)
}

// Helper function to get step validation errors
export function getStepValidationErrors(step: string, data: any) {
  try {
    validateStepData(step, data)
    return null
  } catch (error) {
    if (error instanceof z.ZodError) {
      return error.issues
    }
    throw error
  }
} 