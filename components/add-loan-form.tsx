"use client"
import { useState } from "react"
import type React from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, CheckCircle, XCircle, DollarSign, User, Mail, Plus } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface LoanFormData {
  applicantId: string
  loanAmount: string
  email: string
}

export function AddLoanForm() {
  const [formData, setFormData] = useState<LoanFormData>({
    applicantId: "",
    loanAmount: "",
    email: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [result, setResult] = useState<{ type: "success" | "error"; message: string } | null>(null)
  const { toast } = useToast()

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
    // Clear previous result when user starts typing
    if (result) setResult(null)
  }

  const generateSampleData = () => {
    const timestamp = Date.now()
    const sampleData = {
      applicantId: `LOAN-${timestamp}`,
      loanAmount: (Math.floor(Math.random() * 90000) + 10000).toString(),
      email: `applicant${timestamp}@example.com`,
    }
    setFormData(sampleData)
    setResult(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setResult(null)

    try {
      console.log("🚀 Submitting loan application:", formData)

      const response = await fetch("http://localhost:5000/api/loan/ingest", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          applicantId: formData.applicantId.trim(),
          loanAmount: Number.parseFloat(formData.loanAmount),
          email: formData.email.trim(),
        }),
      })

      const data = await response.json()
      console.log("📥 Server response:", data)

      if (response.ok && data.success) {
        setResult({
          type: "success",
          message: `Loan application submitted successfully! ID: ${data.applicantId}`,
        })
        setFormData({ applicantId: "", loanAmount: "", email: "" })
        toast({
          title: "Success! 🎉",
          description: `Loan application processed for ${data.applicantId}`,
        })
      } else {
        const errorMessage = data.error || "Failed to submit loan application"
        setResult({ type: "error", message: errorMessage })
        toast({
          title: "Submission Failed",
          description: errorMessage,
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("❌ Network error:", error)
      const errorMessage = "Unable to connect to server. Please check if the backend is running on port 5000."
      setResult({ type: "error", message: errorMessage })
      toast({
        title: "Connection Error",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const isFormValid = formData.applicantId.trim() && formData.loanAmount && formData.email.trim()

  return (
    <div className="max-w-md mx-auto space-y-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="applicantId" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            Applicant ID
          </Label>
          <Input
            id="applicantId"
            name="applicantId"
            type="text"
            placeholder="e.g., LOAN-2024-001"
            value={formData.applicantId}
            onChange={handleInputChange}
            className="transition-all-smooth focus:ring-2 focus:ring-primary/20"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="loanAmount" className="flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            Loan Amount
          </Label>
          <Input
            id="loanAmount"
            name="loanAmount"
            type="number"
            placeholder="e.g., 50000"
            value={formData.loanAmount}
            onChange={handleInputChange}
            className="transition-all-smooth focus:ring-2 focus:ring-primary/20"
            min="100"
            max="1000000"
            step="0.01"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email" className="flex items-center gap-2">
            <Mail className="h-4 w-4" />
            Email Address
          </Label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="e.g., john.doe@example.com"
            value={formData.email}
            onChange={handleInputChange}
            className="transition-all-smooth focus:ring-2 focus:ring-primary/20"
            required
          />
        </div>

        <div className="flex gap-2">
          <Button
            type="submit"
            disabled={!isFormValid || isSubmitting}
            className="flex-1 transition-all-smooth hover:scale-105 disabled:hover:scale-100"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Plus className="mr-2 h-4 w-4" />
                Submit Application
              </>
            )}
          </Button>

          <Button
            type="button"
            variant="outline"
            onClick={generateSampleData}
            disabled={isSubmitting}
            className="transition-all-smooth hover:scale-105 bg-transparent"
          >
            Sample Data
          </Button>
        </div>
      </form>

      {result && (
        <Alert className={`animate-slide-in-up ${result.type === "success" ? "border-green-500" : "border-red-500"}`}>
          <div className="flex items-center gap-2">
            {result.type === "success" ? (
              <CheckCircle className="h-4 w-4 text-green-500" />
            ) : (
              <XCircle className="h-4 w-4 text-red-500" />
            )}
            <AlertDescription
              className={
                result.type === "success" ? "text-green-700 dark:text-green-400" : "text-red-700 dark:text-red-400"
              }
            >
              {result.message}
            </AlertDescription>
          </div>
        </Alert>
      )}

      {/* Instructions Card */}
      <Card className="bg-muted/50">
        <CardContent className="pt-4">
          <h4 className="text-sm font-medium mb-2">💡 Quick Tips:</h4>
          <div className="text-xs text-muted-foreground space-y-1">
            <div>• Use unique Applicant IDs (letters, numbers, hyphens, underscores)</div>
            <div>• Loan amount: $100 - $1,000,000</div>
            <div>• Valid email format required</div>
            <div>• Click "Sample Data" for auto-generated test data</div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
