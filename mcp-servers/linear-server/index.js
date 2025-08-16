#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { LinearClient } from '@linear/sdk';
import { config } from 'dotenv';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Load environment variables
config({ path: resolve(__dirname, '../../.env') });

// Create MCP server instance
const server = new Server(
  {
    name: 'linear-server',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Initialize Linear client
let linearClient = null;

async function initLinear() {
  const apiKey = process.env.LINEAR_API_KEY;
  
  if (!apiKey) {
    console.error('Warning: LINEAR_API_KEY not found in environment');
    return;
  }

  try {
    linearClient = new LinearClient({ apiKey });
    
    // Test connection
    const me = await linearClient.viewer;
    console.error(`Linear connected as: ${me.email}`);
  } catch (error) {
    console.error('Failed to connect to Linear:', error.message);
    linearClient = null;
  }
}

// Available tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'list_issues',
        description: 'List Linear issues with filters',
        inputSchema: {
          type: 'object',
          properties: {
            status: {
              type: 'string',
              description: 'Filter by status (e.g., Todo, In Progress, Done)',
            },
            assignee: {
              type: 'string',
              description: 'Filter by assignee email or "me"',
            },
            limit: {
              type: 'number',
              description: 'Number of issues to return (default 20)',
            },
          },
        },
      },
      {
        name: 'create_issue',
        description: 'Create a new Linear issue',
        inputSchema: {
          type: 'object',
          properties: {
            title: {
              type: 'string',
              description: 'Issue title',
            },
            description: {
              type: 'string',
              description: 'Issue description (markdown supported)',
            },
            priority: {
              type: 'number',
              description: 'Priority (0=None, 1=Urgent, 2=High, 3=Normal, 4=Low)',
            },
            teamKey: {
              type: 'string',
              description: 'Team key (e.g., ENG, PROD)',
            },
            labels: {
              type: 'array',
              items: { type: 'string' },
              description: 'Label names',
            },
          },
          required: ['title'],
        },
      },
      {
        name: 'update_issue',
        description: 'Update an existing Linear issue',
        inputSchema: {
          type: 'object',
          properties: {
            issueId: {
              type: 'string',
              description: 'Issue ID or key (e.g., ENG-123)',
            },
            title: {
              type: 'string',
              description: 'New title',
            },
            description: {
              type: 'string',
              description: 'New description',
            },
            stateId: {
              type: 'string',
              description: 'New state ID',
            },
            priority: {
              type: 'number',
              description: 'New priority',
            },
          },
          required: ['issueId'],
        },
      },
      {
        name: 'add_comment',
        description: 'Add a comment to a Linear issue',
        inputSchema: {
          type: 'object',
          properties: {
            issueId: {
              type: 'string',
              description: 'Issue ID or key',
            },
            body: {
              type: 'string',
              description: 'Comment text (markdown supported)',
            },
          },
          required: ['issueId', 'body'],
        },
      },
      {
        name: 'get_issue',
        description: 'Get details of a specific issue',
        inputSchema: {
          type: 'object',
          properties: {
            issueId: {
              type: 'string',
              description: 'Issue ID or key',
            },
          },
          required: ['issueId'],
        },
      },
      {
        name: 'list_teams',
        description: 'List all teams in the workspace',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
      {
        name: 'list_workflow_states',
        description: 'List workflow states for a team',
        inputSchema: {
          type: 'object',
          properties: {
            teamId: {
              type: 'string',
              description: 'Team ID',
            },
          },
        },
      },
      {
        name: 'create_issue_from_error',
        description: 'Create a Linear issue from a Sentry error or bug',
        inputSchema: {
          type: 'object',
          properties: {
            title: {
              type: 'string',
              description: 'Error title',
            },
            errorMessage: {
              type: 'string',
              description: 'Error message',
            },
            stackTrace: {
              type: 'string',
              description: 'Stack trace',
            },
            url: {
              type: 'string',
              description: 'URL where error occurred',
            },
            sentryUrl: {
              type: 'string',
              description: 'Link to Sentry issue',
            },
            priority: {
              type: 'number',
              description: 'Priority based on error frequency',
            },
          },
          required: ['title', 'errorMessage'],
        },
      },
    ],
  };
});

// Handle tool execution
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  if (!linearClient && name !== 'check_connection') {
    return {
      content: [
        {
          type: 'text',
          text: 'Linear client not initialized. Please check LINEAR_API_KEY in .env',
        },
      ],
    };
  }

  try {
    switch (name) {
      case 'list_issues': {
        const { status, assignee, limit = 20 } = args;
        
        let filter = {};
        if (status) {
          filter.state = { name: { eq: status } };
        }
        if (assignee === 'me') {
          const me = await linearClient.viewer;
          filter.assignee = { id: { eq: me.id } };
        }

        const issues = await linearClient.issues({
          filter,
          first: limit,
        });

        const issueList = await Promise.all(
          issues.nodes.map(async (issue) => ({
            id: issue.id,
            identifier: issue.identifier,
            title: issue.title,
            state: (await issue.state)?.name,
            priority: issue.priority,
            assignee: (await issue.assignee)?.name,
            createdAt: issue.createdAt,
            url: issue.url,
          }))
        );

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(issueList, null, 2),
            },
          ],
        };
      }

      case 'create_issue': {
        const { title, description, priority = 3, teamKey, labels = [] } = args;
        
        // Get team
        let teamId;
        if (teamKey) {
          const teams = await linearClient.teams();
          const team = teams.nodes.find(t => t.key === teamKey);
          teamId = team?.id;
        } else {
          // Use first team as default
          const teams = await linearClient.teams();
          teamId = teams.nodes[0]?.id;
        }

        if (!teamId) {
          throw new Error('No team found');
        }

        // Create issue
        const issuePayload = {
          title,
          description,
          priority,
          teamId,
        };

        // Add labels if provided
        if (labels.length > 0) {
          const allLabels = await linearClient.issueLabels();
          const labelIds = labels
            .map(name => allLabels.nodes.find(l => l.name === name)?.id)
            .filter(Boolean);
          
          if (labelIds.length > 0) {
            issuePayload.labelIds = labelIds;
          }
        }

        const issue = await linearClient.createIssue(issuePayload);
        const created = await issue.issue;

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                success: true,
                id: created.id,
                identifier: created.identifier,
                title: created.title,
                url: created.url,
              }, null, 2),
            },
          ],
        };
      }

      case 'update_issue': {
        const { issueId, ...updates } = args;
        
        // Find issue
        let issue;
        if (issueId.includes('-')) {
          // It's an identifier like ENG-123
          const result = await linearClient.issue(issueId);
          issue = result;
        } else {
          // It's an ID
          issue = await linearClient.issue(issueId);
        }

        if (!issue) {
          throw new Error(`Issue ${issueId} not found`);
        }

        // Update issue
        await issue.update(updates);

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                success: true,
                message: `Issue ${issue.identifier} updated`,
              }, null, 2),
            },
          ],
        };
      }

      case 'add_comment': {
        const { issueId, body } = args;
        
        // Find issue
        let issue;
        if (issueId.includes('-')) {
          issue = await linearClient.issue(issueId);
        } else {
          issue = await linearClient.issue(issueId);
        }

        if (!issue) {
          throw new Error(`Issue ${issueId} not found`);
        }

        // Add comment
        await linearClient.createComment({
          issueId: issue.id,
          body,
        });

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                success: true,
                message: `Comment added to ${issue.identifier}`,
              }, null, 2),
            },
          ],
        };
      }

      case 'get_issue': {
        const { issueId } = args;
        
        const issue = await linearClient.issue(issueId);
        
        if (!issue) {
          throw new Error(`Issue ${issueId} not found`);
        }

        const details = {
          id: issue.id,
          identifier: issue.identifier,
          title: issue.title,
          description: issue.description,
          state: (await issue.state)?.name,
          priority: issue.priority,
          assignee: (await issue.assignee)?.name,
          labels: await Promise.all((await issue.labels()).nodes.map(l => l.name)),
          createdAt: issue.createdAt,
          updatedAt: issue.updatedAt,
          url: issue.url,
        };

        // Get comments
        const comments = await issue.comments();
        details.comments = comments.nodes.map(c => ({
          body: c.body,
          createdAt: c.createdAt,
          user: c.user?.name,
        }));

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(details, null, 2),
            },
          ],
        };
      }

      case 'list_teams': {
        const teams = await linearClient.teams();
        
        const teamList = teams.nodes.map(team => ({
          id: team.id,
          key: team.key,
          name: team.name,
          description: team.description,
        }));

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(teamList, null, 2),
            },
          ],
        };
      }

      case 'list_workflow_states': {
        const { teamId } = args;
        
        const states = await linearClient.workflowStates({
          filter: teamId ? { team: { id: { eq: teamId } } } : {},
        });

        const stateList = states.nodes.map(state => ({
          id: state.id,
          name: state.name,
          type: state.type,
          position: state.position,
          color: state.color,
        }));

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(stateList, null, 2),
            },
          ],
        };
      }

      case 'create_issue_from_error': {
        const { 
          title, 
          errorMessage, 
          stackTrace, 
          url, 
          sentryUrl, 
          priority = 2 
        } = args;
        
        // Build description
        let description = `## Error Details\n\n`;
        description += `**Error:** ${errorMessage}\n\n`;
        
        if (url) {
          description += `**URL:** ${url}\n\n`;
        }
        
        if (sentryUrl) {
          description += `**Sentry:** [View in Sentry](${sentryUrl})\n\n`;
        }
        
        if (stackTrace) {
          description += `## Stack Trace\n\n\`\`\`\n${stackTrace}\n\`\`\`\n`;
        }
        
        description += `\n---\n*Auto-generated from error monitoring*`;

        // Get team (use first team)
        const teams = await linearClient.teams();
        const teamId = teams.nodes[0]?.id;

        if (!teamId) {
          throw new Error('No team found');
        }

        // Try to find or create "bug" label
        const labels = await linearClient.issueLabels();
        let bugLabel = labels.nodes.find(l => l.name.toLowerCase() === 'bug');
        
        const issuePayload = {
          title: `🐛 ${title}`,
          description,
          priority,
          teamId,
        };

        if (bugLabel) {
          issuePayload.labelIds = [bugLabel.id];
        }

        const issue = await linearClient.createIssue(issuePayload);
        const created = await issue.issue;

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                success: true,
                id: created.id,
                identifier: created.identifier,
                title: created.title,
                url: created.url,
                message: 'Bug issue created from error',
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

// Start the server
async function main() {
  await initLinear();
  
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('Linear MCP server started');
}

main().catch(console.error);
