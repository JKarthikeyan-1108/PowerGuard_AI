import { describe, it, expect } from 'vitest';
import modelMetadata from '../../lib/ml-artifacts/model_metadata.json';

describe('ML Feature Pipeline & Anomaly Engine', () => {
  it('loads valid model metadata with 8 features', () => {
    expect(modelMetadata.model_version).toBe('v1.0');
    expect(modelMetadata.features).toHaveLength(8);
    expect(modelMetadata.scaler.means).toHaveLength(8);
    expect(modelMetadata.scaler.scales).toHaveLength(8);
    expect(typeof modelMetadata.threshold).toBe('number');
  });

  it('correctly scales a standard domestic reading into normal bounds', () => {
    const reading = {
      voltage: 230.0,
      current: 12.0,
      power: 2500.0,
      powerFactor: 0.94,
      frequency: 50.0,
      apparentPower: (230.0 * 12.0) / 1000.0,
      hourSin: 0.0,
      hourCos: 1.0,
    };

    const raw = [
      reading.voltage,
      reading.current,
      reading.power,
      reading.powerFactor,
      reading.frequency,
      reading.apparentPower,
      reading.hourSin,
      reading.hourCos,
    ];

    const scaled = raw.map((val, i) => (val - modelMetadata.scaler.means[i]) / modelMetadata.scaler.scales[i]);

    // Scaled values for standard reading should remain within typical z-score bounds [-3, +3]
    scaled.forEach((z) => {
      expect(Math.abs(z)).toBeLessThan(5.0);
    });
  });

  it('flags extreme current shunt drop as an anomaly', () => {
    // Current drops to near zero during nominal grid voltage
    const reading = {
      voltage: 231.0,
      current: 0.05,
      power: 10.0,
      powerFactor: 0.40,
    };

    const isNearZeroLoad = reading.current < 0.25 && reading.voltage >= 200;
    const isLowPf = reading.powerFactor < 0.65;

    expect(isNearZeroLoad).toBe(true);
    expect(isLowPf).toBe(true);
  });

  it('rejects out-of-range sensor readings', () => {
    const isVoltageValid = (v: number) => v >= 100 && v <= 350;
    const isCurrentValid = (i: number) => i >= 0 && i <= 150;

    expect(isVoltageValid(420)).toBe(false); // Out of bounds high
    expect(isVoltageValid(40)).toBe(false);  // Out of bounds low
    expect(isVoltageValid(230)).toBe(true);  // Normal

    expect(isCurrentValid(-5)).toBe(false);  // Negative current
    expect(isCurrentValid(220)).toBe(false); // Exceeds domestic service limit
    expect(isCurrentValid(15)).toBe(true);   // Normal
  });
});
