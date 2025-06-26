from flask import Flask, request, jsonify
from flask_cors import CORS
from joblib import load
import pandas as pd
import numpy as np
import os

app = Flask(__name__)
CORS(app, origins=["https://dsylexia-final.vercel.app"], methods=["GET", "POST", "OPTIONS"])


# Load model and feature names
model = load("hybrid_model.pkl")
feature_columns = load("feature_columns.pkl")

def process_input(data):
    """Convert raw input to properly formatted features"""
    try:
        # Create DataFrame from input
        df = pd.DataFrame([data])
        
        if 'memorycove_completedAllLevels' in df.columns:
            df['memorycove_completedAllLevels'] = df['memorycove_completedAllLevels'].astype(int)
        
        # Add this to handle potential NaN values
        df = df.fillna(0)

        required_columns = {
            'memorycove_accuracy': 0,
            'spellshore_accuracy': 0,
            'bubblebay_accuracy': 0,
            'wordreef_accuracy': 0,
            'total_game_time': 0
        }
        
        for col, default in required_columns.items():
            if col not in df.columns:
                df[col] = default
                
        # ====== Add ALL Derived Features ======
        # 1. Accuracy Variance
        accuracy_cols = [col for col in df.columns if 'accuracy' in col]
        df['accuracy_variance'] = df[accuracy_cols].var(axis=1) if accuracy_cols else 0
        
        # 2. Time Variance
        time_cols = [col for col in df.columns if 'time' in col and 'total' not in col]
        df['time_variance'] = df[time_cols].var(axis=1) if time_cols else 0
        
        # 3. Accuracy-to-Time Ratio
        mean_accuracy = df[accuracy_cols].mean(axis=1).replace(0, 1e-6)
        df['accuracy_to_time_ratio'] = df['total_game_time'] / mean_accuracy
        
        # 4. Interaction Terms
        df['memory_spelling_interaction'] = (df.get('memorycove_accuracy', 0) 
                                           * df.get('spellshore_accuracy', 0)) / 100
        df['phonology_orthography_interaction'] = (df.get('bubblebay_accuracy', 0) 
                                                 * df.get('wordreef_accuracy', 0)) / 100

        # ====== Validate Features ======
        missing = set(feature_columns) - set(df.columns)
        if missing:
            raise ValueError(f"Missing: {list(missing)}")
            
        return df[feature_columns]
        
    except Exception as e:
        raise RuntimeError(f"Feature processing failed: {str(e)}")

@app.route("/predict", methods=["POST"])
def predict():
    try:
        # ====== Critical Change ======
        data = request.json
        print("\nReceived raw data:", data)

        if "features" in data:  # Remove this key if present
            del data["features"]
            
        processed_data = process_input(data)
        print("Processed features:", processed_data.values.tolist())

        features = processed_data.values  # No reshape needed
        prediction = model.predict(features)[0]
        probabilities = model.predict_proba(features)[0]
        
        return jsonify({
            "prediction": "Dyslexic" if prediction == 1 else "Non-Dyslexic",
            "confidence": round(probabilities[prediction] * 100, 2)
        })
        
    except Exception as e:
        import traceback
        traceback.print_exc()  # Print full stack trace
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))  # Use Render's port or default to 5000
    app.run(host="0.0.0.0", port=port)