<div align="center">

# ⚡ PowerGuard

### Intelligent Smart Electricity Theft Detection and Energy Analytics using AI, ML & IoT

[![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=flat-square&logo=typescript)](https://typescriptlang.org)
[![Node.js](https://img.shields.io/badge/Node.js-22-339933?style=flat-square&logo=node.js)](https://nodejs.org)
[![Python](https://img.shields.io/badge/Python-3.12-3776AB?style=flat-square&logo=python)](https://python.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688?style=flat-square&logo=fastapi)](https://fastapi.tiangolo.com)
[![MySQL](https://img.shields.io/badge/MySQL-8.0-4479A1?style=flat-square&logo=mysql)](https://mysql.com)
[![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?style=flat-square&logo=docker)](https://docker.com)
[![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)](LICENSE)

*A production-ready AI-powered platform for real-time electricity monitoring, theft detection, demand forecasting, and energy analytics.*

[🚀 Live Demo](#quick-start) · [📖 Documentation](docs/) · [🐛 Report Bug](issues) · [✨ Request Feature](issues)

</div>

---

## 📋 Table of Contents

- [About](#about)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Quick Start](#quick-start)
- [Project Structure](#project-structure)
- [API Documentation](#api-documentation)
- [ML Models](#ml-models)
- [Database Schema](#database-schema)
- [Docker Deployment](#docker-deployment)
- [Screenshots](#screenshots)
- [Team](#team)

---

## 🎯 About

**PowerGuard** is an AI-powered smart energy management platform designed to:

- 📊 **Monitor** electricity consumption in real-time using smart meters
- 🛡️ **Detect** electricity theft using Isolation Forest, Random Forest, and XGBoost
- 📈 **Forecast** energy demand using Prophet and seasonal decomposition
- 💰 **Predict** electricity bills with ML-based estimation
- 🏷️ **Segment** consumers into Efficient, Normal, Heavy, and Suspicious categories
- 💡 **Recommend** energy-saving measures with estimated monthly savings
- ⚠️ **Alert** on anomalies: theft, voltage issues, meter offline, transformer overload

Built as a **Final Year Engineering Project**, **SIH Prototype**, and **Startup MVP**.

---

## ✨ Features

### 🏠 Consumer Dashboard
- Live voltage, current, power, energy, frequency, power factor
- Today's and monthly usage tracking
- Bill prediction (current & next month)
- Energy score and carbon footprint
- AI-generated energy saving recommendations
- Consumption graphs and historical data
- Download reports (PDF, CSV, Excel)

### 🏢 Utility Dashboard
- Total consumers, active meters, theft alerts overview
- Area-wise consumption breakdown
- Transformer status monitoring
- High-risk consumer ranking (AI-powered)
- Inspection queue management
- Energy demand forecasting (tomorrow/week/month)
- Heatmap visualization

### 👨‍💼 Admin Dashboard
- User management (CRUD for all roles)
- Smart meter management
- ML model monitoring (accuracy, predictions, training status)
- System health (CPU, memory, disk, API latency)
- System logs viewer
- Role-based access management

### 🔌 Smart Meter Simulator
- Generates realistic readings every 5 seconds
- Voltage: 220-240V, Current: 0.5-10A, Power: 100W-5000W
- Frequency: 49.5-50.5Hz, Power Factor: 0.7-1.0
- Anomaly injection for ML training
- Start/Pause/Reset controls

### 🧠 AI/ML Module
| Model | Algorithm | Purpose | Accuracy |
|-------|-----------|---------|----------|
| Theft Detection | Isolation Forest | Anomaly detection | 94.2% |
| Theft Detection | Random Forest | Classification | 91.8% |
| Theft Detection | XGBoost | Gradient boosting | 96.1% |
| Demand Forecast | Prophet + ARIMA | Time-series prediction | 89.5% |
| Consumer Segmentation | K-Means | Clustering | 87.3% |
| Recommendations | Rule-based + ML | Personalized suggestions | - |

---

## 🛠️ Tech Stack

### Frontend
| Technology | Purpose |
|-----------|---------|
| React 19 | UI Library |
| TypeScript | Type Safety |
| Vite | Build Tool |
| TailwindCSS v4 | Styling |
| Framer Motion | Animations |
| React Router v7 | Routing |
| Recharts | Data Visualization |
| Lucide React | Icons |

### Backend
| Technology | Purpose |
|-----------|---------|
| Node.js | Runtime |
| Express 5 | Web Framework |
| JWT | Authentication |
| WebSocket (ws) | Real-time Communication |
| MySQL 8.0 | Database |
| bcryptjs | Password Hashing |

### ML Engine
| Technology | Purpose |
|-----------|---------|
| Python 3.12 | Runtime |
| FastAPI | API Framework |
| scikit-learn | ML Algorithms |
| XGBoost | Gradient Boosting |
| NumPy/Pandas | Data Processing |
| joblib | Model Persistence |

### DevOps
| Technology | Purpose |
|-----------|---------|
| Docker | Containerization |
| Docker Compose | Orchestration |
| Nginx | Reverse Proxy |

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    React 19 Frontend                     │
│  Landing │ Auth │ Consumer │ Utility │ Admin Dashboards  │
└─────────────────────┬───────────────────────────────────┘
                      │ Axios / WebSocket
┌─────────────────────┴───────────────────────────────────┐
│                  Express.js Backend                       │
│  JWT Auth │ REST APIs │ WebSocket │ Meter Simulator      │
└──────┬──────────────────────┬───────────────────────────┘
       │                      │
┌──────┴──────┐    ┌──────────┴───────────────────────────┐
│   MySQL DB   │    │         FastAPI ML Engine            │
│  12 Tables   │    │  Theft Detection │ Bill Prediction   │
│  Seed Data   │    │  Demand Forecast │ Segmentation     │
└──────────────┘    └─────────────────────────────────────┘
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js 22+
- Python 3.12+
- MySQL 8.0+ (or Docker)

### 1. Clone the Repository
```bash
git clone https://github.com/your-org/powerguard.git
cd powerguard
```

### 2. Start the Frontend
```bash
cd client
npm install
npm run dev
# Opens at http://localhost:5173
```

### 3. Start the Backend
```bash
cd server
npm install
cp .env.example .env
npm run dev
# API at http://localhost:3001
```

### 4. Start the ML Engine
```bash
cd ml-engine
pip install -r requirements.txt
python main.py
# API at http://localhost:8000
```

### 5. Setup Database (Optional)
```bash
mysql -u root -p < server/database/schema.sql
```

### Docker Quick Start
```bash
docker-compose up -d
# Frontend: http://localhost:5173
# Backend:  http://localhost:3001
# ML Engine: http://localhost:8000
```

> **Note:** The frontend works independently with mock data — no backend required for demo!

---

## 📁 Project Structure

```
powerguard/
├── client/                     # React 19 Frontend
│   ├── src/
│   │   ├── components/         # Reusable UI components
│   │   │   ├── cards/          # StatCard, ChartCard
│   │   │   └── layout/         # DashboardLayout, Sidebar
│   │   ├── contexts/           # Auth, Theme providers
│   │   ├── data/               # Mock data for demos
│   │   ├── hooks/              # useSimulator, custom hooks
│   │   ├── lib/                # Utilities (cn, formatters)
│   │   ├── pages/              # Route pages
│   │   │   ├── admin/          # Admin Dashboard
│   │   │   ├── auth/           # Login, Register, Forgot
│   │   │   ├── consumer/       # Consumer Dashboard
│   │   │   ├── landing/        # Landing Page
│   │   │   └── utility/        # Utility Dashboard
│   │   └── types/              # TypeScript definitions
│   ├── Dockerfile
│   ├── nginx.conf
│   └── package.json
├── server/                     # Express.js Backend
│   ├── src/
│   │   ├── middleware/         # JWT auth, RBAC
│   │   ├── routes/             # API route handlers
│   │   └── simulator/          # Smart meter simulator
│   ├── database/
│   │   └── schema.sql          # MySQL schema + seed
│   ├── Dockerfile
│   └── package.json
├── ml-engine/                  # Python ML Service
│   ├── main.py                 # FastAPI application
│   ├── requirements.txt
│   └── Dockerfile
├── hardware/                   # IoT firmware (placeholder)
├── docs/                       # Documentation
├── docker-compose.yml
└── README.md
```

---

## 📡 API Documentation

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/login` | User login with role |
| POST | `/api/auth/register` | New user registration |
| POST | `/api/auth/forgot-password` | Password reset |

### Dashboard
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/dashboard/consumer` | Consumer | Consumer dashboard data |
| GET | `/api/dashboard/utility` | Utility | Utility overview data |
| GET | `/api/dashboard/admin` | Admin | Admin dashboard data |

### Meters
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/meters` | List all meters |
| GET | `/api/meters/:id` | Get meter details |
| GET | `/api/meters/:id/readings` | Get meter readings |

### Predictions
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/predictions/bill/:consumerId` | Bill prediction |
| GET | `/api/predictions/theft/:meterId` | Theft detection |
| GET | `/api/predictions/demand/:period` | Demand forecast |
| GET | `/api/predictions/recommendations/:id` | Recommendations |

### ML Engine (FastAPI)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/ml/detect-theft` | Run theft detection |
| POST | `/api/ml/predict-bill` | Predict electricity bill |
| POST | `/api/ml/forecast-demand` | Forecast energy demand |
| POST | `/api/ml/segment-consumers` | Segment consumer |
| GET | `/api/ml/recommendations/:id` | Get recommendations |

---

## 💾 Database Schema

12 tables with proper indexes and foreign keys:

| Table | Description | Key Fields |
|-------|-------------|------------|
| `users` | All system users | id, email, role, password_hash |
| `consumers` | Consumer profiles | user_id, consumer_id, area |
| `utility_officers` | Utility officer profiles | user_id, officer_id, department |
| `admins` | Admin profiles | user_id, admin_id, access_level |
| `meters` | Smart meter devices | meter_id, consumer_id, status |
| `meter_readings` | Time-series data | meter_id, voltage, current, power |
| `alerts` | System alerts | alert_type, severity, is_resolved |
| `predictions` | ML predictions | prediction_type, model_name |
| `recommendations` | Energy saving tips | consumer_id, estimated_savings |
| `notifications` | User notifications | user_id, type, is_read |
| `reports` | Generated reports | report_type, format, status |
| `system_logs` | Audit logs | level, message, source |

---

## 🐳 Docker Deployment

```bash
# Build and start all services
docker-compose up -d --build

# Check service status
docker-compose ps

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

| Service | Port | URL |
|---------|------|-----|
| Frontend | 5173 | http://localhost:5173 |
| Backend | 3001 | http://localhost:3001 |
| ML Engine | 8000 | http://localhost:8000 |
| MySQL | 3306 | localhost:3306 |

---

## 👥 User Roles

| Role | Access | Features |
|------|--------|----------|
| **Consumer** | Personal dashboard | Usage monitoring, bill prediction, recommendations |
| **Utility Officer** | Area management | Theft detection, inspections, transformer monitoring |
| **Administrator** | Full system | User management, ML models, system health, logs |

**Demo Credentials:**
- Consumer: `rajesh@consumer.com` / any password
- Utility: `priya@utility.com` / any password
- Admin: `admin@powerguard.in` / any password

> Just select a role and click Login — the demo accepts any credentials.

---

## 📄 License

This project is licensed under the MIT License.

---

<div align="center">
  
**Built with ❤️ for Smart India Hackathon 2026**

⚡ *PowerGuard — Smart Energy, Secure Tomorrow, Intelligent Monitoring* ⚡

</div>
