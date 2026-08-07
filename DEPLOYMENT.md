# PowerGuard Deployment Guide

This document outlines the steps required to deploy the PowerGuard platform to a production environment using Docker and Docker Compose.

## Prerequisites
- A Linux Server (Ubuntu 22.04 LTS recommended)
- Git
- Docker & Docker Compose
- Minimum 4GB RAM, 2 vCPUs

## Step 1: Clone the Repository
```bash
git clone https://github.com/your-org/PowerGuard.git
cd PowerGuard
```

## Step 2: Configure Environment Variables
1. Copy the example environment file:
   ```bash
   cp .env.example .env
   ```
2. Edit `.env` and set strong passwords for `MYSQL_ROOT_PASSWORD`, `JWT_SECRET`, and `JWT_REFRESH_SECRET`. Ensure the `VITE_API_URL` and `VITE_WS_URL` point to your production domain if not using the Nginx reverse proxy defaults.

## Step 3: Build and Run Services
Run the following command to build the Docker images and start the containers in detached mode:
```bash
docker compose up --build -d
```
*This command will start MySQL, Mosquitto, the Node.js Server, the FastAPI AI service, the Next.js Frontend, and the Nginx reverse proxy.*

## Step 4: Database Migration and Seeding
Once the containers are running, you need to push the database schema and optionally seed initial data:
```bash
docker exec -it powerguard-server npx prisma db push
docker exec -it powerguard-server npm run db:seed
```

## Step 5: Configure SSL (HTTPS)
For production, it is highly recommended to secure the Nginx reverse proxy using SSL (Let's Encrypt).
1. Install Certbot:
   ```bash
   sudo apt install certbot python3-certbot-nginx
   ```
2. Run Certbot to generate certificates (you will need to map Nginx ports directly to the host if running outside docker, or use a Dockerized certbot flow).

## Health Checks & Monitoring
- **Backend Health**: `http://<your-domain>/api/health`
- **Container Status**: `docker ps`
- **Logs**: `docker compose logs -f <service-name>`

## Backups
Use the provided bash scripts in the `/scripts` directory.
- Run `bash scripts/backup.sh` to generate a `.sql.gz` dump of the database and a `.tar.gz` archive of the MQTT config/data.
- Consider setting up a `cron` job to automate backups daily:
  ```bash
  0 2 * * * /path/to/PowerGuard/scripts/backup.sh >> /var/log/powerguard-backup.log 2>&1
  ```
