# Utility Officer User Manual

As a Utility Officer, your primary goal is to ensure grid stability, investigate anomalies, and follow up on suspected electricity theft.

## 1. Theft Detection & Alerts
- **Navigation:** Click on `Theft Detection` or `Alerts`.
- **Function:** The AI Engine continuously analyzes meter readings. If it detects energy diversion or bypasses, a `CRITICAL` alert is generated.
- **Action:** 
  1. Click on the alert to view the AI confidence score and explanation (e.g., "Current drawn without corresponding power drop").
  2. Dispatch a field team if the confidence is > 85%.
  3. Mark the alert as `IN_PROGRESS` and eventually `RESOLVED` once the physical inspection is complete.

## 2. Risk Heatmap
- **Navigation:** Click on `Risk Heatmap`.
- **Function:** Displays a geographical overview of theft probabilities and transformer loads.
- **Usage:** Red zones indicate high aggregate theft probability. Focus patrol and inspection efforts in these geographical clusters.

## 3. Transformer Monitoring
- **Navigation:** Click on `Transformers`.
- **Function:** Monitor real-time load percentages.
- **Action:** If a transformer exceeds 90% load, the system will warn of potential overload. You may need to plan load shedding or grid upgrades for that sector.

## 4. Demand Forecasting
- **Navigation:** Click on `Demand Forecast`.
- **Function:** View AI-generated predictions for electricity demand over the next 24 hours to 7 days.
- **Usage:** Use these metrics to coordinate with power generation stations to ensure adequate supply during predicted peak hours.
