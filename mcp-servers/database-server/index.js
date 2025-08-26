#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import pg from 'pg';
import { config } from 'dotenv';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Load environment variables from the main project
config({ path: resolve(__dirname, '../../.env') });

// Create MCP server instance
const server = new Server(
  {
    name: 'database-server',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Database connection pool
let pool = null;

// Initialize database connection
async function initDatabase() {
  const connectionString = process.env.DATABASE_URL;
  
  if (!connectionString) {
    console.error('Warning: DATABASE_URL not found in environment');
    return;
  }

  try {
    pool = new pg.Pool({
      connectionString,
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    });

    // Test connection
    const client = await pool.connect();
    await client.query('SELECT 1');
    client.release();
    console.error('Database connected successfully');
  } catch (error) {
    console.error('Failed to connect to database:', error.message);
    pool = null;
  }
}

// Available tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'query',
        description: 'Execute a SQL query on the PostgreSQL database',
        inputSchema: {
          type: 'object',
          properties: {
            sql: {
              type: 'string',
              description: 'The SQL query to execute',
            },
            params: {
              type: 'array',
              items: { type: ['string', 'number', 'boolean', 'null'] },
              description: 'Query parameters for parameterized queries',
            },
          },
          required: ['sql'],
        },
      },
      {
        name: 'list_tables',
        description: 'List all tables in the database',
        inputSchema: {
          type: 'object',
          properties: {
            schema: {
              type: 'string',
              description: 'Schema name (default: public)',
            },
          },
        },
      },
      {
        name: 'describe_table',
        description: 'Get the structure of a specific table',
        inputSchema: {
          type: 'object',
          properties: {
            table: {
              type: 'string',
              description: 'Table name',
            },
            schema: {
              type: 'string',
              description: 'Schema name (default: public)',
            },
          },
          required: ['table'],
        },
      },
      {
        name: 'list_migrations',
        description: 'List all Prisma migrations',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
      {
        name: 'check_connection',
        description: 'Check if database connection is active',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
      {
        name: 'execute_transaction',
        description: 'Execute multiple SQL statements in a transaction',
        inputSchema: {
          type: 'object',
          properties: {
            statements: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  sql: { type: 'string' },
                  params: { 
                    type: 'array',
                    items: { type: ['string', 'number', 'boolean', 'null'] }
                  },
                },
                required: ['sql'],
              },
              description: 'Array of SQL statements to execute in order',
            },
          },
          required: ['statements'],
        },
      },
      {
        name: 'backup_table',
        description: 'Create a backup of a table',
        inputSchema: {
          type: 'object',
          properties: {
            table: {
              type: 'string',
              description: 'Table name to backup',
            },
            suffix: {
              type: 'string',
              description: 'Suffix for backup table name (default: timestamp)',
            },
          },
          required: ['table'],
        },
      },
    ],
  };
});

// Handle tool execution
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  if (!pool && name !== 'check_connection') {
    return {
      content: [
        {
          type: 'text',
          text: 'Database connection not available. Please check DATABASE_URL configuration.',
        },
      ],
    };
  }

  try {
    switch (name) {
      case 'query': {
        const { sql, params = [] } = args;
        console.error(`Executing query: ${sql.substring(0, 100)}...`);
        
        const result = await pool.query(sql, params);
        
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                rowCount: result.rowCount,
                rows: result.rows,
                fields: result.fields?.map(f => ({ name: f.name, dataType: f.dataTypeID })),
                command: result.command,
              }, null, 2),
            },
          ],
        };
      }

      case 'list_tables': {
        const { schema = 'public' } = args;
        
        const query = `
          SELECT 
            tablename as name,
            schemaname as schema,
            tableowner as owner
          FROM pg_tables
          WHERE schemaname = $1
          ORDER BY tablename;
        `;
        
        const result = await pool.query(query, [schema]);
        
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                schema,
                tables: result.rows,
                count: result.rowCount,
              }, null, 2),
            },
          ],
        };
      }

      case 'describe_table': {
        const { table, schema = 'public' } = args;
        
        const query = `
          SELECT 
            column_name,
            data_type,
            character_maximum_length,
            is_nullable,
            column_default,
            is_identity
          FROM information_schema.columns
          WHERE table_schema = $1 AND table_name = $2
          ORDER BY ordinal_position;
        `;
        
        const columnsResult = await pool.query(query, [schema, table]);
        
        // Get constraints
        const constraintQuery = `
          SELECT
            tc.constraint_name,
            tc.constraint_type,
            kcu.column_name
          FROM information_schema.table_constraints tc
          JOIN information_schema.key_column_usage kcu
            ON tc.constraint_name = kcu.constraint_name
            AND tc.table_schema = kcu.table_schema
          WHERE tc.table_schema = $1 AND tc.table_name = $2;
        `;
        
        const constraintsResult = await pool.query(constraintQuery, [schema, table]);
        
        // Get indexes
        const indexQuery = `
          SELECT
            indexname,
            indexdef
          FROM pg_indexes
          WHERE schemaname = $1 AND tablename = $2;
        `;
        
        const indexesResult = await pool.query(indexQuery, [schema, table]);
        
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                table,
                schema,
                columns: columnsResult.rows,
                constraints: constraintsResult.rows,
                indexes: indexesResult.rows,
              }, null, 2),
            },
          ],
        };
      }

      case 'list_migrations': {
        const query = `
          SELECT 
            migration_name,
            started_at,
            finished_at,
            applied_steps_count,
            logs
          FROM _prisma_migrations
          ORDER BY finished_at DESC;
        `;
        
        try {
          const result = await pool.query(query);
          
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify({
                  migrations: result.rows,
                  count: result.rowCount,
                }, null, 2),
              },
            ],
          };
        } catch (error) {
          if (error.message.includes('_prisma_migrations')) {
            return {
              content: [
                {
                  type: 'text',
                  text: 'No Prisma migrations table found. Database may not be initialized with Prisma.',
                },
              ],
            };
          }
          throw error;
        }
      }

      case 'check_connection': {
        if (!pool) {
          await initDatabase();
        }
        
        if (!pool) {
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify({
                  connected: false,
                  error: 'Could not establish database connection',
                }, null, 2),
              },
            ],
          };
        }
        
        try {
          const result = await pool.query('SELECT current_database(), current_user, version()');
          
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify({
                  connected: true,
                  database: result.rows[0].current_database,
                  user: result.rows[0].current_user,
                  version: result.rows[0].version,
                }, null, 2),
              },
            ],
          };
        } catch (error) {
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify({
                  connected: false,
                  error: error.message,
                }, null, 2),
              },
            ],
          };
        }
      }

      case 'execute_transaction': {
        const { statements } = args;
        
        const client = await pool.connect();
        
        try {
          await client.query('BEGIN');
          
          const results = [];
          for (const stmt of statements) {
            const result = await client.query(stmt.sql, stmt.params || []);
            results.push({
              command: result.command,
              rowCount: result.rowCount,
              rows: result.rows,
            });
          }
          
          await client.query('COMMIT');
          
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify({
                  success: true,
                  results,
                  statementCount: statements.length,
                }, null, 2),
              },
            ],
          };
        } catch (error) {
          await client.query('ROLLBACK');
          throw error;
        } finally {
          client.release();
        }
      }

      case 'backup_table': {
        const { table, suffix = new Date().toISOString().replace(/[:.]/g, '_') } = args;
        const backupTable = `${table}_backup_${suffix}`;
        
        const query = `CREATE TABLE ${backupTable} AS TABLE ${table}`;
        
        const result = await pool.query(query);
        
        // Get row count
        const countResult = await pool.query(`SELECT COUNT(*) FROM ${backupTable}`);
        
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                success: true,
                originalTable: table,
                backupTable,
                rowsCopied: parseInt(countResult.rows[0].count),
              }, null, 2),
            },
          ],
        };
      }

      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error) {
    console.error(`Error executing ${name}:`, error);
    return {
      content: [
        {
          type: 'text',
          text: `Error: ${error.message}`,
        },
      ],
    };
  }
});

// Cleanup on exit
process.on('SIGINT', async () => {
  console.error('Shutting down database server...');
  
  if (pool) {
    await pool.end();
  }
  
  process.exit(0);
});

// Start the server
async function main() {
  await initDatabase();
  
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('Database MCP server started');
}

main().catch(console.error);
