import mqtt from 'mqtt';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '../.env') });

const BROKER_URL = process.env.MQTT_BROKER_URL || 'mqtt://localhost:1883';
const SIMULATED_METERS = [
  'MTR-001',
  'MTR-002',
  'MTR-003',
  'MTR-004',
  'MTR-005',
];

console.log(`🔌 Initializing ESP32 Smart Meter Simulator...`);
console.log(`🔗 Connecting to broker: ${BROKER_URL}`);

const client = mqtt.connect(BROKER_URL, {
  clientId: `esp32_sim_${Math.random().toString(16).slice(2, 10)}`,
  clean: true,
});

function randomFloat(min: number, max: number, decimals: number = 2): number {
  return parseFloat((Math.random() * (max - min) + min).toFixed(decimals));
}

client.on('connect', () => {
  console.log('✅ Connected to MQTT Broker!');
  console.log('📡 Starting telemetry streaming...\n');

  // Start publishing loop for each meter
  SIMULATED_METERS.forEach((serialNumber, index) => {
    // Stagger starts
    setTimeout(() => {
      startSimulatingMeter(serialNumber);
    }, index * 1000);
  });
});

client.on('error', (err) => {
  console.error('❌ MQTT Error:', err);
  process.exit(1);
});

function startSimulatingMeter(serialNumber: string) {
  const topic = `powerguard/meters/${serialNumber}/readings`;
  
  // Base load for this meter
  const baseLoad = randomFloat(0.5, 3.0);
  let isTheftMode = false;

  setInterval(() => {
    // Occasionally switch to 'theft' mode (sudden drop in load)
    if (Math.random() < 0.05) {
      isTheftMode = !isTheftMode;
      if (isTheftMode) console.log(`\n⚠️ METER ${serialNumber} ENTERED THEFT MODE (Load dropped)`);
      else console.log(`\n✅ METER ${serialNumber} RETURNED TO NORMAL`);
    }

    const voltage = randomFloat(220, 240, 1);
    const current = isTheftMode ? randomFloat(0.1, 0.5) : baseLoad + randomFloat(-0.3, 0.3);
    const powerFactor = isTheftMode ? randomFloat(0.5, 0.7) : randomFloat(0.9, 0.99);
    
    // Value in kWh (mock calculation)
    const powerKW = (voltage * current * powerFactor) / 1000;
    // Assuming 5 second intervals, value in kWh for that interval
    const intervalValue = powerKW * (5 / 3600); 

    const payload = {
      serialNumber,
      value: parseFloat(intervalValue.toFixed(6)),
      voltage,
      current: parseFloat(current.toFixed(2)),
      powerFactor,
      frequency: randomFloat(49.9, 50.1, 2),
      timestamp: new Date().toISOString(),
    };

    client.publish(topic, JSON.stringify(payload), { qos: 1 }, (err) => {
      if (err) {
        console.error(`❌ Failed to publish for ${serialNumber}:`, err);
      } else {
        console.log(`[${serialNumber}] Published: V:${payload.voltage} I:${payload.current} PF:${payload.powerFactor}`);
      }
    });

  }, 5000); // Publish every 5 seconds
}
