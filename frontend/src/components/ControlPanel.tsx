"use client";
import { useState } from "react";

export default function ControlsPanel() {
  const [isPaused, setIsPaused] = useState(false);
  const [message, setMessage] = useState("");

  const handlePauseToggle = async () => {
    try {
      await fetch(`http://localhost:5000/api/loan/${isPaused ? "resume" : "pause"}`, {
        method: "POST",
      });
      setIsPaused(!isPaused);
      setMessage(`System ${isPaused ? "resumed" : "paused"} successfully.`);
    } catch (error) {
      console.error("Failed to toggle pause:", error);
      setMessage("Failed to update system state.");
    }
  };

  const handleRetry = async () => {
    try {
      await fetch("http://localhost:5000/api/loan/retry", {
        method: "POST",
      });
      setMessage("Retry triggered for failed records.");
    } catch (error) {
      console.error("Retry failed:", error);
      setMessage("Retry request failed.");
    }
  };

  return (
    <div className="bg-white dark:bg-gray-900 shadow-xl rounded-2xl p-6 w-full max-w-md mt-8">
      <h2 className="text-xl font-bold mb-4 text-center">Controls</h2>

      <div className="flex flex-col gap-4">
        <button
          onClick={handlePauseToggle}
          className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 transition"
        >
          {isPaused ? "Resume Ingestion" : "Pause Ingestion"}
        </button>

        <button
          onClick={handleRetry}
          className="px-4 py-2 rounded bg-yellow-500 text-white hover:bg-yellow-600 transition"
        >
          Retry Failed Records
        </button>

        {message && <p className="text-sm text-center text-gray-500 mt-2">{message}</p>}
      </div>
    </div>
  );
}
