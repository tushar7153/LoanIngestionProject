"use client"
import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, TrendingDown, Activity, CheckCircle, XCircle, Clock, Wifi, WifiOff } from "lucide-react"

interface Metrics {
  total: number
  success: number
  failed: number
}

interface WebSocketMessage {
  type: string
  data: any
  timestamp: string
}

export function MetricsDisplay() {
  const [metrics, setMetrics] = useState<Metrics>({ total: 0, success: 0, failed: 0 })
  const [previousMetrics, setPreviousMetrics] = useState<Metrics>({ total: 0, success: 0, failed: 0 })
  const [isConnected, setIsConnected] = useState(false)
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null)

  useEffect(() => {
    let ws: WebSocket | null = null
    let reconnectTimeout: NodeJS.Timeout

    const connect = () => {
      try {
        ws = new WebSocket("ws://localhost:5000/ws")

        ws.onopen = () => {
          console.log("✅ WebSocket connected")
          setIsConnected(true)
        }

        ws.onmessage = (event) => {
          try {
            const message: WebSocketMessage = JSON.parse(event.data)
            console.log("📨 WebSocket message:", message)

            if (message.type === "metrics") {
              setPreviousMetrics(metrics)
              setMetrics(message.data)
              setLastUpdate(new Date())
            }
          } catch (error) {
            console.error("Error parsing WebSocket message:", error)
          }
        }

        ws.onclose = (event) => {
          console.log("🔌 WebSocket disconnected:", event.code, event.reason)
          setIsConnected(false)

          // Attempt to reconnect after 3 seconds
          reconnectTimeout = setTimeout(() => {
            console.log("🔄 Attempting to reconnect...")
            connect()
          }, 3000)
        }

        ws.onerror = (error) => {
          console.error("❌ WebSocket error:", error)
          setIsConnected(false)
        }
      } catch (error) {
        console.error("❌ Failed to create WebSocket connection:", error)
        setIsConnected(false)

        // Retry connection
        reconnectTimeout = setTimeout(connect, 3000)
      }
    }

    // Initial connection
    connect()

    // Cleanup
    return () => {
      if (reconnectTimeout) {
        clearTimeout(reconnectTimeout)
      }
      if (ws) {
        ws.close()
      }
    }
  }, [])

  // Fetch initial metrics from REST API
  useEffect(() => {
    const fetchInitialMetrics = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/loan/stats")
        if (response.ok) {
          const data = await response.json()
          setMetrics(data)
          setLastUpdate(new Date())
        }
      } catch (error) {
        console.error("Failed to fetch initial metrics:", error)
      }
    }

    fetchInitialMetrics()
  }, [])

  const getTrend = (current: number, previous: number) => {
    if (current > previous) return "up"
    if (current < previous) return "down"
    return "same"
  }

  const successRate = metrics.total > 0 ? ((metrics.success / metrics.total) * 100).toFixed(1) : "0"

  return (
    <>
      <Card className="transition-all-smooth hover:shadow-lg animate-fade-in">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Processed</CardTitle>
          <Activity className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="text-2xl font-bold">{metrics.total.toLocaleString()}</div>
            <Badge variant={isConnected ? "default" : "destructive"} className="animate-pulse">
              {isConnected ? (
                <>
                  <Wifi className="h-3 w-3 mr-1" />
                  Live
                </>
              ) : (
                <>
                  <WifiOff className="h-3 w-3 mr-1" />
                  Offline
                </>
              )}
            </Badge>
          </div>
          <div className="flex items-center text-xs text-muted-foreground mt-1">
            {getTrend(metrics.total, previousMetrics.total) === "up" && (
              <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
            )}
            {getTrend(metrics.total, previousMetrics.total) === "down" && (
              <TrendingDown className="h-3 w-3 text-red-500 mr-1" />
            )}
            <Clock className="h-3 w-3 mr-1" />
            {lastUpdate ? `Updated ${lastUpdate.toLocaleTimeString()}` : "Waiting for data..."}
          </div>
        </CardContent>
      </Card>

      <Card className="transition-all-smooth hover:shadow-lg animate-fade-in" style={{ animationDelay: "0.1s" }}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Successful</CardTitle>
          <CheckCircle className="h-4 w-4 text-green-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">{metrics.success.toLocaleString()}</div>
          <div className="flex items-center text-xs text-muted-foreground mt-1">
            <Badge variant="secondary" className="text-green-600">
              {successRate}% success rate
            </Badge>
          </div>
        </CardContent>
      </Card>

      <Card className="transition-all-smooth hover:shadow-lg animate-fade-in" style={{ animationDelay: "0.2s" }}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Failed</CardTitle>
          <XCircle className="h-4 w-4 text-red-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-red-600">{metrics.failed.toLocaleString()}</div>
          <div className="flex items-center text-xs text-muted-foreground mt-1">
            <Badge variant="destructive" className="opacity-80">
              {metrics.total > 0 ? ((metrics.failed / metrics.total) * 100).toFixed(1) : "0"}% failure rate
            </Badge>
          </div>
        </CardContent>
      </Card>
    </>
  )
}
