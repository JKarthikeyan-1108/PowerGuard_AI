# Production Deployment Checklist (v2.0)

Ensure all steps are completed before migrating traffic to the v2.0 Production cluster.

## 1. Environment Variables
- [ ] `DATABASE_URL`: Ensure pointing to the highly-available Production MySQL cluster.
- [ ] `JWT_SECRET`: Must be rotated from the staging environment. Minimum 64 characters.
- [ ] `GEMINI_API_KEY`: Required for the AI Copilot. Ensure billing is enabled on Google Cloud.
- [ ] `MQTT_BROKER_URL`: Ensure pointing to production broker (e.g. HiveMQ or EMQX cluster).

## 2. Database Migrations
- [ ] Take a full manual snapshot of the MySQL database.
- [ ] Run `npx prisma migrate deploy` to safely apply the SaaS and Webhook schema changes.
- [ ] Verify `ApiKey` and `WebhookEndpoint` tables exist.

## 3. Security & Domain
- [ ] Ensure SSL certificates (Let's Encrypt / AWS ACM) are provisioned. The PWA and WebAuthn features **will strictly fail** if not served over `HTTPS`.
- [ ] Configure the WAF (Web Application Firewall) to allow high-throughput POST traffic on the `/api/integration/scada/telemetry` endpoint from known SCADA IP ranges.

## 4. CI/CD & Build
- [ ] Run `npm run build` on both `apps/web` and `apps/server`.
- [ ] Verify Next.js generated static pages successfully (no hydration errors).

## 5. Post-Deployment Verification
- [ ] Log in as a `SUPER_ADMIN` (`founder@powerguard.io`).
- [ ] Ask the AI Copilot a question and verify it responds without error (confirming Gemini API key is valid).
- [ ] Provision a test Tenant Organization.
