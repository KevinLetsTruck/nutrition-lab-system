import { z } from 'zod'

// Basic demographics schema (simplified - no address fields)
export const demographicsSchema = z.object({
  first_name: z.string().min(1, 'First name is required').max(100, 'First name too long'),
  last_name: z.string().min(1, 'Last name is required').max(100, 'Last name too long'),
  email: z.string().email('Please enter a valid email address')
})

// Diet approach schema
export const dietSchema = z.object({
  dietType: z.enum(['standard', 'vegetarian', 'vegan', 'keto', 'paleo', 'mediterranean', 'gluten-free', 'dairy-free', 'carnivore', 'other']).refine((val) => val !== undefined, {
    message: 'Please select your primary diet type'
  }),
  foodAllergies: z.array(z.string()).optional(),
  mealFrequency: z.enum(['1-2', '3', '4-5', '6+']).optional(),
  waterIntake: z.enum(['<32oz', '32-64oz', '64-96oz', '>96oz']).optional()
})

// Medications schema
export const medicationsSchema = z.object({
  currentMedications: z.array(z.string()).optional(),
  supplements: z.array(z.string()).optional()
})

// Goals schema
export const goalsSchema = z.object({
  healthGoals: z.array(z.string()).optional(),
  primaryConcern: z.string().optional(),
  timeline: z.string().optional()
})

// Truck driver schema (removed truck number and company fields)
export const truckDriverSchema = z.object({
  routeType: z.enum(['local', 'regional', 'long-haul', 'dedicated', 'team']).refine((val) => val !== undefined, {
    message: 'Please select your route type'
  }),
  hoursPerWeek: z.enum(['<40', '40-50', '50-60', '60-70', '>70']).optional(),
  sleepSchedule: z.enum(['regular', 'irregular', 'night-shift', 'split-sleep']).optional()
})

// DOT status schema (removed last physical date and medical card expiry fields)
export const dotStatusSchema = z.object({
  dotStatus: z.enum(['clear', 'restricted', 'conditional', 'expired', 'pending']).refine((val) => val !== undefined, {
    message: 'Please select your current DOT status'
  }),
  hasRestrictions: z.boolean().optional(),
  restrictions: z.array(z.string()).optional()
})

// Complete onboarding schema (updated to match simplified structure)
export const completeOnboardingSchema = z.object({
  // Demographics (simplified)
  first_name: demographicsSchema.shape.first_name,
  last_name: demographicsSchema.shape.last_name,
  email: demographicsSchema.shape.email,
  
  // Diet
  dietType: dietSchema.shape.dietType,
  foodAllergies: dietSchema.shape.foodAllergies,
  mealFrequency: dietSchema.shape.mealFrequency,
  waterIntake: dietSchema.shape.waterIntake,
  
  // Medications
  currentMedications: medicationsSchema.shape.currentMedications,
  supplements: medicationsSchema.shape.supplements,
  
  // Goals
  healthGoals: goalsSchema.shape.healthGoals,
  primaryConcern: goalsSchema.shape.primaryConcern,
  timeline: goalsSchema.shape.timeline,
  
  // Truck driver info (removed unwanted fields)
  routeType: truckDriverSchema.shape.routeType,
  hoursPerWeek: truckDriverSchema.shape.hoursPerWeek,
  sleepSchedule: truckDriverSchema.shape.sleepSchedule,
  
  // DOT status (removed unwanted fields)
  dotStatus: dotStatusSchema.shape.dotStatus,
  hasRestrictions: dotStatusSchema.shape.hasRestrictions,
  restrictions: dotStatusSchema.shape.restrictions
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