"use client"
import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, AreaChart, Area } from "recharts"
import { TrendingUp } from "lucide-react"

interface MetricSnapshot {
  timestamp: string
  success: number
  failed: number
  total: number
  time: string
}

const chartConfig = {
  success: {
    label: "Success",
    color: "hsl(var(--chart-1))",
  },
  failed: {
    label: "Failed",
    color: "hsl(var(--chart-2))",
  },
  total: {
    label: "Total",
    color: "hsl(var(--chart-3))",
  },
}

export function LiveMetricsChart() {
  const [data, setData] = useState<MetricSnapshot[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const fetchHistory = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/loan/metrics/history")
      const json = await res.json()

      const formattedData = json.map((item: any) => ({
        ...item,
        time: new Date(item.timestamp).toLocaleTimeString("en-US", {
          hour12: false,
          hour: "2-digit",
          minute: "2-digit",
        }),
      }))

      setData(formattedData)
      setIsLoading(false)
    } catch (err) {
      console.error("Failed to fetch metric history:", err)
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchHistory()
    const interval = setInterval(fetchHistory, 3000)
    return () => clearInterval(interval)
  }, [])

  const totalProcessed = data.reduce((sum, item) => sum + item.total, 0)
  const successRate =
    data.length > 0 ? ((data.reduce((sum, item) => sum + item.success, 0) / totalProcessed) * 100).toFixed(1) : "0"

  if (isLoading) {
    return (
      <Card className="animate-pulse">
        <CardHeader>
          <div className="h-6 bg-muted rounded w-1/3"></div>
          <div className="h-4 bg-muted rounded w-1/2"></div>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] bg-muted rounded"></div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="transition-all-smooth hover:shadow-lg animate-slide-in-up">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Live Processing Metrics
        </CardTitle>
        <CardDescription>Real-time loan processing performance over time • {successRate}% success rate</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="successGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--chart-1))" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(var(--chart-1))" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="failedGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--chart-2))" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(var(--chart-2))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis dataKey="time" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis fontSize={12} tickLine={false} axisLine={false} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Area
                type="monotone"
                dataKey="success"
                stroke="hsl(var(--chart-1))"
                fillOpacity={1}
                fill="url(#successGradient)"
                strokeWidth={2}
              />
              <Area
                type="monotone"
                dataKey="failed"
                stroke="hsl(var(--chart-2))"
                fillOpacity={1}
                fill="url(#failedGradient)"
                strokeWidth={2}
              />
              <Line type="monotone" dataKey="total" stroke="hsl(var(--chart-3))" strokeWidth={2} dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
