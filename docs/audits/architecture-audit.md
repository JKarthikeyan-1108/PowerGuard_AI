# Architecture & Tech Stack Audit

## Overview
PowerGuard v2.0 represents a successful evolution from a single-tenant monolith to a highly scalable, multi-tenant B2B SaaS platform.

## Frontend Architecture
- **Framework:** Next.js 14 (App Router) with React 19.
- **Styling:** Tailwind CSS + Radix UI (shadcn/ui) for a heavily optimized, accessible, and theme-able design system.
- **State Management:** React Context API for global state (Auth, Theme), local state via hooks.
- **PWA:** Integrated Service Workers for offline support, caching, and mobile-installability.
- **Real-time:** `socket.io-client` for live Digital Twin updates and anomaly alerts.

## Backend Architecture
- **Framework:** Node.js with Express and TypeScript.
- **ORM:** Prisma Client connected to MySQL (relational).
- **Multi-Tenancy:** Logical Isolation. A unified database partitioned dynamically via `organizationId` attached to all core tables. Tenant context is derived via JWT or `x-api-key` in a custom `tenant.ts` middleware.
- **Real-time:** `Socket.io` server attached to the HTTP server for pushing telemetry to clients.
- **Integration Layer:** `axios` for outbound Webhooks, API Key middleware for inbound M2M requests (SCADA/ERP).

## AI Architecture
- **LLM Engine:** Google GenAI SDK (Gemini).
- **Technique:** RAG (Retrieval-Augmented Generation). Live database context (Active Alerts, Load predictions) combined with external context (Weather API, Holiday Calendar) is injected into system prompts dynamically based on user role.

## Future Architecture Considerations (v3.0)
- **Message Queues:** Replace synchronous webhook dispatching with an asynchronous event bus (RabbitMQ / Kafka) to handle high-velocity telemetry without blocking the Node event loop.
- **Timeseries Database:** Migrate raw Meter Reading telemetry from MySQL to InfluxDB or TimescaleDB for vastly improved read/write performance at scale.
