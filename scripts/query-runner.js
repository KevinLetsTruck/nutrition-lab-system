#!/usr/bin/env node

const readline = require('readline');
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
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m'
};

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error(colors.red + 'Error: Missing Supabase environment variables' + colors.reset);
  console.error('Please ensure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set in your .env file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Helper functions
function colorize(text, color) {
  return colors[color] + text + colors.reset;
}

function printTable(data, title = '') {
  if (!data || data.length === 0) {
    console.log(colorize('No data found', 'yellow'));
    return;
  }

  if (title) {
    console.log(colorize(`\n${title}`, 'cyan'));
    console.log(colorize('='.repeat(title.length), 'cyan'));
  }

  const columns = Object.keys(data[0]);
  const columnWidths = {};
  
  // Calculate column widths
  columns.forEach(col => {
    columnWidths[col] = Math.max(
      col.length,
      ...data.map(row => String(row[col] || '').length)
    );
  });

  // Print header
  const header = columns.map(col => col.padEnd(columnWidths[col])).join(' | ');
  console.log(colorize(header, 'bright'));
  console.log(colorize('-'.repeat(header.length), 'blue'));

  // Print rows
  data.forEach(row => {
    const rowStr = columns.map(col => {
      const value = String(row[col] || '');
      return value.padEnd(columnWidths[col]);
    }).join(' | ');
    console.log(rowStr);
  });

  console.log(colorize(`\n${data.length} row(s) returned`, 'green'));
}

function printError(error) {
  console.error(colorize(`\nError: ${error.message}`, 'red'));
  if (error.details) {
    console.error(colorize(`Details: ${error.details}`, 'red'));
  }
  if (error.hint) {
    console.error(colorize(`Hint: ${error.hint}`, 'yellow'));
  }
}

// Command handlers using standard Supabase operations
async function handleTables() {
  try {
    // Since we can't access information_schema through the client,
    // we'll show the known tables and their status
    const knownTables = [
      'clients',
      'lab_reports', 
      'nutriq_results',
      'kbmo_results',
      'dutch_results',
      'cgm_data',
      'food_photos',
      'processing_queue',
      'client_intake',
      'client_files',
      'onboarding_progress',
      'onboarding_sessions'
    ];
    
    const tableStatus = [];
    
    for (const tableName of knownTables) {
      try {
        const { data, error } = await supabase
          .from(tableName)
          .select('count')
          .limit(1);
        
        if (error) {
          tableStatus.push({
            table_name: tableName,
            status: '❌ Error',
            error: error.message
          });
        } else {
          tableStatus.push({
            table_name: tableName,
            status: '✅ Available',
            error: null
          });
        }
      } catch (err) {
        tableStatus.push({
          table_name: tableName,
          status: '❌ Not Found',
          error: err.message
        });
      }
    }
    
    printTable(tableStatus, 'Database Tables Status');
  } catch (error) {
    printError(error);
  }
}

async function handleClients() {
  try {
    const { data, error } = await supabase
      .from('clients')
      .select('id, first_name, last_name, email, created_at')
      .order('created_at', { ascending: false })
      .limit(20);
    
    if (error) throw error;
    printTable(data, 'Clients');
  } catch (error) {
    printError(error);
  }
}

async function handleReports() {
  try {
    const { data, error } = await supabase
      .from('lab_reports')
      .select(`
        id,
        report_type,
        report_date,
        status,
        created_at,
        clients!inner(first_name, last_name, email)
      `)
      .order('created_at', { ascending: false })
      .limit(20);
    
    if (error) throw error;
    
    // Flatten the nested client data
    const flattenedData = data.map(report => ({
      id: report.id,
      report_type: report.report_type,
      report_date: report.report_date,
      status: report.status,
      client_name: `${report.clients.first_name} ${report.clients.last_name}`,
      client_email: report.clients.email,
      created_at: report.created_at
    }));
    
    printTable(flattenedData, 'Lab Reports');
  } catch (error) {
    printError(error);
  }
}

async function handleQueue() {
  try {
    const { data, error } = await supabase
      .from('processing_queue')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(20);
    
    if (error) throw error;
    printTable(data, 'Processing Queue');
  } catch (error) {
    printError(error);
  }
}

async function handleSummary() {
  try {
    // Get client summary using standard operations
    const { data: clients, error: clientsError } = await supabase
      .from('clients')
      .select('id, first_name, last_name, email, created_at');
    
    if (clientsError) throw clientsError;
    
    const { data: reports, error: reportsError } = await supabase
      .from('lab_reports')
      .select('client_id, status');
    
    if (reportsError) throw reportsError;
    
    // Create summary data
    const summaryData = clients.map(client => {
      const clientReports = reports.filter(r => r.client_id === client.id);
      const completedReports = clientReports.filter(r => r.status === 'completed');
      
      return {
        id: client.id,
        name: `${client.first_name} ${client.last_name}`,
        email: client.email,
        total_reports: clientReports.length,
        completed_reports: completedReports.length,
        created_at: client.created_at
      };
    });
    
    printTable(summaryData, 'Client Summary');
  } catch (error) {
    printError(error);
  }
}

async function handleAnalyze() {
  try {
    const { data, error } = await supabase
      .from('lab_reports')
      .select(`
        id,
        report_type,
        status,
        created_at,
        clients!inner(first_name, last_name)
      `)
      .eq('status', 'completed')
      .order('created_at', { ascending: false })
      .limit(20);
    
    if (error) throw error;
    
    const flattenedData = data.map(report => ({
      id: report.id,
      report_type: report.report_type,
      status: report.status,
      client_name: `${report.clients.first_name} ${report.clients.last_name}`,
      created_at: report.created_at
    }));
    
    printTable(flattenedData, 'Analysis Results');
  } catch (error) {
    printError(error);
  }
}

async function handlePending() {
  try {
    const { data, error } = await supabase
      .from('lab_reports')
      .select(`
        id,
        report_type,
        status,
        created_at,
        clients!inner(first_name, last_name)
      `)
      .in('status', ['pending', 'processing'])
      .order('created_at', { ascending: true });
    
    if (error) throw error;
    
    const flattenedData = data.map(report => ({
      id: report.id,
      report_type: report.report_type,
      status: report.status,
      client_name: `${report.clients.first_name} ${report.clients.last_name}`,
      created_at: report.created_at
    }));
    
    printTable(flattenedData, 'Pending Analyses');
  } catch (error) {
    printError(error);
  }
}

async function handleRecent() {
  try {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const { data, error } = await supabase
      .from('lab_reports')
      .select(`
        id,
        report_type,
        status,
        created_at,
        clients!inner(first_name, last_name)
      `)
      .gte('created_at', sevenDaysAgo.toISOString())
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    const flattenedData = data.map(report => ({
      id: report.id,
      report_type: report.report_type,
      status: report.status,
      client_name: `${report.clients.first_name} ${report.clients.last_name}`,
      created_at: report.created_at
    }));
    
    printTable(flattenedData, 'Recent Analyses (Last 7 Days)');
  } catch (error) {
    printError(error);
  }
}

async function handleDescribe(tableName) {
  if (!tableName) {
    console.error(colorize('Usage: desc <table_name>', 'yellow'));
    return;
  }

  try {
    const { data, error } = await supabase
      .from('information_schema.columns')
      .select('column_name, data_type, is_nullable, column_default')
      .eq('table_schema', 'public')
      .eq('table_name', tableName)
      .order('ordinal_position');
    
    if (error) throw error;
    printTable(data, `Table Structure: ${tableName}`);
  } catch (error) {
    printError(error);
  }
}

async function handleCustomQuery(sql) {
  console.error(colorize('Custom SQL queries are not supported for security reasons.', 'red'));
  console.error(colorize('Please use the predefined commands or standard Supabase operations.', 'yellow'));
}

async function handleFileQuery(filePath) {
  try {
    const fs = require('fs');
    if (!fs.existsSync(filePath)) {
      console.error(colorize(`File not found: ${filePath}`, 'red'));
      return;
    }

    const sql = fs.readFileSync(filePath, 'utf8');
    console.log(colorize(`Executing SQL from file: ${filePath}`, 'cyan'));
    console.log(colorize('Custom SQL queries are not supported for security reasons.', 'red'));
    console.error(colorize('Please use the predefined commands or standard Supabase operations.', 'yellow'));
  } catch (error) {
    printError(error);
  }
}

function showHelp() {
  console.log(colorize('\nNutrition Lab Database Query Runner', 'cyan'));
  console.log(colorize('====================================', 'cyan'));
  console.log(colorize('\nAvailable Commands:', 'bright'));
  console.log(colorize('  tables', 'green') + '     - Show all database tables');
  console.log(colorize('  clients', 'green') + '    - Show recent clients');
  console.log(colorize('  reports', 'green') + '    - Show recent lab reports');
  console.log(colorize('  queue', 'green') + '      - Show processing queue');
  console.log(colorize('  summary', 'green') + '    - Show client summary');
  console.log(colorize('  analyze', 'green') + '    - Show completed analyses');
  console.log(colorize('  pending', 'green') + '    - Show pending analyses');
  console.log(colorize('  recent', 'green') + '     - Show recent analyses (last 7 days)');
  console.log(colorize('  desc <table>', 'green') + ' - Describe table structure');
  console.log(colorize('  test', 'green') + '       - Test database connection');
  console.log(colorize('  help', 'green') + '       - Show this help');
  console.log(colorize('  exit', 'green') + '       - Exit the query runner');
  console.log(colorize('\nExamples:', 'bright'));
  console.log(colorize('  desc clients', 'yellow'));
  console.log(colorize('  desc lab_reports', 'yellow'));
  console.log(colorize('\nNote: Custom SQL queries are not supported for security reasons.', 'red'));
  console.log(colorize('Use the predefined commands or standard Supabase operations instead.', 'yellow'));
}

async function testConnection() {
  try {
    const { data, error } = await supabase
      .from('clients')
      .select('count')
      .limit(1);
    
    if (error) throw error;
    console.log(colorize('Database connection successful!', 'green'));
  } catch (error) {
    console.error(colorize('Database connection failed!', 'red'));
    printError(error);
  }
}

async function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    // Interactive mode
    console.log(colorize('\nWelcome to Nutrition Lab Database Query Runner!', 'cyan'));
    console.log(colorize('Type "help" for available commands', 'yellow'));
    console.log(colorize('Note: Custom SQL queries are not supported for security reasons.', 'red'));
    
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
      prompt: colorize('db> ', 'green')
    });

    rl.prompt();

    rl.on('line', async (line) => {
      const input = line.trim();
      
      if (input === 'exit' || input === 'quit') {
        rl.close();
        return;
      }
      
      if (input === 'help') {
        showHelp();
      } else if (input === 'test') {
        await testConnection();
      } else if (input === 'tables') {
        await handleTables();
      } else if (input === 'clients') {
        await handleClients();
      } else if (input === 'reports') {
        await handleReports();
      } else if (input === 'queue') {
        await handleQueue();
      } else if (input === 'summary') {
        await handleSummary();
      } else if (input === 'analyze') {
        await handleAnalyze();
      } else if (input === 'pending') {
        await handlePending();
      } else if (input === 'recent') {
        await handleRecent();
      } else if (input.startsWith('desc ')) {
        const tableName = input.substring(5).trim();
        await handleDescribe(tableName);
      } else if (input.startsWith('file ')) {
        const filePath = input.substring(5).trim();
        await handleFileQuery(filePath);
      } else if (input) {
        console.error(colorize(`Unknown command: ${input}`, 'red'));
        console.log(colorize('Type "help" for available commands', 'yellow'));
      }
      
      rl.prompt();
    });

    rl.on('close', () => {
      console.log(colorize('\nGoodbye!', 'cyan'));
      process.exit(0);
    });
  } else {
    // Command line mode
    const command = args[0];
    
    switch (command) {
      case 'tables':
        await handleTables();
        break;
      case 'clients':
        await handleClients();
        break;
      case 'reports':
        await handleReports();
        break;
      case 'queue':
        await handleQueue();
        break;
      case 'summary':
        await handleSummary();
        break;
      case 'analyze':
        await handleAnalyze();
        break;
      case 'pending':
        await handlePending();
        break;
      case 'recent':
        await handleRecent();
        break;
      case 'test':
        await testConnection();
        break;
      case 'help':
        showHelp();
        break;
      default:
        console.error(colorize(`Unknown command: ${command}`, 'red'));
        console.log(colorize('Available commands: tables, clients, reports, queue, summary, analyze, pending, recent, test, help', 'yellow'));
        process.exit(1);
    }
  }
}

main().catch(console.error); 