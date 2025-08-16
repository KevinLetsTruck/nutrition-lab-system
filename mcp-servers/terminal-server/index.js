#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { execa } from 'execa';
import { homedir } from 'os';
import { resolve } from 'path';

// Create MCP server instance
const server = new Server(
  {
    name: 'terminal-server',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Working directory - defaults to project root
let workingDirectory = process.env.WORKING_DIR || resolve(homedir(), 'fntp-nutrition-system');

// Store running processes
const runningProcesses = new Map();

// Available tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'run_command',
        description: 'Execute a shell command in the working directory',
        inputSchema: {
          type: 'object',
          properties: {
            command: {
              type: 'string',
              description: 'The command to execute',
            },
            cwd: {
              type: 'string',
              description: 'Working directory (optional, defaults to project root)',
            },
            env: {
              type: 'object',
              description: 'Environment variables (optional)',
            },
          },
          required: ['command'],
        },
      },
      {
        name: 'npm_run',
        description: 'Run an npm script from package.json',
        inputSchema: {
          type: 'object',
          properties: {
            script: {
              type: 'string',
              description: 'The npm script name to run (e.g., dev, build, test)',
            },
            args: {
              type: 'array',
              items: { type: 'string' },
              description: 'Additional arguments to pass to the script',
            },
          },
          required: ['script'],
        },
      },
      {
        name: 'start_dev_server',
        description: 'Start the Next.js development server',
        inputSchema: {
          type: 'object',
          properties: {
            port: {
              type: 'number',
              description: 'Port to run on (default 3000)',
            },
          },
        },
      },
      {
        name: 'stop_dev_server',
        description: 'Stop the running development server',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
      {
        name: 'prisma_command',
        description: 'Run Prisma CLI commands',
        inputSchema: {
          type: 'object',
          properties: {
            command: {
              type: 'string',
              description: 'Prisma command (e.g., migrate dev, db push, studio, generate)',
            },
            args: {
              type: 'array',
              items: { type: 'string' },
              description: 'Additional arguments',
            },
          },
          required: ['command'],
        },
      },
      {
        name: 'git_command',
        description: 'Run git commands',
        inputSchema: {
          type: 'object',
          properties: {
            command: {
              type: 'string',
              description: 'Git command (e.g., status, add, commit, push)',
            },
            args: {
              type: 'array',
              items: { type: 'string' },
              description: 'Additional arguments',
            },
          },
          required: ['command'],
        },
      },
      {
        name: 'install_dependencies',
        description: 'Install npm dependencies',
        inputSchema: {
          type: 'object',
          properties: {
            packages: {
              type: 'array',
              items: { type: 'string' },
              description: 'Package names to install (empty for all from package.json)',
            },
            dev: {
              type: 'boolean',
              description: 'Install as dev dependencies',
            },
          },
        },
      },
      {
        name: 'check_process',
        description: 'Check if a process is running',
        inputSchema: {
          type: 'object',
          properties: {
            name: {
              type: 'string',
              description: 'Process name to check',
            },
          },
          required: ['name'],
        },
      },
    ],
  };
});

// Handle tool execution
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case 'run_command': {
        const { command, cwd = workingDirectory, env = {} } = args;
        console.error(`Executing command: ${command} in ${cwd}`);
        
        const result = await execa(command, {
          shell: true,
          cwd,
          env: { ...process.env, ...env },
          reject: false,
        });

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                success: result.exitCode === 0,
                stdout: result.stdout,
                stderr: result.stderr,
                exitCode: result.exitCode,
              }, null, 2),
            },
          ],
        };
      }

      case 'npm_run': {
        const { script, args: scriptArgs = [] } = args;
        console.error(`Running npm script: ${script}`);
        
        const result = await execa('npm', ['run', script, '--', ...scriptArgs], {
          cwd: workingDirectory,
          reject: false,
        });

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                success: result.exitCode === 0,
                stdout: result.stdout,
                stderr: result.stderr,
                exitCode: result.exitCode,
              }, null, 2),
            },
          ],
        };
      }

      case 'start_dev_server': {
        const { port = 3000 } = args;
        
        if (runningProcesses.has('dev-server')) {
          return {
            content: [
              {
                type: 'text',
                text: 'Development server is already running',
              },
            ],
          };
        }

        console.error(`Starting dev server on port ${port}`);
        
        const devProcess = execa('npm', ['run', 'dev'], {
          cwd: workingDirectory,
          env: { ...process.env, PORT: String(port) },
        });

        runningProcesses.set('dev-server', devProcess);

        // Give it a moment to start
        await new Promise(resolve => setTimeout(resolve, 3000));

        return {
          content: [
            {
              type: 'text',
              text: `Development server started on port ${port}. Access at http://localhost:${port}`,
            },
          ],
        };
      }

      case 'stop_dev_server': {
        const devProcess = runningProcesses.get('dev-server');
        
        if (!devProcess) {
          return {
            content: [
              {
                type: 'text',
                text: 'No development server is running',
              },
            ],
          };
        }

        devProcess.kill('SIGTERM');
        runningProcesses.delete('dev-server');

        return {
          content: [
            {
              type: 'text',
              text: 'Development server stopped',
            },
          ],
        };
      }

      case 'prisma_command': {
        const { command, args: prismaArgs = [] } = args;
        console.error(`Running Prisma command: ${command}`);
        
        const result = await execa('npx', ['prisma', ...command.split(' '), ...prismaArgs], {
          cwd: workingDirectory,
          reject: false,
        });

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                success: result.exitCode === 0,
                stdout: result.stdout,
                stderr: result.stderr,
                exitCode: result.exitCode,
              }, null, 2),
            },
          ],
        };
      }

      case 'git_command': {
        const { command, args: gitArgs = [] } = args;
        console.error(`Running git command: ${command}`);
        
        const result = await execa('git', [command, ...gitArgs], {
          cwd: workingDirectory,
          reject: false,
        });

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                success: result.exitCode === 0,
                stdout: result.stdout,
                stderr: result.stderr,
                exitCode: result.exitCode,
              }, null, 2),
            },
          ],
        };
      }

      case 'install_dependencies': {
        const { packages = [], dev = false } = args;
        
        let command;
        if (packages.length === 0) {
          command = ['install'];
        } else {
          command = ['install', ...packages];
          if (dev) command.push('--save-dev');
        }

        console.error(`Installing dependencies: ${packages.join(', ') || 'all'}`);
        
        const result = await execa('npm', command, {
          cwd: workingDirectory,
          reject: false,
        });

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                success: result.exitCode === 0,
                stdout: result.stdout,
                stderr: result.stderr,
                exitCode: result.exitCode,
              }, null, 2),
            },
          ],
        };
      }

      case 'check_process': {
        const { name } = args;
        const isRunning = runningProcesses.has(name);

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                process: name,
                running: isRunning,
                pids: isRunning ? [runningProcesses.get(name).pid] : [],
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
process.on('SIGINT', () => {
  console.error('Shutting down terminal server...');
  
  // Kill all running processes
  for (const [name, proc] of runningProcesses) {
    console.error(`Killing process: ${name}`);
    proc.kill('SIGTERM');
  }
  
  process.exit(0);
});

// Start the server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('Terminal MCP server started');
}

main().catch(console.error);
