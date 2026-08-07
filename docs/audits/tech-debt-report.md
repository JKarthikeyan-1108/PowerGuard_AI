# Technical Debt Report

While PowerGuard v2.0 introduces massive feature parity with legacy SCADA systems, certain architectural shortcuts were taken to achieve MVP delivery timelines.

## 1. Relational Telemetry Storage
- **Issue:** Currently, high-velocity time-series data (MeterReadings) is stored in a relational MySQL database. 
- **Impact:** As the platform scales to hundreds of thousands of meters reporting every 15 minutes, table locking and indexing on MySQL will become a massive bottleneck.
- **Remediation:** Migrate `MeterReading` and `HeartbeatLog` to a dedicated Time-Series Database (TSDB) like InfluxDB or TimescaleDB.

## 2. Synchronous Webhooks
- **Issue:** `webhook.service.ts` uses `Promise.allSettled` and `axios` to push HTTP payloads on the main Node.js thread.
- **Impact:** If a partner's ERP system responds slowly, it ties up active sockets in our Express server, potentially causing cascading latency.
- **Remediation:** Implement RabbitMQ or AWS SQS. Fire the event to the queue instantly, and let a dedicated background worker process dispatch the HTTP requests.

## 3. Mock AI & Simulation
- **Issue:** Much of the grid prediction, theft detection, and weather generation relies on simulated algorithms or simple rules rather than deeply trained ML models.
- **Impact:** Accuracy is acceptable for demos, but insufficient for enterprise production.
- **Remediation:** Connect the prediction pipelines to actual Google Cloud Vertex AI pipelines or BigQuery ML models trained on historical SCADA datasets.
