#!/usr/bin/env node
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { exec } from "child_process";
import { promisify } from "util";
import { resolve } from "path";

const execAsync = promisify(exec);

// Create MCP server instance
const server = new Server(
  {
    name: "git-server",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Git repository path
const REPO_PATH = process.argv[2] || "/Users/kr/fntp-nutrition-system";

// Helper function to run git commands
async function runGitCommand(command, cwd = REPO_PATH) {
  try {
    const { stdout, stderr } = await execAsync(command, { cwd });
    if (stderr && !stderr.includes("warning:")) {
      console.error(`Git stderr: ${stderr}`);
    }
    return stdout.trim();
  } catch (error) {
    throw new Error(`Git command failed: ${error.message}`);
  }
}

// Available tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "git_status",
        description: "Show the working tree status",
        inputSchema: {
          type: "object",
          properties: {
            short: {
              type: "boolean",
              description: "Give output in short format",
              default: false,
            },
          },
        },
      },
      {
        name: "git_log",
        description: "Show commit logs",
        inputSchema: {
          type: "object",
          properties: {
            limit: {
              type: "number",
              description: "Limit number of commits",
              default: 10,
            },
            oneline: {
              type: "boolean",
              description: "Show logs in one line format",
              default: true,
            },
          },
        },
      },
      {
        name: "git_diff",
        description: "Show changes between commits, working tree, etc",
        inputSchema: {
          type: "object",
          properties: {
            staged: {
              type: "boolean",
              description: "Show staged changes",
              default: false,
            },
          },
        },
      },
      {
        name: "git_add",
        description: "Add file contents to the index",
        inputSchema: {
          type: "object",
          properties: {
            files: {
              type: "array",
              items: { type: "string" },
              description: 'Files to add (use ["."] for all)',
            },
          },
          required: ["files"],
        },
      },
      {
        name: "git_commit",
        description: "Record changes to the repository",
        inputSchema: {
          type: "object",
          properties: {
            message: {
              type: "string",
              description: "Commit message",
            },
          },
          required: ["message"],
        },
      },
      {
        name: "git_branch",
        description: "List, create, or delete branches",
        inputSchema: {
          type: "object",
          properties: {
            create: {
              type: "string",
              description: "Create a new branch with this name",
            },
            delete: {
              type: "string",
              description: "Delete branch with this name",
            },
            list: {
              type: "boolean",
              description: "List branches",
              default: true,
            },
          },
        },
      },
      {
        name: "git_checkout",
        description: "Switch branches or restore working tree files",
        inputSchema: {
          type: "object",
          properties: {
            branch: {
              type: "string",
              description: "Branch name to checkout",
            },
          },
          required: ["branch"],
        },
      },
      {
        name: "git_push",
        description: "Update remote refs",
        inputSchema: {
          type: "object",
          properties: {
            remote: {
              type: "string",
              description: "Remote name",
              default: "origin",
            },
            branch: {
              type: "string",
              description: "Branch to push",
            },
            force: {
              type: "boolean",
              description: "Force push",
              default: false,
            },
          },
        },
      },
      {
        name: "git_pull",
        description: "Fetch from and integrate with another repository",
        inputSchema: {
          type: "object",
          properties: {
            remote: {
              type: "string",
              description: "Remote name",
              default: "origin",
            },
            branch: {
              type: "string",
              description: "Branch to pull",
            },
          },
        },
      },
    ],
  };
});

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    let result;

    switch (name) {
      case "git_status":
        result = await runGitCommand(
          `git status ${args.short ? "--short" : ""}`
        );
        break;

      case "git_log":
        result = await runGitCommand(
          `git log ${args.oneline ? "--oneline" : ""} -${args.limit || 10}`
        );
        break;

      case "git_diff":
        result = await runGitCommand(
          `git diff ${args.staged ? "--staged" : ""}`
        );
        if (!result) {
          result = "No changes detected";
        }
        break;

      case "git_add":
        const files = args.files.join(" ");
        result = await runGitCommand(`git add ${files}`);
        result = result || `Added files: ${files}`;
        break;

      case "git_commit":
        result = await runGitCommand(`git commit -m "${args.message}"`);
        break;

      case "git_branch":
        if (args.create) {
          result = await runGitCommand(`git branch ${args.create}`);
          result = `Branch '${args.create}' created`;
        } else if (args.delete) {
          result = await runGitCommand(`git branch -d ${args.delete}`);
        } else {
          result = await runGitCommand("git branch -a");
        }
        break;

      case "git_checkout":
        result = await runGitCommand(`git checkout ${args.branch}`);
        result = `Switched to branch '${args.branch}'`;
        break;

      case "git_push":
        const pushCmd = `git push ${args.force ? "-f" : ""} ${args.remote} ${
          args.branch || ""
        }`.trim();
        result = await runGitCommand(pushCmd);
        result = result || `Pushed to ${args.remote}`;
        break;

      case "git_pull":
        const pullCmd = `git pull ${args.remote} ${args.branch || ""}`.trim();
        result = await runGitCommand(pullCmd);
        break;

      default:
        throw new Error(`Unknown tool: ${name}`);
    }

    return {
      content: [
        {
          type: "text",
          text: result,
        },
      ],
    };
  } catch (error) {
    return {
      content: [
        {
          type: "text",
          text: `Error: ${error.message}`,
        },
      ],
    };
  }
});

// Start the server
async function main() {
  const transport = new StdioServerTransport();

  await server.connect(transport);
  console.error(`Git MCP server running for repository: ${REPO_PATH}`);
}

main().catch((error) => {
  console.error("Server error:", error);
  process.exit(1);
});
