# 🚀 GreenVision AI - Deployment Guide

Complete guide untuk deploy GreenVision AI ke production environment.

---

## 📑 Table of Contents

1. [Local Development Setup](#local-development-setup)
2. [Production Checklist](#production-checklist)
3. [Deployment Platforms](#deployment-platforms)
4. [Docker Deployment](#docker-deployment)
5. [Environment Configuration](#environment-configuration)
6. [Monitoring & Logging](#monitoring--logging)
7. [Backup & Recovery](#backup--recovery)
8. [Troubleshooting](#troubleshooting)

---

## 🏠 Local Development Setup

### Prerequisites
```bash
# Check versions
node --version        # v14+
npm --version         # v6+
python3 --version     # v3.7+ (for frontend server)
```

### Installation
```bash
# 1. Clone repository
cd "GreenVision AI"

# 2. Install backend dependencies
npm install

# 3. Create environment file
cp .env.example .env
# Edit .env as needed

# 4. Setup Ollama (optional but recommended)
# See Ollama Setup section below
```

### Running Development Servers

**Terminal 1 - Backend**:
```bash
npm start
# Output:
# ✅ Server running on http://localhost:3000
# 📍 Static files: [path]/public
```

**Terminal 2 - Frontend**:
```bash
cd public
python3 -m http.server 8000
# Or on Windows:
python -m http.server 8000
# Output:
# Serving HTTP on 0.0.0.0 port 8000
```

**Access**: http://localhost:8000

### Development Workflow
```bash
# Auto-reload backend (install nodemon first)
npm install -D nodemon
npm run dev
# Or in package.json:
# "dev": "nodemon backend/server.js"
```

---

## ✅ Production Checklist

### Code Quality
- [ ] No console.error() statements
- [ ] No console.log() in production code (or wrapped in isDev)
- [ ] No debug/test code remaining
- [ ] All error handling in place
- [ ] Input validation on all endpoints

### Security
- [ ] CORS origins updated to production domain(s)
- [ ] NODE_ENV=production set
- [ ] HTTPS/TLS enabled
- [ ] API rate limiting enabled
- [ ] Environment variables securely stored
- [ ] No hardcoded secrets
- [ ] .env file not in git
- [ ] SQL injection prevention (if using DB)
- [ ] XSS prevention verified
- [ ] CSRF protection enabled

### Performance
- [ ] CSS minified
- [ ] JavaScript minified
- [ ] Images optimized
- [ ] Caching headers configured
- [ ] CDN enabled (optional)
- [ ] Database queries optimized
- [ ] Load testing completed
- [ ] Lighthouse score > 80

### Testing
- [ ] All features tested on target devices
- [ ] Responsive design verified (mobile, tablet, desktop)
- [ ] Accessibility audit passed (WCAG 2.1 AA)
- [ ] Cross-browser testing (Chrome, Firefox, Safari, Edge)
- [ ] Dark/light mode tested
- [ ] Chat with Ollama tested
- [ ] Fallback responses tested
- [ ] Error scenarios handled

### Deployment
- [ ] Backup plan in place
- [ ] Rollback procedure documented
- [ ] Monitoring setup
- [ ] Logging configured
- [ ] Health checks defined
- [ ] Status page ready
- [ ] Support process defined

---

## 🌐 Deployment Platforms

### Option 1: Heroku (Easiest)

#### Setup

1. **Create Heroku account**: https://heroku.com
2. **Install Heroku CLI**:
   ```bash
   brew install heroku/brew/heroku  # macOS
   choco install heroku-cli          # Windows
   apt-get install heroku            # Linux
   ```

3. **Login to Heroku**:
   ```bash
   heroku login
   ```

4. **Create Heroku app**:
   ```bash
   heroku create your-app-name
   # Or link existing:
   heroku git:remote -a your-app-name
   ```

#### Configuration

5. **Set environment variables**:
   ```bash
   heroku config:set NODE_ENV=production
   heroku config:set OLLAMA_URL=http://your-ollama-instance:11434
   heroku config:set OLLAMA_MODEL=mistral
   heroku config:set ALLOWED_ORIGINS=https://your-app-name.herokuapp.com
   ```

6. **Configure Procfile**:
   ```
   # Create Procfile in root
   web: npm start
   ```

#### Deployment

7. **Deploy**:
   ```bash
   git push heroku main
   # Or from specific branch:
   git push heroku your-branch:main
   ```

8. **View logs**:
   ```bash
   heroku logs --tail
   ```

#### Adding Ollama to Heroku

**Option A**: Use external Ollama service
```bash
heroku config:set OLLAMA_URL=https://your-ollama-service.com
```

**Option B**: Run Ollama on another server (DigitalOcean, AWS, etc.)
and point to it.

### Option 2: Railway (Modern Alternative)

#### Setup
1. Go to https://railway.app
2. Connect GitHub account
3. Create new project
4. Select repository

#### Configuration
- Add environment variables in Railway dashboard
- Configure start command: `npm start`
- Set OLLAMA_URL to external service

#### Deployment
- Automatic on git push
- Rollback available
- Custom domains supported

### Option 3: Render (Free Tier Available)

#### Setup
1. https://render.com
2. Sign up with GitHub
3. Create new web service

#### Configuration
```
Build Command: npm install
Start Command: npm start
Environment: Node
Region: Singapore (closest to Indonesia)
```

#### Add Environment
```
NODE_ENV=production
OLLAMA_URL=http://external-ollama:11434
PORT=3000
```

### Option 4: DigitalOcean App Platform

#### Setup
1. https://cloud.digitalocean.com/apps
2. Create new app
3. Connect GitHub repo

#### Configuration
- Choose Node.js buildpack
- Set environment variables
- Configure domains

#### Deployment
- Push to GitHub
- Auto-deploy on push
- Rollback available

### Option 5: Self-Hosted (VPS)

#### Prerequisites
- VPS (AWS EC2, DigitalOcean, Linode, etc.)
- Ubuntu 20.04+ recommended
- SSH access
- Domain name

#### Setup Steps

1. **Connect to VPS**:
   ```bash
   ssh -i your-key.pem ubuntu@your-ip
   ```

2. **Install Node.js**:
   ```bash
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs
   node --version  # Verify
   ```

3. **Install Ollama** (optional):
   ```bash
   curl https://ollama.ai/install.sh | sh
   ollama serve  # Start service
   ```

4. **Setup project**:
   ```bash
   cd /var/www
   git clone https://github.com/your-repo/greenvision-ai.git
   cd greenvision-ai
   npm install
   ```

5. **Configure environment**:
   ```bash
   sudo nano .env
   # Set NODE_ENV=production, OLLAMA_URL, etc.
   chmod 600 .env
   ```

6. **Setup systemd service**:
   ```bash
   sudo tee /etc/systemd/system/greenvision-ai.service > /dev/null <<EOF
   [Unit]
   Description=GreenVision AI
   After=network.target
   
   [Service]
   Type=simple
   User=www-data
   WorkingDirectory=/var/www/greenvision-ai
   ExecStart=/usr/bin/node backend/server.js
   Restart=on-failure
   RestartSec=10
   
   [Install]
   WantedBy=multi-user.target
   EOF
   
   sudo systemctl daemon-reload
   sudo systemctl enable greenvision-ai
   sudo systemctl start greenvision-ai
   sudo systemctl status greenvision-ai
   ```

7. **Setup Nginx reverse proxy**:
   ```bash
   sudo apt-get install nginx
   sudo tee /etc/nginx/sites-available/greenvision-ai > /dev/null <<EOF
   server {
       listen 80;
       server_name yourdomain.com www.yourdomain.com;
       
       # Redirect to HTTPS
       return 301 https://$server_name$request_uri;
   }
   
   server {
       listen 443 ssl http2;
       server_name yourdomain.com www.yourdomain.com;
       
       # SSL certificates (use Let's Encrypt)
       ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
       ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;
       
       # Proxy to Node.js
       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   EOF
   
   sudo ln -s /etc/nginx/sites-available/greenvision-ai /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl restart nginx
   ```

8. **Setup HTTPS with Let's Encrypt**:
   ```bash
   sudo apt-get install certbot python3-certbot-nginx
   sudo certbot certonly --nginx -d yourdomain.com -d www.yourdomain.com
   # Follow prompts
   ```

9. **Verify deployment**:
   ```bash
   curl https://yourdomain.com
   # Should return HTML
   ```

---

## 🐳 Docker Deployment

### Dockerfile

Create `Dockerfile` in root:
```dockerfile
# Build stage
FROM node:18-alpine as builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

# Runtime stage
FROM node:18-alpine
WORKDIR /app

# Install curl for healthchecks
RUN apk add --no-cache curl

# Copy from builder
COPY --from=builder /app/node_modules ./node_modules

# Copy application
COPY . .

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:3000/api/health || exit 1

# Start application
CMD ["node", "backend/server.js"]
```

### Docker Compose

Create `docker-compose.yml`:
```yaml
version: '3.8'

services:
  # Backend API
  backend:
    build: .
    ports:
      - "3000:3000"
    environment:
      NODE_ENV: production
      OLLAMA_URL: http://ollama:11434
      OLLAMA_MODEL: mistral
      ALLOWED_ORIGINS: http://localhost:8000,https://yourdomain.com
    depends_on:
      - ollama
    volumes:
      - ./logs:/app/logs
    restart: unless-stopped

  # Ollama LLM Service
  ollama:
    image: ollama/ollama:latest
    ports:
      - "11434:11434"
    volumes:
      - ollama_data:/root/.ollama
    environment:
      OLLAMA_HOST: 0.0.0.0:11434
    restart: unless-stopped

  # Nginx Reverse Proxy
  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
      - ./certs:/etc/nginx/certs:ro
      - ./public:/var/www/public:ro
    depends_on:
      - backend
    restart: unless-stopped

volumes:
  ollama_data:
```

### Build and Run

```bash
# Build image
docker build -t greenvision-ai .

# Run container
docker run -p 3000:3000 \
  -e NODE_ENV=production \
  -e OLLAMA_URL=http://host.docker.internal:11434 \
  greenvision-ai

# Or use Docker Compose
docker-compose up -d

# View logs
docker-compose logs -f backend

# Stop services
docker-compose down
```

---

## ⚙️ Environment Configuration

### Production .env Template

```env
# Server
PORT=3000
NODE_ENV=production

# Ollama
OLLAMA_URL=https://ollama.yourdomain.com
OLLAMA_MODEL=mistral
OLLAMA_TIMEOUT=30000

# Security
CORS_ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com

# Database (if applicable)
# DB_URL=postgresql://user:pass@host:5432/db

# Logging
LOG_LEVEL=info
LOG_FILE=/var/log/greenvision-ai/app.log

# Monitoring
SENTRY_DSN=https://key@sentry.io/project

# API Keys (if integrated services)
# OPENWEATHER_API_KEY=
# GOOGLE_MAPS_API_KEY=
```

### Production Configuration File

Create `backend/config/production.js`:
```javascript
module.exports = {
  port: process.env.PORT || 3000,
  nodeEnv: 'production',
  cors: {
    origin: process.env.CORS_ALLOWED_ORIGINS?.split(',') || [],
    credentials: true,
    maxAge: 86400 // 24 hours
  },
  ollama: {
    url: process.env.OLLAMA_URL || 'http://localhost:11434',
    model: process.env.OLLAMA_MODEL || 'mistral',
    timeout: parseInt(process.env.OLLAMA_TIMEOUT) || 30000
  },
  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 requests per windowMs
  },
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    file: process.env.LOG_FILE || null
  }
};
```

---

## 📊 Monitoring & Logging

### Application Logging

Add logging middleware to `backend/server.js`:
```javascript
const fs = require('fs');
const path = require('path');

// Create logs directory
const logsDir = path.join(__dirname, '../logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Log stream
const logStream = fs.createWriteStream(
  path.join(logsDir, `${new Date().toISOString().split('T')[0]}.log`),
  { flags: 'a' }
);

// Logging middleware
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  const log = `[${timestamp}] ${req.method} ${req.path} - ${req.ip}`;
  
  logStream.write(log + '\n');
  console.log(log);
  
  next();
});
```

### Health Monitoring

Endpoint already exists: `GET /api/health`

```bash
# Test health endpoint
curl https://yourdomain.com/api/health

# Response:
{
  "status": "ok",
  "timestamp": "2024-01-20T10:30:00Z",
  "ollama": "connected",
  "version": "1.0.0"
}
```

### Setup Monitoring Service

**Option 1: UptimeRobot (Free)**
1. Go to https://uptimerobot.com
2. Create monitor: `https://yourdomain.com/api/health`
3. Check every 5 minutes
4. Alert on status change

**Option 2: Sentry (Error Tracking)**
```bash
npm install @sentry/node
```

```javascript
const Sentry = require("@sentry/node");

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0,
});

app.use(Sentry.Handlers.requestHandler());
app.use(Sentry.Handlers.errorHandler());
```

### Performance Monitoring

**Google Analytics** (Frontend):
```html
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'GA_MEASUREMENT_ID');
</script>
```

---

## 💾 Backup & Recovery

### Database Backup (if applicable)

```bash
# Backup PostgreSQL
pg_dump -h localhost -U user database > backup.sql

# Restore
psql -h localhost -U user database < backup.sql

# Schedule daily backup
0 2 * * * pg_dump -h localhost -U user database > /backups/db_$(date +\%Y\%m\%d).sql
```

### Application Code Backup

```bash
# Git backup
git push origin main

# Server backup
tar -czf /backups/app_$(date +%Y%m%d).tar.gz /var/www/greenvision-ai
```

### Recovery Procedure

```bash
# 1. Stop application
sudo systemctl stop greenvision-ai

# 2. Restore from backup
tar -xzf /backups/app_20240120.tar.gz -C /var/www

# 3. Restore database (if needed)
psql -h localhost -U user database < /backups/db_20240120.sql

# 4. Restart application
sudo systemctl start greenvision-ai

# 5. Verify
curl https://yourdomain.com/api/health
```

---

## 🔧 Troubleshooting

### Application Won't Start

```bash
# Check logs
sudo journalctl -u greenvision-ai -n 50

# Check Node process
ps aux | grep node

# Test port
lsof -i :3000
```

### High CPU Usage

```bash
# Check process
top -p $(pgrep -f "node backend/server.js")

# Possible fixes:
# 1. Increase Ollama timeout
# 2. Enable Ollama GPU support
# 3. Scale to multiple processes
```

### Memory Leak

```bash
# Monitor memory
watch -n 1 'ps aux | grep node'

# Use node debugger
node --inspect backend/server.js

# Connect Chrome DevTools: chrome://inspect
```

### Ollama Connection Issues

```bash
# Check Ollama running
curl http://localhost:11434/api/tags

# Restart Ollama
sudo systemctl restart ollama

# Check Ollama logs
sudo journalctl -u ollama -n 50
```

### CORS Errors

```
Access to XMLHttpRequest blocked by CORS policy
```

**Solution**: Update CORS in `backend/server.js`:
```javascript
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:8000'],
  credentials: true
}));
```

### Chat Not Working

1. Check backend running: `curl http://localhost:3000/api/health`
2. Check Ollama: `curl http://localhost:11434/api/tags`
3. Check browser console: F12 → Console
4. Check network requests: F12 → Network → POST `/api/ai/chat`

---

## 📋 Post-Deployment Checklist

- [ ] Application accessible on production URL
- [ ] HTTPS working
- [ ] Health endpoint responding
- [ ] Chat functionality tested
- [ ] Dark/light mode working
- [ ] All pages loading
- [ ] Responsive design verified on mobile
- [ ] Performance acceptable (< 3s load time)
- [ ] Monitoring configured
- [ ] Backup process running
- [ ] Team notified of launch
- [ ] Support process documented

---

Last Updated: January 2024
Version: 1.0.0
Status: Production Ready
