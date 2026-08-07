# Database Architecture

PowerGuard utilizes a fully normalized MySQL 8 relational database managed through Prisma ORM. 

## Entity Relationship Diagram

```mermaid
erDiagram
    User ||--o{ Role : has
    User ||--o| ConsumerProfile : "can be"
    User ||--o| UtilityOfficer : "can be"
    User ||--o{ AuditLog : generates
    User ||--o{ Notification : receives
    
    ConsumerProfile ||--o{ Meter : owns
    ConsumerProfile }o--o| Area : "belongs to"
    ConsumerProfile ||--o{ BillPrediction : has
    
    Area ||--o{ Transformer : contains
    Transformer ||--o{ Meter : supplies
    
    Meter ||--o{ MeterReading : generates
    Meter ||--o{ HeartbeatLog : generates
    Meter ||--o{ ConnectionLog : generates
    Meter ||--o| DeviceConfig : has
    Meter ||--o{ Alert : triggers
    Meter ||--o{ TheftPrediction : has
```

## Core Models

1. **User / RBAC**: Manages authentication (`User`), authorization (`Role`, `Permission`), and security state (account lockouts, tokens).
2. **Profiles**: Separates domain logic into `ConsumerProfile`, `UtilityOfficer`, and `AdminProfile`.
3. **Meters & Grid**: `Area`, `Transformer`, and `Meter` form the hierarchical grid topology.
4. **Telemetry Data**: `MeterReading`, `HeartbeatLog`, and `ConnectionLog` handle the high-velocity IoT data insertion.
5. **Insights & Alerts**: `Alert`, `TheftPrediction`, `BillPrediction` store the output from the AI models and system rules.
6. **Audit**: `AuditLog` provides an immutable history of sensitive administrative actions.
