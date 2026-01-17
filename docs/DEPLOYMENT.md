# TraceLens Production Deployment Guide

This guide covers deploying TraceLens to production using Docker Compose and Coolify.

## Prerequisites

### System Requirements
- **CPU**: 2+ cores
- **Memory**: 4GB+ RAM
- **Storage**: 20GB+ available space
- **OS**: Linux (Ubuntu 20.04+ recommended)

### Software Requirements
- Docker 20.10+
- Docker Compose 2.0+
- Git
- curl (for health checks)

## Quick Start

### 1. Clone Repository
```bash
git clone https://github.com/username/tracelens.git
cd tracelens
```

### 2. Configure Environment
```bash
# Copy environment template
cp .env.production.template .env.production

# Edit with your values
nano .env.production
```

### 3. Deploy
```bash
# Make deployment script executable
chmod +x scripts/deploy.sh

# Deploy all services
./scripts/deploy.sh deploy
```

### 4. Verify Deployment
```bash
# Check service status
./scripts/deploy.sh status

# Run health checks
./scripts/deploy.sh health
```

## Environment Configuration

### Required Variables
```bash
# Database password (generate secure password)
POSTGRES_PASSWORD=your_secure_postgres_password

# API key secret (generate secure secret)
API_KEY_SECRET=your_secure_api_key_secret
```

### Optional Variables
```bash
# External API keys for enhanced functionality
NVD_API_KEY=your_nvd_api_key
OSV_API_KEY=your_osv_api_key

# Custom domain configuration
NEXT_PUBLIC_API_URL=https://tracelens.yourdomain.com/api
```

## Service Architecture

### Core Services
- **PostgreSQL**: Primary database (port 5432)
- **Redis**: Caching and session storage (port 6379)
- **Ingestion**: Event and trace ingestion API (port 3001)
- **Analysis**: Causal graph analysis engine (port 3003)
- **Security**: CVE scanning and risk assessment (port 3004)
- **Web**: Next.js dashboard (port 3000)
- **Nginx**: Reverse proxy and load balancer (port 80/443)

### Data Flow
```
Browser SDK → Nginx → Ingestion → PostgreSQL
                ↓
Server SDK → Analysis Engine → Dashboard
                ↓
Security Scanner → Risk Assessment
```

## Deployment Options

### Option 1: Docker Compose (Manual)
```bash
# Build and deploy
docker-compose -f docker/production/docker-compose.yml up -d

# View logs
docker-compose -f docker/production/docker-compose.yml logs -f

# Stop services
docker-compose -f docker/production/docker-compose.yml down
```

### Option 2: Deployment Script (Recommended)
```bash
# Full deployment with health checks
./scripts/deploy.sh deploy

# Available commands
./scripts/deploy.sh {build|deploy|health|status|stop|restart|logs|cleanup}
```

### Option 3: Coolify (VPS)
1. Install Coolify on your VPS
2. Import TraceLens repository
3. Configure environment variables
4. Deploy using `coolify.json` configuration

## SSL/TLS Configuration

### Let's Encrypt (Recommended)
```bash
# Install certbot
sudo apt install certbot

# Generate certificate
sudo certbot certonly --standalone -d tracelens.yourdomain.com

# Update nginx configuration
# Uncomment HTTPS server block in docker/production/nginx.conf
```

### Custom Certificates
```bash
# Place certificates in docker/production/ssl/
mkdir -p docker/production/ssl
cp your-cert.pem docker/production/ssl/cert.pem
cp your-key.pem docker/production/ssl/key.pem
```

## Monitoring & Maintenance

### Health Monitoring
```bash
# Automated health checks
./scripts/deploy.sh health

# Manual service checks
curl http://localhost/health
curl http://localhost:3001/api/health
```

### Log Management
```bash
# View all logs
./scripts/deploy.sh logs

# View specific service logs
./scripts/deploy.sh logs ingestion
./scripts/deploy.sh logs web
```

### Database Backup
```bash
# Manual backup
docker-compose -f docker/production/docker-compose.yml exec postgres \
  pg_dump -U tracelens tracelens > backup_$(date +%Y%m%d).sql

# Automated backup (add to crontab)
0 2 * * * /path/to/backup-script.sh
```

### Performance Tuning
```bash
# Monitor resource usage
docker stats

# Scale services (if using Docker Swarm)
docker service scale tracelens_ingestion=3
```

## Security Considerations

### Network Security
- Use firewall to restrict access to internal ports
- Enable HTTPS with valid SSL certificates
- Configure rate limiting in Nginx
- Use strong passwords and API keys

### Application Security
- Regularly update Docker images
- Monitor security vulnerabilities
- Enable audit logging
- Implement proper access controls

### Data Protection
- Encrypt data at rest
- Use secure database connections
- Implement data retention policies
- Regular security audits

## Troubleshooting

### Common Issues

**Services not starting**
```bash
# Check logs
./scripts/deploy.sh logs

# Verify environment variables
cat .env.production

# Check disk space
df -h
```

**Database connection errors**
```bash
# Check PostgreSQL status
docker-compose -f docker/production/docker-compose.yml exec postgres pg_isready

# Reset database password
docker-compose -f docker/production/docker-compose.yml down
docker volume rm production_postgres_data
./scripts/deploy.sh deploy
```

**High memory usage**
```bash
# Monitor memory usage
docker stats

# Restart services
./scripts/deploy.sh restart

# Scale down if necessary
docker-compose -f docker/production/docker-compose.yml scale ingestion=1
```

### Performance Issues

**Slow API responses**
- Check database query performance
- Monitor Redis cache hit rates
- Scale ingestion service horizontally
- Optimize Nginx configuration

**Dashboard loading slowly**
- Enable Nginx gzip compression
- Optimize Next.js build
- Use CDN for static assets
- Monitor network latency

## Scaling

### Horizontal Scaling
```bash
# Scale ingestion service
docker-compose -f docker/production/docker-compose.yml up -d --scale ingestion=3

# Scale analysis engine
docker-compose -f docker/production/docker-compose.yml up -d --scale analysis=2
```

### Load Balancing
- Configure Nginx upstream servers
- Use Docker Swarm or Kubernetes
- Implement database read replicas
- Use Redis Cluster for caching

## Backup & Recovery

### Database Backup
```bash
# Create backup
docker-compose -f docker/production/docker-compose.yml exec postgres \
  pg_dump -U tracelens tracelens | gzip > tracelens_backup.sql.gz

# Restore backup
gunzip -c tracelens_backup.sql.gz | \
docker-compose -f docker/production/docker-compose.yml exec -T postgres \
  psql -U tracelens tracelens
```

### Configuration Backup
```bash
# Backup configuration files
tar -czf tracelens_config_backup.tar.gz \
  .env.production \
  docker/production/ \
  coolify.json
```

## Support

### Getting Help
- Check logs: `./scripts/deploy.sh logs`
- Review documentation: `docs/`
- Submit issues: GitHub Issues
- Community support: Discord/Slack

### Maintenance Schedule
- **Daily**: Health checks and log review
- **Weekly**: Security updates and backups
- **Monthly**: Performance optimization and scaling review
- **Quarterly**: Security audit and disaster recovery testing
