import pandas as pd
import numpy as np
from datetime import datetime
from typing import List, Dict

class FeatureEngineeringService:
    def __init__(self):
        pass

    def derive_features(self, raw_readings: List[Dict]) -> Dict:
        """
        Derives features like daily units, peak-hour usage, and consumption trend 
        from raw sensor data for the ML pipeline.
        
        Args:
            raw_readings: List of dicts, each with 'timestamp', 'value', 'voltage', 'current' etc.
        """
        if not raw_readings:
            return {}

        df = pd.DataFrame(raw_readings)
        
        # Ensure timestamp is datetime
        if 'timestamp' in df.columns:
            df['timestamp'] = pd.to_datetime(df['timestamp'])
            df.set_index('timestamp', inplace=True)
            df.sort_index(inplace=True)
            
            # Derived Features
            # Peak hours assumed to be 18:00 to 22:00
            df['is_peak'] = df.index.hour.isin([18, 19, 20, 21])
            
            peak_usage = df[df['is_peak']]['value'].sum()
            total_usage = df['value'].sum()
            peak_usage_ratio = peak_usage / total_usage if total_usage > 0 else 0.0
            
            # Daily units (assuming data is over a known period, avg per day)
            days = (df.index.max() - df.index.min()).days
            days = days if days > 0 else 1
            avg_daily_usage = total_usage / days
            
            # Night usage ratio (00:00 to 06:00)
            df['is_night'] = df.index.hour.isin([0, 1, 2, 3, 4, 5])
            night_usage = df[df['is_night']]['value'].sum()
            night_usage_ratio = night_usage / total_usage if total_usage > 0 else 0.0
            
            # Weekend usage ratio
            df['is_weekend'] = df.index.weekday >= 5
            weekend_usage = df[df['is_weekend']]['value'].sum()
            weekend_usage_ratio = weekend_usage / total_usage if total_usage > 0 else 0.0
            
            return {
                "avg_daily_usage": float(avg_daily_usage),
                "peak_usage_ratio": float(peak_usage_ratio),
                "night_usage_ratio": float(night_usage_ratio),
                "weekend_usage_ratio": float(weekend_usage_ratio),
                "total_usage": float(total_usage)
            }
        
        # Fallback if no timestamp
        return {
            "avg_daily_usage": 15.0,
            "peak_usage_ratio": 0.3,
            "night_usage_ratio": 0.2,
            "weekend_usage_ratio": 0.2,
            "total_usage": sum([r.get('value', 0) for r in raw_readings])
        }

feature_engineering = FeatureEngineeringService()
