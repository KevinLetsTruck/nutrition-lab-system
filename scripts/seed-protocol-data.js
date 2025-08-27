const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function seedProtocolData() {
  console.log('🌱 Seeding protocol development data...');

  try {
    // Insert daily schedule templates
    console.log('📅 Creating daily schedule templates...');
    
    const scheduleTemplates = [
      {
        id: 'schedule_1',
        name: 'Standard Schedule (2x daily)',
        scheduleTimes: {
          "morning": "8:00 AM",
          "evening": "6:00 PM",
          "description": "Standard morning and evening routine"
        },
        isDefault: true
      },
      {
        id: 'schedule_2',
        name: 'Intensive Schedule (3x daily)',
        scheduleTimes: {
          "morning": "8:00 AM",
          "lunch": "12:00 PM",
          "evening": "6:00 PM",
          "description": "Three times daily for intensive protocols"
        },
        isDefault: false
      },
      {
        id: 'schedule_3',
        name: 'Gentle Schedule (1x daily)',
        scheduleTimes: {
          "morning": "8:00 AM",
          "description": "Once daily for sensitive patients"
        },
        isDefault: false
      },
      {
        id: 'schedule_4',
        name: 'Custom Digestive Schedule',
        scheduleTimes: {
          "wake_up": "7:00 AM",
          "before_breakfast": "7:30 AM",
          "after_breakfast": "9:00 AM",
          "before_lunch": "11:30 AM",
          "after_lunch": "1:00 PM",
          "before_dinner": "5:30 PM",
          "after_dinner": "7:00 PM",
          "bedtime": "10:00 PM",
          "description": "Comprehensive digestive support schedule"
        },
        isDefault: false
      }
    ];

    for (const template of scheduleTemplates) {
      await prisma.dailyScheduleTemplate.upsert({
        where: { id: template.id },
        update: template,
        create: template
      });
    }

    console.log(`✅ Created ${scheduleTemplates.length} daily schedule templates`);

    // Insert protocol templates
    console.log('🧬 Creating protocol templates...');
    
    const protocolTemplates = [
      {
        id: 'template_gut_healing',
        name: 'Gut Healing Protocol',
        category: 'Digestive Health',
        templateData: {
          "phases": [
            {
              "name": "Phase 1: Remove & Reset",
              "duration_weeks": 4,
              "focus": "Eliminate inflammatory foods and pathogens",
              "supplements": [
                {"name": "Digestive Enzymes", "dosage": "2 capsules", "timing": "with meals", "priority": 1},
                {"name": "Antimicrobial Blend", "dosage": "1 capsule", "timing": "between meals", "priority": 1},
                {"name": "Probiotics", "dosage": "50 billion CFU", "timing": "morning on empty stomach", "priority": 2}
              ]
            },
            {
              "name": "Phase 2: Repair & Restore",
              "duration_weeks": 6,
              "focus": "Heal intestinal lining and restore microbiome",
              "supplements": [
                {"name": "L-Glutamine", "dosage": "5g", "timing": "morning on empty stomach", "priority": 1},
                {"name": "Zinc Carnosine", "dosage": "75mg", "timing": "before meals", "priority": 1},
                {"name": "Targeted Probiotics", "dosage": "100 billion CFU", "timing": "evening", "priority": 2}
              ]
            }
          ],
          "dietary_guidelines": {
            "eliminate": ["gluten", "dairy", "sugar", "processed foods"],
            "emphasize": ["bone broth", "fermented foods", "prebiotic fibers", "anti-inflammatory herbs"]
          },
          "lifestyle_modifications": ["stress reduction", "adequate sleep", "mindful eating", "regular movement"]
        },
        isActive: true
      },
      {
        id: 'template_adrenal_support',
        name: 'Adrenal Support Protocol',
        category: 'Endocrine Health',
        templateData: {
          "phases": [
            {
              "name": "Phase 1: Stabilize",
              "duration_weeks": 6,
              "focus": "Support HPA axis and reduce stress response",
              "supplements": [
                {"name": "Adaptogenic Blend", "dosage": "2 capsules", "timing": "morning with breakfast", "priority": 1},
                {"name": "Magnesium Glycinate", "dosage": "400mg", "timing": "evening", "priority": 1},
                {"name": "B-Complex", "dosage": "1 capsule", "timing": "morning", "priority": 2}
              ]
            },
            {
              "name": "Phase 2: Optimize",
              "duration_weeks": 8,
              "focus": "Enhance resilience and energy production",
              "supplements": [
                {"name": "Rhodiola Rosea", "dosage": "300mg", "timing": "morning on empty stomach", "priority": 1},
                {"name": "Ashwagandha", "dosage": "500mg", "timing": "evening", "priority": 1},
                {"name": "CoQ10", "dosage": "100mg", "timing": "with breakfast", "priority": 2}
              ]
            }
          ],
          "dietary_guidelines": {
            "eliminate": ["caffeine after 2pm", "excess sugar", "alcohol"],
            "emphasize": ["regular meal timing", "protein with each meal", "complex carbohydrates", "healthy fats"]
          },
          "lifestyle_modifications": ["consistent sleep schedule", "stress management techniques", "gentle exercise", "breathing exercises"]
        },
        isActive: true
      },
      {
        id: 'template_detox_support',
        name: 'Cellular Detox Protocol',
        category: 'Detoxification',
        templateData: {
          "phases": [
            {
              "name": "Phase 1: Prep & Support",
              "duration_weeks": 2,
              "focus": "Support liver and kidney function",
              "supplements": [
                {"name": "Milk Thistle", "dosage": "300mg", "timing": "twice daily", "priority": 1},
                {"name": "NAC", "dosage": "600mg", "timing": "on empty stomach", "priority": 1},
                {"name": "Alpha Lipoic Acid", "dosage": "300mg", "timing": "with meals", "priority": 2}
              ]
            },
            {
              "name": "Phase 2: Active Detox",
              "duration_weeks": 4,
              "focus": "Mobilize and eliminate toxins",
              "supplements": [
                {"name": "Glutathione", "dosage": "500mg", "timing": "on empty stomach", "priority": 1},
                {"name": "Activated Charcoal", "dosage": "500mg", "timing": "between meals", "priority": 1},
                {"name": "Chlorella", "dosage": "1g", "timing": "with meals", "priority": 2}
              ]
            }
          ],
          "dietary_guidelines": {
            "eliminate": ["processed foods", "environmental toxins", "alcohol", "excess sugar"],
            "emphasize": ["organic produce", "cruciferous vegetables", "sulfur-rich foods", "adequate hydration"]
          },
          "lifestyle_modifications": ["sauna therapy", "dry brushing", "lymphatic massage", "adequate sleep"]
        },
        isActive: true
      }
    ];

    for (const template of protocolTemplates) {
      await prisma.protocolTemplate.upsert({
        where: { id: template.id },
        update: template,
        create: template
      });
    }

    console.log(`✅ Created ${protocolTemplates.length} protocol templates`);

    console.log('🎉 Protocol development data seeding completed successfully!');

  } catch (error) {
    console.error('❌ Error seeding protocol data:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

seedProtocolData()
  .catch((error) => {
    console.error('Failed to seed protocol data:', error);
    process.exit(1);
  });
