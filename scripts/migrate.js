#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
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

// Migration tracking table
const MIGRATIONS_TABLE = 'schema_migrations';

class MigrationManager {
  constructor() {
    this.migrationsDir = path.join(__dirname, '..', 'database', 'migrations');
  }

  async initialize() {
    try {
      // Create migrations tracking table if it doesn't exist
      const createTableSQL = `
        CREATE TABLE IF NOT EXISTS ${MIGRATIONS_TABLE} (
          id SERIAL PRIMARY KEY,
          filename VARCHAR(255) UNIQUE NOT NULL,
          executed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          checksum VARCHAR(64),
          execution_time_ms INTEGER
        );
      `;

      const { error } = await supabase.rpc('exec_sql', { sql: createTableSQL });
      if (error) throw error;

      console.log(colorize('Migration system initialized', 'green'));
    } catch (error) {
      console.error(colorize(`Failed to initialize migration system: ${error.message}`, 'red'));
      throw error;
    }
  }

  async getExecutedMigrations() {
    try {
      const { data, error } = await supabase
        .from(MIGRATIONS_TABLE)
        .select('filename, executed_at, checksum')
        .order('executed_at', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error(colorize(`Failed to get executed migrations: ${error.message}`, 'red'));
      return [];
    }
  }

  getMigrationFiles() {
    try {
      if (!fs.existsSync(this.migrationsDir)) {
        console.warn(colorize(`Migrations directory not found: ${this.migrationsDir}`, 'yellow'));
        return [];
      }

      const files = fs.readdirSync(this.migrationsDir)
        .filter(file => file.endsWith('.sql'))
        .sort();

      return files;
    } catch (error) {
      console.error(colorize(`Failed to read migration files: ${error.message}`, 'red'));
      return [];
    }
  }

  calculateChecksum(content) {
    const crypto = require('crypto');
    return crypto.createHash('sha256').update(content).digest('hex');
  }

  async executeMigration(filename) {
    const filePath = path.join(this.migrationsDir, filename);
    
    if (!fs.existsSync(filePath)) {
      throw new Error(`Migration file not found: ${filePath}`);
    }

    const content = fs.readFileSync(filePath, 'utf8');
    const checksum = this.calculateChecksum(content);
    const startTime = Date.now();

    try {
      console.log(colorize(`Executing migration: ${filename}`, 'cyan'));

      // Execute the migration
      const { error } = await supabase.rpc('exec_sql', { sql: content });
      if (error) throw error;

      const executionTime = Date.now() - startTime;

      // Record the migration
      const { error: insertError } = await supabase
        .from(MIGRATIONS_TABLE)
        .insert({
          filename,
          checksum,
          execution_time_ms: executionTime
        });

      if (insertError) throw insertError;

      console.log(colorize(`✓ Migration completed: ${filename} (${executionTime}ms)`, 'green'));
      return true;
    } catch (error) {
      console.error(colorize(`✗ Migration failed: ${filename}`, 'red'));
      console.error(colorize(`Error: ${error.message}`, 'red'));
      return false;
    }
  }

  async runMigrations() {
    try {
      await this.initialize();

      const executedMigrations = await this.getExecutedMigrations();
      const executedFilenames = new Set(executedMigrations.map(m => m.filename));
      
      const migrationFiles = this.getMigrationFiles();
      const pendingMigrations = migrationFiles.filter(file => !executedFilenames.has(file));

      if (pendingMigrations.length === 0) {
        console.log(colorize('No pending migrations found', 'yellow'));
        return;
      }

      console.log(colorize(`Found ${pendingMigrations.length} pending migration(s)`, 'cyan'));

      let successCount = 0;
      for (const filename of pendingMigrations) {
        const success = await this.executeMigration(filename);
        if (success) successCount++;
      }

      console.log(colorize(`\nMigration summary: ${successCount}/${pendingMigrations.length} successful`, 'bright'));
    } catch (error) {
      console.error(colorize(`Migration process failed: ${error.message}`, 'red'));
      process.exit(1);
    }
  }

  async showStatus() {
    try {
      await this.initialize();

      const executedMigrations = await this.getExecutedMigrations();
      const migrationFiles = this.getMigrationFiles();
      
      console.log(colorize('\nMigration Status', 'bright'));
      console.log(colorize('================', 'cyan'));

      for (const file of migrationFiles) {
        const executed = executedMigrations.find(m => m.filename === file);
        const status = executed ? colorize('✓ EXECUTED', 'green') : colorize('⏳ PENDING', 'yellow');
        const date = executed ? new Date(executed.executed_at).toLocaleString() : '-';
        
        console.log(`${status} ${file} (${date})`);
      }

      const pendingCount = migrationFiles.length - executedMigrations.length;
      console.log(colorize(`\nTotal: ${migrationFiles.length} files, ${executedMigrations.length} executed, ${pendingCount} pending`, 'cyan'));
    } catch (error) {
      console.error(colorize(`Failed to show status: ${error.message}`, 'red'));
    }
  }

  async rollback(steps = 1) {
    try {
      await this.initialize();

      const executedMigrations = await this.getExecutedMigrations();
      
      if (executedMigrations.length === 0) {
        console.log(colorize('No migrations to rollback', 'yellow'));
        return;
      }

      const toRollback = executedMigrations.slice(-steps);
      console.log(colorize(`Rolling back ${toRollback.length} migration(s)`, 'yellow'));

      for (const migration of toRollback.reverse()) {
        console.log(colorize(`Rolling back: ${migration.filename}`, 'cyan'));
        
        // Note: This is a simplified rollback. In a real system, you'd need
        // to implement proper rollback SQL for each migration
        const { error } = await supabase
          .from(MIGRATIONS_TABLE)
          .delete()
          .eq('filename', migration.filename);

        if (error) {
          console.error(colorize(`Failed to rollback ${migration.filename}: ${error.message}`, 'red'));
        } else {
          console.log(colorize(`✓ Rolled back: ${migration.filename}`, 'green'));
        }
      }
    } catch (error) {
      console.error(colorize(`Rollback failed: ${error.message}`, 'red'));
    }
  }

  async createMigration(name) {
    try {
      const timestamp = new Date().toISOString().replace(/[^0-9]/g, '').slice(0, 14);
      const filename = `${timestamp}_${name.replace(/[^a-zA-Z0-9_]/g, '_')}.sql`;
      const filePath = path.join(this.migrationsDir, filename);

      if (!fs.existsSync(this.migrationsDir)) {
        fs.mkdirSync(this.migrationsDir, { recursive: true });
      }

      const template = `-- Migration: ${name}
-- Created: ${new Date().toISOString()}

-- Add your SQL here
-- Example:
-- CREATE TABLE example_table (
--     id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
--     name VARCHAR(255) NOT NULL,
--     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
-- );

`;

      fs.writeFileSync(filePath, template);
      console.log(colorize(`Created migration file: ${filename}`, 'green'));
      console.log(colorize(`Path: ${filePath}`, 'cyan'));
    } catch (error) {
      console.error(colorize(`Failed to create migration: ${error.message}`, 'red'));
    }
  }
}

// Command line interface
async function main() {
  const command = process.argv[2];
  const args = process.argv.slice(3);

  const migrationManager = new MigrationManager();

  try {
    switch (command) {
      case 'run':
      case 'migrate':
        await migrationManager.runMigrations();
        break;

      case 'status':
        await migrationManager.showStatus();
        break;

      case 'rollback':
        const steps = parseInt(args[0]) || 1;
        await migrationManager.rollback(steps);
        break;

      case 'create':
        const name = args[0];
        if (!name) {
          console.error(colorize('Usage: node migrate.js create <migration_name>', 'red'));
          process.exit(1);
        }
        await migrationManager.createMigration(name);
        break;

      case 'init':
        await migrationManager.initialize();
        break;

      default:
        console.log(colorize('Nutrition Lab Database Migration Tool', 'bright'));
        console.log(colorize('====================================', 'cyan'));
        console.log();
        console.log(colorize('Usage:', 'bright'));
        console.log('  node migrate.js run                    - Run pending migrations');
        console.log('  node migrate.js status                 - Show migration status');
        console.log('  node migrate.js rollback [steps]       - Rollback last N migrations');
        console.log('  node migrate.js create <name>          - Create new migration file');
        console.log('  node migrate.js init                   - Initialize migration system');
        console.log();
        console.log(colorize('Examples:', 'bright'));
        console.log('  node migrate.js create add_user_table');
        console.log('  node migrate.js rollback 2');
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

module.exports = MigrationManager; 