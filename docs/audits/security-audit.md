# Security Audit

## Identity & Access Management (IAM)
- **Authentication:** Standard JWT (JSON Web Tokens) with 24-hour expiry.
- **Advanced Auth:** Integrated WebAuthn logic for biometric logins (Fingerprint/FaceID) to eliminate password fatigue for field officers.
- **Role-Based Access Control (RBAC):** Strict segregation via `authorize.ts` middleware:
  - `SUPER_ADMIN`: Platform control across all tenants.
  - `ADMIN`: Organization-scoped control.
  - `UTILITY_OFFICER`: Field-level operational access.
  - `CONSUMER`: Strictly limited to own `consumerId`.

## Machine-to-Machine (M2M) Security
- **API Keys:** SCADA and ERP integrations use hashed API Keys via the `x-api-key` header.
- **Webhooks:** Outbound webhooks to 3rd party systems are cryptographically signed using HMAC SHA256 (`PowerGuard-Signature`).

## Data Protection
- **Tenant Isolation:** enforced at the middleware layer. If an API Key or JWT is missing tenant context, the request is violently rejected (`403 Forbidden`).
- **Passwords:** Hashed via `bcrypt` with a strong salt round configuration.

## Recommendations for Hardening
- Implement strict API Rate Limiting on public endpoints (e.g., login, password resets) using `express-rate-limit`.
- Transition JWT storage on the frontend from `localStorage` to `HttpOnly` cookies to mitigate XSS (Cross-Site Scripting) vectors.
