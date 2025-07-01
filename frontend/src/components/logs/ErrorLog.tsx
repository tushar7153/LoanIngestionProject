// src/components/logs/ErrorLog.tsx
"use client";

import { useEffect, useState } from "react";

interface ErrorLogEntry {
  applicantId: string;
  error: string;
  timestamp: string;
}

export default function ErrorLog() {
  const [logs, setLogs] = useState<ErrorLogEntry[]>([]);

  useEffect(() => {
    fetch("http://localhost:5000/api/loan/errors")
      .then((res) => res.json())
      .then((data) => setLogs(data));
  }, []);

  return (
    <div className="bg-white rounded-xl p-4 shadow-xl w-full">
      <h2 className="text-xl font-semibold mb-4">❌ Error Logs</h2>
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b">
            <th className="py-2">Applicant</th>
            <th className="py-2">Error</th>
            <th className="py-2">Time</th>
          </tr>
        </thead>
        <tbody>
          {logs.map((log, idx) => (
            <tr key={idx} className="border-b hover:bg-gray-100">
              <td className="py-2">{log.applicantId}</td>
              <td className="py-2 text-red-500">{log.error}</td>
              <td className="py-2 text-gray-500">{new Date(log.timestamp).toLocaleTimeString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
