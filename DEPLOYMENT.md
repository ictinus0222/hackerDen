# Deployment Guide

This guide covers deploying hackerDen to production environments.

## Prerequisites

1. **MongoDB Atlas Account**: Set up a MongoDB Atlas cluster
2. **Redis Cloud Account** (optional): For production caching
3. **Deployment Platform**: Choose from Railway, Heroku, Vercel, or Docker

## Environment Variables

### Required Production Variables

Copy the following variables to your production environment:

```bash
# Server Configuration
NODE_ENV=production
PORT=3000

# Database Configuration - MongoDB Atlas
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/hackathon-management?retryWrites=true&w=majority

# Frontend Configuration
FRONTEND_URL=https://your-frontend-domain.com

# JWT Configuration - CRITICAL: Use strong secrets
JWT_SECRET=your-super-strong-jwt-secret-at-least-64-characters-long
JWT_EXPIRES_IN=7d

# Redis Configuration (optional but recommended)
REDIS_URL=redis://username:password@redis-host:port

# Security Configuration
SESSION_SECRET=your-strong-session-secret-at-least-32-characters

# Logging
LOG_LEVEL=info
```

### Frontend Environment Variables

```bash
# Production API URLs
VITE_API_URL=https://your-backend-domain.com
VITE_SOCKET_URL=https://your-backend-domain.com

# Feature flags
VITE_ENABLE_ANALYTICS=true
VITE_ENABLE_ERROR_REPORTING=true

# Build configuration
VITE_BUILD_VERSION=1.0.0
```

## Deployment Options

### Option 1: Railway (Recommended)

Railway provides easy deployment with automatic HTTPS and environment management.

1. **Connect Repository**:
   ```bash
   # Install Railway CLI
   npm install -g @railway/cli
   
   # Login and deploy
   railway login
   railway link
   railway up
   ```

2. **Set Environment Variables**:
   - Go to Railway dashboard
   - Add all required environment variables
   - Deploy will automatically restart

3. **Database Setup**:
   - Add MongoDB Atlas connection string
   - Optionally add Redis plugin from Railway

### Option 2: Heroku

1. **Create Heroku App**:
   ```bash
   # Install Heroku CLI
   heroku create your-app-name
   
   # Set environment variables
   heroku config:set NODE_ENV=production
   heroku config:set MONGODB_URI=your-mongodb-atlas-uri
   heroku config:set JWT_SECRET=your-jwt-secret
   heroku config:set FRONTEND_URL=https://your-app-name.herokuapp.com
   
   # Deploy
   git push heroku main
   ```

2. **Add-ons** (optional):
   ```bash
   # Add Redis
   heroku addons:create heroku-redis:hobby-dev
   ```

### Option 3: Docker Deployment

1. **Build Docker Image**:
   ```bash
   # Build production image
   docker build -t hackathon-management-tool .
   
   # Run container
   docker run -p 3000:3000 \
     -e NODE_ENV=production \
     -e MONGODB_URI=your-mongodb-uri \
     -e JWT_SECRET=your-jwt-secret \
     -e FRONTEND_URL=https://your-domain.com \
     hackathon-management-tool
   ```

2. **Docker Compose** (with Redis):
   ```yaml
   version: '3.8'
   services:
     app:
       build: .
       ports:
         - "3000:3000"
       environment:
         - NODE_ENV=production
         - MONGODB_URI=your-mongodb-uri
         - JWT_SECRET=your-jwt-secret
         - REDIS_URL=redis://redis:6379
       depends_on:
         - redis
     
     redis:
       image: redis:7-alpine
       ports:
         - "6379:6379"
   ```

### Option 4: Vercel (Frontend) + Railway (Backend)

1. **Deploy Frontend to Vercel**:
   ```bash
   # Install Vercel CLI
   npm install -g vercel
   
   # Deploy frontend
   cd frontend
   vercel --prod
   ```

2. **Deploy Backend to Railway**:
   ```bash
   # Deploy backend separately
   railway up
   ```

3. **Update Configuration**:
   - Update `vercel.json` with your backend URL
   - Set frontend environment variables in Vercel dashboard

## Database Setup

### MongoDB Atlas

1. **Create Cluster**:
   - Sign up at [MongoDB Atlas](https://www.mongodb.com/atlas)
   - Create a new cluster (M0 free tier available)
   - Create database user with read/write permissions

2. **Network Access**:
   - Add IP addresses: `0.0.0.0/0` (allow all) for production
   - Or add specific IPs of your deployment platform

3. **Connection String**:
   ```
   mongodb+srv://username:password@cluster.mongodb.net/hackathon-management?retryWrites=true&w=majority
   ```

### Redis Cloud (Optional)

1. **Create Database**:
   - Sign up at [Redis Cloud](https://redis.com/redis-enterprise-cloud/)
   - Create a new database (30MB free tier available)

2. **Connection String**:
   ```
   redis://username:password@redis-host:port
   ```

## Security Checklist

- [ ] Use strong, unique JWT secrets (64+ characters)
- [ ] Enable HTTPS in production
- [ ] Set secure CORS origins
- [ ] Use environment variables for all secrets
- [ ] Enable rate limiting
- [ ] Set up proper logging
- [ ] Configure security headers
- [ ] Use MongoDB Atlas with authentication
- [ ] Restrict database network access

## Performance Optimization

### Frontend
- [ ] Enable gzip compression
- [ ] Use CDN for static assets
- [ ] Implement service worker for caching
- [ ] Optimize bundle size with code splitting

### Backend
- [ ] Enable MongoDB connection pooling
- [ ] Use Redis for session storage and caching
- [ ] Implement proper error handling
- [ ] Set up health checks
- [ ] Configure graceful shutdowns

## Monitoring and Logging

### Health Checks
```bash
# Check application health
curl https://your-domain.com/health
```

### Logging
- Application logs are structured JSON in production
- Use log aggregation services (LogDNA, Papertrail, etc.)
- Monitor error rates and response times

### Error Tracking (Optional)
```bash
# Add Sentry for error tracking
SENTRY_DSN=your-sentry-dsn
```

## Troubleshooting

### Common Issues

1. **Database Connection Errors**:
   - Verify MongoDB Atlas connection string
   - Check network access settings
   - Ensure database user has proper permissions

2. **CORS Errors**:
   - Verify FRONTEND_URL matches your domain
   - Check CORS configuration in server

3. **WebSocket Connection Issues**:
   - Ensure WebSocket support on hosting platform
   - Check firewall settings
   - Verify Socket.io configuration

4. **Build Failures**:
   - Check Node.js version compatibility
   - Verify all dependencies are installed
   - Check TypeScript compilation errors

### Debug Commands

```bash
# Check environment variables
npm run health-check

# View application logs
railway logs  # Railway
heroku logs --tail  # Heroku

# Test database connection
node -e "require('./backend/dist/config/database.js').connectDB().then(() => console.log('DB OK')).catch(console.error)"
```

## Scaling Considerations

### Horizontal Scaling
- Use load balancers for multiple instances
- Implement sticky sessions for WebSocket connections
- Use Redis for shared session storage

### Database Scaling
- MongoDB Atlas auto-scaling
- Read replicas for read-heavy workloads
- Database indexing optimization

### Caching Strategy
- Redis for session storage
- CDN for static assets
- Application-level caching for API responses

## Backup and Recovery

### Database Backups
- MongoDB Atlas automatic backups
- Point-in-time recovery available
- Export important data regularly

### Application Backups
- Source code in version control
- Environment variables documented
- Deployment configurations saved

## Support

For deployment issues:
1. Check the troubleshooting section above
2. Review application logs
3. Verify environment variables
4. Test database connectivity
5. Check platform-specific documentation