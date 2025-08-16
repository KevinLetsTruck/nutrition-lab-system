# MCP Servers for FNTP Nutrition System

## Overview

These custom MCP (Model Context Protocol) servers give Claude direct access to development tools, eliminating the need for Cursor or manual terminal operations.

## Servers Included

### 1. Terminal Server (`terminal-server/`)
Provides direct terminal/shell access for Claude to:
- Run any shell command
- Execute npm scripts
- Start/stop development servers
- Run Prisma commands
- Execute git operations
- Install dependencies
- Manage processes

**Available Tools:**
- `run_command`: Execute any shell command
- `npm_run`: Run npm scripts from package.json
- `start_dev_server`: Start Next.js dev server
- `stop_dev_server`: Stop the dev server
- `prisma_command`: Run Prisma CLI commands
- `git_command`: Execute git operations
- `install_dependencies`: Install npm packages
- `check_process`: Check if a process is running

### 2. Database Server (`database-server/`)
Provides direct PostgreSQL database access for Claude to:
- Execute SQL queries
- Manage database schema
- Run transactions
- Backup tables
- Check migrations

**Available Tools:**
- `query`: Execute SQL queries
- `list_tables`: List all database tables
- `describe_table`: Get table structure
- `list_migrations`: Show Prisma migrations
- `check_connection`: Verify database connection
- `execute_transaction`: Run multiple queries in a transaction
- `backup_table`: Create table backups

## Setup Instructions

### 1. Install Dependencies
```bash
cd /Users/kr/fntp-nutrition-system/mcp-servers
chmod +x setup.sh
./setup.sh
```

### 2. Configure Environment
Make sure your main project `.env` file contains:
```env
DATABASE_URL=postgresql://user:password@localhost:5432/dbname
```

### 3. Restart Claude Desktop
The MCP servers are already configured in:
`~/Library/Application Support/Claude/claude_desktop_config.json`

Simply restart Claude Desktop to load the new servers.

## Usage Examples

### Terminal Server
```javascript
// Claude can now run commands directly:
await terminal.run_command({ command: "ls -la" })
await terminal.npm_run({ script: "dev" })
await terminal.prisma_command({ command: "migrate dev" })
```

### Database Server
```javascript
// Claude can query the database directly:
await database.query({ sql: "SELECT * FROM users LIMIT 10" })
await database.list_tables({ schema: "public" })
await database.describe_table({ table: "Assessment" })
```

## Architecture

```
fntp-nutrition-system/
├── mcp-servers/
│   ├── terminal-server/
│   │   ├── package.json
│   │   └── index.js
│   ├── database-server/
│   │   ├── package.json
│   │   └── index.js
│   └── setup.sh
```

## Security Notes

⚠️ **Important Security Considerations:**

1. **Terminal Server**: Has full shell access to your system. Only run in trusted environments.
2. **Database Server**: Has full database access. Ensure DATABASE_URL uses appropriate credentials.
3. **Both servers**: Should only be used in development environments.

## Troubleshooting

### Server Not Connecting
1. Check Claude Desktop logs: `~/Library/Logs/Claude/`
2. Verify dependencies are installed: `npm ls` in each server directory
3. Ensure Claude Desktop is restarted after configuration changes

### Database Connection Issues
1. Verify DATABASE_URL in `.env` file
2. Check PostgreSQL is running: `pg_ctl status`
3. Test connection: The database server will log connection status on startup

### Terminal Commands Not Working
1. Check working directory is set correctly
2. Verify command exists in PATH
3. Check process permissions

## Future Enhancements

Planned additional servers:
- **Test Server**: Run tests, collect coverage
- **Build Server**: Handle builds and deployments
- **Docker Server**: Manage containers
- **Email Server**: Send test emails
- **File Watch Server**: Monitor file changes

## Contributing

To add a new MCP server:
1. Create a new directory in `mcp-servers/`
2. Add package.json and index.js
3. Follow the MCP SDK patterns
4. Update claude_desktop_config.json
5. Document in this README

## License

MIT

---

**Built to eliminate Cursor and give Claude full development autonomy!** 🚀
