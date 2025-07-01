"use client";
import { useEffect, useState, useRef } from "react";

// Define log structure
interface Log {
  applicantId: string;
  status: string;
  error?: string;
  timestamp: string;
}

export default function LiveLogsFeed() {
  const [logs, setLogs] = useState<Log[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  const fetchLogs = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/loan/logs");
      const data = await res.json();
      setLogs(data);
    } catch (err) {
      console.error("Failed to fetch live logs:", err);
    }
  };

  useEffect(() => {
    fetchLogs();
    const interval = setInterval(fetchLogs, 3000);
    return () => clearInterval(interval);
  }, []);

  // Scroll to bottom on new logs
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [logs]);

  return (
    <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-xl mt-8 w-full max-h-[300px] overflow-y-auto">
      <h2 className="text-xl font-bold mb-4">📡 Live Log Feed</h2>
      <div ref={containerRef} className="space-y-2 text-sm font-mono">
        {logs.map((log, idx) => (
          <div
            key={idx}
            className={`p-2 rounded-lg ${
              log.status === "success"
                ? "bg-green-100 text-green-800 dark:bg-green-900/30"
                : "bg-red-100 text-red-800 dark:bg-red-900/30"
            }`}
          >
            <div>
              [{new Date(log.timestamp).toLocaleTimeString()}] —{" "}
              <strong>{log.applicantId}</strong> —{" "}
              {log.status === "success" ? "✅ Success" : `❌ ${log.error}`}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
