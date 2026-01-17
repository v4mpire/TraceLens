#!/bin/bash

# TraceLens Production Deployment Script
set -e

# Configuration
COMPOSE_FILE="docker/production/docker-compose.yml"
ENV_FILE=".env.production"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Logging function
log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

warn() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] WARNING: $1${NC}"
}

error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ERROR: $1${NC}"
    exit 1
}

# Check prerequisites
check_prerequisites() {
    log "Checking prerequisites..."
    
    if ! command -v docker &> /dev/null; then
        error "Docker is not installed"
    fi
    
    if ! command -v docker-compose &> /dev/null; then
        error "Docker Compose is not installed"
    fi
    
    if [ ! -f "$ENV_FILE" ]; then
        warn "Environment file $ENV_FILE not found, creating template..."
        create_env_template
    fi
    
    log "Prerequisites check passed"
}

# Create environment template
create_env_template() {
    cat > "$ENV_FILE" << EOF
# TraceLens Production Environment Variables

# Database
POSTGRES_PASSWORD=your_secure_postgres_password

# Security
API_KEY_SECRET=your_secure_api_key_secret

# External APIs
NVD_API_KEY=your_nvd_api_key

# Optional: SSL Configuration
# SSL_CERT_PATH=/path/to/cert.pem
# SSL_KEY_PATH=/path/to/key.pem
EOF
    
    warn "Please edit $ENV_FILE with your production values before continuing"
    read -p "Press Enter to continue after editing the environment file..."
}

# Build application
build_app() {
    log "Building TraceLens application..."
    
    # Build all packages
    npm run build
    
    if [ $? -ne 0 ]; then
        error "Application build failed"
    fi
    
    log "Application build completed"
}

# Deploy services
deploy() {
    log "Deploying TraceLens services..."
    
    # Load environment variables
    export $(cat "$ENV_FILE" | grep -v '^#' | xargs)
    
    # Pull latest images
    docker-compose -f "$COMPOSE_FILE" pull
    
    # Build and start services
    docker-compose -f "$COMPOSE_FILE" up -d --build
    
    if [ $? -ne 0 ]; then
        error "Deployment failed"
    fi
    
    log "Services deployed successfully"
}

# Health check
health_check() {
    log "Performing health checks..."
    
    local max_attempts=30
    local attempt=1
    
    while [ $attempt -le $max_attempts ]; do
        log "Health check attempt $attempt/$max_attempts"
        
        # Check database
        if docker-compose -f "$COMPOSE_FILE" exec -T postgres pg_isready -U tracelens > /dev/null 2>&1; then
            log "✓ Database is healthy"
        else
            warn "Database not ready yet..."
            sleep 10
            ((attempt++))
            continue
        fi
        
        # Check Redis
        if docker-compose -f "$COMPOSE_FILE" exec -T redis redis-cli ping > /dev/null 2>&1; then
            log "✓ Redis is healthy"
        else
            warn "Redis not ready yet..."
            sleep 10
            ((attempt++))
            continue
        fi
        
        # Check ingestion service
        if curl -f http://localhost:3001/api/health > /dev/null 2>&1; then
            log "✓ Ingestion service is healthy"
        else
            warn "Ingestion service not ready yet..."
            sleep 10
            ((attempt++))
            continue
        fi
        
        # Check web dashboard
        if curl -f http://localhost:3000 > /dev/null 2>&1; then
            log "✓ Web dashboard is healthy"
        else
            warn "Web dashboard not ready yet..."
            sleep 10
            ((attempt++))
            continue
        fi
        
        # Check nginx
        if curl -f http://localhost/health > /dev/null 2>&1; then
            log "✓ Nginx is healthy"
        else
            warn "Nginx not ready yet..."
            sleep 10
            ((attempt++))
            continue
        fi
        
        log "All services are healthy!"
        return 0
    done
    
    error "Health check failed after $max_attempts attempts"
}

# Show status
show_status() {
    log "TraceLens deployment status:"
    docker-compose -f "$COMPOSE_FILE" ps
    
    echo ""
    log "Service URLs:"
    echo "  Dashboard: http://localhost"
    echo "  API: http://localhost/api"
    echo "  Health: http://localhost/health"
    
    echo ""
    log "To view logs: docker-compose -f $COMPOSE_FILE logs -f [service]"
    log "To stop: docker-compose -f $COMPOSE_FILE down"
}

# Cleanup function
cleanup() {
    log "Cleaning up old containers and images..."
    docker system prune -f
    log "Cleanup completed"
}

# Main deployment function
main() {
    log "Starting TraceLens production deployment..."
    
    case "${1:-deploy}" in
        "build")
            check_prerequisites
            build_app
            ;;
        "deploy")
            check_prerequisites
            build_app
            deploy
            health_check
            show_status
            ;;
        "health")
            health_check
            ;;
        "status")
            show_status
            ;;
        "stop")
            log "Stopping TraceLens services..."
            docker-compose -f "$COMPOSE_FILE" down
            ;;
        "restart")
            log "Restarting TraceLens services..."
            docker-compose -f "$COMPOSE_FILE" restart
            health_check
            ;;
        "logs")
            docker-compose -f "$COMPOSE_FILE" logs -f "${2:-}"
            ;;
        "cleanup")
            cleanup
            ;;
        *)
            echo "Usage: $0 {build|deploy|health|status|stop|restart|logs|cleanup}"
            echo ""
            echo "Commands:"
            echo "  build    - Build application only"
            echo "  deploy   - Full deployment (default)"
            echo "  health   - Run health checks"
            echo "  status   - Show service status"
            echo "  stop     - Stop all services"
            echo "  restart  - Restart all services"
            echo "  logs     - Show service logs"
            echo "  cleanup  - Clean up old containers"
            exit 1
            ;;
    esac
}

# Run main function
main "$@"
