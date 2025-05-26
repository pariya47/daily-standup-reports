"use client"

import { useState, useEffect } from "react"
import { createClient } from "@supabase/supabase-js"
import { format } from "date-fns"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { DateRangePicker } from "@/components/date-range-picker"
import { TeamSelector } from "@/components/team-selector"
import { WordCloud } from "@/components/word-cloud"
import { generateExecutiveSummary } from "@/lib/text-processor"
import type { Report } from "@/lib/types"
import { Download, ChevronLeft, ChevronRight } from "lucide-react"
import { Badge } from "@/components/ui/badge"

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.POSTGRES_NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.POSTGRES_NEXT_PUBLIC_SUPABASE_ANON_KEY

// Create client only if URL and key are available
const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null

export function CEODashboard() {
  const [reports, setReports] = useState<Report[]>([])
  const [aggregatedReport, setAggregatedReport] = useState<Report | null>(null)
  const [dateRange, setDateRange] = useState<{ from: Date; to: Date }>({
    from: new Date(),
    to: new Date(),
  })
  const [selectedTeams, setSelectedTeams] = useState<string[]>([])
  const [availableTeams, setAvailableTeams] = useState<string[]>([])
  const [executiveSummary, setExecutiveSummary] = useState<string>("")
  const [topKeywords, setTopKeywords] = useState<Array<{ text: string; trend: "up" | "down" | "stable" }>>([])

  // Fetch available teams
  useEffect(() => {
    async function fetchTeams() {
      if (!supabase) {
        console.error("Supabase client not initialized")
        // Use mock data for development/preview
        const mockTeams = ["Engineering", "Design", "Product", "Marketing", "Sales"]
        setAvailableTeams(mockTeams)
        if (selectedTeams.length === 0) {
          setSelectedTeams(mockTeams)
        }
        return
      }

      try {
        const { data, error } = await supabase.from("standup").select("team_name").order("team_name")

        if (error) {
          console.error("Error fetching teams:", error)
          return
        }

        const uniqueTeams = Array.from(new Set(data.map((item) => item.team_name)))
        setAvailableTeams(uniqueTeams)

        // Set default to all teams
        if (selectedTeams.length === 0) {
          setSelectedTeams(uniqueTeams)
        }
      } catch (err) {
        console.error("Failed to fetch teams:", err)
        // Use mock data as fallback
        const mockTeams = ["Engineering", "Design", "Product", "Marketing", "Sales"]
        setAvailableTeams(mockTeams)
        if (selectedTeams.length === 0) {
          setSelectedTeams(mockTeams)
        }
      }
    }

    fetchTeams()
  }, [])

  // Fetch reports based on date range and selected teams
  useEffect(() => {
    async function fetchReports() {
      if (selectedTeams.length === 0) return

      if (!supabase) {
        console.error("Supabase client not initialized")
        // Use mock data for development/preview
        const mockReports = selectedTeams.map((team, index) => ({
          id: `mock-${index}`,
          content: `This is a mock standup report for ${team}. Today I completed the dashboard UI design, worked on the API integration, and fixed several bugs in the reporting module. Tomorrow I plan to implement the word cloud visualization and improve the filtering options. No blockers at the moment.`,
          createdAt: new Date(),
          teamName: team,
        }))
        setReports(mockReports)

        // Create aggregated report from mock data
        if (mockReports.length > 0) {
          const combinedContent = mockReports.map((r) => r.content).join("\n\n")
          const aggregated: Report = {
            id: "aggregated",
            content: combinedContent,
            createdAt: new Date(),
            teamName: "Aggregated",
          }
          setAggregatedReport(aggregated)

          // Generate executive summary
          const summary = generateExecutiveSummary(combinedContent)
          setExecutiveSummary(summary)

          // Set mock top keywords with trends
          setTopKeywords([
            { text: "completed", trend: "up" },
            { text: "implementation", trend: "stable" },
            { text: "database", trend: "down" },
            { text: "testing", trend: "up" },
            { text: "deployment", trend: "up" },
          ])
        }
        return
      }

      try {
        const { data, error } = await supabase
          .from("standup")
          .select("*")
          .gte("created_at", format(dateRange.from, "yyyy-MM-dd"))
          .lte("created_at", format(dateRange.to, "yyyy-MM-dd"))
          .in("team_name", selectedTeams)
          .order("created_at", { ascending: false })

        if (error) {
          console.error("Error fetching reports:", error)
          return
        }

        const formattedReports = data.map((report) => ({
          id: report.id,
          content: report.content,
          createdAt: new Date(report.created_at),
          teamName: report.team_name,
        }))

        setReports(formattedReports)

        // Create aggregated report
        if (formattedReports.length > 0) {
          const combinedContent = formattedReports.map((r) => r.content).join("\n\n")
          const aggregated: Report = {
            id: "aggregated",
            content: combinedContent,
            createdAt: new Date(),
            teamName: "Aggregated",
          }
          setAggregatedReport(aggregated)

          // Generate executive summary
          const summary = generateExecutiveSummary(combinedContent)
          setExecutiveSummary(summary)

          // Set mock top keywords with trends
          // In a real implementation, this would compare with previous periods
          setTopKeywords([
            { text: "completed", trend: "up" },
            { text: "implementation", trend: "stable" },
            { text: "database", trend: "down" },
            { text: "testing", trend: "up" },
            { text: "deployment", trend: "up" },
          ])
        }
      } catch (err) {
        console.error("Failed to fetch reports:", err)
        // Use mock data as fallback
        const mockReports = selectedTeams.map((team, index) => ({
          id: `mock-${index}`,
          content: `This is a mock standup report for ${team}. Today I completed the dashboard UI design, worked on the API integration, and fixed several bugs in the reporting module. Tomorrow I plan to implement the word cloud visualization and improve the filtering options. No blockers at the moment.`,
          createdAt: new Date(),
          teamName: team,
        }))
        setReports(mockReports)

        // Create aggregated report from mock data
        if (mockReports.length > 0) {
          const combinedContent = mockReports.map((r) => r.content).join("\n\n")
          const aggregated: Report = {
            id: "aggregated",
            content: combinedContent,
            createdAt: new Date(),
            teamName: "Aggregated",
          }
          setAggregatedReport(aggregated)

          // Generate executive summary
          const summary = generateExecutiveSummary(combinedContent)
          setExecutiveSummary(summary)

          // Set mock top keywords with trends
          setTopKeywords([
            { text: "completed", trend: "up" },
            { text: "implementation", trend: "stable" },
            { text: "database", trend: "down" },
            { text: "testing", trend: "up" },
            { text: "deployment", trend: "up" },
          ])
        }
      }
    }

    fetchReports()
  }, [dateRange, selectedTeams])

  // Handle date shortcuts
  const setToday = () => {
    const today = new Date()
    setDateRange({ from: today, to: today })
  }

  const setYesterday = () => {
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    setDateRange({ from: yesterday, to: yesterday })
  }

  // Handle export
  const handleExport = () => {
    alert("Export functionality would generate a PDF or image here")
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex flex-col gap-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h1 className="text-3xl font-bold">CEO Dashboard</h1>
          <Button onClick={handleExport} className="ml-auto">
            <Download className="mr-2 h-4 w-4" />
            Export Report
          </Button>
        </div>

        <div className="flex flex-wrap gap-4 items-center">
          <DateRangePicker dateRange={dateRange} onDateRangeChange={setDateRange} />
          <div className="flex gap-2">
            <Button variant="outline" onClick={setToday}>
              Today
            </Button>
            <Button variant="outline" onClick={setYesterday}>
              Yesterday
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => {
                const prev = new Date(dateRange.from)
                prev.setDate(prev.getDate() - 1)
                setDateRange({ from: prev, to: prev })
              }}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => {
                const next = new Date(dateRange.from)
                next.setDate(next.getDate() + 1)
                setDateRange({ from: next, to: next })
              }}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          <TeamSelector
            availableTeams={availableTeams}
            selectedTeams={selectedTeams}
            onTeamsChange={setSelectedTeams}
          />
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Executive Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg">{executiveSummary || "No data available for the selected period."}</p>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Aggregated Word Cloud</CardTitle>
            </CardHeader>
            <CardContent>
              {aggregatedReport ? (
                <div className="h-[400px]">
                  <WordCloud report={aggregatedReport} stopWordFilter="any" onWordClick={() => {}} />
                </div>
              ) : (
                <div className="flex items-center justify-center h-[400px]">
                  <p className="text-muted-foreground">No data available</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Top Keywords & Trends</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-4">
                {topKeywords.map((keyword) => (
                  <li key={keyword.text} className="flex items-center justify-between">
                    <span className="text-lg font-medium">{keyword.text}</span>
                    <Badge
                      variant={
                        keyword.trend === "up" ? "default" : keyword.trend === "down" ? "destructive" : "secondary"
                      }
                    >
                      {keyword.trend === "up" && "↑"}
                      {keyword.trend === "down" && "↓"}
                      {keyword.trend === "stable" && "→"} {keyword.trend}
                    </Badge>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Team Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {reports.length > 0 ? (
                reports.slice(0, 6).map((report) => (
                  <Card key={report.id}>
                    <CardHeader className="p-4">
                      <CardTitle className="text-base">{report.teamName}</CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                      <p className="text-sm text-muted-foreground">{format(report.createdAt, "MMM d, yyyy")}</p>
                      <p className="mt-2 line-clamp-3">{report.content.substring(0, 100)}...</p>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <p className="col-span-3 text-center text-muted-foreground py-8">
                  No team reports available for the selected period
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
