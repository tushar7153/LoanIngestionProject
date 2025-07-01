import express, { Request, Response, NextFunction } from "express";
import { ingestLoan } from "../controllers/loanController";
import Loan from "../models/Loan";

const router = express.Router();

// ✅ POST /api/loan/ingest — for processing incoming loans
router.post("/ingest", async (req: Request, res: Response, next: NextFunction) => {
  try {
    await ingestLoan(req, res);
  } catch (err) {
    next(err); // pass error to express error handler
  }
});

// ✅ GET /api/loan/errors — fetch latest 20 failed records
router.get("/errors", async (req: Request, res: Response) => {
  try {
    const logs = await Loan.find({ status: "failed" })
      .sort({ createdAt: -1 })
      .limit(20);

    const formattedLogs = logs.map((log: any) => ({
      applicantId: log.applicantId,
      error: log.error,
      timestamp: log.createdAt,
    }));

    res.status(200).json(formattedLogs);
  } catch (err) {
    console.error("Error fetching logs:", err);
    res.status(500).json({ error: "Failed to fetch logs" });
  }
});

export default router;
