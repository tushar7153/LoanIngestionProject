import mongoose from "mongoose"

const loanSchema = new mongoose.Schema(
  {
    applicantId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    loanAmount: {
      type: Number,
      required: true,
      min: [1, "Loan amount must be positive"],
    },
    email: {
      type: String,
      required: true,
      match: [/^\S+@\S+\.\S+$/, "Please enter a valid email"],
    },
    status: {
      type: String,
      enum: ["success", "failed", "pending"],
      required: true,
      default: "pending",
    },
    error: {
      type: String,
      default: null,
    },
    processedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  },
)

// Add indexes for better query performance
loanSchema.index({ status: 1, createdAt: -1 })
loanSchema.index({ createdAt: -1 })

const Loan = mongoose.model("Loan", loanSchema)
export default Loan
