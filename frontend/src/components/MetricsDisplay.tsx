"use client";
import useWebSocket from "../hooks/useWebSocket";

export default function MetricsDisplay() {
  const { total, success, failed } = useWebSocket("ws://localhost:5000");

  return (
    <div className="bg-white dark:bg-gray-900 shadow-lg rounded-2xl p-6 w-full max-w-md">
      <h2 className="text-xl font-bold mb-4 text-center">Live Metrics</h2>
      <ul className="space-y-2 text-lg">
        <li>📥 Total Received: <strong>{total}</strong></li>
        <li>✅ Success: <strong className="text-green-600">{success}</strong></li>
        <li>❌ Failed: <strong className="text-red-600">{failed}</strong></li>
      </ul>
    </div>
  );
}
