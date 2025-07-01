"use client"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Play, Pause, RefreshCw, Settings, CheckCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export function ControlsPanel() {
  const [isPaused, setIsPaused] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [lastAction, setLastAction] = useState<string>("")
  const { toast } = useToast()

  const handlePauseToggle = async () => {
    setIsLoading(true)
    try {
      const endpoint = isPaused ? "resume" : "pause"
      const response = await fetch(`http://localhost:5000/api/loan/${endpoint}`, {
        method: "POST",
      })

      if (response.ok) {
        setIsPaused(!isPaused)
        const action = isPaused ? "resumed" : "paused"
        setLastAction(`System ${action} successfully`)
        toast({
          title: "Success",
          description: `Loan ingestion ${action}`,
        })
      } else {
        throw new Error("Failed to update system state")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update system state",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleRetry = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("http://localhost:5000/api/loan/retry", {
        method: "POST",
      })

      if (response.ok) {
        setLastAction("Retry initiated for failed records")
        toast({
          title: "Retry Initiated",
          description: "Failed records are being processed again",
        })
      } else {
        throw new Error("Retry request failed")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to initiate retry",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* System Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            System Status
          </CardTitle>
          <CardDescription>Current loan processing system state</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className={`h-3 w-3 rounded-full ${isPaused ? "bg-red-500" : "bg-green-500"} animate-pulse`} />
              <span className="font-medium">{isPaused ? "Paused" : "Active"}</span>
            </div>
            <Badge variant={isPaused ? "destructive" : "default"}>
              {isPaused ? "Ingestion Paused" : "Processing Loans"}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Control Actions */}
      <Card>
        <CardHeader>
          <CardTitle>System Controls</CardTitle>
          <CardDescription>Manage loan processing operations</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Button
              onClick={handlePauseToggle}
              disabled={isLoading}
              variant={isPaused ? "default" : "secondary"}
              className="transition-all-smooth hover:scale-105 disabled:hover:scale-100"
            >
              {isPaused ? (
                <>
                  <Play className="h-4 w-4 mr-2" />
                  Resume Ingestion
                </>
              ) : (
                <>
                  <Pause className="h-4 w-4 mr-2" />
                  Pause Ingestion
                </>
              )}
            </Button>

            <Button
              onClick={handleRetry}
              disabled={isLoading}
              variant="outline"
              className="transition-all-smooth hover:scale-105 disabled:hover:scale-100 bg-transparent"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
              Retry Failed Records
            </Button>
          </div>

          {lastAction && (
            <Alert className="animate-slide-in-up">
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>{lastAction}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* System Information */}
      <Card>
        <CardHeader>
          <CardTitle>System Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between items-center text-sm">
            <span className="text-muted-foreground">WebSocket Connection:</span>
            <Badge variant="default" className="animate-pulse">
              Connected
            </Badge>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-muted-foreground">Database Status:</span>
            <Badge variant="default">Online</Badge>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-muted-foreground">Last Updated:</span>
            <span className="text-sm">{new Date().toLocaleTimeString()}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
