"use client"
import { useEffect, useState, useRef } from "react"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { CheckCircle, XCircle, Activity, Wifi, WifiOff } from "lucide-react"

interface Log {
  applicantId: string
  status: string
  error?: string
  timestamp: string
  loanAmount?: number
  email?: string
}

interface WebSocketMessage {
  type: string
  data: any
  timestamp: string
}

interface LiveLogsFeedProps {
  compact?: boolean
}

export function LiveLogsFeed({ compact = false }: LiveLogsFeedProps) {
  const [logs, setLogs] = useState<Log[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isConnected, setIsConnected] = useState(false)
  const scrollAreaRef = useRef<HTMLDivElement>(null)

  const fetchLogs = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/loan/logs")
      if (res.ok) {
        const data = await res.json()
        setLogs(data)
        setIsLoading(false)
      }
    } catch (err) {
      console.error("Failed to fetch live logs:", err)
      setIsLoading(false)
    }
  }

  useEffect(() => {
    // Initial fetch
    fetchLogs()

    // WebSocket connection for real-time updates
    let ws: WebSocket | null = null
    let reconnectTimeout: NodeJS.Timeout

    const connect = () => {
      try {
        ws = new WebSocket("ws://localhost:5000/ws")

        ws.onopen = () => {
          console.log("✅ Live logs WebSocket connected")
          setIsConnected(true)
        }

        ws.onmessage = (event) => {
          try {
            const message: WebSocketMessage = JSON.parse(event.data)

            if (message.type === "newLoan") {
              // Add new loan to the beginning of the list
              setLogs((prevLogs) => [message.data, ...prevLogs.slice(0, 99)]) // Keep only last 100
            }
          } catch (error) {
            console.error("Error parsing WebSocket message:", error)
          }
        }

        ws.onclose = () => {
          console.log("🔌 Live logs WebSocket disconnected")
          setIsConnected(false)

          // Attempt to reconnect
          reconnectTimeout = setTimeout(connect, 3000)
        }

        ws.onerror = (error) => {
          console.error("❌ Live logs WebSocket error:", error)
          setIsConnected(false)
        }
      } catch (error) {
        console.error("❌ Failed to create WebSocket connection:", error)
        setIsConnected(false)
        reconnectTimeout = setTimeout(connect, 3000)
      }
    }

    connect()

    // Fallback: periodic fetch if WebSocket fails
    const fallbackInterval = setInterval(() => {
      if (!isConnected) {
        fetchLogs()
      }
    }, 5000)

    return () => {
      if (reconnectTimeout) clearTimeout(reconnectTimeout)
      if (ws) ws.close()
      clearInterval(fallbackInterval)
    }
  }, [isConnected])

  // Auto-scroll to top when new logs arrive (since we're adding to the beginning)
  useEffect(() => {
    if (scrollAreaRef.current && !compact) {
      const scrollElement = scrollAreaRef.current.querySelector("[data-radix-scroll-area-viewport]")
      if (scrollElement) {
        scrollElement.scrollTop = 0
      }
    }
  }, [logs, compact])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-32">
        <Activity className="h-6 w-6 animate-spin text-muted-foreground" />
        <span className="ml-2 text-muted-foreground">Loading logs...</span>
      </div>
    )
  }

  const displayLogs = compact ? logs.slice(0, 10) : logs

  return (
    <div className="space-y-4">
      {!compact && (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-primary animate-pulse" />
            <span className="text-sm font-medium">Live Activity Feed</span>
            <Badge variant="secondary">{logs.length} entries</Badge>
          </div>
          <Badge variant={isConnected ? "default" : "outline"} className="animate-pulse">
            {isConnected ? (
              <>
                <Wifi className="h-3 w-3 mr-1" />
                Live
              </>
            ) : (
              <>
                <WifiOff className="h-3 w-3 mr-1" />
                Polling
              </>
            )}
          </Badge>
        </div>
      )}

      <ScrollArea className={compact ? "h-[200px]" : "h-[400px]"} ref={scrollAreaRef}>
        <div className="space-y-2 pr-4">
          {displayLogs.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              <Activity className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No logs available</p>
              <p className="text-xs mt-1">Submit a loan application to see activity</p>
            </div>
          ) : (
            displayLogs.map((log, idx) => (
              <div
                key={`${log.applicantId}-${log.timestamp}-${idx}`}
                className={`flex items-center justify-between p-3 rounded-lg border transition-all-smooth hover:shadow-sm animate-fade-in ${
                  log.status === "success"
                    ? "bg-green-50 border-green-200 dark:bg-green-950/20 dark:border-green-800"
                    : "bg-red-50 border-red-200 dark:bg-red-950/20 dark:border-red-800"
                }`}
                style={{ animationDelay: `${idx * 0.05}s` }}
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  {log.status === "success" ? (
                    <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-500 flex-shrink-0" />
                  )}

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-sm truncate">{log.applicantId}</span>
                      <Badge variant={log.status === "success" ? "default" : "destructive"} className="text-xs">
                        {log.status}
                      </Badge>
                      {log.loanAmount && (
                        <Badge variant="outline" className="text-xs">
                          ${log.loanAmount.toLocaleString()}
                        </Badge>
                      )}
                    </div>

                    {log.error && <p className="text-xs text-red-600 dark:text-red-400 truncate">{log.error}</p>}
                    {log.email && !compact && <p className="text-xs text-muted-foreground truncate">{log.email}</p>}
                  </div>
                </div>

                <div className="text-xs text-muted-foreground flex-shrink-0 ml-2">
                  {new Date(log.timestamp).toLocaleTimeString("en-US", {
                    hour12: false,
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit",
                  })}
                </div>
              </div>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  )
}
