import WebSocket from "ws"

export const metrics = {
  total: 0,
  success: 0,
  failed: 0,
}

let socketClients: WebSocket[] = []

export const registerClient = (ws: WebSocket) => {
  socketClients.push(ws)
  console.log(`📡 WebSocket client connected. Total clients: ${socketClients.length}`)

  // Send current metrics to new client
  ws.send(
    JSON.stringify({
      type: "metrics",
      data: metrics,
    }),
  )
}

export const removeClient = (ws: WebSocket) => {
  socketClients = socketClients.filter((client) => client !== ws)
  console.log(`📡 WebSocket client disconnected. Total clients: ${socketClients.length}`)
}

export const broadcastMetrics = () => {
  const message = JSON.stringify({
    type: "metrics",
    data: metrics,
    timestamp: new Date().toISOString(),
  })

  socketClients.forEach((ws, i) => {
    try {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(message)
      }
    } catch (e) {
      console.error("Error sending to WebSocket client:", e)
      socketClients.splice(i, 1)
    }
  })
}

export const broadcastNewLoan = (loan: any) => {
  const message = JSON.stringify({
    type: "newLoan",
    data: {
      applicantId: loan.applicantId,
      status: loan.status,
      error: loan.error,
      timestamp: loan.createdAt,
      loanAmount: loan.loanAmount,
      email: loan.email,
    },
    timestamp: new Date().toISOString(),
  })

  socketClients.forEach((ws, i) => {
    try {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(message)
      }
    } catch (e) {
      console.error("Error sending loan update to WebSocket client:", e)
      socketClients.splice(i, 1)
    }
  })
}

// Initialize metrics from database on startup
export const initializeMetrics = async () => {
  try {
    const Loan = require("../models/Loan").default

    const [total, success, failed] = await Promise.all([
      Loan.countDocuments(),
      Loan.countDocuments({ status: "success" }),
      Loan.countDocuments({ status: "failed" }),
    ])

    metrics.total = total
    metrics.success = success
    metrics.failed = failed

    console.log("📊 Metrics initialized:", metrics)
  } catch (error) {
    console.error("Error initializing metrics:", error)
  }
}

// Periodically sync metrics with database
setInterval(async () => {
  try {
    const Loan = require("../models/Loan").default

    const [total, success, failed] = await Promise.all([
      Loan.countDocuments(),
      Loan.countDocuments({ status: "success" }),
      Loan.countDocuments({ status: "failed" }),
    ])

    metrics.total = total
    metrics.success = success
    metrics.failed = failed

    broadcastMetrics()
  } catch (error) {
    console.error("Error syncing metrics:", error)
  }
}, 10000) // Sync every 10 seconds
