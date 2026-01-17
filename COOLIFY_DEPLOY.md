# TraceLens Coolify Deployment Guide

## Quick Deploy

1. **Create New Resource in Coolify**
   - Choose "Docker Compose" deployment type
   - Repository: `https://github.com/v4mpire/TraceLens.git`
   - Branch: `main`
   - Docker Compose file: `docker-compose.yaml`

2. **Set Environment Variables**
   ```bash
   POSTGRES_PASSWORD=your_secure_password_here
   API_URL=https://your-domain.com
   LOG_LEVEL=info
   ```

3. **Deploy**
   - Coolify will automatically build and start all services
   - Web dashboard: Port 3000
   - API service: Port 3001
   - Database: Port 5432 (internal)
   - Redis: Port 6379 (internal)

## Services Included

- **Web Dashboard** (Next.js) - Port 3000
- **Ingestion Service** (Express API) - Port 3001  
- **PostgreSQL Database** - Port 5432
- **Redis Cache** - Port 6379

## Health Checks

All services include proper health checks to prevent restart loops:

- **Web**: `/api/health`
- **API**: `/health`
- **Database**: `pg_isready`
- **Redis**: `redis-cli ping`

## Restart Policies

- `restart: unless-stopped` for all services
- Proper dependency ordering with health checks
- Extended start periods to allow full initialization

## Troubleshooting

If services restart repeatedly:

1. Check environment variables are set correctly
2. Verify database password matches in all services
3. Check logs for specific error messages
4. Ensure sufficient resources (2GB RAM minimum)

## Production Notes

- Database data persists in Docker volumes
- Redis configured with memory limits and persistence
- All services run as non-root users
- Security headers and rate limiting enabled
