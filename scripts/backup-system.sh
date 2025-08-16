#!/bin/bash

# FNTP Backup & Rollback System
# Automated checkpoint creation with comprehensive testing

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
BACKUP_DIR="./backups"
PROJECT_ROOT="."
DB_BACKUP_DIR="$BACKUP_DIR/database"
CODE_BACKUP_DIR="$BACKUP_DIR/code"
ROLLBACK_LOG="$BACKUP_DIR/rollback.log"
MAX_BACKUPS=10

# Create backup directories if they don't exist
mkdir -p "$DB_BACKUP_DIR"
mkdir -p "$CODE_BACKUP_DIR"

# Function to print colored messages
print_status() {
    echo -e "${BLUE}[$(date '+%H:%M:%S')]${NC} $1"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Function to create a checkpoint
create_checkpoint() {
    local checkpoint_name=$1
    local description=$2
    local timestamp=$(date +%Y%m%d_%H%M%S)
    local checkpoint_id="${timestamp}_${checkpoint_name}"
    
    print_status "Creating checkpoint: $checkpoint_id"
    print_status "Description: $description"
    
    # 1. Git commit current state
    print_status "Committing current changes..."
    git add -A
    git commit -m "Checkpoint: $checkpoint_name - $description" || true
    
    # 2. Create git tag
    git tag -a "checkpoint_$checkpoint_id" -m "$description"
    print_success "Git checkpoint created"
    
    # 3. Backup database
    print_status "Backing up database..."
    if [ -n "$DATABASE_URL" ]; then
        pg_dump "$DATABASE_URL" > "$DB_BACKUP_DIR/db_$checkpoint_id.sql"
        print_success "Database backed up"
    else
        print_warning "DATABASE_URL not set, skipping database backup"
    fi
    
    # 4. Create code archive
    print_status "Creating code archive..."
    tar -czf "$CODE_BACKUP_DIR/code_$checkpoint_id.tar.gz" \
        --exclude=node_modules \
        --exclude=.next \
        --exclude=backups \
        --exclude=.git \
        .
    print_success "Code archived"
    
    # 5. Save environment snapshot
    print_status "Saving environment snapshot..."
    cp .env "$CODE_BACKUP_DIR/env_$checkpoint_id.env" 2>/dev/null || true
    npm list --depth=0 > "$CODE_BACKUP_DIR/packages_$checkpoint_id.txt"
    
    # 6. Log checkpoint
    echo "[$timestamp] CHECKPOINT: $checkpoint_name - $description" >> "$ROLLBACK_LOG"
    echo "  Git Tag: checkpoint_$checkpoint_id" >> "$ROLLBACK_LOG"
    echo "  Database: db_$checkpoint_id.sql" >> "$ROLLBACK_LOG"
    echo "  Code: code_$checkpoint_id.tar.gz" >> "$ROLLBACK_LOG"
    echo "" >> "$ROLLBACK_LOG"
    
    # 7. Clean old backups (keep only MAX_BACKUPS)
    clean_old_backups
    
    print_success "Checkpoint created successfully: $checkpoint_id"
    return 0
}

# Function to list available checkpoints
list_checkpoints() {
    print_status "Available checkpoints:"
    echo ""
    git tag -l "checkpoint_*" | sort -r | head -20 | while read tag; do
        local date_part=$(echo $tag | cut -d'_' -f2-3)
        local name_part=$(echo $tag | cut -d'_' -f4-)
        local message=$(git tag -l --format='%(contents)' $tag | head -1)
        echo -e "${GREEN}$tag${NC}"
        echo "  Date: $(echo $date_part | sed 's/_/ /')"
        echo "  Name: $name_part"
        echo "  Description: $message"
        echo ""
    done
}

# Function to rollback to checkpoint
rollback_to_checkpoint() {
    local checkpoint_tag=$1
    
    if [ -z "$checkpoint_tag" ]; then
        print_error "Please specify a checkpoint tag"
        list_checkpoints
        return 1
    fi
    
    print_warning "Rolling back to checkpoint: $checkpoint_tag"
    print_warning "This will:"
    echo "  1. Stash current changes"
    echo "  2. Restore code to checkpoint state"
    echo "  3. Restore database (if backup exists)"
    echo "  4. Reinstall dependencies"
    echo ""
    read -p "Continue? (y/N): " confirm
    
    if [ "$confirm" != "y" ]; then
        print_status "Rollback cancelled"
        return 0
    fi
    
    # 1. Stash current changes
    print_status "Stashing current changes..."
    git stash push -m "Pre-rollback stash $(date +%Y%m%d_%H%M%S)"
    
    # 2. Checkout the checkpoint
    print_status "Restoring code to checkpoint..."
    git checkout "$checkpoint_tag"
    
    # 3. Restore database if backup exists
    local checkpoint_id=$(echo $checkpoint_tag | sed 's/checkpoint_//')
    local db_backup="$DB_BACKUP_DIR/db_$checkpoint_id.sql"
    
    if [ -f "$db_backup" ]; then
        print_status "Restoring database..."
        if [ -n "$DATABASE_URL" ]; then
            psql "$DATABASE_URL" < "$db_backup"
            print_success "Database restored"
        else
            print_warning "DATABASE_URL not set, skipping database restore"
        fi
    else
        print_warning "No database backup found for this checkpoint"
    fi
    
    # 4. Restore environment file if exists
    local env_backup="$CODE_BACKUP_DIR/env_$checkpoint_id.env"
    if [ -f "$env_backup" ]; then
        print_status "Restoring environment file..."
        cp "$env_backup" .env
        print_success "Environment restored"
    fi
    
    # 5. Reinstall dependencies
    print_status "Reinstalling dependencies..."
    npm install
    
    # 6. Run migrations
    print_status "Running database migrations..."
    npx prisma migrate deploy
    
    # 7. Log rollback
    echo "[$(date +%Y%m%d_%H%M%S)] ROLLBACK to: $checkpoint_tag" >> "$ROLLBACK_LOG"
    
    print_success "Rollback completed successfully!"
    print_status "You are now at checkpoint: $checkpoint_tag"
    
    return 0
}

# Function to clean old backups
clean_old_backups() {
    # Keep only the most recent MAX_BACKUPS database backups
    ls -t "$DB_BACKUP_DIR"/*.sql 2>/dev/null | tail -n +$((MAX_BACKUPS + 1)) | xargs rm -f 2>/dev/null || true
    
    # Keep only the most recent MAX_BACKUPS code archives
    ls -t "$CODE_BACKUP_DIR"/*.tar.gz 2>/dev/null | tail -n +$((MAX_BACKUPS + 1)) | xargs rm -f 2>/dev/null || true
}

# Function to run comprehensive tests
run_tests() {
    print_status "Running comprehensive tests..."
    
    local all_passed=true
    
    # 1. Check if server starts
    print_status "Testing server startup..."
    npm run dev &
    local server_pid=$!
    sleep 5
    
    if curl -s http://localhost:3000 > /dev/null; then
        print_success "Server starts successfully"
    else
        print_error "Server failed to start"
        all_passed=false
    fi
    
    # 2. Test database connection
    print_status "Testing database connection..."
    npx prisma db pull > /dev/null 2>&1
    if [ $? -eq 0 ]; then
        print_success "Database connection successful"
    else
        print_error "Database connection failed"
        all_passed=false
    fi
    
    # 3. Test API endpoints
    print_status "Testing API endpoints..."
    local endpoints=(
        "/api/health"
        "/api/assessment/test-question"
        "/api/auth/test-setup"
    )
    
    for endpoint in "${endpoints[@]}"; do
        if curl -s "http://localhost:3000$endpoint" | grep -q "success\|ok"; then
            print_success "Endpoint $endpoint working"
        else
            print_warning "Endpoint $endpoint might have issues"
        fi
    done
    
    # 4. Check for TypeScript errors
    print_status "Checking TypeScript..."
    if npx tsc --noEmit; then
        print_success "No TypeScript errors"
    else
        print_error "TypeScript errors found"
        all_passed=false
    fi
    
    # Kill the dev server
    kill $server_pid 2>/dev/null || true
    
    if [ "$all_passed" = true ]; then
        print_success "All tests passed!"
        return 0
    else
        print_error "Some tests failed"
        return 1
    fi
}

# Main menu
show_menu() {
    echo ""
    echo "====================================="
    echo "    FNTP Backup & Rollback System   "
    echo "====================================="
    echo ""
    echo "1) Create checkpoint"
    echo "2) List checkpoints"
    echo "3) Rollback to checkpoint"
    echo "4) Run tests"
    echo "5) Create checkpoint with tests"
    echo "6) Exit"
    echo ""
    read -p "Select option: " choice
    
    case $choice in
        1)
            read -p "Checkpoint name (no spaces): " name
            read -p "Description: " desc
            create_checkpoint "$name" "$desc"
            ;;
        2)
            list_checkpoints
            ;;
        3)
            read -p "Checkpoint tag: " tag
            rollback_to_checkpoint "$tag"
            ;;
        4)
            run_tests
            ;;
        5)
            read -p "Checkpoint name (no spaces): " name
            read -p "Description: " desc
            if run_tests; then
                create_checkpoint "$name" "$desc"
            else
                print_error "Tests failed, checkpoint not created"
            fi
            ;;
        6)
            exit 0
            ;;
        *)
            print_error "Invalid option"
            ;;
    esac
}

# If run with arguments, execute directly
if [ $# -gt 0 ]; then
    case $1 in
        create)
            create_checkpoint "$2" "$3"
            ;;
        list)
            list_checkpoints
            ;;
        rollback)
            rollback_to_checkpoint "$2"
            ;;
        test)
            run_tests
            ;;
        *)
            echo "Usage: $0 [create|list|rollback|test]"
            exit 1
            ;;
    esac
else
    # Interactive mode
    while true; do
        show_menu
    done
fi
