"use client"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { AlertTriangle, Download, RefreshCw, Search, Filter } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface Log {
  applicantId: string
  error: string
  timestamp: string
}

export function ErrorLogs() {
  const [logs, setLogs] = useState<Log[]>([])
  const [filteredLogs, setFilteredLogs] = useState<Log[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [errorType, setErrorType] = useState("all")
  const [timeRange, setTimeRange] = useState("all")
  const { toast } = useToast()

  const fetchLogs = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/loan/errors")
      const data = await res.json()
      setLogs(data)
    } catch (err) {
      console.error("Failed to fetch logs:", err)
      toast({
        title: "Error",
        description: "Failed to fetch error logs",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const applyFilters = () => {
    let filtered = [...logs]

    // Search filter
    if (searchTerm.trim()) {
      filtered = filtered.filter((log) => log.applicantId.toLowerCase().includes(searchTerm.toLowerCase()))
    }

    // Error type filter
    if (errorType !== "all") {
      filtered = filtered.filter((log) => log.error.toLowerCase().includes(errorType.toLowerCase()))
    }

    // Time range filter
    if (timeRange !== "all") {
      const now = new Date()
      const cutoff = new Date()

      switch (timeRange) {
        case "1h":
          cutoff.setHours(now.getHours() - 1)
          break
        case "24h":
          cutoff.setDate(now.getDate() - 1)
          break
        case "7d":
          cutoff.setDate(now.getDate() - 7)
          break
      }

      filtered = filtered.filter((log) => new Date(log.timestamp) > cutoff)
    }

    setFilteredLogs(filtered)
  }

  useEffect(() => {
    fetchLogs()
    const interval = setInterval(fetchLogs, 10000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    applyFilters()
  }, [logs, searchTerm, errorType, timeRange])

  const handleRetry = async () => {
    try {
      await fetch("http://localhost:5000/api/loan/retry", { method: "POST" })
      toast({
        title: "Retry Initiated",
        description: "Failed records are being retried",
      })
      fetchLogs()
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to initiate retry",
        variant: "destructive",
      })
    }
  }

  const exportCSV = () => {
    const csvContent = [
      ["Applicant ID", "Error", "Timestamp"],
      ...filteredLogs.map((log) => [
        log.applicantId,
        `"${log.error.replace(/"/g, '""')}"`,
        new Date(log.timestamp).toLocaleString(),
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n")

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = `error-logs-${new Date().toISOString().split("T")[0]}.csv`
    link.click()
    URL.revokeObjectURL(url)

    toast({
      title: "Export Complete",
      description: "Error logs have been exported to CSV",
    })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-destructive" />
          <h3 className="text-lg font-semibold">Error Management</h3>
          <Badge variant="destructive">{filteredLogs.length} errors</Badge>
        </div>

        <div className="flex gap-2">
          <Button onClick={handleRetry} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry Failed
          </Button>
          <Button onClick={exportCSV} variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search Applicant ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        <Select value={errorType} onValueChange={setErrorType}>
          <SelectTrigger>
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Filter by error type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Errors</SelectItem>
            <SelectItem value="email">Email Invalid</SelectItem>
            <SelectItem value="amount">Amount Issues</SelectItem>
            <SelectItem value="required">Required Fields</SelectItem>
          </SelectContent>
        </Select>

        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger>
            <SelectValue placeholder="Time range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Time</SelectItem>
            <SelectItem value="1h">Last Hour</SelectItem>
            <SelectItem value="24h">Last 24 Hours</SelectItem>
            <SelectItem value="7d">Last 7 Days</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Applicant ID</TableHead>
              <TableHead>Error Details</TableHead>
              <TableHead>Timestamp</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={3} className="text-center py-8">
                  <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2" />
                  Loading error logs...
                </TableCell>
              </TableRow>
            ) : filteredLogs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className="text-center py-8 text-muted-foreground">
                  {logs.length === 0 ? "No errors found 🎉" : "No matching errors found"}
                </TableCell>
              </TableRow>
            ) : (
              filteredLogs.map((log, idx) => (
                <TableRow key={idx} className="animate-fade-in hover:bg-muted/50">
                  <TableCell className="font-medium">{log.applicantId}</TableCell>
                  <TableCell>
                    <Badge variant="destructive" className="text-xs">
                      {log.error}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{new Date(log.timestamp).toLocaleString()}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
