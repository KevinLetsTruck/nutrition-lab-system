import { z } from 'zod';

export const createClientSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  dateOfBirth: z.string().or(z.date()).optional(),
  gender: z.enum(['male', 'female']).optional(),
  isTruckDriver: z.boolean().default(true),
  dotNumber: z.string().optional(),
  cdlNumber: z.string().optional(),
  healthGoals: z.array(z.string()).optional(),
  medications: z.array(z.object({
    name: z.string(),
    dosage: z.string().optional(),
    frequency: z.string().optional(),
  })).optional(),
  conditions: z.array(z.string()).optional(),
  allergies: z.array(z.string()).optional(),
});

export const updateClientSchema = createClientSchema.partial();

export type CreateClientInput = z.infer<typeof createClientSchema>;
export type UpdateClientInput = z.infer<typeof updateClientSchema>;
