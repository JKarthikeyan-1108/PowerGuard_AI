# PowerGuard Future Roadmap

## v1.1.0: Scalability & Queueing (Q4 2026)
- **Message Broker Integration:** Migrate AI inference calls from synchronous HTTP to RabbitMQ or Apache Kafka to ensure zero data loss and eliminate backpressure.
- **Database Partitioning:** Implement automated MySQL table partitioning by month for the `MeterReading` table.
- **Hardware mTLS:** Upgrade IoT authentication to utilize mutual TLS certificates for meters.

## v1.2.0: Advanced AI & Mobile (Q1 2027)
- **Deep Learning Models:** Upgrade Theft Detection from Random Forest to an LSTM-based neural network for better sequential pattern recognition.
- **Consumer Mobile App:** Release React Native iOS and Android applications for consumers to receive push notifications for high bills and recommendations.

## v2.0.0: Grid Digital Twin (Q3 2027)
- **Full Digital Twin:** Interactive 3D/GIS mapping of transformers, feeder lines, and meters.
- **Predictive Maintenance:** AI models predicting transformer degradation weeks before failure based on temperature and vibration IoT sensors (extending beyond just load monitoring).
- **Multi-Tenancy:** Architecture overhaul to support SaaS deployment for multiple utility companies on a single infrastructure cluster.
