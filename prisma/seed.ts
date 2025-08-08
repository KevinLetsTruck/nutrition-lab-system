import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seed...')
  
  // Create or get admin user
  const adminPasswordHash = await bcrypt.hash('Admin123!', 10)
  let adminUser = await prisma.user.findUnique({
    where: { email: 'admin@nutritionlab.com' }
  })
  
  if (!adminUser) {
    adminUser = await prisma.user.create({
      data: {
        email: 'admin@nutritionlab.com',
        passwordHash: adminPasswordHash,
        role: 'ADMIN',
        emailVerified: true,
        adminProfile: {
          create: {
            name: 'System Admin',
            title: 'Lead Practitioner',
            specializations: ['functional_medicine', 'nutrition', 'truck_driver_health']
          }
        }
      }
    })
    console.log('✅ Created admin user:', adminUser.email)
  } else {
    console.log('✅ Admin user already exists:', adminUser.email)
  }
  
  // Create or get test client user
  const clientPasswordHash = await bcrypt.hash('Client123!', 10)
  let clientUser = await prisma.user.findUnique({
    where: { email: 'john.trucker@example.com' }
  })
  
  if (!clientUser) {
    clientUser = await prisma.user.create({
      data: {
        email: 'john.trucker@example.com',
        passwordHash: clientPasswordHash,
        role: 'CLIENT',
        emailVerified: true,
        clientProfile: {
          create: {
            firstName: 'John',
            lastName: 'Trucker',
            phone: '555-0123',
            consultationStatus: 'scheduled'
          }
        }
      }
    })
    console.log('✅ Created client user:', clientUser.email)
  } else {
    console.log('✅ Client user already exists:', clientUser.email)
  }
  
  // Create or get client record
  let client = await prisma.client.findUnique({
    where: { email: 'john.trucker@example.com' }
  })
  
  if (!client) {
    client = await prisma.client.create({
      data: {
        email: 'john.trucker@example.com',
        firstName: 'John',
        lastName: 'Trucker',
        phone: '555-0123',
        dateOfBirth: new Date('1975-05-15'),
        address: '123 Highway Lane, Truckerville, TX 75001',
        emergencyContact: 'Jane Trucker - 555-0124',
        medicalHistory: 'Type 2 diabetes, hypertension, sleep apnea',
        allergies: 'Penicillin',
        currentMedications: 'Metformin 1000mg, Lisinopril 10mg'
      }
    })
    console.log('✅ Created test client:', client.email)
  } else {
    console.log('✅ Test client already exists:', client.email)
  }
  
  // Create a sample lab report
  const labReport = await prisma.labReport.create({
    data: {
      clientId: client.id,
      reportType: 'BLOOD_TEST',
      reportDate: new Date('2024-01-15'),
      status: 'COMPLETED',
      filePath: '/samples/john-trucker-labcorp-2024-01.pdf',
      fileSize: 156789,
      analysisResults: {
        summary: 'Multiple metabolic markers out of optimal range',
        concerns: ['insulin_resistance', 'inflammation', 'vitamin_d_deficiency'],
        recommendations: ['dietary_changes', 'supplement_protocol', 'lifestyle_modifications']
      }
    }
  })
  console.log('✅ Created sample lab report')
  
  // Create sample AI conversation
  const conversation = await prisma.aiConversation.create({
    data: {
      clientId: client.id,
      assessmentType: 'comprehensive',
      status: 'active',
      metadata: {
        topic: 'Initial Health Assessment',
        purpose: 'comprehensive_health_evaluation',
        focus_areas: ['metabolic_health', 'cardiovascular_risk', 'truck_driver_specific']
      },
      messages: {
        create: [
          {
            role: 'system',
            content: 'You are a functional medicine practitioner specializing in truck driver health.'
          },
          {
            role: 'user',
            content: 'Analyze this client\'s lab results and provide recommendations.'
          }
        ]
      }
    }
  })
  console.log('✅ Created sample AI conversation')
  
  // Create sample note
  await prisma.note.create({
    data: {
      clientId: client.id,
      authorId: adminUser.id,
      content: 'Initial consultation completed. Client motivated to improve health for DOT certification.',
      category: 'clinical'
    }
  })
  console.log('✅ Created sample note')
  
  console.log('🎉 Seed completed successfully!')
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })