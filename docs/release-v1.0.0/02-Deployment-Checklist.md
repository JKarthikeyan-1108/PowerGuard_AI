# PowerGuard Deployment Checklist

Before deploying PowerGuard v1.0.0 to a production environment, ensure all items on this checklist are verified.

## 1. Infrastructure Readiness
- [ ] **Servers:** Minimum 3 separate VMs/Containers (Node.js API, Python AI Engine, Next.js Frontend).
- [ ] **Database:** MySQL 8.0+ provisioned with automated daily backups.
- [ ] **Cache:** Redis 6+ provisioned for rate limiting and session management.
- [ ] **MQTT Broker:** Mosquitto or EMQX deployed, configured with TLS (MQTTS on port 8883).
- [ ] **Network:** Firewalls configured. Only ports 80/443 (Frontend), 3000 (API), 1883/8883 (MQTT), and 8000 (Internal AI) should be managed.

## 2. Configuration & Secrets
- [ ] Generate strong, random strings for `JWT_SECRET` and `JWT_REFRESH_SECRET`.
- [ ] Ensure `NODE_ENV=production` is set across all Node.js applications.
- [ ] Ensure `DATABASE_URL` uses a secure connection string with a restricted database user.
- [ ] Configure `EMAIL_HOST`, `EMAIL_USER`, and `EMAIL_PASS` for SMTP notifications.
- [ ] Set `FRONTEND_URL` in the server environment to correctly configure CORS.

## 3. Database Migration
- [ ] Run `npx prisma migrate deploy` to apply migrations without resetting the database.
- [ ] Run `npx prisma db seed` if starting from a fresh database to create the default Admin account.

## 4. Application Build
- [ ] Backend: Run `npm run build` in `apps/server` and verify `dist/` is generated cleanly.
- [ ] Frontend: Run `npm run build` in `apps/web` and verify zero ESLint/TypeScript errors.
- [ ] AI Engine: Verify Python `requirements.txt` installs successfully in a virtual environment.

## 5. Security & SSL
- [ ] Configure Nginx/HAProxy for SSL termination (HTTPS).
- [ ] Enforce WAF rules to protect against DDoS on public endpoints.
- [ ] Verify rate limiting is enabled via Redis.

## 6. Monitoring & Logs
- [ ] Verify `logs/` directory has proper write permissions.
- [ ] Log rotation is configured at the OS level (e.g., `logrotate`).
- [ ] Admin monitoring dashboard successfully connects to AI, DB, and MQTT endpoints.

## 7. Post-Deployment Verification
- [ ] Login as Admin.
- [ ] Verify System Health dashboard shows all services as `HEALTHY`.
- [ ] Connect a test MQTT client and verify telemetry appears in the dashboard.
- [ ] Trigger the Demo Mode (Fast) and verify Socket.IO real-time updates are functioning.
