import type { Server } from "http"
import WebSocket from "ws"
import { registerClient, removeClient, initializeMetrics } from "../services/metrics"

export const initWebSocket = (server: Server) => {
  const wss = new WebSocket.Server({
    server,
    path: "/ws",
  })

  // Initialize metrics from database
  initializeMetrics()

  wss.on("connection", (ws: WebSocket, req) => {
    console.log("🔌 New WebSocket connection established")

    registerClient(ws)

    ws.on("message", (message: string) => {
      try {
        const data = JSON.parse(message)
        console.log("📨 Received WebSocket message:", data)

        // Handle different message types if needed
        switch (data.type) {
          case "ping":
            ws.send(JSON.stringify({ type: "pong", timestamp: new Date().toISOString() }))
            break
          default:
            console.log("Unknown message type:", data.type)
        }
      } catch (error) {
        console.error("Error parsing WebSocket message:", error)
      }
    })

    ws.on("close", (code, reason) => {
      console.log(`🔌 WebSocket connection closed: ${code} ${reason}`)
      removeClient(ws)
    })

    ws.on("error", (error) => {
      console.error("WebSocket error:", error)
      removeClient(ws)
    })

    // Send ping every 30 seconds to keep connection alive
    const pingInterval = setInterval(() => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.ping()
      } else {
        clearInterval(pingInterval)
      }
    }, 30000)
  })

  console.log("🔌 WebSocket server initialized")
}
