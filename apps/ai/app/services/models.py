import random
from typing import List, Dict, Any

class BaseMockModel:
    """Base class for mock models that simulates scikit-learn/keras APIs."""
    def __init__(self, model_name: str):
        self.model_name = model_name
        self.is_loaded = True
        
class IsolationForestMock(BaseMockModel):
    """
    Unsupervised Anomaly Detection.
    Detects anomalies (outliers) based on random splits in feature space.
    """
    def __init__(self):
        super().__init__("IsolationForest")
        
    def predict(self, features: Dict[str, float]) -> float:
        # Simulate: Low voltage or extremely high current increases anomaly probability
        voltage = features.get("voltage", 230)
        current = features.get("current", 5)
        
        prob = 0.05
        if voltage < 200 or voltage > 250:
            prob += 0.3
        if current > 20:
            prob += 0.4
            
        return min(prob + random.uniform(0, 0.1), 1.0)


class RandomForestMock(BaseMockModel):
    """
    Supervised Classification.
    Uses ensemble decision trees to classify known theft patterns.
    """
    def __init__(self):
        super().__init__("RandomForest")
        
    def predict(self, features: Dict[str, float]) -> float:
        pf = features.get("powerFactor", 0.95)
        # Low power factor often indicates meter tampering
        prob = 0.8 if pf < 0.7 else 0.1
        return min(prob + random.uniform(-0.1, 0.1), 1.0)


class XGBoostMock(BaseMockModel):
    """
    Gradient Boosting Classification.
    High performance non-linear relationships for subtle theft patterns.
    """
    def __init__(self):
        super().__init__("XGBoost")
        
    def predict(self, features: Dict[str, float]) -> float:
        usage = features.get("value", 1.0)
        # Simulate: Very low usage despite normal voltage/current indicates bypass
        prob = 0.7 if usage < 0.05 else 0.05
        return min(max(prob + random.uniform(-0.1, 0.2), 0.0), 1.0)


class LSTMMock(BaseMockModel):
    """
    Recurrent Neural Network (RNN).
    Detects temporal anomalies in a sequence of readings over time.
    """
    def __init__(self):
        super().__init__("LSTM")
        
    def predict_sequence(self, sequence: List[Dict[str, float]]) -> float:
        # Simulate sequence evaluation
        if len(sequence) < 3:
            return 0.1
            
        # Check for sudden drops in usage in the sequence
        values = [s.get("value", 0) for s in sequence]
        drop_magnitude = values[0] - values[-1]
        
        prob = 0.8 if drop_magnitude > 2.0 else 0.1
        return min(max(prob + random.uniform(0, 0.1), 0.0), 1.0)


class LinearRegressionMock(BaseMockModel):
    """
    Time Series Forecasting.
    Predicts next month's energy demand based on historical trends.
    """
    def __init__(self):
        super().__init__("LinearRegression")
        
    def forecast(self, historical_usage: List[float], days_ahead: int = 30) -> float:
        if not historical_usage:
            return 0.0
            
        avg_usage = sum(historical_usage) / len(historical_usage)
        trend = (historical_usage[-1] - historical_usage[0]) / len(historical_usage)
        
        predicted = avg_usage + (trend * days_ahead)
        return max(predicted, 0.0)


class KMeansMock(BaseMockModel):
    """
    Unsupervised Clustering.
    Segments consumers into clusters (e.g., Heavy Users, Night-time, Efficient).
    """
    def __init__(self):
        super().__init__("KMeans")
        self.cluster_names = {
            0: "Efficient Consumers",
            1: "Heavy Night-Time Users",
            2: "High Overall Consumption",
            3: "Irregular Patterns"
        }
        
    def predict_cluster(self, profile_features: Dict[str, float]) -> Dict[str, Any]:
        monthly_avg = profile_features.get("monthly_avg", 300)
        
        if monthly_avg > 800:
            cluster_id = 2
        elif monthly_avg < 200:
            cluster_id = 0
        else:
            cluster_id = random.choice([1, 3])
            
        return {
            "cluster_id": cluster_id,
            "cluster_name": self.cluster_names[cluster_id]
        }


class RecommendationEngine:
    """
    Rule-based or Collaborative Filtering Engine.
    Maps KMeans clusters and usage patterns to actionable energy-saving tips.
    """
    def get_recommendations(self, cluster_id: int) -> List[str]:
        recommendations = {
            0: ["Your usage is excellent! Consider joining our green energy tier."],
            1: ["Shift high-load appliances to off-peak hours (10 AM - 4 PM) for lower tariffs."],
            2: ["Schedule a smart-home energy audit to identify heavy load sources.", "Upgrade to energy-efficient HVAC systems."],
            3: ["Consider a smart thermostat to regulate your irregular heating/cooling patterns."]
        }
        return recommendations.get(cluster_id, ["Monitor your daily usage on the dashboard."])


# Singleton Manager
class AIModelManager:
    def __init__(self):
        self.isolation_forest = IsolationForestMock()
        self.random_forest = RandomForestMock()
        self.xgboost = XGBoostMock()
        self.lstm = LSTMMock()
        self.linear_regression = LinearRegressionMock()
        self.kmeans = KMeansMock()
        self.recommendation_engine = RecommendationEngine()
        
    def ensemble_anomaly_score(self, features: Dict[str, float]) -> Dict[str, Any]:
        """Combine Isolation Forest, Random Forest, and XGBoost."""
        if_score = self.isolation_forest.predict(features)
        rf_score = self.random_forest.predict(features)
        xgb_score = self.xgboost.predict(features)
        
        # Weighted ensemble
        final_score = (if_score * 0.4) + (rf_score * 0.3) + (xgb_score * 0.3)
        
        return {
            "is_anomaly": final_score > 0.65,
            "confidence": round(final_score * 100, 2),
            "breakdown": {
                "isolation_forest": round(if_score, 2),
                "random_forest": round(rf_score, 2),
                "xgboost": round(xgb_score, 2)
            }
        }

model_manager = AIModelManager()
