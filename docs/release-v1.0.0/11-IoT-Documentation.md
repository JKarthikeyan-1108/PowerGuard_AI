# IoT & MQTT Documentation

PowerGuard relies on the MQTT protocol for lightweight, high-frequency IoT telemetry from physical smart meters.

## MQTT Broker Configuration
- **Protocol:** MQTT v5 or v3.1.1.
- **TLS:** MQTTS over Port 8883 is strictly required in production for payload encryption.
- **QoS:** We use QoS 1 (At least once delivery) for telemetry to balance reliability and throughput.

## Topic Structure

### 1. Telemetry
- **Topic:** `meters/{serialNumber}/reading`
- **Payload:** 
  ```json
  {
    "serialNumber": "MTR-123",
    "value": 15.4,
    "voltage": 230.1,
    "current": 10.2,
    "powerFactor": 0.95,
    "frequency": 50.0,
    "timestamp": "2026-08-07T12:00:00Z"
  }
  ```

### 2. Heartbeat & Status
- **Topic:** `meters/{serialNumber}/heartbeat`
- **Payload:** 
  ```json
  {
    "serialNumber": "MTR-123",
    "status": "ONLINE",
    "uptime": 36000
  }
  ```
- **LWT (Last Will and Testament):** Meters must be configured to publish `{ "status": "OFFLINE" }` to their status topic upon ungraceful disconnect.

## Backend Processing
The `mqtt.service.ts` module in the Node.js backend subscribes to wildcard topics (`meters/+/reading`). It parses the JSON, validates it against the expected schema, and triggers the `ReadingProcessor` class, which handles DB insertion, AI inference, and Socket.IO broadcasting.
