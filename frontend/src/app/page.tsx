"use client";
import MetricsDisplay from "../components/MetricsDisplay";
import ControlsPanel from "../components/ControlPanel";
import ErrorLogs from "../components/ErrorLogs";
import LiveMetricsChart from "../components/LiveMetricsChart";
import LiveLogsFeed from "../components/LiveLogsFeed"; // ✅ Import the new component

export default function Home() {
  return (
    <main className="min-h-screen px-4 py-8 sm:px-12 bg-[#f9fbfd] dark:bg-[#0d1117] text-[#0a0a0a] dark:text-white">
      <h1 className="text-2xl sm:text-3xl font-bold mb-6 text-center">
        📊 Ultra-Fast Loan Dashboard
      </h1>

      {/* Top Row - Metrics + Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <MetricsDisplay />
        <ControlsPanel />
      </div>

      {/* Chart */}
      <div className="mb-8">
        <LiveMetricsChart />
      </div>

      {/* 🟢 Live Logs Feed */}
      <div className="mb-8">
        <LiveLogsFeed />
      </div>

      {/* ❌ Error Logs */}
      <ErrorLogs />
    </main>
  );
}
