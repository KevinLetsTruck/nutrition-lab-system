import { PrismaClient } from '@prisma/client'
import * as bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seed...')

  // Create a test admin user
  const adminPassword = await bcrypt.hash('Admin123!', 10)
  const admin = await prisma.user.upsert({
    where: { email: 'admin@nutritionlab.com' },
    update: {},
    create: {
      email: 'admin@nutritionlab.com',
      passwordHash: adminPassword,
      role: 'ADMIN',
      emailVerified: true,
      adminProfile: {
        create: {
          name: 'System Administrator',
          title: 'Lead Nutritionist',
          specializations: ['Functional Medicine', 'Clinical Nutrition'],
          clientCapacity: 100,
        }
      }
    }
  })
  console.log('✅ Created admin user:', admin.email)

  // Create a test client user
  const clientPassword = await bcrypt.hash('Client123!', 10)
  const clientUser = await prisma.user.upsert({
    where: { email: 'john.doe@example.com' },
    update: {},
    create: {
      email: 'john.doe@example.com',
      passwordHash: clientPassword,
      role: 'CLIENT',
      emailVerified: true,
      clientProfile: {
        create: {
          firstName: 'John',
          lastName: 'Doe',
          phone: '+1234567890',
          consultationStatus: 'scheduled',
          onboardingData: {
            healthGoals: ['Weight Management', 'Better Energy'],
            dietaryRestrictions: ['Gluten-Free'],
            currentMedications: [],
          }
        }
      }
    }
  })
  console.log('✅ Created client user:', clientUser.email)

  // Create a test client record for lab reports
  const testClient = await prisma.client.upsert({
    where: { email: 'john.doe@example.com' },
    update: {},
    create: {
      email: 'john.doe@example.com',
      firstName: 'John',
      lastName: 'Doe',
      dateOfBirth: new Date('1985-05-15'),
      phone: '+1234567890',
      address: '123 Test Street, Test City, TC 12345',
      medicalHistory: 'No significant medical history',
      allergies: 'Peanuts, Shellfish',
      currentMedications: 'Vitamin D supplement',
    }
  })
  console.log('✅ Created test client:', testClient.email)

  // Create sample lab report
  const labReport = await prisma.labReport.create({
    data: {
      clientId: testClient.id,
      reportType: 'NUTRIQ',
      reportDate: new Date(),
      status: 'COMPLETED',
      analysisResults: {
        overallScore: 75,
        categories: {
          vitamins: 80,
          minerals: 70,
          antioxidants: 75,
        }
      },
      notes: 'Initial assessment completed',
    }
  })
  console.log('✅ Created sample lab report')

  // Create NutriQ result
  await prisma.nutriqResult.create({
    data: {
      labReportId: labReport.id,
      overallScore: 75,
      systemScores: {
        immune: 78,
        digestive: 72,
        cardiovascular: 80,
        nervous: 68,
      },
      deficiencies: ['Vitamin D', 'Magnesium', 'Omega-3'],
      recommendations: {
        supplements: ['Vitamin D3 5000IU', 'Magnesium Glycinate 400mg'],
        dietary: ['Increase fatty fish intake', 'Add leafy greens'],
      }
    }
  })
  console.log('✅ Created NutriQ results')

  console.log('🎉 Database seed completed!')
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
