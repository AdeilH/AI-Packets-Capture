import numpy as np
import pandas as pd
from sklearn.ensemble import IsolationForest
from sklearn.preprocessing import StandardScaler
import joblib
import os
from datetime import datetime

class AnomalyDetector:
    def __init__(self):
        self.model = None
        self.scaler = StandardScaler()
        self.feature_columns = None
        self.stats = {
            'total_anomalies': 0,
            'last_training': None,
            'training_samples': 0
        }
        self.model_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'models', 'isolation_forest.joblib')
        self._load_model()
    
    def _load_model(self):
        """Load pre-trained model if available"""
        if os.path.exists(self.model_path):
            try:
                model_data = joblib.load(self.model_path)
                self.model = model_data['model']
                self.scaler = model_data['scaler']
                self.feature_columns = model_data['feature_columns']
                self.stats = model_data['stats']
                return True
            except Exception as e:
                print(f"Error loading model: {e}")
        return False
    
    def _save_model(self):
        """Save the trained model"""
        os.makedirs(os.path.dirname(self.model_path), exist_ok=True)
        model_data = {
            'model': self.model,
            'scaler': self.scaler,
            'feature_columns': self.feature_columns,
            'stats': self.stats
        }
        joblib.dump(model_data, self.model_path)
    
    def train(self, packet_features):
        """Train the anomaly detection model on packet features"""
        if packet_features.empty:
            return False
        
        # Select numerical features only
        numerical_features = packet_features.select_dtypes(include=[np.number])
        self.feature_columns = numerical_features.columns.tolist()
        
        # Scale features
        X = self.scaler.fit_transform(numerical_features)
        
        # Train Isolation Forest model
        self.model = IsolationForest(
            n_estimators=100,
            contamination=0.05,  # Assume 5% of data is anomalous
            random_state=42
        )
        
        self.model.fit(X)
        
        # Update stats
        self.stats['last_training'] = datetime.now().isoformat()
        self.stats['training_samples'] = len(packet_features)
        
        self._save_model()
        return True
    
    def analyze(self, packet_data):
        """Analyze packets for anomalies using the trained model"""
        from packet_processing.packet_parser import PacketParser
        
        # Create a packet parser instance
        parser = PacketParser()
        
        # Extract features
        packet_features = parser.extract_features(packet_data)
        
        if packet_features.empty:
            return {
                'anomalies': [],
                'summary': {
                    'total_packets': len(packet_data),
                    'anomaly_percentage': 0.0
                }
            }
        
        # If we don't have a model yet, train one
        if self.model is None:
            self.train(packet_features)
            return {
                'anomalies': [],
                'summary': {
                    'total_packets': len(packet_data),
                    'anomaly_percentage': 0.0,
                    'message': 'Initial model trained. No anomalies detected.'
                }
            }
        
        # Ensure we have all required features
        if self.feature_columns:
            # Select and create necessary columns
            for col in self.feature_columns:
                if col not in packet_features:
                    packet_features[col] = 0
            
            numerical_features = packet_features[self.feature_columns]
            
            # Scale features
            X = self.scaler.transform(numerical_features)
            
            # Predict anomalies
            anomaly_scores = self.model.decision_function(X)
            predictions = self.model.predict(X)
            
            # Prepare results
            anomalies = []
            for i, pred in enumerate(predictions):
                if pred == -1:  # Anomaly
                    anomaly_record = packet_features.iloc[i].to_dict()
                    anomaly_record['anomaly_score'] = float(anomaly_scores[i])
                    anomalies.append(anomaly_record)
            
            # Update stats
            self.stats['total_anomalies'] += len(anomalies)
            
            return {
                'anomalies': anomalies,
                'summary': {
                    'total_packets': len(packet_data),
                    'anomaly_count': len(anomalies),
                    'anomaly_percentage': (len(anomalies) / len(packet_features)) * 100
                }
            }
        
        # If we don't have feature columns, train the model first
        self.train(packet_features)
        return {
            'anomalies': [],
            'summary': {
                'total_packets': len(packet_data),
                'anomaly_percentage': 0.0,
                'message': 'Model trained. Run analysis again to detect anomalies.'
            }
        }
    
    def get_stats(self):
        """Return detector statistics"""
        return self.stats
    
    def get_model_info(self):
        """Return information about the model"""
        if self.model is None:
            return {
                'status': 'not_trained',
                'message': 'Model not yet trained'
            }
        
        return {
            'status': 'trained',
            'last_training': self.stats['last_training'],
            'training_samples': self.stats['training_samples'],
            'feature_count': len(self.feature_columns) if self.feature_columns else 0
        } 