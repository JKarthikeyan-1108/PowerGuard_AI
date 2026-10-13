#!/usr/bin/env python3
"""
PowerGuard AI — Exported ML Model Verification & Inference Test
Proves that exported .joblib artifacts and model metadata load and evaluate correctly.
"""

import os
import json
import joblib
import numpy as np

MODEL_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "trained_models"))
MODEL_PATH = os.path.join(MODEL_DIR, "isolation_forest_v1.0.joblib")
SCALER_PATH = os.path.join(MODEL_DIR, "scaler_v1.0.joblib")
META_PATH = os.path.join(MODEL_DIR, "model_metadata.json")

def run_tests():
    print("=" * 60)
    print("TEST: Verifying Exported Machine Learning Artifacts")
    print("=" * 60)

    # 1. File existence
    assert os.path.exists(MODEL_PATH), f"Model file missing: {MODEL_PATH}"
    assert os.path.exists(SCALER_PATH), f"Scaler file missing: {SCALER_PATH}"
    assert os.path.exists(META_PATH), f"Metadata file missing: {META_PATH}"
    print("[PASS] All required artifact files exist on disk.")

    # 2. Loading
    model = joblib.load(MODEL_PATH)
    scaler = joblib.load(SCALER_PATH)
    with open(META_PATH, "r") as f:
        meta = json.load(f)
    print("[PASS] Successfully deserialized model, scaler, and metadata.")

    # 3. Metadata validation
    assert meta["model_version"] == "v1.0"
    assert len(meta["features"]) == 8
    assert len(scaler.mean_) == 8
    print(f"[PASS] Model metadata matches schema. Features: {meta['features']}")

    # 4. Normal Case Test
    # [V, I, P, PF, Freq, S, hour_sin, hour_cos]
    normal_reading = np.array([[230.0, 12.0, 2500.0, 0.94, 50.0, (230*12)/1000.0, 0.0, 1.0]])
    normal_scaled = scaler.transform(normal_reading)
    normal_score = float(model.decision_function(normal_scaled)[0])
    normal_pred = int(model.predict(normal_scaled)[0]) # 1 = normal, -1 = anomaly

    print(f"[*] Normal reading score: {normal_score:.4f} (Prediction: {'Normal' if normal_pred == 1 else 'Anomaly'})")
    assert normal_pred == 1, "Normal reading should not be flagged as an anomaly"
    print("[PASS] Normal reading correctly evaluated as normal.")

    # 5. Anomaly Case Test (Shunt bypass / tap)
    bypass_reading = np.array([[231.0, 0.08, 15.0, 0.40, 50.0, (231*0.08)/1000.0, 0.86, -0.5]])
    bypass_scaled = scaler.transform(bypass_reading)
    bypass_score = float(model.decision_function(bypass_scaled)[0])
    bypass_pred = int(model.predict(bypass_scaled)[0])

    print(f"[*] Bypass reading score: {bypass_score:.4f} (Prediction: {'Normal' if bypass_pred == 1 else 'Anomaly'})")
    assert bypass_pred == -1 or bypass_score < meta["threshold"], "Bypass reading should be flagged as anomalous"
    print("[PASS] Bypass anomaly correctly isolated by model.")

    print("\n" + "=" * 60)
    print("ALL ML ARTIFACT INFERENCE TESTS PASSED SUCCESSFULLY!")
    print("=" * 60)

if __name__ == "__main__":
    run_tests()
