# Git MCP Server

A Node.js implementation of the Model Context Protocol (MCP) server for Git operations.

## Overview

This MCP server provides Git functionality to Claude, allowing it to perform version control operations directly on your repository.

## Available Tools

- **git_status** - Show the working tree status
- **git_log** - Show commit logs
- **git_diff** - Show changes between commits, working tree, etc
- **git_add** - Add file contents to the index
- **git_commit** - Record changes to the repository
- **git_branch** - List, create, or delete branches
- **git_checkout** - Switch branches
- **git_push** - Update remote refs
- **git_pull** - Fetch from and integrate with another repository

## Installation

```bash
npm install
```

## Usage

The server is automatically started by Claude Desktop when configured in `claude_desktop_config.json`.

To test manually:

```bash
node index.js /path/to/repository
```

## Configuration

The server is configured in Claude Desktop's config file with:

```json
{
  "git": {
    "command": "node",
    "args": [
      "/Users/kr/fntp-nutrition-system/mcp-servers/git-server/index.js",
      "/Users/kr/fntp-nutrition-system"
    ]
  }
}
```

## Requirements

- Node.js 16+
- Git installed and available in PATH
- Repository must be initialized with git

## Notes

This is a custom implementation created because:

1. The official `@modelcontextprotocol/server-git` npm package is not published
2. The Python version requires Python 3.10+ which may not be available

This Node.js version provides the same core Git functionality using the git CLI.

