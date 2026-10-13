# PowerGuard AI — IoT Integration & Smart Meter Guide (ESP32 + PZEM-004T)

## 1. Hardware Overview

PowerGuard AI interfaces with physical edge hardware built around the **Espressif ESP32** microcontroller and the **Peacefair PZEM-004T v3.0** AC Energy Monitoring Module.

```
+-------------------------------------------------------------+
|                      AC MAINS (230V / 50Hz)                 |
|       Line (L)  ------------------[ CT Coil ]-----> Load    |
|       Neutral (N) --------------------------------> Load    |
+-------------------------------------------------------------+
                            |     |
              AC Voltage    |     | Current CT Sensing
                            v     v
                  +-----------------------+
                  |     PZEM-004T v3.0    |
                  |  Optically Isolated   |
                  +-----------------------+
                     5V | GND | TX | RX
                     |    |     |    |
                     v    v     v    v
                  +-----------------------+
                  |     ESP32 DevKit      |
                  |   UART2 (GPIO 16/17)  |
                  |     Wi-Fi 802.11b/g/n |
                  +-----------------------+
                            |
                   HTTPS POST / MQTT TLS
                            v
               +-----------------------------+
               |  PowerGuard Cloud / Vercel  |
               |       /api/ingest           |
               +-----------------------------+
```

### Hardware Specifications

| Component | Function | Operating Range | Accuracy / Precision |
| :--- | :--- | :--- | :--- |
| **ESP32 DevKit V1** | Dual-core Xtensa 240MHz, 2.4GHz Wi-Fi, 4MB Flash | 3.3V Logic | Real-time edge processing & EMA filtering |
| **PZEM-004T v3.0** | High-precision AC energy sensor with optocoupler isolation | 80V – 260V AC, 0 – 100A | Class 1.0 (1.0% voltage/current precision) |
| **Current Transformer (CT)** | Non-invasive Split-core or solid core coil | 0 – 100A RMS | Galvanically isolated AC current sensing |

### Pin Connection Diagram

| PZEM-004T Pin | ESP32 Pin | Note |
| :--- | :--- | :--- |
| `5V` | `5V (VIN)` | External 5V power supply to PZEM module |
| `GND` | `GND` | Common ground |
| `TX` | `GPIO 16 (RX2)` | Serial2 RX (data from PZEM to ESP32) |
| `RX` | `GPIO 17 (TX2)` | Serial2 TX (commands from ESP32 to PZEM) |

---

## 2. Ingestion Interface Specification

Smart meter firmware communicates with PowerGuard AI through authenticated HTTPS endpoints or MQTT topics.

### Authenticated HTTP Endpoint

- **Method**: `POST`
- **Path**: `/api/ingest`
- **Headers**:
  ```http
  Content-Type: application/json
  x-api-key: <IOT_DEVICE_API_KEY>
  ```

### JSON Telemetry Payload

```json
{
  "meterId": "PG-ESP32-001",
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

### Payload Validation Rules

The API applies strict physical bounds validation. Readings failing these criteria are rejected with HTTP 400 Bad Request:

| Parameter | Allowed Range | Unit | Action on Breach |
| :--- | :--- | :--- | :--- |
| `voltage` | `100.0` – `350.0` | Volts RMS | Rejected (potential sensor failure) |
| `current` | `0.0` – `150.0` | Amperes RMS | Rejected (exceeds domestic capacity) |
| `power` | `0.0` – `50000.0` | Watts | Rejected (out of range) |
| `powerFactor` | `0.00` – `1.00` | Dimensionless | Rejected |
| `frequency` | `45.0` – `65.0` | Hertz | Rejected |
| `cumulativeEnergyKwh` | $\ge 0.0$ | kWh | Rejected |

---

## 3. Sensor Simulator (Testing & Demo Without Hardware)

When ESP32 hardware is not physically connected, PowerGuard includes a simulation suite that generates physically calibrated data clearly marked with `"isSimulated": true`.

### Running the Python CLI Simulator

```bash
# Automated mode (regular household diurnal profile with occasional anomalies)
python scripts/sensor_simulator.py --url http://localhost:3000/api/ingest --iterations 20

# Force specific physical test patterns:
python scripts/sensor_simulator.py --mode bypass   # Shunt tap / bypass simulation
python scripts/sensor_simulator.py --mode surge    # Extreme current overload
python scripts/sensor_simulator.py --mode low_pf   # Severe phase angle manipulation
```

### Web UI Interactive Simulator

Utility operators and administrators can trigger real-time simulated telemetry directly from the web dashboard:
- **Endpoint**: `POST /api/simulator`
- **Body**: `{"meterId": "MTR-001", "mode": "TAMPER_BYPASS"}`
- Responses are processed through the complete ML pipeline and reflected on the active dashboard.
