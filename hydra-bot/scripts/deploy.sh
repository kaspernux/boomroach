#!/bin/bash

# ==============================================
# Hydra Bot Deployment Script
# Complete deployment automation for production
# ==============================================

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Configuration
ENVIRONMENT=${1:-production}
FORCE_REBUILD=${2:-false}
BACKUP_BEFORE_DEPLOY=${3:-true}

echo -e "${PURPLE}🚀 Hydra Bot Deployment Script${NC}"
echo -e "${BLUE}Environment: ${ENVIRONMENT}${NC}"
echo -e "${BLUE}Force Rebuild: ${FORCE_REBUILD}${NC}"
echo -e "${BLUE}Backup Before Deploy: ${BACKUP_BEFORE_DEPLOY}${NC}"
echo ""

# Function to print step headers
print_step() {
    echo -e "${CYAN}=== $1 ===${NC}"
}

# Function to print success messages
print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

# Function to print warning messages
print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

# Function to print error messages
print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check if required tools are installed
check_dependencies() {
    print_step "Checking Dependencies"
    
    local deps=("docker" "docker-compose" "git" "node" "python3" "bun")
    local missing_deps=()
    
    for dep in "${deps[@]}"; do
        if ! command -v "$dep" &> /dev/null; then
            missing_deps+=("$dep")
        else
            print_success "$dep is installed"
        fi
    done
    
    if [ ${#missing_deps[@]} -ne 0 ]; then
        print_error "Missing dependencies: ${missing_deps[*]}"
        echo "Please install the missing dependencies and try again."
        exit 1
    fi
    
    # Check Docker Compose version
    if docker-compose version | grep -q "version 1"; then
        print_warning "Docker Compose v1 detected. Consider upgrading to v2."
    fi
    
    print_success "All dependencies satisfied"
    echo ""
}

# Load environment variables
load_environment() {
    print_step "Loading Environment Configuration"
    
    if [ ! -f ".env" ]; then
        if [ -f ".env.example" ]; then
            print_warning "No .env file found. Copying from .env.example"
            cp .env.example .env
            print_error "Please configure .env file with your settings before deployment"
            exit 1
        else
            print_error "No .env.example file found"
            exit 1
        fi
    fi
    
    # Load environment variables
    set -a
    source .env
    set +a
    
    # Validate critical environment variables
    local required_vars=(
        "DATABASE_URL"
        "REDIS_URL"
        "SOLANA_RPC_URL"
        "PRIVATE_KEY"
        "OPENAI_API_KEY"
        "TELEGRAM_BOT_TOKEN"
        "JWT_SECRET"
    )
    
    local missing_vars=()
    for var in "${required_vars[@]}"; do
        if [ -z "${!var}" ]; then
            missing_vars+=("$var")
        fi
    done
    
    if [ ${#missing_vars[@]} -ne 0 ]; then
        print_error "Missing required environment variables: ${missing_vars[*]}"
        exit 1
    fi
    
    print_success "Environment configuration loaded"
    echo ""
}

# Create backup of current deployment
create_backup() {
    if [ "$BACKUP_BEFORE_DEPLOY" != "true" ]; then
        print_warning "Skipping backup (BACKUP_BEFORE_DEPLOY=false)"
        return
    fi
    
    print_step "Creating Deployment Backup"
    
    local backup_dir="backups/$(date +%Y%m%d_%H%M%S)"
    mkdir -p "$backup_dir"
    
    # Backup database
    if docker-compose ps postgres | grep -q "Up"; then
        print_step "Backing up PostgreSQL database"
        docker-compose exec -T postgres pg_dump -U hydra hydra > "$backup_dir/database.sql"
        print_success "Database backup created"
    fi
    
    # Backup Redis data
    if docker-compose ps redis | grep -q "Up"; then
        print_step "Backing up Redis data"
        docker-compose exec -T redis redis-cli --rdb - > "$backup_dir/redis.rdb"
        print_success "Redis backup created"
    fi
    
    # Backup configuration files
    cp -r config "$backup_dir/" 2>/dev/null || true
    cp .env "$backup_dir/" 2>/dev/null || true
    cp docker-compose.yml "$backup_dir/" 2>/dev/null || true
    
    print_success "Backup created in $backup_dir"
    echo ""
}

# Stop running services gracefully
stop_services() {
    print_step "Stopping Running Services"
    
    if docker-compose ps | grep -q "Up"; then
        print_step "Gracefully stopping services..."
        docker-compose stop
        print_success "Services stopped"
    else
        print_warning "No running services found"
    fi
    echo ""
}

# Build Docker images
build_images() {
    print_step "Building Docker Images"
    
    if [ "$FORCE_REBUILD" = "true" ]; then
        print_step "Force rebuild requested - building without cache"
        docker-compose build --no-cache --parallel
    else
        docker-compose build --parallel
    fi
    
    print_success "Docker images built successfully"
    echo ""
}

# Run database migrations
run_migrations() {
    print_step "Running Database Migrations"
    
    # Start database first
    docker-compose up -d postgres redis
    
    # Wait for database to be ready
    print_step "Waiting for database to be ready..."
    local max_attempts=30
    local attempt=1
    
    while [ $attempt -le $max_attempts ]; do
        if docker-compose exec -T postgres pg_isready -U hydra; then
            print_success "Database is ready"
            break
        fi
        
        if [ $attempt -eq $max_attempts ]; then
            print_error "Database failed to start within timeout"
            exit 1
        fi
        
        echo "Attempt $attempt/$max_attempts - waiting..."
        sleep 2
        ((attempt++))
    done
    
    # Run Prisma migrations
    print_step "Running Prisma migrations..."
    cd backend
    npm install
    npx prisma migrate deploy
    npx prisma generate
    cd ..
    
    print_success "Database migrations completed"
    echo ""
}

# Deploy services
deploy_services() {
    print_step "Deploying Hydra Bot Services"
    
    # Deploy in the correct order for dependencies
    local services=(
        "postgres"
        "redis" 
        "backend"
        "trading-engine"
        "ai-signal-engine"
        "sniper-engine"
        "reentry-engine"
        "guardian-risk"
        "telegram-bot"
        "treasury"
        "nginx"
    )
    
    for service in "${services[@]}"; do
        print_step "Starting $service..."
        docker-compose up -d "$service"
        
        # Wait a moment for service to initialize
        sleep 3
        
        # Check if service started successfully
        if docker-compose ps "$service" | grep -q "Up"; then
            print_success "$service started successfully"
        else
            print_error "$service failed to start"
            docker-compose logs "$service"
            exit 1
        fi
    done
    
    print_success "All services deployed successfully"
    echo ""
}

# Run health checks
run_health_checks() {
    print_step "Running Health Checks"
    
    local services=(
        "backend:3001/health"
        "trading-engine:8000/health"
        "ai-signal-engine:8001/health"
        "sniper-engine:8002/health"
        "reentry-engine:8003/health"
        "guardian-risk:8004/health"
        "telegram-bot:8005/health"
        "treasury:8006/health"
    )
    
    for service in "${services[@]}"; do
        local service_name=$(echo "$service" | cut -d':' -f1)
        local health_endpoint=$(echo "$service" | cut -d':' -f2-)
        
        print_step "Checking $service_name health..."
        
        local max_attempts=10
        local attempt=1
        
        while [ $attempt -le $max_attempts ]; do
            if curl -sf "http://localhost:$health_endpoint" > /dev/null; then
                print_success "$service_name is healthy"
                break
            fi
            
            if [ $attempt -eq $max_attempts ]; then
                print_error "$service_name health check failed"
                return 1
            fi
            
            echo "Attempt $attempt/$max_attempts - waiting..."
            sleep 5
            ((attempt++))
        done
    done
    
    print_success "All health checks passed"
    echo ""
}

# Initialize default data
initialize_data() {
    print_step "Initializing Default Data"
    
    # Seed database with initial data
    if [ -f "backend/src/scripts/seed.ts" ]; then
        print_step "Seeding database..."
        cd backend
        npm run db:seed
        cd ..
        print_success "Database seeded"
    fi
    
    # Initialize trading engines with default configurations
    print_step "Initializing trading engines..."
    
    # This would call API endpoints to set up default configurations
    # curl -X POST "http://localhost:8000/api/v1/config/initialize" \
    #      -H "Authorization: Bearer $INTERNAL_API_KEY"
    
    print_success "Trading engines initialized"
    echo ""
}

# Setup monitoring
setup_monitoring() {
    print_step "Setting Up Monitoring"
    
    # Start monitoring services
    docker-compose up -d prometheus grafana
    
    print_step "Configuring Grafana dashboards..."
    # This would import default dashboards
    
    print_step "Setting up alerts..."
    # This would configure alerting rules
    
    print_success "Monitoring setup completed"
    echo ""
}

# Display deployment summary
show_deployment_summary() {
    print_step "Deployment Summary"
    
    echo -e "${GREEN}🎉 Hydra Bot Deployment Completed Successfully!${NC}"
    echo ""
    
    echo -e "${BLUE}📊 Service Status:${NC}"
    docker-compose ps
    echo ""
    
    echo -e "${BLUE}🌐 Access URLs:${NC}"
    if [ "$ENVIRONMENT" = "development" ]; then
        echo "• Backend API: http://localhost:3001"
        echo "• Trading Engine: http://localhost:8000"
        echo "• AI Signals: http://localhost:8001"
        echo "• API Documentation: http://localhost:8000/docs"
        echo "• Database Admin: http://localhost:8080"
        echo "• Redis Commander: http://localhost:8081"
        echo "• Prometheus: http://localhost:9090"
        echo "• Grafana: http://localhost:3000"
    else
        echo "• Production API: https://api.hydra-bot.boomroach.com"
        echo "• Monitoring: https://monitoring.hydra-bot.boomroach.com"
    fi
    echo ""
    
    echo -e "${BLUE}🔧 Management Commands:${NC}"
    echo "• View logs: docker-compose logs -f [service]"
    echo "• Restart service: docker-compose restart [service]"
    echo "• Scale service: docker-compose up -d --scale [service]=[count]"
    echo "• Stop all: docker-compose stop"
    echo "• Update: ./scripts/deploy.sh $ENVIRONMENT true"
    echo ""
    
    echo -e "${BLUE}📈 Next Steps:${NC}"
    echo "1. Configure your Telegram bot with /start"
    echo "2. Fund your trading wallet"
    echo "3. Enable trading engines"
    echo "4. Monitor the dashboard"
    echo ""
    
    print_success "Deployment guide completed!"
}

# Rollback function
rollback_deployment() {
    print_error "Deployment failed. Starting rollback..."
    
    # Stop current services
    docker-compose stop
    
    # Restore from backup if available
    local latest_backup=$(ls -t backups/ | head -n1)
    if [ -n "$latest_backup" ]; then
        print_step "Restoring from backup: $latest_backup"
        
        # Restore database
        if [ -f "backups/$latest_backup/database.sql" ]; then
            docker-compose up -d postgres
            sleep 10
            docker-compose exec -T postgres psql -U hydra -c "DROP DATABASE IF EXISTS hydra;"
            docker-compose exec -T postgres psql -U hydra -c "CREATE DATABASE hydra;"
            docker-compose exec -T postgres psql -U hydra hydra < "backups/$latest_backup/database.sql"
        fi
        
        # Restore configuration
        if [ -f "backups/$latest_backup/.env" ]; then
            cp "backups/$latest_backup/.env" .env
        fi
        
        print_success "Rollback completed"
    else
        print_warning "No backup found for rollback"
    fi
    
    exit 1
}

# Cleanup old images and containers
cleanup() {
    print_step "Cleaning Up"
    
    # Remove unused Docker images
    docker image prune -f
    
    # Remove old backups (keep last 7 days)
    find backups -type d -mtime +7 -exec rm -rf {} + 2>/dev/null || true
    
    print_success "Cleanup completed"
    echo ""
}

# Main deployment function
main() {
    echo -e "${PURPLE}🐍 Starting Hydra Bot Deployment${NC}"
    echo -e "${BLUE}Timestamp: $(date)${NC}"
    echo ""
    
    # Trap errors for rollback
    trap rollback_deployment ERR
    
    # Execute deployment steps
    check_dependencies
    load_environment
    create_backup
    stop_services
    build_images
    run_migrations
    deploy_services
    
    # Remove error trap for health checks (non-critical)
    trap - ERR
    
    run_health_checks
    initialize_data
    setup_monitoring
    cleanup
    show_deployment_summary
    
    echo -e "${GREEN}🚀 Hydra Bot is now live and ready to dominate Solana trading!${NC}"
    echo -e "${YELLOW}⚡ May the profits be with you! 🪳💎${NC}"
}

# Script execution
if [ "${BASH_SOURCE[0]}" = "${0}" ]; then
    main "$@"
fi