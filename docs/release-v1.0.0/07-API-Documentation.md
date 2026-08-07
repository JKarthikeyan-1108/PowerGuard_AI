# API Documentation

PowerGuard v1.0.0 uses a RESTful API built on Express.js (Node.js) and FastAPI (Python).

## Base URLs
- **Main API:** `https://api.powerguard.com/api`
- **Internal AI API:** `http://ai.powerguard.internal:8000/api/ai`

## Authentication
Most endpoints require a Bearer token in the `Authorization` header.
- **Header format:** `Authorization: Bearer <token>`
- Tokens are acquired via `POST /api/auth/login`.

## Core Modules

### 1. Auth (`/api/auth`)
- `POST /login`: Authenticates user and returns JWT + Refresh Token.
- `POST /refresh-token`: Mints a new JWT.
- `GET /me`: Returns the authenticated user's profile.

### 2. Monitoring (`/api/monitoring`)
Requires `ADMIN` role.
- `GET /dashboard`: Returns the full unified system health dashboard metrics.
- `GET /system`: Returns OS/Node metrics.
- `GET /api-metrics`: Returns request rates and response times.
- `GET /history`: Returns time-series metrics.

### 3. Demo Engine (`/api/demo`)
Requires `ADMIN` role.
- `GET /status`: Returns whether Demo mode is active.
- `POST /enable`: Starts generating fake IoT readings for selected scenarios.
- `POST /disable`: Stops the demo engine.
- `POST /presentation`: Runs a full automated sequence for presentations.

### 4. Meters (`/api/meters`)
- `GET /`: Lists all meters (Admin/Utility).
- `POST /`: Provisions a new meter.
- `GET /:id/readings`: Fetches historical telemetry for a specific meter.

### 5. Alerts (`/api/alerts`)
- `GET /`: Lists active alerts.
- `PUT /:id`: Updates alert status (e.g., to `IN_PROGRESS` or `RESOLVED`).

## Real-Time API (Socket.IO)
- **Namespaces:**
  - `/readings`: Emits `meter:new-reading` for global telemetry.
  - `/alerts`: Emits `alert:new` and `alert:update`.
  - `/admin`: Emits `system:update` and `demo:state`.
  - `/consumer`: Emits tailored events via `to('consumer:ID')`.

## AI API (Internal FastAPI)
- `POST /predict-theft`: Requires `voltage`, `current`, `power_factor`, `kW`. Returns anomaly probability.
- `POST /predict-bill`: Returns end-of-month projected consumption.
- `POST /recommendations`: Returns array of actionable energy tips based on user cluster.
- `GET /health`: Returns loaded model status and latency.
