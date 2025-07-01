"use client"
import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ThemeToggle } from "@/components/theme-toggle"
import { MetricsDisplay } from "@/components/metrics-display"
import { LiveMetricsChart } from "@/components/live-metrics-chart"
import { ErrorLogs } from "@/components/error-logs"
import { LiveLogsFeed } from "@/components/live-logs-feed"
import { ControlsPanel } from "@/components/controls-panel"
import { AddLoanForm } from "@/components/add-loan-form"
import { Activity, Plus, BarChart3, AlertTriangle, Settings } from "lucide-react"

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("overview")

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 transition-all-smooth">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between px-4">
          <div className="flex items-center space-x-2">
            <Activity className="h-6 w-6 text-primary animate-pulse" />
            <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Loan Ingestion Dashboard
            </h1>
          </div>
          <ThemeToggle />
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5 mb-6">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="add-loan" className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add Loan
            </TabsTrigger>
            <TabsTrigger value="logs" className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Live Logs
            </TabsTrigger>
            <TabsTrigger value="errors" className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Errors
            </TabsTrigger>
            <TabsTrigger value="controls" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Controls
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6 animate-slide-in-up">
            {/* Metrics Cards */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              <MetricsDisplay />
            </div>

            {/* Charts */}
            <div className="grid gap-6 lg:grid-cols-1">
              <LiveMetricsChart />
            </div>

            {/* Recent Activity */}
            <Card className="animate-fade-in">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Recent Activity
                </CardTitle>
                <CardDescription>Latest loan processing activities</CardDescription>
              </CardHeader>
              <CardContent>
                <LiveLogsFeed compact />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="add-loan" className="animate-slide-in-up">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="h-5 w-5" />
                  Add New Loan Application
                </CardTitle>
                <CardDescription>Submit a new loan application for processing</CardDescription>
              </CardHeader>
              <CardContent>
                <AddLoanForm />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="logs" className="animate-slide-in-up">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Live Processing Logs
                </CardTitle>
                <CardDescription>Real-time view of all loan processing activities</CardDescription>
              </CardHeader>
              <CardContent>
                <LiveLogsFeed />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="errors" className="animate-slide-in-up">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-destructive" />
                  Error Management
                </CardTitle>
                <CardDescription>View and manage failed loan applications</CardDescription>
              </CardHeader>
              <CardContent>
                <ErrorLogs />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="controls" className="animate-slide-in-up">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  System Controls
                </CardTitle>
                <CardDescription>Manage loan processing system operations</CardDescription>
              </CardHeader>
              <CardContent>
                <ControlsPanel />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
