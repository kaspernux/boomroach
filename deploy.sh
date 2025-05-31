#!/bin/bash

# BoomRoach 2025 - Complete System Deployment Script
# This script deploys both frontend and backend components

set -e

echo "🪳 BoomRoach 2025 - Ultimate Deployment Script 🚀"
echo "=================================================="

# Configuration
FRONTEND_DIR="frontend"
BACKEND_DIR="backend"
DOCKER_COMPOSE_FILE="docker-compose.yml"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if required tools are installed
check_requirements() {
    log_info "Checking system requirements..."

    command -v node >/dev/null 2>&1 || { log_error "Node.js is required but not installed. Aborting."; exit 1; }
    command -v bun >/dev/null 2>&1 || { log_error "Bun is required but not installed. Aborting."; exit 1; }
    command -v docker >/dev/null 2>&1 || { log_error "Docker is required but not installed. Aborting."; exit 1; }
    command -v docker-compose >/dev/null 2>&1 || { log_error "Docker Compose is required but not installed. Aborting."; exit 1; }

    log_success "All requirements satisfied"
}

# Setup environment files
setup_environment() {
    log_info "Setting up environment files..."

    # Frontend environment
    if [ ! -f "${FRONTEND_DIR}/.env.local" ]; then
        if [ -f "${FRONTEND_DIR}/.env.example" ]; then
            cp "${FRONTEND_DIR}/.env.example" "${FRONTEND_DIR}/.env.local"
            log_success "Frontend environment file created"
        else
            log_warning "Frontend .env.example not found"
        fi
    fi

    # Backend environment
    if [ ! -f "${BACKEND_DIR}/.env" ]; then
        if [ -f "${BACKEND_DIR}/.env.example" ]; then
            cp "${BACKEND_DIR}/.env.example" "${BACKEND_DIR}/.env"
            log_success "Backend environment file created"
        else
            log_warning "Backend .env.example not found"
        fi
    fi
}

# Build frontend
build_frontend() {
    log_info "Building frontend application..."

    cd "${FRONTEND_DIR}"

    # Install dependencies
    log_info "Installing frontend dependencies..."
    bun install

    # Build the application
    log_info "Building Next.js application..."
    bun run build

    # Run linter
    log_info "Running linter..."
    bun run lint --fix || log_warning "Linter warnings found (continuing...)"

    cd ..
    log_success "Frontend build completed"
}

# Setup backend
setup_backend() {
    log_info "Setting up backend services..."

    cd "${BACKEND_DIR}"

    # Install dependencies
    log_info "Installing backend dependencies..."
    bun install

    # Generate Prisma client
    if [ -f "prisma/schema.prisma" ]; then
        log_info "Generating Prisma client..."
        bun run db:generate
    fi

    # Build TypeScript
    log_info "Building TypeScript..."
    bun run build

    cd ..
    log_success "Backend setup completed"
}

# Start services with Docker
start_docker_services() {
    log_info "Starting Docker services..."

    # Check if docker-compose.yml exists
    if [ -f "${BACKEND_DIR}/${DOCKER_COMPOSE_FILE}" ]; then
        cd "${BACKEND_DIR}"

        # Pull latest images
        log_info "Pulling Docker images..."
        docker-compose pull

        # Start services
        log_info "Starting services..."
        docker-compose up -d

        # Wait for services to be ready
        log_info "Waiting for services to be ready..."
        sleep 30

        # Check service health
        log_info "Checking service health..."
        docker-compose ps

        cd ..
        log_success "Docker services started"
    else
        log_warning "Docker Compose file not found, skipping Docker services"
    fi
}

# Setup database
setup_database() {
    log_info "Setting up database..."

    cd "${BACKEND_DIR}"

    # Run database migrations
    if [ -f "prisma/schema.prisma" ]; then
        log_info "Running database migrations..."
        bun run db:push || log_warning "Database migration failed (continuing...)"

        # Seed database (if seed script exists)
        if grep -q "db:seed" package.json; then
            log_info "Seeding database..."
            bun run db:seed || log_warning "Database seeding failed (continuing...)"
        fi
    fi

    cd ..
    log_success "Database setup completed"
}

# Start development servers
start_dev_servers() {
    log_info "Starting development servers..."

    # Start backend in background
    if [ -d "${BACKEND_DIR}" ]; then
        cd "${BACKEND_DIR}"
        log_info "Starting backend server..."
        bun run dev &
        BACKEND_PID=$!
        cd ..

        # Wait for backend to start
        sleep 10
    fi

    # Start frontend
    if [ -d "${FRONTEND_DIR}" ]; then
        cd "${FRONTEND_DIR}"
        log_info "Starting frontend server..."
        bun run dev &
        FRONTEND_PID=$!
        cd ..

        # Wait for frontend to start
        sleep 5
    fi

    log_success "Development servers started"
    echo ""
    echo "🌐 Frontend: http://localhost:3000"
    echo "🔗 Backend API: http://localhost:3001"
    echo "📚 API Docs: http://localhost:3001/api-docs"
    echo "🏥 Health Check: http://localhost:3001/health"
    echo ""
}

# Production build and deployment
production_deploy() {
    log_info "Starting production deployment..."

    # Build frontend for production
    build_frontend

    # Setup backend for production
    setup_backend

    # Create production docker-compose if it doesn't exist
    if [ ! -f "docker-compose.prod.yml" ]; then
        log_info "Creating production Docker Compose configuration..."
        cat > docker-compose.prod.yml << EOF
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    container_name: boomroach_postgres_prod
    restart: unless-stopped
    environment:
      POSTGRES_DB: boomroach_prod
      POSTGRES_USER: boomroach
      POSTGRES_PASSWORD: \${POSTGRES_PASSWORD}
    volumes:
      - postgres_data_prod:/var/lib/postgresql/data
    networks:
      - boomroach_network

  redis:
    image: redis:7-alpine
    container_name: boomroach_redis_prod
    restart: unless-stopped
    volumes:
      - redis_data_prod:/data
    networks:
      - boomroach_network

  api:
    build:
      context: ./backend
      dockerfile: Dockerfile
      target: production
    container_name: boomroach_api_prod
    restart: unless-stopped
    environment:
      NODE_ENV: production
      DATABASE_URL: postgresql://boomroach:\${POSTGRES_PASSWORD}@postgres:5432/boomroach_prod?schema=public
      REDIS_URL: redis://redis:6379
      JWT_SECRET: \${JWT_SECRET}
    depends_on:
      - postgres
      - redis
    networks:
      - boomroach_network
    ports:
      - "3001:3001"

  frontend:
    build:
      context: ./boomroach
      dockerfile: Dockerfile
    container_name: boomroach_frontend_prod
    restart: unless-stopped
    environment:
      NODE_ENV: production
      NEXT_PUBLIC_API_URL: http://localhost:3001
    ports:
      - "3000:3000"
    depends_on:
      - api
    networks:
      - boomroach_network

volumes:
  postgres_data_prod:
  redis_data_prod:

networks:
  boomroach_network:
    driver: bridge
EOF
        log_success "Production Docker Compose created"
    fi

    # Deploy with production configuration
    log_info "Deploying with production configuration..."
    docker-compose -f docker-compose.prod.yml up -d --build

    log_success "Production deployment completed"
}

# Cleanup function
cleanup() {
    log_info "Cleaning up..."

    # Stop background processes
    if [ ! -z "$FRONTEND_PID" ]; then
        kill $FRONTEND_PID 2>/dev/null || true
    fi
    if [ ! -z "$BACKEND_PID" ]; then
        kill $BACKEND_PID 2>/dev/null || true
    fi

    log_success "Cleanup completed"
}

# Trap to cleanup on script exit
trap cleanup EXIT

# Main deployment flow
main() {
    echo "Select deployment mode:"
    echo "1) Development (local servers)"
    echo "2) Production (Docker containers)"
    echo "3) Full setup (install + development)"
    echo "4) Docker services only"
    echo "5) Frontend only"
    echo "6) Backend only"
    read -p "Enter your choice (1-6): " choice

    case $choice in
        1)
            log_info "Starting development deployment..."
            check_requirements
            setup_environment
            start_docker_services
            setup_database
            start_dev_servers
            ;;
        2)
            log_info "Starting production deployment..."
            check_requirements
            setup_environment
            production_deploy
            ;;
        3)
            log_info "Starting full setup..."
            check_requirements
            setup_environment
            build_frontend
            setup_backend
            start_docker_services
            setup_database
            start_dev_servers
            ;;
        4)
            log_info "Starting Docker services only..."
            check_requirements
            start_docker_services
            ;;
        5)
            log_info "Building frontend only..."
            build_frontend
            cd "${FRONTEND_DIR}"
            bun run dev
            ;;
        6)
            log_info "Starting backend only..."
            setup_backend
            start_docker_services
            setup_database
            cd "${BACKEND_DIR}"
            bun run dev
            ;;
        *)
            log_error "Invalid choice. Please run the script again."
            exit 1
            ;;
    esac

    if [ "$choice" != "2" ]; then
        echo ""
        echo "🎉 BoomRoach 2025 is running!"
        echo "📝 To stop the servers, press Ctrl+C"
        echo ""

        # Keep script running for development mode
        while true; do
            sleep 1
        done
    fi
}

# Run main function
main "$@"
