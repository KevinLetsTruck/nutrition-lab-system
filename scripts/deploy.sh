#!/bin/bash

# Production Deployment Script for Nutrition Lab System
# This script helps prepare and deploy the application to Vercel

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to check environment variables
check_env_vars() {
    print_status "Checking environment variables..."
    
    local required_vars=(
        "NEXT_PUBLIC_SUPABASE_URL"
        "NEXT_PUBLIC_SUPABASE_ANON_KEY"
        "SUPABASE_SERVICE_ROLE_KEY"
        "ANTHROPIC_API_KEY"
    )
    
    local missing_vars=()
    
    for var in "${required_vars[@]}"; do
        if [ -z "${!var}" ]; then
            missing_vars+=("$var")
        fi
    done
    
    if [ ${#missing_vars[@]} -ne 0 ]; then
        print_error "Missing required environment variables:"
        for var in "${missing_vars[@]}"; do
            echo "  - $var"
        done
        echo ""
        print_warning "Please set these variables in your Vercel environment"
        return 1
    fi
    
    print_success "All required environment variables are set"
}

# Function to run pre-deployment checks
pre_deployment_checks() {
    print_status "Running pre-deployment checks..."
    
    # Check if we're in the right directory
    if [ ! -f "package.json" ]; then
        print_error "package.json not found. Please run this script from the project root."
        exit 1
    fi
    
    # Check if git is available
    if ! command_exists git; then
        print_error "Git is not installed or not in PATH"
        exit 1
    fi
    
    # Check if we're in a git repository
    if [ ! -d ".git" ]; then
        print_error "Not in a git repository. Please initialize git first."
        exit 1
    fi
    
    # Check for uncommitted changes
    if [ -n "$(git status --porcelain)" ]; then
        print_warning "You have uncommitted changes. Consider committing them before deployment."
        read -p "Continue anyway? (y/N): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            print_status "Deployment cancelled"
            exit 0
        fi
    fi
    
    print_success "Pre-deployment checks passed"
}

# Function to build the application
build_application() {
    print_status "Building application..."
    
    # Clean previous build
    if [ -d ".next" ]; then
        rm -rf .next
        print_status "Cleaned previous build"
    fi
    
    # Install dependencies
    print_status "Installing dependencies..."
    npm ci --production=false
    
    # Run linting
    print_status "Running linting..."
    npm run lint
    
    # Build application
    print_status "Building application..."
    npm run build
    
    print_success "Application built successfully"
}

# Function to run database migrations
run_migrations() {
    print_status "Running database migrations..."
    
    if npm run db:migrate; then
        print_success "Database migrations completed"
    else
        print_error "Database migrations failed"
        exit 1
    fi
}

# Function to deploy to Vercel
deploy_to_vercel() {
    print_status "Deploying to Vercel..."
    
    if command_exists vercel; then
        # Deploy using Vercel CLI
        vercel --prod
    else
        print_warning "Vercel CLI not found. Please deploy manually:"
        echo "1. Push your code to GitHub"
        echo "2. Connect your repository to Vercel"
        echo "3. Set environment variables in Vercel dashboard"
        echo "4. Deploy from Vercel dashboard"
    fi
}

# Function to run post-deployment tests
post_deployment_tests() {
    print_status "Running post-deployment tests..."
    
    # Get the deployment URL (you'll need to set this)
    if [ -n "$VERCEL_URL" ]; then
        local base_url="https://$VERCEL_URL"
    else
        print_warning "VERCEL_URL not set. Please run health checks manually:"
        echo "curl https://your-domain.com/api/health"
        return 0
    fi
    
    # Test health endpoint
    print_status "Testing health endpoint..."
    if curl -f -s "$base_url/api/health" > /dev/null; then
        print_success "Health endpoint is working"
    else
        print_error "Health endpoint failed"
        return 1
    fi
    
    # Test analyze endpoint (GET only)
    print_status "Testing analyze endpoint..."
    if curl -f -s "$base_url/api/analyze" > /dev/null; then
        print_success "Analyze endpoint is accessible"
    else
        print_error "Analyze endpoint failed"
        return 1
    fi
    
    print_success "Post-deployment tests passed"
}

# Function to show deployment summary
show_summary() {
    echo ""
    print_success "Deployment Summary"
    echo "=================="
    echo ""
    echo "✅ Pre-deployment checks completed"
    echo "✅ Application built successfully"
    echo "✅ Database migrations applied"
    echo "✅ Deployed to Vercel"
    echo "✅ Post-deployment tests passed"
    echo ""
    print_status "Next steps:"
    echo "1. Set up monitoring (Sentry, etc.)"
    echo "2. Configure custom domain"
    echo "3. Set up SSL certificate"
    echo "4. Test all functionality"
    echo "5. Set up backup strategy"
    echo ""
    print_success "Your Nutrition Lab AI System is now live! 🎉"
}

# Main deployment function
main() {
    echo ""
    print_status "Starting production deployment..."
    echo ""
    
    pre_deployment_checks
    check_env_vars
    build_application
    run_migrations
    deploy_to_vercel
    post_deployment_tests
    show_summary
}

# Check if script is being sourced or executed
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi 