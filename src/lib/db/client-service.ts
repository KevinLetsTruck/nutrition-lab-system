import { prisma } from '@/lib/prisma'
import { Prisma } from '@prisma/client'

export interface ClientCreateInput {
  email: string
  firstName: string
  lastName: string
  phone?: string
  dateOfBirth?: Date | string
  address?: string
  emergencyContact?: string
  medicalHistory?: string
  allergies?: string
  currentMedications?: string
}

export interface ClientUpdateInput {
  email?: string
  firstName?: string
  lastName?: string
  phone?: string
  dateOfBirth?: Date | string
  address?: string
  emergencyContact?: string
  medicalHistory?: string
  allergies?: string
  currentMedications?: string
}

export interface ClientSearchOptions {
  query?: string
  skip?: number
  take?: number
  orderBy?: 'createdAt' | 'firstName' | 'lastName' | 'email'
  orderDirection?: 'asc' | 'desc'
}

export class ClientService {
  /**
   * Get all clients with pagination
   */
  static async getClients(options: ClientSearchOptions = {}) {
    const {
      skip = 0,
      take = 20,
      orderBy = 'createdAt',
      orderDirection = 'desc'
    } = options

    try {
      const [clients, total] = await Promise.all([
        prisma.client.findMany({
          skip,
          take,
          orderBy: {
            [orderBy]: orderDirection
          },
          include: {
            labReports: {
              take: 1,
              orderBy: {
                createdAt: 'desc'
              }
            },
            _count: {
              select: {
                labReports: true,
                notes: true,
                aiConversations: true
              }
            }
          }
        }),
        prisma.client.count()
      ])

      return {
        clients,
        total,
        page: Math.floor(skip / take) + 1,
        totalPages: Math.ceil(total / take)
      }
    } catch (error) {
      console.error('Error fetching clients:', error)
      throw new Error('Failed to fetch clients')
    }
  }

  /**
   * Get single client with all relations
   */
  static async getClientById(id: string) {
    try {
      const client = await prisma.client.findUnique({
        where: { id },
        include: {
          labReports: {
            orderBy: {
              reportDate: 'desc'
            },
            include: {
              nutriqResult: true
            }
          },
          aiConversations: {
            orderBy: {
              createdAt: 'desc'
            }
          },
          notes: {
            orderBy: {
              createdAt: 'desc'
            }
          },
          clientFiles: {
            orderBy: {
              uploadedAt: 'desc'
            }
          },
          protocolRecommendations: {
            orderBy: {
              createdAt: 'desc'
            }
          },
          onboardingProgress: true
        }
      })

      if (!client) {
        throw new Error('Client not found')
      }

      return client
    } catch (error) {
      console.error('Error fetching client:', error)
      throw error
    }
  }

  /**
   * Create new client
   */
  static async createClient(data: ClientCreateInput) {
    try {
      // Ensure email is lowercase
      const email = data.email.toLowerCase()

      // Check if client already exists
      const existing = await prisma.client.findUnique({
        where: { email }
      })

      if (existing) {
        throw new Error('Client with this email already exists')
      }

      // Create client
      const client = await prisma.client.create({
        data: {
          email,
          firstName: data.firstName,
          lastName: data.lastName,
          phone: data.phone,
          dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : null,
          address: data.address,
          emergencyContact: data.emergencyContact,
          medicalHistory: data.medicalHistory,
          allergies: data.allergies,
          currentMedications: data.currentMedications
        }
      })

      return client
    } catch (error) {
      console.error('Error creating client:', error)
      throw error
    }
  }

  /**
   * Update client
   */
  static async updateClient(id: string, data: ClientUpdateInput) {
    try {
      // If email is being updated, ensure it's lowercase
      if (data.email) {
        data.email = data.email.toLowerCase()

        // Check if new email is already taken
        const existing = await prisma.client.findFirst({
          where: {
            email: data.email,
            NOT: { id }
          }
        })

        if (existing) {
          throw new Error('Email is already in use')
        }
      }

      const client = await prisma.client.update({
        where: { id },
        data: {
          ...data,
          dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : undefined
        }
      })

      return client
    } catch (error) {
      console.error('Error updating client:', error)
      throw error
    }
  }

  /**
   * Delete client (soft delete by setting archived)
   */
  static async deleteClient(id: string) {
    try {
      // We don't actually delete, we just mark as archived
      const client = await prisma.client.update({
        where: { id },
        data: {
          // Note: You'll need to add an 'archived' field to your schema
          // For now, we'll do a hard delete
          // archived: true,
          // archivedAt: new Date()
        }
      })

      // For now, doing hard delete - uncomment above and comment below for soft delete
      await prisma.client.delete({
        where: { id }
      })

      return { success: true, id }
    } catch (error) {
      console.error('Error deleting client:', error)
      throw error
    }
  }

  /**
   * Search clients by name or email
   */
  static async searchClients(options: ClientSearchOptions = {}) {
    const {
      query = '',
      skip = 0,
      take = 20,
      orderBy = 'createdAt',
      orderDirection = 'desc'
    } = options

    try {
      const where: Prisma.ClientWhereInput = query
        ? {
            OR: [
              {
                email: {
                  contains: query,
                  mode: 'insensitive'
                }
              },
              {
                firstName: {
                  contains: query,
                  mode: 'insensitive'
                }
              },
              {
                lastName: {
                  contains: query,
                  mode: 'insensitive'
                }
              }
            ]
          }
        : {}

      const [clients, total] = await Promise.all([
        prisma.client.findMany({
          where,
          skip,
          take,
          orderBy: {
            [orderBy]: orderDirection
          },
          include: {
            _count: {
              select: {
                labReports: true,
                notes: true
              }
            }
          }
        }),
        prisma.client.count({ where })
      ])

      return {
        clients,
        total,
        page: Math.floor(skip / take) + 1,
        totalPages: Math.ceil(total / take)
      }
    } catch (error) {
      console.error('Error searching clients:', error)
      throw new Error('Failed to search clients')
    }
  }

  /**
   * Get client by email
   */
  static async getClientByEmail(email: string) {
    try {
      const client = await prisma.client.findUnique({
        where: { 
          email: email.toLowerCase() 
        }
      })

      return client
    } catch (error) {
      console.error('Error fetching client by email:', error)
      throw error
    }
  }

  /**
   * Get recent clients
   */
  static async getRecentClients(limit: number = 10) {
    try {
      const clients = await prisma.client.findMany({
        take: limit,
        orderBy: {
          createdAt: 'desc'
        },
        include: {
          labReports: {
            take: 1,
            orderBy: {
              reportDate: 'desc'
            }
          }
        }
      })

      return clients
    } catch (error) {
      console.error('Error fetching recent clients:', error)
      throw error
    }
  }
}

export default ClientService
