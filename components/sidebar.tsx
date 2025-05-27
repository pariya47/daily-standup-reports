"use client"

import { useState, useEffect, useMemo } from "react"
import { format, startOfWeek, startOfMonth, endOfWeek, endOfMonth, getWeekOfMonth, getMonth, getYear } from "date-fns"
import type { Report, ReportType } from "@/lib/types"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { ChevronDown, ChevronRight, FileText, Menu, CalendarDays, Columns, Calendar } from "lucide-react"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"

interface SidebarProps {
  reports: Report[]
  selectedReport: Report | null
  onReportSelect: (report: Report) => void
  onReportTypeChange: (reportType: ReportType) => void
  currentReportType: ReportType
  className?: string
}

interface GroupedReports {
  period: string // For daily, this is date; for weekly, 'YYYY-WW'; for monthly, 'YYYY-MM'
  reports: Report[]
  periodTitle: string // User-friendly title like "Oct 23, 2023", "Week 42 (Oct 23-29)", "October 2023"
}

// Helper to get week string: YYYY-WW
const getWeekId = (date: Date) => `${getYear(date)}-${format(date, "II")}` // ISO week number

// Grouping functions
const groupReportsByDate = (reports: Report[]): GroupedReports[] => {
  const groups: Record<string, Report[]> = {}
  reports.forEach((report) => {
    const dateStr = format(report.createdAt, "yyyy-MM-dd")
    if (!groups[dateStr]) groups[dateStr] = []
    groups[dateStr].push(report)
  })
  return Object.entries(groups)
    .map(([date, reps]) => ({
      period: date,
      reports: reps,
      periodTitle: format(new Date(date), "MMM d, yyyy"),
    }))
    .sort((a, b) => new Date(b.period).getTime() - new Date(a.period).getTime())
}

const groupReportsByWeek = (reports: Report[]): GroupedReports[] => {
  const groups: Record<string, Report[]> = {}
  reports.forEach((report) => {
    const weekId = getWeekId(report.createdAt)
    if (!groups[weekId]) groups[weekId] = []
    groups[weekId].push(report)
  })
  return Object.entries(groups)
    .map(([weekId, reps]) => {
      const firstReportDate = reps[0].createdAt
      const weekStart = startOfWeek(firstReportDate, { weekStartsOn: 1 }) // Assuming week starts on Monday
      const weekEnd = endOfWeek(firstReportDate, { weekStartsOn: 1 })
      return {
        period: weekId,
        reports: reps,
        periodTitle: `Week of ${format(weekStart, "MMM d")} - ${format(weekEnd, "MMM d, yyyy")}`,
      }
    })
    .sort((a, b) => b.period.localeCompare(a.period)) // Sort by YYYY-WW string
}

const groupReportsByMonth = (reports: Report[]): GroupedReports[] => {
  const groups: Record<string, Report[]> = {}
  reports.forEach((report) => {
    const monthId = format(report.createdAt, "yyyy-MM")
    if (!groups[monthId]) groups[monthId] = []
    groups[monthId].push(report)
  })
  return Object.entries(groups)
    .map(([monthId, reps]) => ({
      period: monthId,
      reports: reps,
      periodTitle: format(reps[0].createdAt, "MMMM yyyy"),
    }))
    .sort((a, b) => b.period.localeCompare(a.period)) // Sort by YYYY-MM string
}

// Function to create a summary report from multiple reports
function createPeriodSummary(reports: Report[], periodIdentifier: string, reportType: ReportType, periodTitle: string): Report {
  const combinedContent = reports
    .map((report) => {
      return report.content == null || report.content === "" ? "" : `## ${report.teamName} (${format(report.createdAt, "MMM d")})\n\n${report.content}`
    })
    .join("\n\n---\n\n")

  let titlePrefix = "Summary"
  if (reportType === "daily") titlePrefix = "Daily Summary"
  else if (reportType === "weekly") titlePrefix = "Weekly Summary"
  else if (reportType === "monthly") titlePrefix = "Monthly Summary"
  
  // Use the first report's createdAt for the summary's createdAt, or generate based on periodIdentifier
  let summaryDate = new Date()
  if (reports.length > 0) {
    summaryDate = reports[0].createdAt; // Default to first report's date
  }
  if (reportType === 'daily') summaryDate = new Date(periodIdentifier);
  else if (reportType === 'weekly') summaryDate = startOfWeek(new Date(reports[0]?.createdAt || periodIdentifier.split('-W')[0] + '-01-01'), { weekStartsOn: 1 }); // Approx
  else if (reportType === 'monthly') summaryDate = startOfMonth(new Date(reports[0]?.createdAt || periodIdentifier + '-01'));


  return {
    id: `summary-${reportType}-${periodIdentifier}`,
    content: `# ${titlePrefix} - ${periodTitle}\n\n${combinedContent}`,
    createdAt: summaryDate,
    teamName: `${titlePrefix}`,
    reportType: reportType,
  }
}

function SidebarContent({ reports, selectedReport, onReportSelect, onReportTypeChange, currentReportType }: SidebarProps) {
  const groupedReports = useMemo(() => {
    if (currentReportType === "weekly") {
      return groupReportsByWeek(reports)
    } else if (currentReportType === "monthly") {
      return groupReportsByMonth(reports)
    }
    return groupReportsByDate(reports) // Default to daily
  }, [reports, currentReportType])

  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({})

  useEffect(() => {
    if (groupedReports.length > 0) {
      const initialOpenState: Record<string, boolean> = {}
      groupedReports.forEach((group, index) => {
        initialOpenState[group.period] = index === 0 // Open the first (latest) group
      })
      setOpenGroups(initialOpenState)
    } else {
      setOpenGroups({})
    }
  }, [groupedReports])

  const toggleGroup = (period: string) => {
    setOpenGroups((prev) => ({
      ...prev,
      [period]: !prev[period],
    }))
  }

  const reportTypeTitle = currentReportType.charAt(0).toUpperCase() + currentReportType.slice(1) + " Reports";

  return (
    <div className="flex flex-col h-full">
      <div className="p-3 md:p-4 border-b">
        <h2 className="font-semibold text-sm md:text-base mb-2">{reportTypeTitle}</h2>
        <Tabs value={currentReportType} onValueChange={(value) => onReportTypeChange(value as ReportType)} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="daily" className="text-xs px-1">
              <CalendarDays className="h-3 w-3 mr-1 sm:mr-2" /> Daily
            </TabsTrigger>
            <TabsTrigger value="weekly" className="text-xs px-1">
              <Columns className="h-3 w-3 mr-1 sm:mr-2" /> Weekly
            </TabsTrigger>
            <TabsTrigger value="monthly" className="text-xs px-1">
              <Calendar className="h-3 w-3 mr-1 sm:mr-2" /> Monthly
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
      <ScrollArea className="flex-1">
        <div className="p-2">
          {groupedReports.length > 0 ? (
            groupedReports.map((group) => {
              const periodSummary = createPeriodSummary(group.reports, group.period, currentReportType, group.periodTitle)
              const isSummarySelected = selectedReport?.id === periodSummary.id;

              return (
                <Collapsible
                  key={group.period}
                  open={openGroups[group.period] ?? false}
                  onOpenChange={() => toggleGroup(group.period)}
                  className="mb-2"
                >
                  <CollapsibleTrigger className="flex w-full items-center justify-between p-2 hover:bg-muted/50 rounded-md text-sm md:text-base">
                    <span className="font-medium text-left">{group.periodTitle}</span>
                    {openGroups[group.period] ? (
                      <ChevronDown className="h-4 w-4 flex-shrink-0" />
                    ) : (
                      <ChevronRight className="h-4 w-4 flex-shrink-0" />
                    )}
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    {/* Period Summary Item */}
                    <Button
                      variant="ghost"
                      className={cn(
                        "w-full justify-start text-left mb-1 h-auto py-2 pl-4 md:pl-6 bg-primary/5 hover:bg-primary/10",
                        isSummarySelected && "bg-primary/20 font-semibold",
                      )}
                      onClick={() => onReportSelect(periodSummary)}
                    >
                      <div className="flex items-center gap-2 w-full min-w-0">
                        <div className="flex flex-col items-start min-w-0 flex-1">
                          <span className={cn("text-xs md:text-sm truncate w-full", isSummarySelected ? "text-primary" : "text-foreground/80")}>
                            {periodSummary.teamName} Ready!
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {group.reports.length} report{group.reports.length > 1 ? "s" : ""}
                          </span>
                        </div>
                      </div>
                    </Button>

                    {/* Individual Reports */}
                    {group.reports.map((report) => (
                      <Button
                        key={report.id}
                        variant="ghost"
                        className={cn(
                          "w-full justify-start text-left mb-1 h-auto py-2 pl-4 md:pl-6 hover:bg-muted/50",
                          selectedReport?.id === report.id && "bg-muted font-semibold",
                        )}
                        onClick={() => onReportSelect(report)}
                      >
                        <div className="flex flex-row items-center pl-2 space-x-2 min-w-0 flex-1">
                          <FileText className="h-3 w-3 md:h-4 md:w-4 text-primary/80 flex-shrink-0" />
                          <span className="font-medium text-xs md:text-sm truncate">{report.teamName}</span>
                        </div>
                      </Button>
                    ))}
                  </CollapsibleContent>
                </Collapsible>
              )
            })
          ) : (
            <p className="text-xs md:text-sm text-muted-foreground p-2">No reports found for this period.</p>
          )}
        </div>
      </ScrollArea>
    </div>
  )
}

export function Sidebar({ reports, selectedReport, onReportSelect, onReportTypeChange, currentReportType, className }: SidebarProps) {
  const [isOpen, setIsOpen] = useState(false)

  const handleReportSelectAndCloseMobile = (report: Report) => {
    onReportSelect(report)
    setIsOpen(false) // Close sidebar after selection on mobile
  }

  return (
    <>
      {/* Mobile Sidebar */}
      <div className="md:hidden">
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="fixed bottom-4 left-4 z-50 bg-background/80 backdrop-blur-sm border">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Open sidebar</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-72 sm:w-80 p-0">
            <SidebarContent
              reports={reports}
              selectedReport={selectedReport}
              onReportSelect={handleReportSelectAndCloseMobile}
              onReportTypeChange={onReportTypeChange}
              currentReportType={currentReportType}
            />
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop Sidebar */}
      <div className={cn("hidden md:flex w-64 lg:w-72 border-r bg-muted/20 flex-col h-full", className)}>
        <SidebarContent
          reports={reports}
          selectedReport={selectedReport}
          onReportSelect={onReportSelect}
          onReportTypeChange={onReportTypeChange}
          currentReportType={currentReportType}
        />
      </div>
    </>
  )
}
