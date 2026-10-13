#!/usr/bin/env python3
"""
PowerGuard AI — Smart Meter Sensor Simulator
Generates calibrated physical electrical telemetry for ESP32/PZEM-004T emulation.
Supports normal diurnal consumption and synthetic anomaly injection.
Sends authenticated JSON payloads to /api/ingest.
"""

import sys
import time
import json
import random
import argparse
from datetime import datetime, timezone
import urllib.request
import urllib.error

DEFAULT_URL = "http://localhost:3000/api/ingest"
DEFAULT_API_KEY = "pg-sim-key-2026"

def parse_args():
    parser = argparse.ArgumentParser(description="PowerGuard AI IoT Sensor Simulator")
    parser.add_argument("--url", default=DEFAULT_URL, help=f"Ingestion endpoint (default: {DEFAULT_URL})")
    parser.add_argument("--api-key", default=DEFAULT_API_KEY, help="Device API key")
    parser.add_argument("--meter-id", default="MTR-001", help="Target Meter ID")
    parser.add_argument("--interval", type=float, default=3.0, help="Publish interval in seconds")
    parser.add_argument("--mode", choices=["auto", "normal", "bypass", "surge", "low_pf"], default="auto",
                        help="Telemetry generation profile (auto: mostly normal with occasional anomalies)")
    parser.add_argument("--iterations", type=int, default=10, help="Number of telemetry cycles to run (0 for infinite)")
    return parser.parse_args()

def generate_telemetry(meter_id: str, mode: str, cumulative_energy: float):
    now = datetime.now(timezone.utc)
    hour = now.hour + now.minute / 60.0

    # Diurnal household load curve
    morning = 6.0 * (2.718 ** (-((hour - 8.0) ** 2) / 6.0))
    evening = 10.0 * (2.718 ** (-((hour - 20.0) ** 2) / 8.0))
    base_current = 2.0 + morning + evening + random.uniform(-0.5, 0.5)

    current_mode = mode
    if mode == "auto":
        # 15% probability of an anomaly in auto mode
        roll = random.random()
        if roll < 0.08:
            current_mode = "bypass"
        elif roll < 0.12:
            current_mode = "surge"
        elif roll < 0.15:
            current_mode = "low_pf"
        else:
            current_mode = "normal"

    voltage = round(random.uniform(228.0, 233.0), 2)
    current = round(max(0.5, base_current), 3)
    power_factor = round(random.uniform(0.91, 0.97), 3)
    data_source = "SIMULATOR_NORMAL"

    if current_mode == "bypass":
        # Current shunt bypass: near zero current with grid voltage active
        current = round(random.uniform(0.04, 0.18), 3)
        power_factor = round(random.uniform(0.35, 0.55), 3)
        data_source = "SIMULATOR_THEFT"
    elif current_mode == "surge":
        # Current surge beyond domestic connection limit
        current = round(random.uniform(52.0, 75.0), 3)
        voltage = round(random.uniform(204.0, 212.0), 2) # voltage sag
        power_factor = round(random.uniform(0.85, 0.92), 3)
        data_source = "SIMULATOR_THEFT"
    elif current_mode == "low_pf":
        # Heavy reactive manipulation
        current = round(random.uniform(10.0, 18.0), 3)
        power_factor = round(random.uniform(0.30, 0.48), 3)
        data_source = "SIMULATOR_THEFT"

    power = round(voltage * current * power_factor, 2)
    frequency = round(random.uniform(49.88, 50.12), 2)
    incremental_kwh = (power / 1000.0) * (3.0 / 3600.0)
    cumulative_energy += incremental_kwh

    payload = {
        "meterId": meter_id,
        "voltage": voltage,
        "current": current,
        "power": power,
        "powerFactor": power_factor,
        "frequency": frequency,
        "cumulativeEnergyKwh": round(cumulative_energy, 4),
        "timestamp": now.isoformat(),
        "dataSource": data_source,
        "isSimulated": True,
        "metadata": {
            "firmwareVersion": "1.0.0-simulator",
            "simulationMode": current_mode
        }
    }
    return payload, current_mode, cumulative_energy

def post_telemetry(url: str, api_key: str, payload: dict):
    data = json.dumps(payload).encode('utf-8')
    req = urllib.request.Request(
        url,
        data=data,
        headers={
            "Content-Type": "application/json",
            "x-api-key": api_key,
            "User-Agent": "PowerGuard-Simulator/1.0"
        },
        method="POST"
    )
    try:
        with urllib.request.urlopen(req, timeout=5) as resp:
            status_code = resp.getcode()
            body = resp.read().decode('utf-8')
            return status_code, json.loads(body)
    except urllib.error.HTTPError as e:
        body = e.read().decode('utf-8')
        try:
            return e.code, json.loads(body)
        except Exception:
            return e.code, {"error": body}
    except Exception as e:
        return 0, {"error": str(e)}

def main():
    args = parse_args()
    print("=" * 60)
    print("⚡ POWERGUARD AI — SMART METER SENSOR SIMULATOR ⚡")
    print(f"Target URL : {args.url}")
    print(f"Meter ID   : {args.meter_id}")
    print(f"Mode       : {args.mode}")
    print(f"Interval   : {args.interval}s")
    print("=" * 60)

    cumulative_energy = 1420.50
    cycle = 0

    while True:
        cycle += 1
        payload, current_mode, cumulative_energy = generate_telemetry(args.meter_id, args.mode, cumulative_energy)
        
        status, resp = post_telemetry(args.url, args.api_key, payload)
        
        ml_info = resp.get("mlInference", {})
        risk = ml_info.get("riskLevel", "UNKNOWN")
        is_anomaly = ml_info.get("isAnomaly", False)

        anomaly_tag = "[🚨 ANOMALY ALERT]" if is_anomaly else "[✓ NORMAL]"
        print(f"[{cycle}] {payload['timestamp'][:19]} | Mode: {current_mode:8} | "
              f"V: {payload['voltage']:5.1f}V | I: {payload['current']:6.2f}A | "
              f"P: {payload['power']:7.1f}W | PF: {payload['powerFactor']:.2f} | "
              f"HTTP {status} -> {anomaly_tag} Risk: {risk}")

        if args.iterations > 0 and cycle >= args.iterations:
            print(f"\n[+] Completed {cycle} test cycles.")
            break

        time.sleep(args.interval)

if __name__ == "__main__":
    main()
