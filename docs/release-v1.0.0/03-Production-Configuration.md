# Production Configuration Guide

This document outlines the required configuration files and environment variables for a production deployment of PowerGuard v1.0.0.

## 1. Node.js Backend (`apps/server/.env`)

```env
# Server Configuration
NODE_ENV=production
PORT=3000
FRONTEND_URL=https://app.powerguard.com

# Database (MySQL)
DATABASE_URL="mysql://powerguard_user:SecurePass123!@db.powerguard.internal:3306/powerguard_prod?connection_limit=50&pool_timeout=20"

# Redis (Caching & Rate Limiting)
REDIS_URL=redis://:RedisSecurePass@redis.powerguard.internal:6379

# JWT Authentication
JWT_SECRET=generate_a_64_char_secure_random_string_here
JWT_EXPIRES_IN=1h
JWT_REFRESH_SECRET=generate_another_64_char_secure_random_string_here
JWT_REFRESH_EXPIRES_IN=7d

# MQTT Broker
MQTT_BROKER_URL=mqtts://mqtt.powerguard.internal:8883
MQTT_USERNAME=powerguard_api
MQTT_PASSWORD=secure_mqtt_pass

# AI Engine
AI_SERVICE_URL=http://ai.powerguard.internal:8000

# Email/SMTP (Notifications)
EMAIL_HOST=smtp.sendgrid.net
EMAIL_PORT=587
EMAIL_USER=apikey
EMAIL_PASS=your_sendgrid_api_key
EMAIL_FROM="PowerGuard Alerts <alerts@powerguard.com>"

# Logging
LOG_LEVEL=info
```

## 2. Next.js Frontend (`apps/web/.env`)

```env
# Frontend Configuration
NODE_ENV=production
NEXT_PUBLIC_API_URL=https://api.powerguard.com/api
NEXT_PUBLIC_SOCKET_URL=https://api.powerguard.com
NEXT_PUBLIC_APP_URL=https://app.powerguard.com
```

## 3. Python AI Engine (`apps/ai/.env`)

```env
# AI Engine Configuration
ENVIRONMENT=production
PORT=8000
WORKERS=4
LOG_LEVEL=info
MODEL_CACHE_DIR=/app/models
```

## 4. PM2 Ecosystem File (`ecosystem.config.js`)
For running via PM2 in production:

```javascript
module.exports = {
  apps: [
    {
      name: 'powerguard-api',
      script: 'dist/index.js',
      cwd: './apps/server',
      instances: 'max',
      exec_mode: 'cluster',
      env_production: {
        NODE_ENV: 'production'
      }
    },
    {
      name: 'powerguard-web',
      script: 'npm',
      args: 'start',
      cwd: './apps/web',
      instances: 1, // Next.js handles its own workers
      env_production: {
        NODE_ENV: 'production'
      }
    }
  ]
};
```
