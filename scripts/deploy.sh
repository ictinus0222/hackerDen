#!/bin/bash

# Production Deployment Script for hackerDen
set -e

echo "🚀 Starting production deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if required environment variables are set
check_env_vars() {
    print_status "Checking environment variables..."
    
    required_vars=("MONGODB_URI" "JWT_SECRET" "SESSION_SECRET")
    missing_vars=()
    
    for var in "${required_vars[@]}"; do
        if [ -z "${!var}" ]; then
            missing_vars+=("$var")
        fi
    done
    
    if [ ${#missing_vars[@]} -ne 0 ]; then
        print_error "Missing required environment variables:"
        printf '%s\n' "${missing_vars[@]}"
        exit 1
    fi
    
    print_status "Environment variables check passed ✓"
}

# Clean previous builds
clean_builds() {
    print_status "Cleaning previous builds..."
    npm run clean
    print_status "Clean completed ✓"
}

# Install dependencies
install_deps() {
    print_status "Installing dependencies..."
    npm run install:all
    print_status "Dependencies installed ✓"
}

# Run tests
run_tests() {
    print_status "Running tests..."
    
    # Run backend tests
    print_status "Running backend tests..."
    cd backend && npm run test:run
    cd ..
    
    # Run frontend tests
    print_status "Running frontend tests..."
    cd frontend && npm run test:run
    cd ..
    
    print_status "All tests passed ✓"
}

# Build for production
build_production() {
    print_status "Building for production..."
    npm run build:production
    print_status "Production build completed ✓"
}

# Test production build
test_production() {
    print_status "Testing production build..."
    
    # Start the server in background
    cd backend && npm run start:production &
    SERVER_PID=$!
    
    # Wait for server to start
    sleep 5
    
    # Test health endpoint
    if curl -f http://localhost:3000/health > /dev/null 2>&1; then
        print_status "Health check passed ✓"
    else
        print_error "Health check failed ✗"
        kill $SERVER_PID
        exit 1
    fi
    
    # Kill the test server
    kill $SERVER_PID
    
    print_status "Production build test completed ✓"
}

# Deploy to Railway (Backend)
deploy_backend() {
    print_status "Deploying backend to Railway..."
    
    if command -v railway &> /dev/null; then
        railway up
        print_status "Backend deployed to Railway ✓"
    else
        print_warning "Railway CLI not found. Please install it and run 'railway up' manually"
        print_status "Install Railway CLI: npm install -g @railway/cli"
    fi
}

# Deploy to Vercel (Frontend)
deploy_frontend() {
    print_status "Deploying frontend to Vercel..."
    
    cd frontend
    
    if command -v vercel &> /dev/null; then
        vercel --prod
        print_status "Frontend deployed to Vercel ✓"
    else
        print_warning "Vercel CLI not found. Please install it and run 'vercel --prod' manually"
        print_status "Install Vercel CLI: npm install -g vercel"
    fi
    
    cd ..
}

# Run E2E tests against production
run_e2e_tests() {
    print_status "Running E2E tests against production..."
    
    # Update E2E test configuration for production URLs
    export PLAYWRIGHT_BASE_URL="https://hackathon-management-tool.vercel.app"
    
    npm run test:e2e
    print_status "E2E tests completed ✓"
}

# Main deployment flow
main() {
    print_status "Starting hackerDen production deployment"
    
    # Pre-deployment checks
    check_env_vars
    clean_builds
    install_deps
    
    # Build and test
    run_tests
    build_production
    test_production
    
    # Deploy
    deploy_backend
    deploy_frontend
    
    # Post-deployment verification
    print_status "Waiting for deployments to be ready..."
    sleep 30
    
    run_e2e_tests
    
    print_status "🎉 Deployment completed successfully!"
    print_status "Frontend: https://hackathon-management-tool.vercel.app"
    print_status "Backend: https://hackathon-management-backend.railway.app"
    print_status "Health Check: https://hackathon-management-backend.railway.app/health"
}

# Run main function
main "$@"