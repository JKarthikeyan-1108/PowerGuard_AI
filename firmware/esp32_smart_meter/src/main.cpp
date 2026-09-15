#include <Arduino.h>
#include <WiFiManager.h>
#include <PubSubClient.h>
#include <PZEM004Tv30.h>
#include <ArduinoJson.h>
#include <vector>

// EMA Filter constant
const float EMA_ALPHA = 0.2;

// Filtered values
float filteredVoltage = 0;
float filteredCurrent = 0;
float filteredPower = 0;

// Offline Buffer
std::vector<String> offlineBuffer;
const size_t MAX_BUFFER_SIZE = 60; // 5 mins of 5s readings

// Hardware Serial 2 for PZEM-004T
#if !defined(PZEM_RX_PIN) && !defined(PZEM_TX_PIN)
#define PZEM_RX_PIN 16
#define PZEM_TX_PIN 17
#endif

#ifndef METER_ID
#define METER_ID "PG001"
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
  // wm.resetSettings(); // Un-comment to wipe WiFi settings for testing
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
  while (!mqttClient.connected()) {
    Serial.print("Attempting MQTT connection...");
    // Setup Last Will and Testament (LWT)
    String lwtPayload = "{\"meterId\":\"" + String(METER_ID) + "\",\"status\":\"OFFLINE\"}";
    if (mqttClient.connect(METER_ID, NULL, NULL, statusTopic.c_str(), 1, true, lwtPayload.c_str())) {
      Serial.println("connected");
      
      // Publish ONLINE status
      String onlinePayload = "{\"meterId\":\"" + String(METER_ID) + "\",\"status\":\"ONLINE\"}";
      mqttClient.publish(statusTopic.c_str(), onlinePayload.c_str(), true); // Retained

      // Subscribe to topics
      mqttClient.subscribe(configTopic.c_str());
      mqttClient.subscribe(updateTopic.c_str());
      mqttClient.subscribe(restartTopic.c_str());
    } else {
      Serial.print("failed, rc=");
      Serial.print(mqttClient.state());
      Serial.println(" try again in 5 seconds");
      delay(5000);
    }
  }
}

void publishHeartbeat() {
  StaticJsonDocument<256> doc;
  doc["meterId"] = METER_ID;
  doc["status"] = "ONLINE";
  doc["firmwareVersion"] = "1.0.0";
  doc["uptime"] = millis() / 1000;
  
  char buffer[256];
  serializeJson(doc, buffer);
  mqttClient.publish(heartbeatTopic.c_str(), buffer);
  Serial.println("Heartbeat published.");
}

void processAndPublishReading() {
  float rawVoltage = pzem.voltage();
  float rawCurrent = pzem.current();
  float rawPower = pzem.power();
  float energy = pzem.energy();
  float frequency = pzem.frequency();
  float pf = pzem.pf();

  if(isnan(rawVoltage)) {
    Serial.println("Error reading voltage");
    if (mqttClient.connected()) {
      // Send alert
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
  if (filteredVoltage == 0) { // First reading
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
  doc["energy"] = energy;
  doc["frequency"] = frequency;
  doc["powerFactor"] = pf;
  doc["timestamp"] = ""; // The server will stamp it if empty, or we could sync NTP.

  char buffer[512];
  serializeJson(doc, buffer);
  String payload = String(buffer);

  if (mqttClient.connected()) {
    mqttClient.publish(readingTopic.c_str(), buffer);
    Serial.println("Reading published.");
  } else {
    // Fail-Safe Buffering
    if (offlineBuffer.size() < MAX_BUFFER_SIZE) {
      offlineBuffer.push_back(payload);
      Serial.println("Offline. Reading buffered.");
    } else {
      Serial.println("Offline. Buffer full, dropping reading.");
    }
  }
}

void setup() {
  Serial.begin(115200);
  delay(1000);

  Serial.println("PowerGuard Smart Meter Starting...");

  setup_wifi();

  mqttClient.setServer(MQTT_BROKER, MQTT_PORT);
  mqttClient.setCallback(mqttCallback);

  // Allow some time for PZEM to initialize
  delay(2000);
}

void loop() {
  if (!mqttClient.connected()) {
    reconnectMQTT();
  } else {
    // Flush offline buffer if any
    while (offlineBuffer.size() > 0 && mqttClient.connected()) {
      String payload = offlineBuffer.front();
      if (mqttClient.publish(readingTopic.c_str(), payload.c_str())) {
        offlineBuffer.erase(offlineBuffer.begin());
        Serial.println("Buffered reading published.");
        delay(50); // Small delay to avoid flooding
      } else {
        break; // Stop flushing if publish fails
      }
    }
  }
  
  mqttClient.loop();

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
