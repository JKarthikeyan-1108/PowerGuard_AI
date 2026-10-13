# PowerGuard AI — REST API Documentation & Integration Specification

## 1. Overview & Base URLs

PowerGuard AI provides unified serverless REST endpoints deployed on Vercel and accessible across web dashboards, mobile applications, and ESP32 hardware meters.

- **Local Base URL**: `http://localhost:3000`
- **Vercel Production URL**: `https://<your-project>.vercel.app`
- **Content-Type**: `application/json`

---

## 2. API Endpoints

### 2.1 Smart Meter Telemetry Ingestion (`POST /api/ingest`)

Receives, validates, and stores electrical readings transmitted by ESP32 microcontrollers or the sensor simulator. Automatically triggers ML anomaly evaluation.

#### Headers
```http
Content-Type: application/json
x-api-key: powerguard-iot-secret-2026
```

#### Request Payload
```json
{
  "meterId": "MTR-001",
  "consumerId": "usr-consumer-1",
  "voltage": 231.45,
  "current": 12.83,
  "power": 2780.20,
  "powerFactor": 0.935,
  "frequency": 50.02,
  "cumulativeEnergyKwh": 1420.584,
  "timestamp": "2026-10-13T12:45:00.000Z",
  "dataSource": "ESP32_PZEM004T",
  "isSimulated": false,
  "metadata": {
    "firmwareVersion": "1.0.0",
    "wifiRssi": -62,
    "sensorStatus": "NORMAL"
  }
}
```

#### Response (`201 Created`)
```json
{
  "status": "success",
  "readingId": "rdg_1791894982123_a9b1c",
  "meterId": "MTR-001",
  "timestamp": "2026-10-13T12:45:00.000Z",
  "validationStatus": "VALID",
  "isSimulated": false,
  "mlInference": {
    "isAnomaly": false,
    "anomalyScore": 0.0845,
    "riskLevel": "NORMAL"
  }
}
```

#### Validation Error (`400 Bad Request`)
```json
{
  "error": "Malformed or out-of-range sensor reading",
  "validationErrors": {
    "voltage": ["Voltage too high (>350V)"],
    "current": ["Current cannot be negative"]
  }
}
```

---

### 2.2 Machine Learning Anomaly Prediction (`POST /api/predict`)

Executes Isolation Forest anomaly scoring on validated electrical parameters. Computes normalized feature z-scores and provides explanatory diagnostic rationales.

#### Request Payload
```json
{
  "meterId": "MTR-002",
  "consumerId": "usr-consumer-2",
  "voltage": 229.50,
  "current": 0.08,
  "power": 18.36,
  "powerFactor": 0.42,
  "frequency": 50.01,
  "cumulativeEnergyKwh": 890.25,
  "timestamp": "2026-10-13T18:30:00.000Z"
}
```

#### Response (`200 OK` — Anomaly Detected)
```json
{
  "status": "success",
  "meterId": "MTR-002",
  "consumerId": "usr-consumer-2",
  "timestamp": "2026-10-13T18:30:00.000Z",
  "modelVersion": "v1.0",
  "isAnomaly": true,
  "anomalyScore": -0.0682,
  "riskLevel": "HIGH_RISK",
  "confidenceScore": 0.945,
  "featureImportance": {
    "current": 0.485,
    "apparent_power": 0.280,
    "power_factor": 0.165,
    "voltage": 0.045,
    "frequency": 0.025
  },
  "explanation": "Investigation Alert: Near-zero current recorded during active hours with nominal grid voltage. Potential meter shunt bypass or neutral tamper.",
  "featuresUsed": {
    "voltage": 229.50,
    "current": 0.08,
    "power": 18.36,
    "powerFactor": 0.42,
    "frequency": 50.01,
    "apparentPower": 0.018,
    "hourSin": -0.966,
    "hourCos": -0.259
  },
  "notice": "Anomalies represent investigation alerts for grid operators, not definitive proof of electricity theft."
}
```

---

### 2.3 Interactive Sensor Simulator (`POST /api/simulator`)

Triggers synthetic meter telemetry for testing and live demonstration. Automatically flags generated readings as simulated.

#### Request Payload
```json
{
  "meterId": "MTR-001",
  "mode": "TAMPER_BYPASS"
}
```
*Supported modes*: `"NORMAL"`, `"TAMPER_BYPASS"`, `"OVERLOAD"`, `"LOW_PF"`.

#### Response (`200 OK`)
```json
{
  "status": "success",
  "simulationMode": "TAMPER_BYPASS",
  "reading": {
    "meterId": "MTR-001",
    "voltage": 230.82,
    "current": 0.114,
    "power": 10.98,
    "powerFactor": 0.42,
    "frequency": 50.04,
    "cumulativeEnergyKwh": 1251.24,
    "timestamp": "2026-10-13T13:00:00.000Z",
    "dataSource": "SIMULATOR_THEFT",
    "isSimulated": true
  },
  "ingestResult": {
    "status": "success",
    "readingId": "rdg_1791895123987_sim4",
    "mlInference": {
      "isAnomaly": true,
      "riskLevel": "HIGH_RISK"
    }
  },
  "notice": "SIMULATION DATA: Clearly flagged as simulated test reading and distinct from physical ESP32 meter data."
}
```

---

### 2.4 System Health Check (`GET /api/health`)

Returns real-time service health, model version, and Firebase connectivity mode.

#### Response (`200 OK`)
```json
{
  "status": "healthy",
  "service": "PowerGuard AI Platform",
  "timestamp": "2026-10-13T13:05:00.000Z",
  "uptimeSeconds": 1420,
  "mlEngine": {
    "status": "active",
    "modelName": "PowerGuard_IsolationForest_AnomalyDetector",
    "version": "v1.0",
    "algorithm": "Isolation Forest (Unsupervised)",
    "featureCount": 8
  },
  "firebase": {
    "clientConfigured": true,
    "adminConfigured": true,
    "mode": "cloud"
  },
  "endpoints": {
    "predict": "/api/predict",
    "ingest": "/api/ingest",
    "simulator": "/api/simulator",
    "health": "/api/health"
  }
}
```
