from flask import Flask, request, jsonify
from flask_cors import CORS
import numpy as np
import requests
import datetime
from tensorflow.keras.models import load_model
from sklearn.preprocessing import MinMaxScaler

app = Flask(__name__)
CORS(app)

model = load_model("timeseries_price_LSTM.h5")

@app.route("/predict")
def predict():
    try:
        coin = request.args.get("coin", "bitcoin").lower()
        print("📥 Coin:", coin)

        url = f"https://api.coingecko.com/api/v3/coins/{coin}/market_chart?vs_currency=usd&days=30"
        res = requests.get(url)
        res.raise_for_status()
        data = res.json()
        print("✅ Respon dari CoinGecko OK")

        if "prices" not in data:
            raise KeyError("Key 'prices' tidak ditemukan di respon API")

        prices = data["prices"]
        close_prices = np.array([p[1] for p in prices]).reshape(-1, 1)
        print(f"✅ Jumlah harga ditarik: {len(close_prices)}")

        scaler = MinMaxScaler()
        scaled = scaler.fit_transform(close_prices)

        window_size = 30
        if len(scaled) < window_size:
            return jsonify({"error": "Data tidak cukup"}), 400

        input_seq = scaled[-window_size:].reshape(1, window_size, 1)

        predictions = []
        for _ in range(7):
            pred = model.predict(input_seq, verbose=0)[0][0]
            predictions.append(pred)
            input_seq = np.append(input_seq[:, 1:, :], [[[pred]]], axis=1)

        predicted = scaler.inverse_transform(np.array(predictions).reshape(-1, 1)).flatten().tolist()
        today = datetime.date.today()
        dates = [(today + datetime.timedelta(days=i)).isoformat() for i in range(1, 8)]

        return jsonify({
            "dates": dates,
            "predicted": predicted
        })

    except Exception as e:
        print("❌ ERROR:", e)
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(debug=True, port=5050)
