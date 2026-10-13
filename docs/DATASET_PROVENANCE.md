# PowerGuard AI — Dataset Selection, Provenance & Quality Analysis

## 1. Executive Summary

For the **POWERGUARD AI** electricity theft detection and energy analytics system, machine learning models must process high-frequency electrical measurements—specifically voltage, current, active power, reactive power, power factor, and cumulative energy. These parameters mirror the exact physical telemetry captured by our hardware prototype (**ESP32 microcontroller + PZEM-004T v3.0 AC energy sensor**).

This document establishes the formal provenance, data quality audit, ethical justification, and feature engineering methodology for the training dataset used in this project.

---

## 2. Public Dataset Selection & Comparison

We evaluated multiple public energy repositories available on Kaggle and academic archives before finalizing our dataset:

| Dataset | Provider / Source | Features Available | Sampling Rate | Labeled Theft? | Suitability Verdict |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Individual Household Electric Power Consumption** | UCI Machine Learning Repository / Kaggle (`uciml/electric-power-consumption`) | `Global_active_power`, `Global_reactive_power`, `Voltage`, `Global_intensity` (Current), `Sub_metering_1,2,3` | 1 minute (2,075,259 rows, ~47 months) | **No** (Unlabeled physical measurements) | **PRIMARY SELECTION**: Matches hardware electrical telemetry directly; enables fine-grained anomaly detection. |
| **State Grid Corporation of China (SGCC)** | State Grid Corp of China / Kaggle | Daily kWh cumulative consumption only (42,372 consumers, 1035 days) | 1 day | **Yes** (Binary theft flag `0/1`) | **SECONDARY / BENCHMARK ONLY**: Daily totals lack voltage, current, and power factor needed for real-time meter tampering & physical fault detection. |
| **London Datastore Smart Meter Dataset** | UK Power Networks / Kaggle | Half-hourly kWh readings | 30 minutes | **No** | Useful for macroscopic demand forecasting, but lacks sub-second electrical parameters. |

### Selected Dataset: UCI Individual Household Electric Power Consumption
- **Kaggle Identifier**: `uciml/electric-power-consumption`
- **Original Source**: Georges Hébrail, Alice Bérard (EDF R&D), UC Irvine Machine Learning Repository.
- **License**: Creative Commons Attribution 4.0 International (CC BY 4.0) / Public Academic Domain.
- **Duration**: December 16, 2006 to November 26, 2010 (3 years, 11 months).
- **Total Records**: 2,075,259 raw readings.

---

## 3. Dataset Schema & Physical Parameter Mapping

The dataset contains the following attributes, mapped to standard smart meter telemetry:

| Dataset Attribute | Physical Unit | Hardware Sensor Parameter (PZEM-004T) | Meaning in PowerGuard AI |
| :--- | :--- | :--- | :--- |
| `Date` | `dd/mm/yyyy` | Microcontroller NTP Timestamp | Date of measurement |
| `Time` | `hh:mm:ss` | Microcontroller NTP Timestamp | Time of measurement |
| `Global_active_power` | Kilowatts (kW) | Active Power ($P$, Watts / kW) | Total real power consumed by the load |
| `Global_reactive_power` | Kilovars (kVAR) | Reactive Power ($Q$) | Reactive load (inductive/capacitive) |
| `Voltage` | Volts (V) | RMS Voltage ($V_{rms}$) | Grid supply voltage |
| `Global_intensity` | Amperes (A) | RMS Current ($I_{rms}$) | Load current draw |
| `Sub_metering_1` | Watt-hours (Wh) | Sub-circuit active energy | Kitchen appliances |
| `Sub_metering_2` | Watt-hours (Wh) | Sub-circuit active energy | Laundry & refrigeration |
| `Sub_metering_3` | Watt-hours (Wh) | Sub-circuit active energy | Climate control (water heater / AC) |

---

## 4. Scientific Honesty & Ground Truth Labels

> **CRITICAL ARCHITECTURAL PRINCIPLE**:  
> The UCI dataset consists of genuine, un-doctored smart meter measurements from an actual residential installation. **It does NOT contain verified electricity theft labels.**
>
> In accordance with strict engineering standards and hackathon ethics:
> 1. We **do not fabricate synthetic "theft" labels** and pretend the model achieved an artificial 99.9% accuracy on non-existent real-world theft cases.
> 2. The primary machine learning model is strictly formulated as **Unsupervised Anomaly Detection using Isolation Forests**, learning the manifold of typical household electrical behavior.
> 3. Detected anomalies are classified as **Investigation Alerts** rather than definitive proof of theft. In real power distribution grids, anomalies may result from:
>    - Physical meter tampering (e.g., neutral bypass, current-transformer shunting).
>    - Severe load anomalies (e.g., illegal tapping, equipment malfunction).
>    - Sensor faults (e.g., loose wiring, PZEM optical coupler dropouts).
> 4. For supervised classification benchmarking (Random Forest / XGBoost), we explicitly document benchmark scenarios with injected fault signatures (e.g., sudden current drops while voltage remains steady, extreme power factor degradation) to measure detection sensitivity.

---

## 5. Data Cleaning & Preprocessing

During exploratory data analysis (EDA), the following quality issues are resolved:
1. **Missing Values**: 25,979 readings (~1.25%) contain `?` placeholders representing sensor downtime or communication dropouts. These are cleaned using forward-fill (`ffill`) followed by local linear interpolation for gaps under 15 minutes, preserving temporal continuity without introducing synthetic discontinuities.
2. **Timestamp Normalization**: `Date` and `Time` columns are parsed into ISO-8601 UTC timestamps, indexed sequentially.
3. **Physical Bound Verification**:
   - Voltage: Filtered to $180\text{V} \le V \le 270\text{V}$ (standard European 230V $\pm 20\%$).
   - Current: Filtered to $I \ge 0\text{A}$ and $I \le 100\text{A}$.
   - Active Power: Filtered to $P \ge 0\text{kW}$.
4. **Duplicate Removal**: Identical consecutive timestamps are deduplicated by taking the mean reading.

---

## 6. Feature Engineering

To provide rich context for the Isolation Forest and downstream analytics, the raw readings are transformed into engineered features:

1. **Apparent Power ($S$)**:
   $$S = \frac{V \times I}{1000} \quad (\text{kVA})$$
2. **Calculated Power Factor ($\cos\phi$)**:
   $$\text{PF} = \frac{P}{S} = \frac{\text{Global\_active\_power}}{\frac{\text{Voltage} \times \text{Global\_intensity}}{1000}}$$
   Bounded strictly between $0.05$ and $1.00$. Meter tampering often exhibits anomalous power factor readings because current bypass disrupts the vector phase relationship.
3. **Active/Reactive Ratio**:
   $$\text{Ratio}_{P/Q} = \frac{P}{Q + \epsilon}$$
4. **Temporal Cyclic Features**:
   To allow tree models to understand daily and weekly cycles without arbitrary integer step jumps:
   $$\text{hour\_sin} = \sin\left(\frac{2\pi \times \text{hour}}{24}\right), \quad \text{hour\_cos} = \cos\left(\frac{2\pi \times \text{hour}}{24}\right)$$
   $$\text{day\_sin} = \sin\left(\frac{2\pi \times \text{dayofweek}}{7}\right), \quad \text{day\_cos} = \cos\left(\frac{2\pi \times \text{dayofweek}}{7}\right)$$
5. **Rolling Historical Baselines**:
   - `rolling_mean_current_24h`: 24-hour rolling average of current.
   - `rolling_std_current_24h`: 24-hour rolling standard deviation (volatility).
   - `current_deviation_ratio`: Instantaneous current relative to historical average:
     $$\Delta I = \frac{I - \mu_{I, 24h}}{\sigma_{I, 24h} + \epsilon}$$

---

## 7. Train / Test Split & Leakage Prevention

Because electricity consumption is an autoregressive time-series process, standard random k-fold cross-validation introduces **severe temporal data leakage** (using future patterns to predict past anomalies).

Instead, we employ a **strict chronological train/test split**:
- **Training Set**: First 80% chronologically (approx. 3 years of baseline historical data).
- **Validation / Test Set**: Final 20% chronologically (approx. 9 months of unseen future data).
- Scalers (`StandardScaler`) are fitted **exclusively on the training partition** and then used to transform the test set and production payloads.

---

## 8. Export Artifacts

Training produces the following standardized artifacts stored in `trained_models/` and bundled into the prediction API:
- `isolation_forest_v1.0.joblib`: Serialized Isolation Forest estimator.
- `scaler_v1.0.joblib`: Scikit-learn StandardScaler with fitted means and scales.
- `model_metadata.json`: Feature list, exact ordering, contamination rate, decision threshold, version tag, and input validation bounds.
- `evaluation_report.json`: Precision, recall, anomaly score distributions, and comparison against baseline statistical Z-score detector.
