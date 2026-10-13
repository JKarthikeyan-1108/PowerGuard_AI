# ⚡ POWERGUARD AI

**Intelligent Smart Electricity Theft Detection and Energy Analytics using AI, Machine Learning & IoT**  
*Final-Year Engineering Project & Yuva Yodha Energy Tech Hackathon 2026 Working Prototype*

---

## 📖 Executive Summary

PowerGuard AI is an end-to-end smart energy intelligence platform that prevents non-technical electricity losses (electricity theft, meter tampering, and grid leakage) using real-time edge IoT sensors (**ESP32 + PZEM-004T**), unsupervised Machine Learning (**Isolation Forest**), Cloud Firestore, and a responsive web application built with **React 19, Next.js, and Tailwind CSS**.

Unlike superficial mockups, PowerGuard AI features a functional full-stack pipeline:
1. **IoT Edge Sensing**: Physical measurements (Voltage, Current, Power, Cumulative Energy, Power Factor, Frequency) captured by PZEM-004T and transmitted securely via authenticated HTTP/MQTT.
2. **Kaggle ML Training Pipeline**: Unsupervised Isolation Forest trained on the public **UCI Individual Household Electric Power Consumption dataset** (`uciml/electric-power-consumption` on Kaggle), avoiding fabricated theft labels and enforcing chronological splits without data leakage.
3. **Serverless Inference API**: `/api/predict` endpoint evaluating meter telemetry in real time with diagnostic feature importance and risk scores.
4. **Cloud Firestore Schema & Security**: 8 collections (`users`, `meters`, `readings`, `alerts`, `predictions`, `reports`, `deviceStatus`, `modelMetadata`) protected by role-based security rules.
5. **Multi-Role Dashboards**: Specialized portals for Consumers, Utility Operators, and System Administrators with clear distinctions between real physical sensor telemetry and simulated testing data.

---

## 🏗️ Architecture & Logical Data Flow

```
+---------------------------------------------------------------------------------------------------+
| 1. DATASET & ML MODEL TRAINING                                                                     |
|    Kaggle UCI Dataset  -->  Data Cleaning & Preprocessing  -->  Cyclic Feature Engineering        |
|    -->  Chronological Split (80/20)  -->  Isolation Forest Fit  -->  Export .joblib & metadata.json|
+---------------------------------------------------------------------------------------------------+
                                                      |
                                                      v
+---------------------------------------------------------------------------------------------------+
| 2. REAL-TIME EDGE TELEMETRY INGESTION                                                             |
|    ESP32 + PZEM-004T  \                                                                           |
|    (or Sensor Simulator) ----> Authenticated POST /api/ingest (x-api-key validated)               |
|                                |                                                                  |
|                                +--> Cloud Firestore 'readings' & 'deviceStatus'                   |
|                                +--> ML Inference /api/predict (StandardScaler + Isolation Forest) |
|                                       |                                                           |
|                                       +--> High Risk / Anomaly Detected?                          |
|                                            YES: Automated Alert logged to 'alerts'                |
|                                            NO : Standard log stored in 'predictions'              |
+---------------------------------------------------------------------------------------------------+
                                                      |
                                                      v
+---------------------------------------------------------------------------------------------------+
| 3. REACT 19 DASHBOARDS & REAL-TIME ANALYTICS                                                      |
|    Consumer Portal        : Real-time Watts/V/I, daily trends, estimated bill, energy tips        |
|    Utility Operator Portal: Active meters, anomaly alerts, tamper investigations, CSV exports    |
|    Administrator Portal   : User/meter management, ML model health, device statuses               |
+---------------------------------------------------------------------------------------------------+
```

---

## 🛠️ Technology Stack

| Layer | Technologies Used | Purpose |
| :--- | :--- | :--- |
| **Frontend** | React 19, Next.js 15, Tailwind CSS, Recharts, Framer Motion, Lucide | Responsive dashboards, real-time telemetry graphs, alert feeds |
| **Authentication** | Firebase Authentication (Email/Password, Google OAuth, Phone OTP) | Secure user identity & role tokens |
| **Database** | Firebase Cloud Firestore | NoSQL document storage for telemetry, meters, and alerts |
| **Machine Learning** | Python 3.12, scikit-learn, pandas, NumPy, joblib | Isolation Forest anomaly detection & feature engineering |
| **ML Notebook** | Kaggle Notebooks / Google Colab | Reproducible training on UCI Electricity Consumption dataset |
| **Inference Engine** | Vercel Serverless Route Handlers (`/api/predict`) & Python FastAPI | Zero-cold-start edge scoring & feature explanation |
| **IoT Edge Hardware** | ESP32 DevKit V1 + PZEM-004T v3.0 AC Energy Meter | High-precision voltage, current, power factor measurement |
| **Testing** | Vitest, React Testing Library, JSDOM | Unit tests for components, RBAC rules, and ML pipelines |
| **Deployment** | Vercel (Frontend & Serverless API) + GitHub | Cloud CI/CD and production hosting |

---

## 📊 Machine Learning Model & Dataset Provenance

- **Public Kaggle Dataset**: `uciml/electric-power-consumption` (Georges Hébrail & Alice Bérard, EDF R&D).
- **Physical Features**: Voltage (V), Current (A), Active Power (W), Power Factor ($\cos\phi$), Frequency (Hz), Apparent Power (kVA), Cyclic Hour Encoding ($\sin/\cos$).
- **Scientific Integrity Principle**: The raw dataset contains real-world residential measurements without verified theft labels. Therefore, **we do not fabricate synthetic theft labels**; the primary model is strictly formulated as **Unsupervised Anomaly Detection using Isolation Forests**. Detected deviations are classified as **Investigation Alerts** rather than definitive proof of theft.
- **Reproducible Notebook**: Located at [`notebooks/powerguard_theft_detection_kaggle.ipynb`](file:///j:/PowerGuard/notebooks/powerguard_theft_detection_kaggle.ipynb).
- **Provenance Documentation**: Detailed analysis in [`docs/DATASET_PROVENANCE.md`](file:///j:/PowerGuard/docs/DATASET_PROVENANCE.md).

---

## 🔒 Firestore Collections & Security Rules

All documents are governed by [`firestore.rules`](file:///j:/PowerGuard/firestore.rules) enforcing strict Role-Based Access Control (RBAC):

1. `users`: Personal profiles; consumers read/update their own profile (role cannot be self-escalated); admins manage all.
2. `meters`: Smart meter specifications, tariff plans, and coordinates; consumers read only their assigned meters.
3. `readings`: Immutable time-series telemetry; writes strictly validated for electrical ranges ($100\text{V} \le V \le 350\text{V}$, $0\text{A} \le I \le 150\text{A}$).
4. `alerts`: Anomaly alerts; utility operators review and transition statuses (`OPEN` -> `INVESTIGATING` -> `RESOLVED` / `FALSE_POSITIVE`).
5. `predictions`: Isolation Forest inference logs and feature contributions.
6. `reports`: Downloadable CSV energy audit and billing summaries.
7. `deviceStatus`: Hardware heartbeats, firmware versions, and Wi-Fi signal strength.
8. `modelMetadata`: ML model versions, scaler parameters, decision thresholds, and training metadata.

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- **Node.js**: v20 or v22 LTS
- **Python**: v3.11 or v3.12
- **Git**

### 2. Installation
```bash
# Clone the repository
git clone https://github.com/JKarthikeyan-1108/PowerGuard_AI.git
cd PowerGuard

# Copy environment template
cp .env.example .env.local

# Install frontend dependencies
cd apps/web
npm install
```

### 3. Run the ML Pipeline (Optional - Pre-trained artifacts included)
```bash
cd apps/ai
python src/training/train_pipeline.py
# Generates trained_models/isolation_forest_v1.0.joblib and model_metadata.json
```

### 4. Start the Web Dashboard
```bash
cd apps/web
npm run dev
# Dashboard available at http://localhost:3000
```

### 5. Stream Sensor Telemetry (Hardware or Simulator)

To test the system with live sensor data:
```bash
# In a separate terminal, launch the Python sensor simulator:
python scripts/sensor_simulator.py --url http://localhost:3000/api/ingest --iterations 20

# Test specific anomaly scenarios:
python scripts/sensor_simulator.py --mode bypass   # Simulates current shunt / meter bypass
python scripts/sensor_simulator.py --mode surge    # Simulates load surge
```

---

## 🧪 Testing Suite

PowerGuard AI includes unit and integration tests across components, security rules, and ML pipelines:

```bash
# 1. Run Frontend & API Component Tests
cd apps/web
npm run test
# Output: 4 test suites passed (13 tests)

# 2. Run TypeScript Type Checking
npm run type-check
# Output: zero errors

# 3. Run ML Model Inference Test
cd apps/ai
python scripts/test_model_inference.py
# Output: Verifies deserialization, scaling, normal inference, and anomaly isolation
```

---

## ☁️ Vercel Deployment

For full deployment instructions, see the [`docs/DEPLOYMENT_VERCEL.md`](file:///j:/PowerGuard/docs/DEPLOYMENT_VERCEL.md) guide.

```bash
# Push changes to GitHub
git add .
git commit -m "feat: complete PowerGuard AI prototype with Kaggle ML, Firebase, and Vercel endpoints"
git push origin main
```

In the Vercel dashboard:
1. Import repository and set **Root Directory** to `apps/web`.
2. Add environment variables from `.env.example` (`NEXT_PUBLIC_FIREBASE_*`, `FIREBASE_*`, `IOT_DEVICE_API_KEY`).
3. Deploy! Vercel automatically deploys the frontend and serverless endpoints (`/api/predict`, `/api/ingest`, `/api/health`).

---

## 📋 Implementation Checklist

| Category | Requirement | Status | Verification |
| :--- | :--- | :--- | :--- |
| **Frontend** | React 19, Next.js 15, Tailwind CSS, Recharts | ✅ Completed | Production build passes (`47 routes generated`) |
| **Authentication** | Firebase Auth + RBAC (Consumer, Utility, Admin) | ✅ Completed | Protected layouts & role-based routing |
| **Database** | Firebase Cloud Firestore (8 collections) | ✅ Completed | Strict `firestore.rules` & typed schemas |
| **ML Training** | Kaggle Notebook on UCI electricity dataset | ✅ Completed | `powerguard_theft_detection_kaggle.ipynb` |
| **ML Models** | Unsupervised Isolation Forest (no fake labels) | ✅ Completed | ROC-AUC: `0.9974`, F1: `0.8263` vs baseline |
| **Model Export** | Model, scaler, feature list & metadata | ✅ Completed | `trained_models/isolation_forest_v1.0.joblib` |
| **Inference API** | `/api/predict` serverless route with explanations | ✅ Completed | Scaled scoring, risk levels, feature importance |
| **IoT Ingestion** | `/api/ingest` with authenticated electrical validation | ✅ Completed | Physical bounds validation & automated ML trigger |
| **Sensor Simulator**| Python & Web UI simulator with clear demo badges | ✅ Completed | `scripts/sensor_simulator.py` + `DataSourceBadge` |
| **IoT Firmware** | ESP32 + PZEM-004T C++ code with HTTP & MQTT | ✅ Completed | `firmware/esp32_smart_meter/src/main.cpp` |
| **Testing** | Vitest unit tests & Python model validation | ✅ Completed | 100% tests passing in Vitest & Python scripts |
| **Deployment** | Vercel config & step-by-step instructions | ✅ Completed | `vercel.json` + `docs/DEPLOYMENT_VERCEL.md` |

---

## 📄 License

MIT License — Developed for the Yuva Yodha Energy Tech Hackathon 2026.
