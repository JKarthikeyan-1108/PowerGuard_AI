import mqtt from 'mqtt';

const BROKER_URL = process.env.MQTT_BROKER_URL || 'mqtt://localhost:1883';
const METERS_COUNT = parseInt(process.env.SIMULATOR_METERS || '10');
const INTERVAL_MS = parseInt(process.env.SIMULATOR_INTERVAL || '5000');

console.log(`🔌 ESP32 Simulator connecting to ${BROKER_URL}`);
const client = mqtt.connect(BROKER_URL, {
  clientId: `esp32_simulator_${Math.random().toString(16).slice(2, 10)}`,
});

// Generate some fake serial numbers
const meters = Array.from({ length: METERS_COUNT }).map((_, i) => {
  return `MTR-SIM-${String(i + 1).padStart(3, '0')}`;
});

const randomFloat = (min: number, max: number) => parseFloat((Math.random() * (max - min) + min).toFixed(2));

client.on('connect', () => {
  console.log('✅ Connected to MQTT broker. Starting simulation...');

  // Send initial online status
  meters.forEach((meter) => {
    client.publish(`meters/${meter}/status`, JSON.stringify({ status: 'ONLINE', timestamp: new Date() }), { retain: true });
  });

  setInterval(() => {
    meters.forEach((meter) => {
      // 2% chance meter goes offline randomly
      if (Math.random() < 0.02) {
        client.publish(`meters/${meter}/heartbeat`, JSON.stringify({ status: 'OFFLINE', timestamp: new Date() }));
        return; // skip reading
      }

      // 5% chance of anomaly (theft / overload)
      const isAnomaly = Math.random() < 0.05;
      
      let voltage = randomFloat(220, 240);
      let current = randomFloat(2, 15);
      
      if (isAnomaly) {
        // Overload / Theft simulation
        current = randomFloat(30, 50); // Massive spike
        voltage = randomFloat(200, 215); // Voltage drop
        
        // Publish an alert
        client.publish(`meters/${meter}/alert`, JSON.stringify({
          type: 'HIGH_CONSUMPTION',
          severity: 'HIGH',
          title: 'Unusual Spike Detected',
          description: `Current surged to ${current}A causing voltage drop.`,
          timestamp: new Date()
        }));
      }

      const powerFactor = randomFloat(0.85, 0.99);
      const frequency = randomFloat(49.8, 50.2);
      const power = (voltage * current * powerFactor) / 1000; // kW
      
      const payload = {
        serialNumber: meter,
        value: randomFloat(0.1, 5.0), // incremental energy addition
        voltage,
        current,
        powerFactor,
        frequency,
        power,
        temperature: randomFloat(25, 45), // degrees celsius
        timestamp: new Date().toISOString()
      };

      // Publish Reading
      client.publish(`meters/${meter}/reading`, JSON.stringify(payload));
      
      // Publish Heartbeat
      client.publish(`meters/${meter}/heartbeat`, JSON.stringify({ status: 'ONLINE', timestamp: new Date() }));
    });
  }, INTERVAL_MS);
});

client.on('error', (err) => {
  console.error('MQTT Error:', err);
});
