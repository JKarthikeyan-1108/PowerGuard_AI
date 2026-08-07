import torch
import torch.nn as nn
import numpy as np
import pandas as pd
from sklearn.preprocessing import MinMaxScaler
import os

MODEL_DIR = os.path.join(os.path.dirname(__file__), 'saved_models')
os.makedirs(MODEL_DIR, exist_ok=True)

class LSTMModel(nn.Module):
    def __init__(self, input_size=1, hidden_layer_size=50, output_size=1):
        super().__init__()
        self.hidden_layer_size = hidden_layer_size
        self.lstm = nn.LSTM(input_size, hidden_layer_size, batch_first=True)
        self.linear = nn.Linear(hidden_layer_size, output_size)

    def forward(self, input_seq):
        lstm_out, _ = self.lstm(input_seq)
        predictions = self.linear(lstm_out[:, -1, :])
        return predictions

class DemandForecastModel:
    def __init__(self, version="v1.0"):
        self.version = version
        self.model = None
        self.scaler = None
        self._load_models()

    def _get_model_paths(self):
        return {
            'model': os.path.join(MODEL_DIR, f'demand_lstm_{self.version}.pt'),
            'scaler': os.path.join(MODEL_DIR, f'demand_scaler_{self.version}.joblib')
        }

    def _load_models(self):
        paths = self._get_model_paths()
        if os.path.exists(paths['model']):
            import joblib
            self.model = LSTMModel()
            self.model.load_state_dict(torch.load(paths['model']))
            self.model.eval()
            if os.path.exists(paths['scaler']):
                self.scaler = joblib.load(paths['scaler'])
        else:
            print(f"Demand Forecast Model version {self.version} not found. Please train first.")

    def create_inout_sequences(self, input_data, tw):
        inout_seq = []
        L = len(input_data)
        for i in range(L-tw):
            train_seq = input_data[i:i+tw]
            train_label = input_data[i+tw:i+tw+1]
            inout_seq.append((train_seq ,train_label))
        return inout_seq

    def train(self, df: pd.DataFrame, epochs=50):
        """
        Expects df with column 'demand' sorted by time.
        """
        import joblib
        
        data = df['demand'].values.astype(float)
        
        self.scaler = MinMaxScaler(feature_range=(-1, 1))
        train_data_normalized = self.scaler.fit_transform(data.reshape(-1, 1))
        
        train_data_normalized = torch.FloatTensor(train_data_normalized)
        
        train_window = 24 # Use last 24 hours to predict next
        train_inout_seq = self.create_inout_sequences(train_data_normalized, train_window)
        
        self.model = LSTMModel()
        loss_function = nn.MSELoss()
        optimizer = torch.optim.Adam(self.model.parameters(), lr=0.001)

        self.model.train()
        for i in range(epochs):
            for seq, labels in train_inout_seq:
                optimizer.zero_grad()
                
                # Reshape for batch_first=True
                seq = seq.unsqueeze(0) 
                
                y_pred = self.model(seq)
                
                single_loss = loss_function(y_pred, labels.unsqueeze(0))
                single_loss.backward()
                optimizer.step()

        paths = self._get_model_paths()
        torch.save(self.model.state_dict(), paths['model'])
        joblib.dump(self.scaler, paths['scaler'])
        print(f"Demand Forecast Model version {self.version} trained and saved.")

    def predict(self, recent_history: list):
        if not self.model or not self.scaler:
            raise ValueError("Models are not loaded.")

        if len(recent_history) < 24:
            # pad with mean if not enough data
            mean_val = np.mean(recent_history) if recent_history else 1000.0
            recent_history = ([mean_val] * (24 - len(recent_history))) + recent_history

        recent_history = recent_history[-24:]
        
        normalized = self.scaler.transform(np.array(recent_history).reshape(-1, 1))
        seq = torch.FloatTensor(normalized).unsqueeze(0)
        
        self.model.eval()
        with torch.no_grad():
            pred = self.model(seq)
            
        pred_actual = self.scaler.inverse_transform(pred.numpy())
        predicted_demand = float(pred_actual[0][0])

        return {
            "predicted_demand": round(predicted_demand, 2),
            "confidence": 0.85, # Simplification
            "model_version": self.version
        }
