// ============================================================
// PowerGuard - Smart Meter Simulator
// Generates realistic meter readings every 5 seconds
// Simulates voltage, current, power, energy, frequency, PF
// Can inject anomalies for ML training
// ============================================================

const INTERVAL_MS = 5000; // 5 seconds
const ANOMALY_RATE = 0.05; // 5% chance of anomaly

const meters = [
  { meterId: 'MTR-001', area: 'Sector 15', baseLoad: 1.5 },
  { meterId: 'MTR-002', area: 'Model Town', baseLoad: 2.0 },
  { meterId: 'MTR-003', area: 'Civil Lines', baseLoad: 1.8 },
  { meterId: 'MTR-047', area: 'Sector 15', baseLoad: 3.5, suspicious: true },
  { meterId: 'MTR-089', area: 'Civil Lines', baseLoad: 0.5, offline: true },
];

let cumulativeEnergy = {};
let isRunning = false;

/**
 * Generate a single meter reading
 */
function generateReading(meter) {
  const isAnomaly = meter.suspicious ? Math.random() < 0.3 : Math.random() < ANOMALY_RATE;
  
  let voltage, current, powerFactor;

  if (isAnomaly && meter.suspicious) {
    // Theft pattern: unexpectedly low reading
    voltage = 220 + Math.random() * 20;
    current = 0.01 + Math.random() * 0.1;
    powerFactor = 0.1 + Math.random() * 0.2;
  } else if (isAnomaly) {
    const anomalyType = Math.random();
    if (anomalyType < 0.33) {
      // Voltage anomaly
      voltage = Math.random() < 0.5 ? 180 + Math.random() * 20 : 250 + Math.random() * 20;
      current = meter.baseLoad + (Math.random() - 0.5) * 2;
      powerFactor = 0.7 + Math.random() * 0.3;
    } else if (anomalyType < 0.66) {
      // Current spike
      voltage = 225 + Math.random() * 15;
      current = 15 + Math.random() * 30;
      powerFactor = 0.3 + Math.random() * 0.3;
    } else {
      // Power factor drop
      voltage = 225 + Math.random() * 15;
      current = meter.baseLoad + Math.random() * 3;
      powerFactor = 0.1 + Math.random() * 0.3;
    }
  } else {
    // Normal reading
    const hourOfDay = new Date().getHours();
    let loadMultiplier = 1.0;
    if (hourOfDay >= 6 && hourOfDay <= 9) loadMultiplier = 1.5;
    if (hourOfDay >= 17 && hourOfDay <= 22) loadMultiplier = 2.0;
    if (hourOfDay >= 23 || hourOfDay <= 5) loadMultiplier = 0.3;
    
    voltage = 225 + Math.random() * 15;
    current = meter.baseLoad * loadMultiplier + (Math.random() - 0.5) * 1.5;
    current = Math.max(0.1, current);
    powerFactor = 0.8 + Math.random() * 0.2;
  }

  const power = voltage * current * powerFactor;
  const frequency = 49.5 + Math.random();
  
  // Cumulative energy
  if (!cumulativeEnergy[meter.meterId]) {
    cumulativeEnergy[meter.meterId] = 100 + Math.random() * 200;
  }
  cumulativeEnergy[meter.meterId] += (power / 1000) * (INTERVAL_MS / 3600000); // kWh increment

  return {
    meterId: meter.meterId,
    area: meter.area,
    voltage: Math.round(voltage * 10) / 10,
    current: Math.round(Math.abs(current) * 100) / 100,
    power: Math.round(power * 10) / 10,
    energy: Math.round(cumulativeEnergy[meter.meterId] * 100) / 100,
    frequency: Math.round(frequency * 100) / 100,
    powerFactor: Math.round(powerFactor * 100) / 100,
    isAnomaly,
    anomalyType: isAnomaly ? (meter.suspicious ? 'theft_pattern' : 'sensor_anomaly') : null,
    timestamp: new Date().toISOString(),
    status: meter.offline ? 'offline' : 'active',
  };
}

/**
 * Start the meter simulator
 * @param {Function} broadcastFn - Function to broadcast data to WebSocket clients
 */
function startSimulator(broadcastFn) {
  if (isRunning) return;
  isRunning = true;
  
  console.log('🔌 Smart Meter Simulator started (interval: 5s)');
  
  setInterval(() => {
    const readings = meters
      .filter(m => !m.offline)
      .map(meter => generateReading(meter));
    
    readings.forEach(reading => {
      if (broadcastFn) {
        broadcastFn(reading);
      }
    });
    
    // Log summary
    const anomalies = readings.filter(r => r.isAnomaly).length;
    if (anomalies > 0) {
      console.log(`⚠️  Simulator: ${readings.length} readings, ${anomalies} anomalies detected`);
    }
  }, INTERVAL_MS);
}

/**
 * Stop the simulator
 */
function stopSimulator() {
  isRunning = false;
  console.log('🛑 Smart Meter Simulator stopped');
}

module.exports = { startSimulator, stopSimulator, generateReading };
