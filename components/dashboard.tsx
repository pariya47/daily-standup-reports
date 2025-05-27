"use client"

import { useState, useEffect } from "react"
import { createClient } from "@supabase/supabase-js"
import { subDays } from "date-fns"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Sidebar } from "@/components/sidebar"
import { WordCloud } from "@/components/word-cloud"
import { FullReport } from "@/components/full-report"
import { NavigationButtons } from "@/components/navigation-buttons"
import { StopWordFilter } from "@/components/stop-word-filter"
import { ReferencesDrawer } from "@/components/references-drawer"
import { CommandDialogDemo } from "@/components/cmd"
import type { Report, ReportType } from "@/lib/types"
import { fetchDailyReports, fetchWeeklyReports, fetchMonthlyReports } from "@/lib/supabase"

export function Dashboard() {
  const [reports, setReports] = useState<Report[]>([])
  const [selectedReport, setSelectedReport] = useState<Report | null>(null)
  const [selectedWord, setSelectedWord] = useState<string | null>(null)
  const [stopWordFilter, setStopWordFilter] = useState<"english" | "thai" | "any">("any")
  const [isReferencesOpen, setIsReferencesOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [currentReportType, setCurrentReportType] = useState<ReportType>('daily');

  // Callback to handle report type change from Sidebar
  const handleReportTypeChange = (reportType: ReportType) => {
    setCurrentReportType(reportType)
    // Data fetching will be triggered by the useEffect below due to currentReportType dependency change
  }

  // Fetch reports based on currentReportType
  useEffect(() => {
    async function fetchReportsData(reportType: ReportType) {
      setIsLoading(true)
      let fetchedReports: Report[] = []

      try {
        if (reportType === "daily") {
          fetchedReports = await fetchDailyReports()
        } else if (reportType === "weekly") {
          fetchedReports = await fetchWeeklyReports()
        } else if (reportType === "monthly") {
          fetchedReports = await fetchMonthlyReports()
        }
        setReports(fetchedReports)

        if (fetchedReports.length > 0) {
          // If selectedReport is no longer in the new list or not of the current type, select the first one
          const currentSelectedStillValid = fetchedReports.find(r => r.id === selectedReport?.id && r.reportType === reportType);
          if (currentSelectedStillValid) {
            setSelectedReport(currentSelectedStillValid);
          } else {
            setSelectedReport(fetchedReports[0]);
          }
        } else {
          setSelectedReport(null) // No reports, so no selection
        }
      } catch (err) {
        console.error(`Error fetching ${reportType} reports:`, err)
        setReports([])
        setSelectedReport(null)
      }
      setIsLoading(false)
    }

    fetchReportsData(currentReportType)
  }, [currentReportType]) // Re-run effect when currentReportType changes

  // Handle report selection
  const handleReportSelect = (report: Report) => {
    setSelectedReport(report)
    setSelectedWord(null)
    setIsReferencesOpen(false)
  }

  // Handle word click in word cloud
  const handleWordClick = (word: string) => {
    setSelectedWord(word)
    setIsReferencesOpen(true)
  }

  // Handle navigation
  const handlePrevious = () => {
    const currentIndex = reports.findIndex((r) => r.id === selectedReport?.id)
    if (currentIndex < reports.length - 1) {
      setSelectedReport(reports[currentIndex + 1])
    }
  }

  const handleNext = () => {
    const currentIndex = reports.findIndex((r) => r.id === selectedReport?.id)
    if (currentIndex > 0) {
      setSelectedReport(reports[currentIndex - 1])
    }
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar
        reports={reports}
        selectedReport={selectedReport}
        onReportSelect={handleReportSelect}
        currentReportType={currentReportType}
        onReportTypeChange={handleReportTypeChange}
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="p-3 md:p-4 border-b flex flex-col sm:flex-row gap-2 sm:gap-4 items-start sm:items-center">
          <h2 className="scroll-m-20 text-xl md:text-3xl font-semibold tracking-tight first:mt-0 px-2 md:px-2 truncate flex-1 min-w-0">
            {selectedReport?.createdAt
              ? selectedReport.createdAt.toLocaleDateString('en-US', { day: '2-digit', month: 'long', timeZone: 'UTC' })
              : ""}: {selectedReport?.teamName
              ? selectedReport.teamName.charAt(0).toUpperCase() + selectedReport.teamName.slice(1)
              : currentReportType.charAt(0).toUpperCase() + currentReportType.slice(1) + " Overview"} 
              {/* Fallback title based on report type if no report is selected */}
          </h2>
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 items-start sm:items-center w-full sm:w-auto">
            <StopWordFilter value={stopWordFilter} onChange={setStopWordFilter} />
            <div className="flex flex-row gap-2 items-center">
              <NavigationButtons // TODO: Consider disabling nav buttons if selectedReport is a summary
                onPrevious={handlePrevious}
                onNext={handleNext}
                hasPrevious={reports.findIndex((r) => r.id === selectedReport?.id) < reports.length - 1}
                hasNext={reports.findIndex((r) => r.id === selectedReport?.id) > 0}
              />
            </div>
          </div>
        </div>
        <div className="flex-1 p-3 md:p-6 overflow-auto">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <p className="text-muted-foreground">Loading {currentReportType} reports...</p>
            </div>
          ) : selectedReport ? (
            <Tabs defaultValue="wordcloud" className="h-full flex flex-col" key={selectedReport.id}> {/* Add key to Tabs to force re-render */}
              <TabsList className="grid w-full grid-cols-2 mb-4">
                <TabsTrigger value="wordcloud" className="text-xs md:text-sm">
                  Wordcloud
                </TabsTrigger>
                <TabsTrigger value="fulltext" className="text-xs md:text-sm">
                  Full Report
                </TabsTrigger>
              </TabsList>
              <TabsContent value="wordcloud" className="flex-1 mt-0">
                <WordCloud report={selectedReport} stopWordFilter={stopWordFilter} onWordClick={handleWordClick} />
              </TabsContent>
              <TabsContent value="fulltext" className="flex-1 mt-0">
                <FullReport report={selectedReport} />
              </TabsContent>
            </Tabs>
          ) : (
            <div className="flex items-center justify-center h-full">
              <p className="text-muted-foreground text-center px-4">
                No {currentReportType} reports available for the selected period.
              </p>
            </div>
          )}
        </div>
      </div>
      <ReferencesDrawer
        isOpen={isReferencesOpen}
        onClose={() => setIsReferencesOpen(false)}
        word={selectedWord}
        report={selectedReport}
      />
    </div>
  )
}
