import { z } from "zod"

const loanSchema = z.object({
  applicantId: z
    .string()
    .min(1, "Applicant ID is required")
    .max(50, "Applicant ID must be less than 50 characters")
    .regex(/^[A-Za-z0-9-_]+$/, "Applicant ID can only contain letters, numbers, hyphens, and underscores"),
  loanAmount: z
    .number()
    .positive("Loan amount must be positive")
    .min(100, "Minimum loan amount is $100")
    .max(1000000, "Maximum loan amount is $1,000,000"),
  email: z.string().email("Please enter a valid email address").min(1, "Email is required"),
})

export const validateLoan = (data: any) => {
  try {
    loanSchema.parse(data)
    return { success: true }
  } catch (e: any) {
    const firstError = e.errors[0]
    return {
      success: false,
      error: firstError.message,
      field: firstError.path[0],
    }
  }
}
