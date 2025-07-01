import express from "express"
import mongoose from "mongoose"
import dotenv from "dotenv"
import cors from "cors"
import { createServer } from "http"
import loanRoutes from "./routes/loanRoutes"
import { initWebSocket } from "./websocket/wsServer"

dotenv.config()

const app = express()
const PORT = process.env.PORT || 5000

// Middleware
app.use(
  cors({
    origin: ["http://localhost:3000", "http://127.0.0.1:3000"],
    credentials: true,
  }),
)
app.use(express.json())

// Routes
app.use("/api/loan", loanRoutes)

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({ status: "OK", timestamp: new Date().toISOString() })
})

// MongoDB connection
const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/loan-ingestion"

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB connected successfully")

    // Create HTTP server
    const server = createServer(app)

    // Initialize WebSocket
    initWebSocket(server)

    // Start server
    server.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`)
      console.log(`📊 Dashboard: http://localhost:3000`)
      console.log(`🔌 WebSocket: ws://localhost:${PORT}`)
    })
  })
  .catch((err) => {
    console.error("❌ MongoDB connection failed:", err)
    process.exit(1)
  })
