// src/components/Chart.tsx
"use client";

import { useEffect, useState } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from "recharts";

export default function RealtimeChart() {
  const [data, setData] = useState<any[]>([]);

  useEffect(() => {
    const ws = new WebSocket("ws://localhost:5000");

    ws.onmessage = (event) => {
      const metrics = JSON.parse(event.data);
      setData((prev) => [
        ...prev.slice(-19),
        {
          time: new Date().toLocaleTimeString(),
          success: metrics.success,
          failed: metrics.failed,
        },
      ]);
    };

    return () => ws.close();
  }, []);

  return (
    <div className="bg-white rounded-xl p-4 shadow-xl w-full">
      <h2 className="text-xl font-semibold mb-4">📈 Success vs Failed (Live)</h2>
      <LineChart width={600} height={300} data={data}>
        <XAxis dataKey="time" />
        <YAxis allowDecimals={false} />
        <Tooltip />
        <Legend />
        <CartesianGrid stroke="#ccc" />
        <Line type="monotone" dataKey="success" stroke="#4ade80" strokeWidth={2} />
        <Line type="monotone" dataKey="failed" stroke="#f87171" strokeWidth={2} />
      </LineChart>
    </div>
  );
}
