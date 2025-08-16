#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import axios from 'axios';
import { config } from 'dotenv';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Load environment variables
config({ path: resolve(__dirname, '../../.env') });

// Create MCP server instance
const server = new Server(
  {
    name: 'sentry-server',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Sentry API configuration
const SENTRY_API_URL = 'https://sentry.io/api/0';
let sentryClient = null;
let organization = null;
let project = null;

async function initSentry() {
  const token = process.env.SENTRY_AUTH_TOKEN;
  organization = process.env.SENTRY_ORG || 'fntp-nutrition';
  project = process.env.SENTRY_PROJECT || 'javascript-nextjs';
  
  if (!token) {
    console.error('Warning: SENTRY_AUTH_TOKEN not found in environment');
    console.error('Get it from: https://sentry.io/settings/account/api/auth-tokens/');
    return;
  }

  sentryClient = axios.create({
    baseURL: SENTRY_API_URL,
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  try {
    // Test connection
    const response = await sentryClient.get('/');
    console.error(`Sentry connected for org: ${organization}, project: ${project}`);
  } catch (error) {
    console.error('Failed to connect to Sentry:', error.message);
    sentryClient = null;
  }
}

// Available tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'list_issues',
        description: 'List recent Sentry issues/errors',
        inputSchema: {
          type: 'object',
          properties: {
            status: {
              type: 'string',
              description: 'Filter by status (unresolved, resolved, ignored)',
            },
            level: {
              type: 'string',
              description: 'Filter by level (error, warning, info)',
            },
            limit: {
              type: 'number',
              description: 'Number of issues to return (default 25)',
            },
            query: {
              type: 'string',
              description: 'Search query',
            },
          },
        },
      },
      {
        name: 'get_issue',
        description: 'Get details of a specific Sentry issue',
        inputSchema: {
          type: 'object',
          properties: {
            issueId: {
              type: 'string',
              description: 'Sentry issue ID',
            },
          },
          required: ['issueId'],
        },
      },
      {
        name: 'get_issue_events',
        description: 'Get recent events for an issue',
        inputSchema: {
          type: 'object',
          properties: {
            issueId: {
              type: 'string',
              description: 'Sentry issue ID',
            },
            limit: {
              type: 'number',
              description: 'Number of events (default 10)',
            },
          },
          required: ['issueId'],
        },
      },
      {
        name: 'resolve_issue',
        description: 'Mark a Sentry issue as resolved',
        inputSchema: {
          type: 'object',
          properties: {
            issueId: {
              type: 'string',
              description: 'Sentry issue ID',
            },
          },
          required: ['issueId'],
        },
      },
      {
        name: 'ignore_issue',
        description: 'Ignore a Sentry issue',
        inputSchema: {
          type: 'object',
          properties: {
            issueId: {
              type: 'string',
              description: 'Sentry issue ID',
            },
            duration: {
              type: 'number',
              description: 'Ignore duration in minutes',
            },
          },
          required: ['issueId'],
        },
      },
      {
        name: 'get_stats',
        description: 'Get error statistics for the project',
        inputSchema: {
          type: 'object',
          properties: {
            period: {
              type: 'string',
              description: 'Time period (24h, 7d, 14d, 30d)',
            },
          },
        },
      },
      {
        name: 'get_releases',
        description: 'List recent releases',
        inputSchema: {
          type: 'object',
          properties: {
            limit: {
              type: 'number',
              description: 'Number of releases (default 10)',
            },
          },
        },
      },
      {
        name: 'analyze_error_pattern',
        description: 'Analyze an error to find patterns and suggest fixes',
        inputSchema: {
          type: 'object',
          properties: {
            issueId: {
              type: 'string',
              description: 'Sentry issue ID to analyze',
            },
          },
          required: ['issueId'],
        },
      },
      {
        name: 'check_deployment_health',
        description: 'Check error rates after a deployment',
        inputSchema: {
          type: 'object',
          properties: {
            releaseVersion: {
              type: 'string',
              description: 'Release version to check',
            },
          },
        },
      },
    ],
  };
});

// Handle tool execution
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  if (!sentryClient) {
    return {
      content: [
        {
          type: 'text',
          text: 'Sentry client not initialized. Please check SENTRY_AUTH_TOKEN in .env',
        },
      ],
    };
  }

  try {
    switch (name) {
      case 'list_issues': {
        const { status = 'unresolved', level, limit = 25, query } = args;
        
        const params = {
          statsPeriod: '24h',
          shortIdLookup: 1,
          limit,
          query: status === 'unresolved' ? 'is:unresolved' : `is:${status}`,
        };

        if (level) {
          params.query += ` level:${level}`;
        }
        
        if (query) {
          params.query += ` ${query}`;
        }

        const response = await sentryClient.get(
          `/projects/${organization}/${project}/issues/`,
          { params }
        );

        const issues = response.data.map(issue => ({
          id: issue.id,
          shortId: issue.shortId,
          title: issue.title,
          culprit: issue.culprit,
          level: issue.level,
          status: issue.status,
          count: issue.count,
          userCount: issue.userCount,
          firstSeen: issue.firstSeen,
          lastSeen: issue.lastSeen,
          permalink: issue.permalink,
        }));

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(issues, null, 2),
            },
          ],
        };
      }

      case 'get_issue': {
        const { issueId } = args;
        
        const response = await sentryClient.get(`/issues/${issueId}/`);
        const issue = response.data;

        const details = {
          id: issue.id,
          shortId: issue.shortId,
          title: issue.title,
          culprit: issue.culprit,
          level: issue.level,
          status: issue.status,
          platform: issue.platform,
          type: issue.type,
          metadata: issue.metadata,
          count: issue.count,
          userCount: issue.userCount,
          firstSeen: issue.firstSeen,
          lastSeen: issue.lastSeen,
          permalink: issue.permalink,
        };

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(details, null, 2),
            },
          ],
        };
      }

      case 'get_issue_events': {
        const { issueId, limit = 10 } = args;
        
        const response = await sentryClient.get(
          `/issues/${issueId}/events/`,
          { params: { limit } }
        );

        const events = response.data.map(event => ({
          id: event.id,
          eventID: event.eventID,
          message: event.message,
          platform: event.platform,
          dateCreated: event.dateCreated,
          user: event.user,
          context: event.contexts,
          tags: event.tags,
        }));

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(events, null, 2),
            },
          ],
        };
      }

      case 'resolve_issue': {
        const { issueId } = args;
        
        await sentryClient.put(`/issues/${issueId}/`, {
          status: 'resolved',
        });

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                success: true,
                message: `Issue ${issueId} marked as resolved`,
              }, null, 2),
            },
          ],
        };
      }

      case 'ignore_issue': {
        const { issueId, duration } = args;
        
        const data = {
          status: 'ignored',
        };

        if (duration) {
          data.ignoreDuration = duration;
        }

        await sentryClient.put(`/issues/${issueId}/`, data);

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                success: true,
                message: `Issue ${issueId} ignored${duration ? ` for ${duration} minutes` : ''}`,
              }, null, 2),
            },
          ],
        };
      }

      case 'get_stats': {
        const { period = '24h' } = args;
        
        const response = await sentryClient.get(
          `/organizations/${organization}/stats/`,
          {
            params: {
              field: 'sum(quantity)',
              groupBy: 'category,outcome',
              interval: '1h',
              statsPeriod: period,
            },
          }
        );

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(response.data, null, 2),
            },
          ],
        };
      }

      case 'get_releases': {
        const { limit = 10 } = args;
        
        const response = await sentryClient.get(
          `/organizations/${organization}/releases/`,
          { params: { limit } }
        );

        const releases = response.data.map(release => ({
          version: release.version,
          dateCreated: release.dateCreated,
          dateReleased: release.dateReleased,
          newGroups: release.newGroups,
          commitCount: release.commitCount,
          authors: release.authors,
          projects: release.projects,
        }));

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(releases, null, 2),
            },
          ],
        };
      }

      case 'analyze_error_pattern': {
        const { issueId } = args;
        
        // Get issue details
        const issueResponse = await sentryClient.get(`/issues/${issueId}/`);
        const issue = issueResponse.data;
        
        // Get recent events
        const eventsResponse = await sentryClient.get(
          `/issues/${issueId}/events/`,
          { params: { limit: 5 } }
        );
        const events = eventsResponse.data;

        // Analyze patterns
        const analysis = {
          issue: {
            title: issue.title,
            culprit: issue.culprit,
            level: issue.level,
            occurrences: issue.count,
            usersAffected: issue.userCount,
          },
          patterns: {
            frequency: calculateFrequency(issue),
            timePattern: analyzeTimePattern(issue),
            userImpact: issue.userCount / issue.count,
          },
          commonFactors: extractCommonFactors(events),
          suggestedActions: generateSuggestions(issue, events),
        };

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(analysis, null, 2),
            },
          ],
        };
      }

      case 'check_deployment_health': {
        const { releaseVersion } = args;
        
        // Get release details
        const releaseResponse = await sentryClient.get(
          `/organizations/${organization}/releases/${releaseVersion}/`
        );
        const release = releaseResponse.data;

        // Get issues for this release
        const issuesResponse = await sentryClient.get(
          `/projects/${organization}/${project}/issues/`,
          {
            params: {
              query: `first-release:"${releaseVersion}"`,
              limit: 100,
            },
          }
        );

        const health = {
          release: {
            version: release.version,
            deployed: release.dateReleased,
            commitCount: release.commitCount,
          },
          newIssues: issuesResponse.data.length,
          criticalIssues: issuesResponse.data.filter(i => i.level === 'error').length,
          totalErrors: issuesResponse.data.reduce((sum, i) => sum + i.count, 0),
          usersAffected: Math.max(...issuesResponse.data.map(i => i.userCount || 0)),
          status: issuesResponse.data.length === 0 ? 'healthy' : 
                  issuesResponse.data.some(i => i.level === 'error') ? 'critical' : 'warning',
        };

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(health, null, 2),
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

// Helper functions
function calculateFrequency(issue) {
  const hoursSinceFirst = (new Date() - new Date(issue.firstSeen)) / (1000 * 60 * 60);
  const eventsPerHour = issue.count / hoursSinceFirst;
  
  if (eventsPerHour > 100) return 'critical';
  if (eventsPerHour > 10) return 'high';
  if (eventsPerHour > 1) return 'moderate';
  return 'low';
}

function analyzeTimePattern(issue) {
  const lastSeen = new Date(issue.lastSeen);
  const hour = lastSeen.getHours();
  
  if (hour >= 9 && hour < 17) return 'business_hours';
  if (hour >= 17 && hour < 22) return 'evening';
  if (hour >= 22 || hour < 6) return 'overnight';
  return 'early_morning';
}

function extractCommonFactors(events) {
  const factors = {
    browsers: {},
    os: {},
    urls: {},
  };

  events.forEach(event => {
    // Count browsers
    const browser = event.tags?.find(t => t.key === 'browser')?.value;
    if (browser) {
      factors.browsers[browser] = (factors.browsers[browser] || 0) + 1;
    }

    // Count OS
    const os = event.tags?.find(t => t.key === 'os')?.value;
    if (os) {
      factors.os[os] = (factors.os[os] || 0) + 1;
    }

    // Count URLs
    const url = event.tags?.find(t => t.key === 'url')?.value;
    if (url) {
      factors.urls[url] = (factors.urls[url] || 0) + 1;
    }
  });

  return factors;
}

function generateSuggestions(issue, events) {
  const suggestions = [];

  if (issue.count > 100) {
    suggestions.push('High frequency error - consider immediate hotfix');
  }

  if (issue.userCount > 50) {
    suggestions.push('Affecting many users - prioritize resolution');
  }

  if (issue.culprit?.includes('api')) {
    suggestions.push('API-related error - check backend services');
  }

  if (issue.culprit?.includes('database')) {
    suggestions.push('Database-related - check connection and queries');
  }

  return suggestions;
}

// Start the server
async function main() {
  await initSentry();
  
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('Sentry MCP server started');
}

main().catch(console.error);
