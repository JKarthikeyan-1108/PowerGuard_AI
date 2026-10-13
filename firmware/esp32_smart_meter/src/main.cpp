#include <Arduino.h>
#include <WiFiManager.h>
#include <PubSubClient.h>
#include <HTTPClient.h>
#include <WiFiClientSecure.h>
#include <PZEM004Tv30.h>
#include <ArduinoJson.h>
#include <vector>

// ── Ingestion Transport Settings ──────────────────────────────
#ifndef INGEST_API_URL
#define INGEST_API_URL "http://192.168.1.100:3000/api/ingest"
#endif

#ifndef IOT_API_KEY
#define IOT_API_KEY "powerguard-iot-secret-2026"
#endif

#ifndef ENABLE_HTTP_INGESTION
#define ENABLE_HTTP_INGESTION true
#endif

#ifndef ENABLE_MQTT_INGESTION
#define ENABLE_MQTT_INGESTION true
#endif

// ── Filtering Constants (EMA Filter) ──────────────────────────
const float EMA_ALPHA = 0.25;
float filteredVoltage = 0;
float filteredCurrent = 0;
float filteredPower = 0;

// ── Offline Buffer ────────────────────────────────────────────
std::vector<String> offlineBuffer;
const size_t MAX_BUFFER_SIZE = 60; // 5 mins of 5s readings

// ── Hardware Serial 2 for PZEM-004T ───────────────────────────
#if !defined(PZEM_RX_PIN) && !defined(PZEM_TX_PIN)
#define PZEM_RX_PIN 16
#define PZEM_TX_PIN 17
#endif

#ifndef METER_ID
#define METER_ID "MTR-001"
#endif

#ifndef MQTT_BROKER
#define MQTT_BROKER "192.168.1.100"
#endif

#ifndef MQTT_PORT
#define MQTT_PORT 1883
#endif

PZEM004Tv30 pzem(Serial2, PZEM_RX_PIN, PZEM_TX_PIN);
WiFiClient espClient;
PubSubClient mqttClient(espClient);

unsigned long lastReadingTime = 0;
unsigned long lastHeartbeatTime = 0;
const unsigned long readingInterval = 5000;   // 5 seconds
const unsigned long heartbeatInterval = 30000; // 30 seconds

String readingTopic = String("meters/") + METER_ID + "/reading";
String statusTopic = String("meters/") + METER_ID + "/status";
String heartbeatTopic = String("meters/") + METER_ID + "/heartbeat";
String alertTopic = String("meters/") + METER_ID + "/alert";

String configTopic = String("devices/config");
String updateTopic = String("devices/update");
String restartTopic = String("devices/restart");

void setup_wifi() {
  WiFiManager wm;
  // wm.resetSettings(); // Un-comment to reset Wi-Fi configuration
  bool res = wm.autoConnect("PowerGuard_SmartMeter", "powerguard");
  if(!res) {
    Serial.println("Failed to connect to WiFi. Restarting...");
    delay(3000);
    ESP.restart();
  } 
  Serial.println("WiFi Connected!");
  Serial.print("IP Address: ");
  Serial.println(WiFi.localIP());
}

void mqttCallback(char* topic, byte* payload, unsigned int length) {
  String message;
  for (int i = 0; i < length; i++) {
    message += (char)payload[i];
  }
  Serial.print("Message arrived [");
  Serial.print(topic);
  Serial.print("] ");
  Serial.println(message);

  if (String(topic) == restartTopic) {
    StaticJsonDocument<256> doc;
    DeserializationError error = deserializeJson(doc, message);
    if (!error && doc["meterId"] == METER_ID) {
      Serial.println("Restart command received. Restarting in 2 seconds...");
      delay(2000);
      ESP.restart();
    }
  }
}

void reconnectMQTT() {
  if (!ENABLE_MQTT_INGESTION) return;

  unsigned long startAttempt = millis();
  while (!mqttClient.connected() && millis() - startAttempt < 3000) {
    Serial.print("Attempting MQTT connection...");
    String lwtPayload = "{\"meterId\":\"" + String(METER_ID) + "\",\"status\":\"OFFLINE\"}";
    if (mqttClient.connect(METER_ID, NULL, NULL, statusTopic.c_str(), 1, true, lwtPayload.c_str())) {
      Serial.println("connected");
      String onlinePayload = "{\"meterId\":\"" + String(METER_ID) + "\",\"status\":\"ONLINE\"}";
      mqttClient.publish(statusTopic.c_str(), onlinePayload.c_str(), true);

      mqttClient.subscribe(configTopic.c_str());
      mqttClient.subscribe(updateTopic.c_str());
      mqttClient.subscribe(restartTopic.c_str());
    } else {
      Serial.print("failed, rc=");
      Serial.println(mqttClient.state());
      delay(1000);
    }
  }
}

// ── HTTP Ingestion: Direct Authenticated POST to /api/ingest ──
bool postReadingHttp(const String& jsonPayload) {
  if (WiFi.status() != WL_CONNECTED) return false;

  HTTPClient http;
  http.begin(INGEST_API_URL);
  http.addHeader("Content-Type", "application/json");
  http.addHeader("x-api-key", IOT_API_KEY);
  http.setTimeout(4000);

  int httpCode = http.POST(jsonPayload);
  if (httpCode == HTTP_CODE_CREATED || httpCode == HTTP_CODE_OK) {
    String response = http.getString();
    Serial.println("[HTTP 201] Ingested successfully into PowerGuard cloud.");

    // Parse ML inference result if present
    StaticJsonDocument<512> respDoc;
    if (deserializeJson(respDoc, response) == DeserializationError::Ok) {
      if (respDoc["mlInference"]["isAnomaly"] == true) {
        const char* risk = respDoc["mlInference"]["riskLevel"];
        Serial.print("🚨 [ML ALERT] Anomaly detected by cloud inference! Risk Level: ");
        Serial.println(risk);
      }
    }
    http.end();
    return true;
  } else {
    Serial.printf("[HTTP ERROR] Ingest failed, code: %d\n", httpCode);
    http.end();
    return false;
  }
}

void publishHeartbeat() {
  StaticJsonDocument<256> doc;
  doc["meterId"] = METER_ID;
  doc["status"] = "ONLINE";
  doc["firmwareVersion"] = "1.0.0-dual";
  doc["uptime"] = millis() / 1000;
  doc["wifiRssi"] = WiFi.RSSI();
  
  char buffer[256];
  serializeJson(doc, buffer);

  if (ENABLE_MQTT_INGESTION && mqttClient.connected()) {
    mqttClient.publish(heartbeatTopic.c_str(), buffer);
  }
  Serial.println("Heartbeat recorded.");
}

void processAndPublishReading() {
  float rawVoltage = pzem.voltage();
  float rawCurrent = pzem.current();
  float rawPower = pzem.power();
  float energy = pzem.energy();
  float frequency = pzem.frequency();
  float pf = pzem.pf();

  if(isnan(rawVoltage)) {
    Serial.println("Error reading voltage from PZEM-004T");
    if (ENABLE_MQTT_INGESTION && mqttClient.connected()) {
      StaticJsonDocument<256> alertDoc;
      alertDoc["meterId"] = METER_ID;
      alertDoc["type"] = "SENSOR_FAILURE";
      alertDoc["message"] = "Failed to read from PZEM-004T";
      char alertBuf[256];
      serializeJson(alertDoc, alertBuf);
      mqttClient.publish(alertTopic.c_str(), alertBuf);
    }
    return;
  }

  // Edge-Level Preprocessing (EMA Filter)
  if (filteredVoltage == 0) {
    filteredVoltage = rawVoltage;
    filteredCurrent = rawCurrent;
    filteredPower = rawPower;
  } else {
    filteredVoltage = (EMA_ALPHA * rawVoltage) + ((1 - EMA_ALPHA) * filteredVoltage);
    filteredCurrent = (EMA_ALPHA * rawCurrent) + ((1 - EMA_ALPHA) * filteredCurrent);
    filteredPower = (EMA_ALPHA * rawPower) + ((1 - EMA_ALPHA) * filteredPower);
  }

  StaticJsonDocument<512> doc;
  doc["meterId"] = METER_ID;
  doc["voltage"] = filteredVoltage;
  doc["current"] = filteredCurrent;
  doc["power"] = filteredPower;
  doc["cumulativeEnergyKwh"] = energy;
  doc["frequency"] = isnan(frequency) ? 50.0 : frequency;
  doc["powerFactor"] = isnan(pf) ? 0.95 : pf;
  doc["dataSource"] = "ESP32_PZEM004T";
  doc["isSimulated"] = false;

  JsonObject metadata = doc.createNestedObject("metadata");
  metadata["firmwareVersion"] = "1.0.0-dual";
  metadata["wifiRssi"] = WiFi.RSSI();
  metadata["sensorStatus"] = "ONLINE";

  char buffer[512];
  serializeJson(doc, buffer);
  String payload = String(buffer);

  bool delivered = false;

  // 1. Direct Authenticated HTTP Ingestion
  if (ENABLE_HTTP_INGESTION) {
    delivered = postReadingHttp(payload);
  }

  // 2. MQTT Ingestion
  if (ENABLE_MQTT_INGESTION && mqttClient.connected()) {
    mqttClient.publish(readingTopic.c_str(), buffer);
    delivered = true;
    Serial.println("Reading published via MQTT.");
  }

  // 3. Fallback Offline Buffering
  if (!delivered) {
    if (offlineBuffer.size() < MAX_BUFFER_SIZE) {
      offlineBuffer.push_back(payload);
      Serial.println("Offline. Reading stored in RAM buffer.");
    } else {
      Serial.println("Offline buffer full, dropping oldest reading.");
      offlineBuffer.erase(offlineBuffer.begin());
      offlineBuffer.push_back(payload);
    }
  }
}

void setup() {
  Serial.begin(115200);
  delay(1000);

  Serial.println("==================================================");
  Serial.println("⚡ PowerGuard Smart Meter ESP32 Starting... ⚡");
  Serial.println("==================================================");

  setup_wifi();

  if (ENABLE_MQTT_INGESTION) {
    mqttClient.setServer(MQTT_BROKER, MQTT_PORT);
    mqttClient.setCallback(mqttCallback);
  }

  delay(1500);
}

void loop() {
  if (ENABLE_MQTT_INGESTION) {
    if (!mqttClient.connected()) {
      reconnectMQTT();
    }
    mqttClient.loop();
  }

  // Flush offline buffer if connectivity restored
  if (WiFi.status() == WL_CONNECTED && offlineBuffer.size() > 0) {
    String bufferedPayload = offlineBuffer.front();
    bool sent = false;
    if (ENABLE_HTTP_INGESTION) {
      sent = postReadingHttp(bufferedPayload);
    } else if (ENABLE_MQTT_INGESTION && mqttClient.connected()) {
      sent = mqttClient.publish(readingTopic.c_str(), bufferedPayload.c_str());
    }

    if (sent) {
      offlineBuffer.erase(offlineBuffer.begin());
      Serial.println("Buffered reading flushed successfully.");
    }
  }

  unsigned long now = millis();

  if (now - lastReadingTime > readingInterval) {
    lastReadingTime = now;
    processAndPublishReading();
  }

  if (now - lastHeartbeatTime > heartbeatInterval) {
    lastHeartbeatTime = now;
    publishHeartbeat();
  }
}
