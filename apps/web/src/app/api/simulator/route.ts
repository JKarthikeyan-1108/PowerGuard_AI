import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const meterId = body.meterId || 'MTR-001';
    const mode = body.mode || 'NORMAL'; // 'NORMAL' | 'TAMPER_BYPASS' | 'OVERLOAD' | 'LOW_PF'

    let voltage = 230.0 + (Math.random() * 4 - 2);
    let current = 8.5 + (Math.random() * 3 - 1.5);
    let powerFactor = 0.92 + (Math.random() * 0.05);
    let dataSource = 'SIMULATOR_NORMAL';

    if (mode === 'TAMPER_BYPASS') {
      // Current shunt bypass: near zero current with grid voltage active
      current = 0.08 + Math.random() * 0.1;
      powerFactor = 0.42;
      dataSource = 'SIMULATOR_THEFT';
    } else if (mode === 'OVERLOAD') {
      // Excessive load surge
      current = 58.0 + Math.random() * 10;
      voltage = 208.0; // voltage sag
      powerFactor = 0.88;
      dataSource = 'SIMULATOR_THEFT';
    } else if (mode === 'LOW_PF') {
      // Phase displacement anomaly
      current = 12.0;
      powerFactor = 0.35;
      dataSource = 'SIMULATOR_THEFT';
    }

    const power = voltage * current * powerFactor;
    const frequency = 50.0 + (Math.random() * 0.1 - 0.05);

    const payload = {
      meterId,
      voltage: parseFloat(voltage.toFixed(2)),
      current: parseFloat(current.toFixed(3)),
      power: parseFloat(power.toFixed(2)),
      powerFactor: parseFloat(Math.min(0.99, powerFactor).toFixed(3)),
      frequency: parseFloat(frequency.toFixed(2)),
      cumulativeEnergyKwh: 1250.0 + Math.random() * 50,
      timestamp: new Date().toISOString(),
      dataSource,
      isSimulated: true,
      metadata: {
        firmwareVersion: '1.0.0-sim',
        sensorStatus: 'SIMULATED',
      },
    };

    const baseUrl = req.nextUrl.origin;
    const ingestRes = await fetch(`${baseUrl}/api/ingest`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': 'pg-sim-key-2026',
      },
      body: JSON.stringify(payload),
    });

    const result = await ingestRes.json();

    return NextResponse.json({
      status: 'success',
      simulationMode: mode,
      reading: payload,
      ingestResult: result,
      notice: 'SIMULATION DATA: Clearly flagged as simulated test reading and distinct from physical ESP32 meter data.',
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Simulator error', message: error?.message || 'Unknown error' },
      { status: 500 }
    );
  }
}
