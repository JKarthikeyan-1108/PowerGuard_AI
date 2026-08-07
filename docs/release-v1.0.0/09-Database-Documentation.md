# Database Documentation

PowerGuard uses MySQL 8.0+, managed via Prisma ORM.

## Schema Overview

The database is highly relational, centering around the `Meter` and its associated `MeterReading` records.

### Core Entities

- **User:** System users (Admin, Utility Officer, Consumer). Handles authentication.
- **Consumer:** Detailed profile for a household/business. Links to a User account.
- **Transformer:** Grid infrastructure nodes. Groups multiple meters geographically.
- **Meter:** The physical IoT device. Links to a Consumer and a Transformer.
- **MeterReading:** High-volume time-series data. Stores voltage, current, power factor, and kW values.

### Analytics & Alerts Entities

- **Alert:** System-generated notifications (Theft, Outage, Tampering).
- **TheftPrediction:** Historical AI inference results indicating probability of theft.
- **BillPrediction:** AI-generated monthly bill forecasts.
- **EnergyForecast:** Macro-level grid demand predictions.
- **Recommendation:** AI-generated energy saving tips for consumers.

### Observability Entities
- **HeartbeatLog:** Tracks device uptime and connectivity state.
- **ConnectionLog:** Tracks disconnect/reconnect events.
- **AuditLog:** Cryptographically tracks sensitive system actions.

## Indexing Strategy
To handle large volumes of time-series data, the following indexes are critical and applied in the Prisma schema:
- `MeterReading`: Index on `(meterId, timestamp)` for fast retrieval of a specific meter's history.
- `Alert`: Index on `(status, severity)` for quick dashboard filtering.

## Maintenance
It is recommended to implement a data-archiving strategy for `MeterReading` table after 12 months, moving old telemetry to cold storage (e.g., AWS S3 or a data warehouse) to maintain relational database performance.
