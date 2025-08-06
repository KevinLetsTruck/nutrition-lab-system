#!/bin/bash

# Railway Environment Push Script
# This script safely pushes environment variables from .env.railway to Railway
# with progress tracking, error handling, and resume capability

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m' # No Color

# Files
ENV_FILE=".env.railway"
PROGRESS_FILE=".railway-push-progress"
ERROR_LOG=".railway-push-errors.log"

# Counters
TOTAL_VARS=0
PUSHED_VARS=0
FAILED_VARS=0

# Function to print colored output
print_color() {
    local color=$1
    shift
    echo -e "${color}$*${NC}"
}

# Function to print error and exit
error_exit() {
    print_color "$RED" "❌ Error: $1"
    exit 1
}

# Function to print warning
warning() {
    print_color "$YELLOW" "⚠️  Warning: $1"
}

# Function to print success
success() {
    print_color "$GREEN" "✅ $1"
}

# Function to print info
info() {
    print_color "$BLUE" "ℹ️  $1"
}

# Function to check if Railway CLI is installed
check_railway_cli() {
    if ! command -v railway &> /dev/null; then
        error_exit "Railway CLI is not installed. Please install it first: npm install -g @railway/cli"
    fi
}

# Function to check if logged in to Railway
check_railway_login() {
    if ! railway whoami &> /dev/null; then
        error_exit "Not logged in to Railway. Please run: railway login"
    fi
}

# Function to check if project is linked
check_railway_link() {
    if ! railway status &> /dev/null; then
        error_exit "No Railway project linked. Please run: railway link"
    fi
}

# Function to parse .env.railway file and count variables
parse_env_file() {
    local vars=()
    local current_key=""
    local current_value=""
    local in_multiline=false
    
    while IFS= read -r line || [ -n "$line" ]; do
        # Skip empty lines and comments
        [[ -z "$line" || "$line" =~ ^[[:space:]]*# ]] && continue
        
        # Check if this is a key=value line
        if [[ "$line" =~ ^([A-Za-z_][A-Za-z0-9_]*)[[:space:]]*=[[:space:]]*(.*)$ ]]; then
            # Save previous multiline if exists
            if [[ -n "$current_key" ]]; then
                vars+=("$current_key")
            fi
            
            current_key="${BASH_REMATCH[1]}"
            current_value="${BASH_REMATCH[2]}"
            
            # Check if value starts with quotes and doesn't end with them (multiline)
            if [[ "$current_value" =~ ^[\'\"](.*) ]] && ! [[ "$current_value" =~ ['\"]$ ]]; then
                in_multiline=true
            else
                in_multiline=false
                vars+=("$current_key")
                current_key=""
            fi
        elif [[ "$in_multiline" == true ]]; then
            # Continue multiline value
            if [[ "$line" =~ ['\"]$ ]]; then
                in_multiline=false
                vars+=("$current_key")
                current_key=""
            fi
        fi
    done < "$ENV_FILE"
    
    # Handle last variable if exists
    if [[ -n "$current_key" ]]; then
        vars+=("$current_key")
    fi
    
    printf '%s\n' "${vars[@]}"
}

# Function to get value for a key from .env.railway
get_env_value() {
    local key=$1
    local value=""
    local found=false
    local in_multiline=false
    local current_key=""
    
    while IFS= read -r line || [ -n "$line" ]; do
        # Skip empty lines and comments
        [[ -z "$line" || "$line" =~ ^[[:space:]]*# ]] && continue
        
        # Check if this is a key=value line
        if [[ "$line" =~ ^([A-Za-z_][A-Za-z0-9_]*)[[:space:]]*=[[:space:]]*(.*)$ ]]; then
            current_key="${BASH_REMATCH[1]}"
            local line_value="${BASH_REMATCH[2]}"
            
            if [[ "$current_key" == "$key" ]]; then
                found=true
                value="$line_value"
                
                # Check if it's a complete single-line value
                if [[ "$line_value" =~ ^[\'\"](.*)[\'\"]$ ]]; then
                    # Complete quoted value
                    value="${BASH_REMATCH[1]}"
                    break
                elif [[ "$line_value" =~ ^[\'\"](.*) ]]; then
                    # Start of multiline value
                    value="${BASH_REMATCH[1]}"
                    in_multiline=true
                else
                    # Unquoted value
                    break
                fi
            else
                in_multiline=false
            fi
        elif [[ "$in_multiline" == true && "$found" == true ]]; then
            # Continue multiline value
            if [[ "$line" =~ (.*)[\'\"]$ ]]; then
                # End of multiline value
                value+="\n${BASH_REMATCH[1]}"
                break
            else
                # Middle of multiline value
                value+="\n$line"
            fi
        fi
    done < "$ENV_FILE"
    
    echo "$value"
}

# Function to check if variable was already pushed (for resume capability)
was_pushed() {
    local key=$1
    [[ -f "$PROGRESS_FILE" ]] && grep -q "^$key$" "$PROGRESS_FILE"
}

# Function to mark variable as pushed
mark_pushed() {
    local key=$1
    echo "$key" >> "$PROGRESS_FILE"
}

# Function to push a single variable to Railway
push_variable() {
    local key=$1
    local value=$2
    local attempt=1
    local max_attempts=3
    
    while [[ $attempt -le $max_attempts ]]; do
        if railway variables --set "$key=$value" &> /dev/null; then
            return 0
        else
            if [[ $attempt -lt $max_attempts ]]; then
                warning "Failed to set $key (attempt $attempt/$max_attempts), retrying..."
                sleep 2
            fi
            ((attempt++))
        fi
    done
    
    # Log error after all attempts failed
    echo "$(date '+%Y-%m-%d %H:%M:%S') - Failed to set $key after $max_attempts attempts" >> "$ERROR_LOG"
    return 1
}

# Main execution
main() {
    print_color "$BOLD" "🚂 Railway Environment Push Script"
    print_color "$BOLD" "=================================="
    echo
    
    # Preliminary checks
    info "Performing preliminary checks..."
    check_railway_cli
    check_railway_login
    check_railway_link
    
    # Check if .env.railway exists
    if [[ ! -f "$ENV_FILE" ]]; then
        error_exit "$ENV_FILE not found. Please run 'npm run railway:prepare' first."
    fi
    
    # Parse variables
    info "Parsing $ENV_FILE..."
    VARIABLES=()
    while IFS= read -r var; do
        VARIABLES+=("$var")
    done < <(parse_env_file)
    TOTAL_VARS=${#VARIABLES[@]}
    
    if [[ $TOTAL_VARS -eq 0 ]]; then
        error_exit "No variables found in $ENV_FILE"
    fi
    
    # Show summary
    echo
    print_color "$CYAN" "📋 VARIABLES TO BE PUSHED ($TOTAL_VARS total):"
    print_color "$CYAN" "=========================================="
    for var in "${VARIABLES[@]}"; do
        if was_pushed "$var"; then
            echo "  ✓ $var (already pushed)"
        else
            echo "  • $var"
        fi
    done
    echo
    
    # Check for resume
    if [[ -f "$PROGRESS_FILE" ]]; then
        local already_pushed=$(wc -l < "$PROGRESS_FILE" | tr -d ' ')
        if [[ $already_pushed -gt 0 ]]; then
            warning "Found previous progress file. $already_pushed variables were already pushed."
            echo
            read -p "Do you want to resume from where you left off? (y/n): " -n 1 -r
            echo
            if [[ ! $REPLY =~ ^[Yy]$ ]]; then
                read -p "Start fresh? This will re-push all variables. (y/n): " -n 1 -r
                echo
                if [[ $REPLY =~ ^[Yy]$ ]]; then
                    rm -f "$PROGRESS_FILE"
                    info "Starting fresh..."
                else
                    info "Aborting..."
                    exit 0
                fi
            else
                info "Resuming from previous progress..."
            fi
        fi
    fi
    
    # Ask for confirmation
    if [[ ! -f "$PROGRESS_FILE" ]]; then
        echo
        read -p "$(print_color "$YELLOW" "Are you sure you want to push these $TOTAL_VARS variables to Railway? (y/n): ")" -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            info "Operation cancelled."
            exit 0
        fi
    fi
    
    # Push variables
    echo
    print_color "$CYAN" "🚀 PUSHING VARIABLES TO RAILWAY"
    print_color "$CYAN" "==============================="
    echo
    
    # Clear error log for new run
    [[ -f "$ERROR_LOG" ]] && > "$ERROR_LOG"
    
    for var in "${VARIABLES[@]}"; do
        # Skip if already pushed
        if was_pushed "$var"; then
            ((PUSHED_VARS++))
            continue
        fi
        
        # Get value
        value=$(get_env_value "$var")
        
        # Show progress
        printf "Setting %-30s ... " "$var"
        
        # Push to Railway
        if push_variable "$var" "$value"; then
            success "done"
            mark_pushed "$var"
            ((PUSHED_VARS++))
        else
            print_color "$RED" "failed"
            ((FAILED_VARS++))
        fi
        
        # Show overall progress
        local progress=$((PUSHED_VARS * 100 / TOTAL_VARS))
        echo "Progress: [$PUSHED_VARS/$TOTAL_VARS] ${progress}%"
        echo
    done
    
    # Final summary
    echo
    print_color "$BOLD" "📊 SUMMARY"
    print_color "$BOLD" "=========="
    success "Successfully pushed: $PUSHED_VARS variables"
    if [[ $FAILED_VARS -gt 0 ]]; then
        print_color "$RED" "Failed: $FAILED_VARS variables"
        warning "Check $ERROR_LOG for details"
        echo
        warning "You can run this script again to retry failed variables"
    else
        success "All variables pushed successfully! 🎉"
        # Clean up progress file on complete success
        rm -f "$PROGRESS_FILE"
    fi
    
    # Show next steps
    echo
    print_color "$CYAN" "📝 NEXT STEPS:"
    print_color "$CYAN" "=============="
    echo "1. Verify variables: railway variables"
    echo "2. Deploy your app: railway up"
    echo
    warning "Don't forget to delete sensitive files:"
    echo "   rm .env.railway .railway-command.sh"
    echo
}

# Run main function
main "$@"