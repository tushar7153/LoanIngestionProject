import type { Request, Response } from "express"
import { validateLoan } from "../utils/validate"
import Loan from "../models/Loan"
import { metrics, broadcastMetrics, broadcastNewLoan } from "../services/metrics"

export const ingestLoan = async (req: Request, res: Response) => {
  try {
    const data = req.body
    console.log("📥 Received loan application:", data)

    // Increment total count
    metrics.total += 1

    // Validate the loan data
    const result = validateLoan(data)

    if (!result.success) {
      // Create failed record
      const failedLoan = await Loan.create({
        ...data,
        status: "failed",
        error: result.error,
        processedAt: new Date(),
      })

      metrics.failed += 1

      // Broadcast updates
      broadcastMetrics()
      broadcastNewLoan(failedLoan)

      console.log("❌ Loan validation failed:", result.error)
      return res.status(400).json({
        success: false,
        error: result.error,
        applicantId: data.applicantId,
      })
    }

    // Create successful record
    const successfulLoan = await Loan.create({
      ...data,
      status: "success",
      processedAt: new Date(),
    })

    metrics.success += 1

    // Broadcast updates
    broadcastMetrics()
    broadcastNewLoan(successfulLoan)

    console.log("✅ Loan processed successfully:", data.applicantId)
    return res.status(200).json({
      success: true,
      message: "Loan application processed successfully",
      applicantId: data.applicantId,
      loanId: successfulLoan._id,
    })
  } catch (error: any) {
    console.error("💥 Error processing loan:", error)

    // Handle duplicate key error
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        error: "Applicant ID already exists. Please use a unique ID.",
      })
    }

    metrics.failed += 1
    broadcastMetrics()

    return res.status(500).json({
      success: false,
      error: "Internal server error. Please try again.",
    })
  }
}
