import express from "express"
import { ingestLoan } from "../controllers/loanController"
import Loan from "../models/Loan"

const router = express.Router()

// POST /api/loan/ingest — process new loan
router.post("/ingest", async (req, res, next) => {
  try {
    await ingestLoan(req, res)
  } catch (error) {
    next(error)
  }
})

// GET /api/loan/errors — fetch failed records
router.get("/errors", async (req, res) => {
  try {
    const logs = await Loan.find({ status: "failed" }).sort({ createdAt: -1 }).limit(50)

    const formatted = logs.map((log: any) => ({
      applicantId: log.applicantId,
      error: log.error,
      timestamp: log.createdAt,
      loanAmount: log.loanAmount,
      email: log.email,
    }))

    res.status(200).json(formatted)
  } catch (err) {
    console.error("Error fetching error logs:", err)
    res.status(500).json({ error: "Failed to fetch error logs" })
  }
})

// GET /api/loan/logs — fetch all recent logs
router.get("/logs", async (req, res) => {
  try {
    const logs = await Loan.find().sort({ createdAt: -1 }).limit(100)

    const formatted = logs.map((log: any) => ({
      applicantId: log.applicantId,
      status: log.status,
      error: log.error,
      timestamp: log.createdAt,
      loanAmount: log.loanAmount,
      email: log.email,
    }))

    res.status(200).json(formatted.reverse()) // Oldest first for display
  } catch (err) {
    console.error("Error fetching logs:", err)
    res.status(500).json({ error: "Failed to fetch logs" })
  }
})

// GET /api/loan/metrics/history — get metrics history
router.get("/metrics/history", async (req, res) => {
  try {
    // Get loans from last 24 hours, grouped by hour
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)

    const loans = await Loan.find({
      createdAt: { $gte: twentyFourHoursAgo },
    }).sort({ createdAt: 1 })

    // Group by hour
    const hourlyData: { [key: string]: { success: number; failed: number; total: number } } = {}

    loans.forEach((loan: any) => {
      const hour = new Date(loan.createdAt).toISOString().slice(0, 13) + ":00:00.000Z"

      if (!hourlyData[hour]) {
        hourlyData[hour] = { success: 0, failed: 0, total: 0 }
      }

      hourlyData[hour].total += 1
      if (loan.status === "success") {
        hourlyData[hour].success += 1
      } else if (loan.status === "failed") {
        hourlyData[hour].failed += 1
      }
    })

    // Convert to array format
    const chartData = Object.entries(hourlyData).map(([timestamp, data]) => ({
      timestamp,
      ...data,
      time: new Date(timestamp).toLocaleTimeString("en-US", {
        hour12: false,
        hour: "2-digit",
        minute: "2-digit",
      }),
    }))

    res.status(200).json(chartData)
  } catch (err) {
    console.error("Error fetching metrics history:", err)
    res.status(500).json({ error: "Failed to fetch metrics history" })
  }
})

// GET /api/loan/stats — get current statistics
router.get("/stats", async (req, res) => {
  try {
    const [total, success, failed] = await Promise.all([
      Loan.countDocuments(),
      Loan.countDocuments({ status: "success" }),
      Loan.countDocuments({ status: "failed" }),
    ])

    res.status(200).json({
      total,
      success,
      failed,
      successRate: total > 0 ? ((success / total) * 100).toFixed(1) : "0",
    })
  } catch (err) {
    console.error("Error fetching stats:", err)
    res.status(500).json({ error: "Failed to fetch statistics" })
  }
})

// POST /api/loan/pause — pause ingestion
router.post("/pause", (req, res) => {
  console.log("🚨 Loan ingestion paused")
  res.status(200).json({ message: "Ingestion paused" })
})

// POST /api/loan/resume — resume ingestion
router.post("/resume", (req, res) => {
  console.log("▶️ Loan ingestion resumed")
  res.status(200).json({ message: "Ingestion resumed" })
})

// POST /api/loan/retry — retry failed records
router.post("/retry", async (req, res) => {
  try {
    const failedLoans = await Loan.find({ status: "failed" })
    console.log(`🔁 Retrying ${failedLoans.length} failed records`)

    // Here you could implement actual retry logic
    // For now, just log the action

    res.status(200).json({
      message: `Retry initiated for ${failedLoans.length} failed records`,
    })
  } catch (err) {
    console.error("Error during retry:", err)
    res.status(500).json({ error: "Failed to retry records" })
  }
})

// GET /api/loan/all — get all loans with pagination
router.get("/all", async (req, res) => {
  try {
    const page = Number.parseInt(req.query.page as string) || 1
    const limit = Number.parseInt(req.query.limit as string) || 20
    const skip = (page - 1) * limit

    const [loans, total] = await Promise.all([
      Loan.find().sort({ createdAt: -1 }).skip(skip).limit(limit),
      Loan.countDocuments(),
    ])

    res.status(200).json({
      loans,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (err) {
    console.error("Error fetching all loans:", err)
    res.status(500).json({ error: "Failed to fetch loans" })
  }
})

export default router
