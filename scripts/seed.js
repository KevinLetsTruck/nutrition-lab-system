#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

// Colors for terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function colorize(text, color) {
  return colors[color] + text + colors.reset;
}

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error(colorize('Error: Missing Supabase environment variables', 'red'));
  console.error('Please ensure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set in your .env file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

class DatabaseSeeder {
  constructor() {
    this.clientIds = [];
    this.reportIds = [];
  }

  async seed() {
    try {
      console.log(colorize('Starting database seeding...', 'cyan'));
      
      await this.seedClients();
      await this.seedLabReports();
      await this.seedNutriQResults();
      await this.seedKBMOResults();
      await this.seedDutchResults();
      await this.seedCGMData();
      await this.seedFoodPhotos();
      await this.seedProcessingQueue();
      
      console.log(colorize('\nDatabase seeding completed successfully!', 'green'));
    } catch (error) {
      console.error(colorize(`Seeding failed: ${error.message}`, 'red'));
      process.exit(1);
    }
  }

  async seedClients() {
    console.log(colorize('Seeding clients...', 'blue'));
    
    const clients = [
      {
        email: 'john.doe@example.com',
        first_name: 'John',
        last_name: 'Doe',
        date_of_birth: '1985-03-15',
        phone: '+1-555-0123',
        address: '123 Main St, Anytown, USA',
        emergency_contact: 'Jane Doe (Wife) +1-555-0124',
        medical_history: 'Hypertension, Type 2 Diabetes',
        allergies: 'Peanuts, Shellfish',
        current_medications: 'Metformin, Lisinopril'
      },
      {
        email: 'jane.smith@example.com',
        first_name: 'Jane',
        last_name: 'Smith',
        date_of_birth: '1990-07-22',
        phone: '+1-555-0125',
        address: '456 Oak Ave, Somewhere, USA',
        emergency_contact: 'Bob Smith (Husband) +1-555-0126',
        medical_history: 'PCOS, IBS',
        allergies: 'Gluten, Dairy',
        current_medications: 'Birth control, Probiotics'
      },
      {
        email: 'mike.johnson@example.com',
        first_name: 'Mike',
        last_name: 'Johnson',
        date_of_birth: '1978-11-08',
        phone: '+1-555-0127',
        address: '789 Pine Rd, Elsewhere, USA',
        emergency_contact: 'Sarah Johnson (Wife) +1-555-0128',
        medical_history: 'High Cholesterol, Sleep Apnea',
        allergies: 'None',
        current_medications: 'Atorvastatin, CPAP therapy'
      },
      {
        email: 'sarah.wilson@example.com',
        first_name: 'Sarah',
        last_name: 'Wilson',
        date_of_birth: '1992-04-12',
        phone: '+1-555-0129',
        address: '321 Elm St, Nowhere, USA',
        emergency_contact: 'Tom Wilson (Brother) +1-555-0130',
        medical_history: 'Anxiety, Depression',
        allergies: 'Sulfa drugs',
        current_medications: 'Sertraline, Vitamin D'
      },
      {
        email: 'david.brown@example.com',
        first_name: 'David',
        last_name: 'Brown',
        date_of_birth: '1988-09-30',
        phone: '+1-555-0131',
        address: '654 Maple Dr, Anywhere, USA',
        emergency_contact: 'Lisa Brown (Sister) +1-555-0132',
        medical_history: 'Athletic, No major issues',
        allergies: 'None',
        current_medications: 'Multivitamin, Protein powder'
      }
    ];

    for (const client of clients) {
      const { data, error } = await supabase
        .from('clients')
        .insert(client)
        .select('id')
        .single();

      if (error) {
        console.error(colorize(`Failed to insert client ${client.email}: ${error.message}`, 'red'));
      } else {
        this.clientIds.push(data.id);
        console.log(colorize(`✓ Created client: ${client.first_name} ${client.last_name}`, 'green'));
      }
    }
  }

  async seedLabReports() {
    console.log(colorize('Seeding lab reports...', 'blue'));
    
    const reports = [
      {
        client_id: this.clientIds[0],
        report_type: 'nutriq',
        report_date: '2024-01-15',
        status: 'completed',
        notes: 'Initial NutriQ assessment completed'
      },
      {
        client_id: this.clientIds[0],
        report_type: 'kbmo',
        report_date: '2024-01-20',
        status: 'completed',
        notes: 'Food sensitivity panel results'
      },
      {
        client_id: this.clientIds[1],
        report_type: 'dutch',
        report_date: '2024-01-18',
        status: 'completed',
        notes: 'Hormone testing results'
      },
      {
        client_id: this.clientIds[1],
        report_type: 'cgm',
        report_date: '2024-01-25',
        status: 'completed',
        notes: 'Continuous glucose monitoring data'
      },
      {
        client_id: this.clientIds[2],
        report_type: 'nutriq',
        report_date: '2024-01-22',
        status: 'processing',
        notes: 'Follow-up assessment in progress'
      },
      {
        client_id: this.clientIds[3],
        report_type: 'food_photo',
        report_date: '2024-01-28',
        status: 'pending',
        notes: 'Food diary photos uploaded'
      }
    ];

    for (const report of reports) {
      const { data, error } = await supabase
        .from('lab_reports')
        .insert(report)
        .select('id')
        .single();

      if (error) {
        console.error(colorize(`Failed to insert report: ${error.message}`, 'red'));
      } else {
        this.reportIds.push(data.id);
        console.log(colorize(`✓ Created ${report.report_type} report for client`, 'green'));
      }
    }
  }

  async seedNutriQResults() {
    console.log(colorize('Seeding NutriQ results...', 'blue'));
    
    const nutriqResults = [
      {
        lab_report_id: this.reportIds[0],
        total_score: 65,
        energy_score: 7,
        mood_score: 6,
        sleep_score: 8,
        stress_score: 5,
        digestion_score: 7,
        immunity_score: 6,
        detailed_answers: {
          energy: { score: 7, questions: { q1: 3, q2: 4 } },
          mood: { score: 6, questions: { q1: 3, q2: 3 } },
          sleep: { score: 8, questions: { q1: 4, q2: 4 } }
        },
        recommendations: 'Focus on stress management and mood support. Consider adaptogenic herbs and regular exercise.'
      },
      {
        lab_report_id: this.reportIds[4],
        total_score: 72,
        energy_score: 8,
        mood_score: 7,
        sleep_score: 7,
        stress_score: 6,
        digestion_score: 8,
        immunity_score: 7,
        detailed_answers: {
          energy: { score: 8, questions: { q1: 4, q2: 4 } },
          mood: { score: 7, questions: { q1: 4, q2: 3 } },
          sleep: { score: 7, questions: { q1: 4, q2: 3 } }
        },
        recommendations: 'Good overall scores. Maintain current lifestyle habits and consider adding more stress management techniques.'
      }
    ];

    for (const result of nutriqResults) {
      const { error } = await supabase
        .from('nutriq_results')
        .insert(result);

      if (error) {
        console.error(colorize(`Failed to insert NutriQ result: ${error.message}`, 'red'));
      } else {
        console.log(colorize(`✓ Created NutriQ results`, 'green'));
      }
    }
  }

  async seedKBMOResults() {
    console.log(colorize('Seeding KBMO results...', 'blue'));
    
    const kbmoResults = [
      {
        lab_report_id: this.reportIds[1],
        total_igg_score: 245,
        high_sensitivity_foods: ['wheat', 'dairy', 'eggs'],
        moderate_sensitivity_foods: ['soy', 'corn', 'nuts'],
        low_sensitivity_foods: ['rice', 'chicken', 'vegetables'],
        elimination_diet_recommendations: 'Remove wheat, dairy, and eggs for 4-6 weeks. Reintroduce one food group at a time.',
        reintroduction_plan: 'Week 1: Reintroduce eggs. Week 2: Reintroduce dairy. Week 3: Reintroduce wheat.'
      }
    ];

    for (const result of kbmoResults) {
      const { error } = await supabase
        .from('kbmo_results')
        .insert(result);

      if (error) {
        console.error(colorize(`Failed to insert KBMO result: ${error.message}`, 'red'));
      } else {
        console.log(colorize(`✓ Created KBMO results`, 'green'));
      }
    }
  }

  async seedDutchResults() {
    console.log(colorize('Seeding Dutch results...', 'blue'));
    
    const dutchResults = [
      {
        lab_report_id: this.reportIds[2],
        cortisol_am: 12.5,
        cortisol_pm: 3.2,
        dhea: 245.0,
        testosterone_total: 45.2,
        testosterone_free: 8.9,
        estradiol: 85.3,
        progesterone: 12.1,
        melatonin: 45.2,
        organic_acid_metabolites: {
          citric_acid: 45.2,
          malic_acid: 32.1,
          succinic_acid: 28.9
        },
        hormone_analysis: 'Normal cortisol rhythm with slight evening elevation. Good DHEA levels. Balanced sex hormones.',
        recommendations: 'Maintain current lifestyle. Consider stress management if evening cortisol remains elevated.'
      }
    ];

    for (const result of dutchResults) {
      const { error } = await supabase
        .from('dutch_results')
        .insert(result);

      if (error) {
        console.error(colorize(`Failed to insert Dutch result: ${error.message}`, 'red'));
      } else {
        console.log(colorize(`✓ Created Dutch results`, 'green'));
      }
    }
  }

  async seedCGMData() {
    console.log(colorize('Seeding CGM data...', 'blue'));
    
    const cgmDataPoints = [
      {
        lab_report_id: this.reportIds[3],
        timestamp: '2024-01-25T07:00:00Z',
        glucose_level: 95,
        meal_type: 'breakfast',
        food_description: 'Oatmeal with berries and nuts',
        insulin_dose: 0,
        activity_level: 'sedentary',
        stress_level: 3,
        sleep_hours: 7.5,
        notes: 'Good morning glucose levels'
      },
      {
        lab_report_id: this.reportIds[3],
        timestamp: '2024-01-25T12:00:00Z',
        glucose_level: 125,
        meal_type: 'lunch',
        food_description: 'Grilled chicken salad',
        insulin_dose: 0,
        activity_level: 'light',
        stress_level: 4,
        sleep_hours: null,
        notes: 'Post-lunch spike within normal range'
      },
      {
        lab_report_id: this.reportIds[3],
        timestamp: '2024-01-25T18:00:00Z',
        glucose_level: 110,
        meal_type: 'dinner',
        food_description: 'Salmon with quinoa and vegetables',
        insulin_dose: 0,
        activity_level: 'moderate',
        stress_level: 2,
        sleep_hours: null,
        notes: 'Evening levels stable'
      }
    ];

    for (const dataPoint of cgmDataPoints) {
      const { error } = await supabase
        .from('cgm_data')
        .insert(dataPoint);

      if (error) {
        console.error(colorize(`Failed to insert CGM data point: ${error.message}`, 'red'));
      } else {
        console.log(colorize(`✓ Created CGM data point`, 'green'));
      }
    }
  }

  async seedFoodPhotos() {
    console.log(colorize('Seeding food photos...', 'blue'));
    
    const foodPhotos = [
      {
        lab_report_id: this.reportIds[5],
        image_path: 'uploads/food_photos/breakfast_20240128.jpg',
        meal_type: 'breakfast',
        food_description: 'Greek yogurt with granola and berries',
        estimated_calories: 320,
        macro_breakdown: { protein: 25, carbs: 35, fat: 12 },
        ai_analysis_results: {
          confidence: 0.92,
          identified_foods: ['yogurt', 'granola', 'berries'],
          nutrition_estimate: { calories: 320, protein: 25, carbs: 35, fat: 12 }
        }
      },
      {
        lab_report_id: this.reportIds[5],
        image_path: 'uploads/food_photos/lunch_20240128.jpg',
        meal_type: 'lunch',
        food_description: 'Grilled chicken with mixed greens',
        estimated_calories: 280,
        macro_breakdown: { protein: 35, carbs: 8, fat: 15 },
        ai_analysis_results: {
          confidence: 0.88,
          identified_foods: ['chicken', 'lettuce', 'tomatoes', 'olive oil'],
          nutrition_estimate: { calories: 280, protein: 35, carbs: 8, fat: 15 }
        }
      }
    ];

    for (const photo of foodPhotos) {
      const { error } = await supabase
        .from('food_photos')
        .insert(photo);

      if (error) {
        console.error(colorize(`Failed to insert food photo: ${error.message}`, 'red'));
      } else {
        console.log(colorize(`✓ Created food photo record`, 'green'));
      }
    }
  }

  async seedProcessingQueue() {
    console.log(colorize('Seeding processing queue...', 'blue'));
    
    const queueItems = [
      {
        lab_report_id: this.reportIds[4],
        task_type: 'analyze_nutriq',
        status: 'processing',
        priority: 3,
        payload: { analysis_type: 'nutriq', report_id: this.reportIds[4] }
      },
      {
        lab_report_id: this.reportIds[5],
        task_type: 'analyze_food_photos',
        status: 'pending',
        priority: 2,
        payload: { analysis_type: 'food_photos', report_id: this.reportIds[5] }
      },
      {
        task_type: 'generate_client_report',
        status: 'pending',
        priority: 1,
        payload: { client_id: this.clientIds[0], report_type: 'comprehensive' }
      }
    ];

    for (const item of queueItems) {
      const { error } = await supabase
        .from('processing_queue')
        .insert(item);

      if (error) {
        console.error(colorize(`Failed to insert queue item: ${error.message}`, 'red'));
      } else {
        console.log(colorize(`✓ Created processing queue item`, 'green'));
      }
    }
  }

  async clearData() {
    console.log(colorize('Clearing existing data...', 'yellow'));
    
    const tables = [
      'processing_queue',
      'food_photos',
      'cgm_data',
      'dutch_results',
      'kbmo_results',
      'nutriq_results',
      'lab_reports',
      'clients'
    ];

    for (const table of tables) {
      const { error } = await supabase
        .from(table)
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all but keep structure

      if (error) {
        console.error(colorize(`Failed to clear ${table}: ${error.message}`, 'red'));
      } else {
        console.log(colorize(`✓ Cleared ${table}`, 'green'));
      }
    }
  }
}

// Command line interface
async function main() {
  const command = process.argv[2];
  const seeder = new DatabaseSeeder();

  try {
    switch (command) {
      case 'seed':
        await seeder.seed();
        break;

      case 'clear':
        await seeder.clearData();
        break;

      case 'reset':
        await seeder.clearData();
        await seeder.seed();
        break;

      default:
        console.log(colorize('Nutrition Lab Database Seeder', 'bright'));
        console.log(colorize('============================', 'cyan'));
        console.log();
        console.log(colorize('Usage:', 'bright'));
        console.log('  node seed.js seed                    - Seed database with sample data');
        console.log('  node seed.js clear                   - Clear all data');
        console.log('  node seed.js reset                   - Clear and reseed database');
        console.log();
        console.log(colorize('Examples:', 'bright'));
        console.log('  node seed.js seed');
        console.log('  node seed.js reset');
        console.log();
    }
  } catch (error) {
    console.error(colorize(`Error: ${error.message}`, 'red'));
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = DatabaseSeeder; 