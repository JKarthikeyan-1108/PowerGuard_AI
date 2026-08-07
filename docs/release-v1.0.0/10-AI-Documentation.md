# AI Documentation

The PowerGuard AI Engine runs as a dedicated FastAPI microservice to offload heavy numerical computations from the Node.js API server.

## Models Included in v1.0.0

### 1. Theft Detection Model (`theft_detector_v1.pkl`)
- **Type:** Random Forest Classifier (or LightGBM)
- **Features:** Voltage, Current, Power Factor, Frequency, Consumption (kWh).
- **Purpose:** Identifies meter bypasses, physical tampering, and energy diversion.
- **Latency:** < 50ms per inference.

### 2. Bill Prediction Model (`bill_predictor_v1.pkl`)
- **Type:** Time-Series / ARIMA or Gradient Boosting Regressor
- **Features:** Day of month, historical daily average, seasonal factor, consumer type.
- **Purpose:** Projects the final monthly consumption to predict the electricity bill early in the cycle.

### 3. Consumer Clustering Model (`consumer_cluster_v1.pkl`)
- **Type:** K-Means Clustering
- **Features:** Peak usage ratio, night usage ratio, load variance.
- **Purpose:** Segments consumers into behavioral groups (e.g., "Heavy HVAC User", "Night Owl") to generate highly personalized energy-saving recommendations.

## Training Pipeline
Currently, models are pre-trained locally in Jupyter Notebooks and exported via `joblib`. 
- **Future Roadmap:** Implement automated model retraining using a pipeline like Airflow/Kubeflow, reading historical data directly from MySQL/Data Warehouse.

## API Integration
The Node.js backend calls `POST /api/ai/predict-theft` synchronously when a meter reading arrives. 
*Note:* In high-throughput environments, this should be transitioned to a message queue (e.g., RabbitMQ or Kafka) to prevent Node.js request blocking.
