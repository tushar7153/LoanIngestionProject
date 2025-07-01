"use client";
import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

// Define the type for each data point
interface MetricSnapshot {
  timestamp: string;
  success: number;
  failed: number;
  total: number;
}

export default function LiveMetricsChart() {
  const [data, setData] = useState<MetricSnapshot[]>([]);

  const fetchHistory = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/loan/metrics/history");
      const json = await res.json();
      setData(json);
    } catch (err) {
      console.error("Failed to fetch metric history:", err);
    }
  };

  useEffect(() => {
    fetchHistory(); // initial load
    const interval = setInterval(fetchHistory, 5000); // refresh every 5s
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-white dark:bg-gray-900 p-6 mt-8 rounded-2xl shadow-xl w-full">
      <h2 className="text-xl font-bold mb-4">📈 Live Metrics Over Time</h2>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="timestamp" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line
            type="monotone"
            dataKey="success"
            stroke="#16a34a"
            strokeWidth={2}
            dot={false}
          />
          <Line
            type="monotone"
            dataKey="failed"
            stroke="#dc2626"
            strokeWidth={2}
            dot={false}
          />
          <Line
            type="monotone"
            dataKey="total"
            stroke="#2563eb"
            strokeWidth={2}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
