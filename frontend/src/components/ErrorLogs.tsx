"use client";
import { useEffect, useState } from "react";

// Define Log type
interface Log {
  applicantId: string;
  error: string;
  timestamp: string;
  status?: string;
}

export default function ErrorLogs() {
  const [logs, setLogs] = useState<Log[]>([]);
  const [filtered, setFiltered] = useState<Log[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [errorType, setErrorType] = useState("All");
  const [timeRange, setTimeRange] = useState("all");

  const fetchLogs = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/loan/errors");
      const data = await res.json();
      setLogs(data);
    } catch (err) {
      console.error("Failed to fetch logs:", err);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    const now = new Date();
    let filteredLogs = [...logs];

    if (timeRange !== "all") {
      const cutoff = new Date();
      if (timeRange === "1h") cutoff.setHours(now.getHours() - 1);
      if (timeRange === "24h") cutoff.setDate(now.getDate() - 1);
      if (timeRange === "7d") cutoff.setDate(now.getDate() - 7);
      filteredLogs = filteredLogs.filter(
        (log) => new Date(log.timestamp) > cutoff
      );
    }

    if (searchTerm.trim()) {
      filteredLogs = filteredLogs.filter((log) =>
        log.applicantId.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (errorType !== "All") {
      filteredLogs = filteredLogs.filter((log) =>
        log.error.toLowerCase().includes(errorType.toLowerCase())
      );
    }

    setFiltered(filteredLogs);
  };

  useEffect(() => {
    fetchLogs();
    const interval = setInterval(fetchLogs, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    applyFilters();
  }, [logs, searchTerm, errorType, timeRange]);

  const handleRetry = async () => {
    try {
      await fetch("http://localhost:5000/api/loan/retry", { method: "POST" });
      fetchLogs();
    } catch (err) {
      console.error("Retry failed:", err);
    }
  };

  const exportCSV = () => {
    const csvContent = [
      ["Applicant ID", "Error", "Timestamp"],
      ...filtered.map((log) => [
        log.applicantId,
        log.error,
        new Date(log.timestamp).toLocaleString(),
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "error-logs.csv";
    link.click();
  };

  return (
    <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-xl w-full mt-8 overflow-auto">
      <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
        <h2 className="text-xl font-bold">❌ Failed Logs</h2>
        <div className="flex gap-2">
          <button
            onClick={handleRetry}
            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
          >
            Retry Failed
          </button>
          <button
            onClick={exportCSV}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Export CSV
          </button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row sm:flex-wrap sm:justify-start gap-4 mb-6 items-start sm:items-center">
        <input
          type="text"
          placeholder="Search Applicant ID"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="px-3 py-2 rounded-lg border dark:bg-gray-800 dark:text-white w-full sm:w-[180px]"
        />
        <select
          value={errorType}
          onChange={(e) => setErrorType(e.target.value)}
          className="px-3 py-2 rounded-lg border dark:bg-gray-800 dark:text-white w-full sm:w-[160px]"
        >
          <option>All</option>
          <option>Email Invalid</option>
          <option>Loan Amount Missing</option>
          <option>Other</option>
        </select>
        <select
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value)}
          className="px-3 py-2 rounded-lg border dark:bg-gray-800 dark:text-white w-full sm:w-[160px]"
        >
          <option value="all">All Time</option>
          <option value="1h">Last 1 Hour</option>
          <option value="24h">Last 24 Hours</option>
          <option value="7d">Last 7 Days</option>
        </select>
      </div>

      {loading ? (
        <p className="text-center text-gray-500">Loading...</p>
      ) : filtered.length === 0 ? (
        <p className="text-center text-green-500">No matching logs 🎉</p>
      ) : (
        <table className="min-w-full text-sm text-left border-collapse">
          <thead>
            <tr className="bg-gray-200 dark:bg-gray-800 text-gray-600 dark:text-gray-300">
              <th className="px-4 py-2 border-b">Applicant ID</th>
              <th className="px-4 py-2 border-b">Error</th>
              <th className="px-4 py-2 border-b">Timestamp</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((log, idx) => (
              <tr
                key={idx}
                className="hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <td className="px-4 py-2 border-b">{log.applicantId}</td>
                <td className="px-4 py-2 border-b text-red-600 dark:text-red-400">
                  {log.error}
                </td>
                <td className="px-4 py-2 border-b">
                  {new Date(log.timestamp).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
