// src/App.tsx – CryptoZone (TSX version with dropdown, loading, and numeric prediction display)

import { useState } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

type PredictionData = {
  dates: string[];
  predicted: number[];
};

const coinOptions = [
  { label: "Bitcoin", value: "bitcoin" },
  { label: "Ethereum", value: "ethereum" },
  { label: "Solana", value: "solana" },
  { label: "Cardano", value: "cardano" },
  { label: "Ripple", value: "ripple" },
];

export default function App() {
  const [coin, setCoin] = useState<string>("bitcoin");
  const [data, setData] = useState<PredictionData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const fetchPrediction = async () => {
    setLoading(true);
    try {
      const res = await fetch(`https://cryptoui-production.up.railway.app/predict?coin=${coin}`);
      const json = await res.json();
      setData(json);
    } catch (err) {
      console.error("Failed to fetch prediction:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        width: "100vw",
        minHeight: "100vh",
        padding: "2rem",
        backgroundColor: "#121212",
        color: "#ffffff",
        textAlign: "center"
      }}
    >
      <h1 style={{ fontSize: "2rem" }}>CryptOracle 🔮</h1>
      <p style={{ marginBottom: "1rem" }}>
        Prediksi harga kripto menggunakan Machine Learning
      </p>

      <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1.5rem" }}>
        <select
          value={coin}
          onChange={(e) => setCoin(e.target.value)}
          style={{ padding: "0.5rem", width: "200px" }}
        >
          {coinOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
        <button onClick={fetchPrediction} disabled={loading}>
          {loading ? "Loading..." : "Prediksi"}
        </button>
      </div>

      {loading && <p>⏳ Sedang memuat prediksi harga...</p>}

      {data && (
        <div style={{ width: "100%", maxWidth: "700px" }}>
          <h3>Prediksi Harga {coin}</h3>
          <Line
            data={{
              labels: data.dates,
              datasets: [
                {
                  label: "Harga Prediksi",
                  data: data.predicted,
                  borderColor: "orange",
                  backgroundColor: "rgba(255,165,0,0.2)",
                },
              ],
            }}
          />
          <ul style={{ marginTop: "1rem", listStyle: "none", padding: 0 }}>
            {data.predicted.map((val, i) => (
              <li key={i}>{data.dates[i]}: ${val.toFixed(2)}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
