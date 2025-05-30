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
  const validReports = reports.filter(report => {
    const isValid = report.createdAt instanceof Date && !isNaN(report.createdAt.getTime());
    if (!isValid) {
      console.warn(`Sidebar (groupReportsByDate): Filtering out report ID ${report.id} due to invalid createdAt:`, report.createdAt);
    }
    return isValid;
  });

  const groups: Record<string, Report[]> = {};
  validReports.forEach((report) => {
    const dateStr = format(report.createdAt!, "yyyy-MM-dd");
    if (!groups[dateStr]) groups[dateStr] = [];
    groups[dateStr].push(report);
  });
  return Object.entries(groups)
    .map(([date, reps]) => ({
      period: date,
      reports: reps,
      periodTitle: format(new Date(date), "MMM d, yyyy"),
    }))
    .sort((a, b) => new Date(b.period).getTime() - new Date(a.period).getTime());
};

const groupReportsByWeek = (reports: Report[]): GroupedReports[] => {
  const validReports = reports.filter(report => {
    const isValid = report.createdAt instanceof Date && !isNaN(report.createdAt.getTime());
    if (!isValid) {
      console.warn(`Sidebar (groupReportsByWeek): Filtering out report ID ${report.id} due to invalid createdAt:`, report.createdAt);
    }
    return isValid;
  });

  const groups: Record<string, Report[]> = {};
  validReports.forEach((report) => {
    const weekId = getWeekId(report.createdAt!);
    if (!groups[weekId]) groups[weekId] = [];
    groups[weekId].push(report);
  });
  return Object.entries(groups)
    .map(([weekId, reps]) => {
      // reps[0] is guaranteed to exist and have a valid createdAt if groups[weekId] was populated
      const firstReportDate = reps[0].createdAt!;
      const weekStart = startOfWeek(firstReportDate, { weekStartsOn: 1 });
      const weekEnd = endOfWeek(firstReportDate, { weekStartsOn: 1 });
      return {
        period: weekId,
        reports: reps,
        periodTitle: `Week of ${format(weekStart, "MMM d")} - ${format(weekEnd, "MMM d, yyyy")}`,
      };
    })
    .sort((a, b) => b.period.localeCompare(a.period));
};

const groupReportsByMonth = (reports: Report[]): GroupedReports[] => {
  const validReports = reports.filter(report => {
    const isValid = report.createdAt instanceof Date && !isNaN(report.createdAt.getTime());
    if (!isValid) {
      console.warn(`Sidebar (groupReportsByMonth): Filtering out report ID ${report.id} due to invalid createdAt:`, report.createdAt);
    }
    return isValid;
  });

  const groups: Record<string, Report[]> = {};
  validReports.forEach((report) => {
    const monthId = format(report.createdAt!, "yyyy-MM");
    if (!groups[monthId]) groups[monthId] = [];
    groups[monthId].push(report);
  });
  return Object.entries(groups)
    .map(([monthId, reps]) => ({
      period: monthId,
      reports: reps,
      // reps[0] is guaranteed to exist and have a valid createdAt if groups[monthId] was populated
      periodTitle: format(reps[0].createdAt!, "MMMM yyyy"),
    }))
    .sort((a, b) => b.period.localeCompare(a.period));
};

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
  if (reports.length > 0 && reports[0].createdAt) { // Ensure reports[0] and its createdAt exist
    summaryDate = reports[0].createdAt;
  } else if (reportType === 'daily') {
    summaryDate = new Date(periodIdentifier);
  }
  // Further refinement of summaryDate based on reportType and periodIdentifier
  if (reportType === 'daily') {
    summaryDate = new Date(periodIdentifier);
  } else if (reportType === 'weekly' && reports.length > 0 && reports[0].createdAt) {
    summaryDate = startOfWeek(reports[0].createdAt, { weekStartsOn: 1 });
  } else if (reportType === 'weekly') { // Fallback if reports[0] or createdAt is null
    const year = parseInt(periodIdentifier.split('-')[0], 10);
    const weekNum = parseInt(periodIdentifier.split('-')[1], 10);
    summaryDate = startOfWeek(new Date(year, 0, 1 + (weekNum - 1) * 7), { weekStartsOn: 1 });
  } else if (reportType === 'monthly' && reports.length > 0 && reports[0].createdAt) {
    summaryDate = startOfMonth(reports[0].createdAt);
  } else if (reportType === 'monthly') { // Fallback
    const year = parseInt(periodIdentifier.split('-')[0], 10);
    const monthIndex = parseInt(periodIdentifier.split('-')[1], 10) - 1;
    summaryDate = startOfMonth(new Date(year, monthIndex, 1));
  }


  const aggregatedProgressLines: string[] = [];
  reports.forEach((report, reportIndex) => {
    if (report.progress && typeof report.progress === 'string' && report.progress.trim() !== "") {
      const lines = report.progress.split('\n').map(line => line.trim()).filter(line => line.length > 0);
      if (lines.length > 0) {
        if (reports.length > 1) {
          aggregatedProgressLines.push(`**${report.teamName} (${format(report.createdAt!, "MMM d")})**`);
        }
        lines.forEach(line => {
          aggregatedProgressLines.push(line);
        });
        if (reports.length > 1 && reportIndex < reports.length - 1 && lines.length > 0) {
          // Add separator if not the last report and it had content
          const nextReportHasProgress = reports.slice(reportIndex + 1).some(r => r.progress && r.progress.trim() !== "");
          if (nextReportHasProgress) aggregatedProgressLines.push("\n---\n");
        }
      }
    }
  });
  const summaryProgress = aggregatedProgressLines.join('\n');

  const aggregatedBlockersLines: string[] = [];
  reports.forEach((report, reportIndex) => {
    if (report.blockers && typeof report.blockers === 'string' && report.blockers.trim() !== "") {
      const lines = report.blockers.split('\n').map(line => line.trim()).filter(line => line.length > 0);
      if (lines.length > 0) {
        if (reports.length > 1) {
          aggregatedBlockersLines.push(`**${report.teamName} (${format(report.createdAt!, "MMM d")})**`);
        }
        lines.forEach(line => {
          aggregatedBlockersLines.push(line);
        });
        if (reports.length > 1 && reportIndex < reports.length - 1 && lines.length > 0) {
          const nextReportHasBlockers = reports.slice(reportIndex + 1).some(r => r.blockers && r.blockers.trim() !== "");
          if (nextReportHasBlockers) aggregatedBlockersLines.push("\n---\n");
        }
      }
    }
  });
  const summaryBlockers = aggregatedBlockersLines.join('\n');

  const aggregatedNextStepsLines: string[] = [];
  reports.forEach((report, reportIndex) => {
    if (report.nextSteps && typeof report.nextSteps === 'string' && report.nextSteps.trim() !== "") {
      const lines = report.nextSteps.split('\n').map(line => line.trim()).filter(line => line.length > 0);
      if (lines.length > 0) {
        if (reports.length > 1) {
          aggregatedNextStepsLines.push(`**${report.teamName} (${format(report.createdAt!, "MMM d")})**`);
        }
        lines.forEach(line => {
          aggregatedNextStepsLines.push(line);
        });
        if (reports.length > 1 && reportIndex < reports.length - 1 && lines.length > 0) {
          const nextReportHasNextSteps = reports.slice(reportIndex + 1).some(r => r.nextSteps && r.nextSteps.trim() !== "");
          if (nextReportHasNextSteps) aggregatedNextStepsLines.push("\n---\n");
        }
      }
    }
  });
  const summaryNextSteps = aggregatedNextStepsLines.join('\n');

  return {
    id: `summary-${reportType}-${periodIdentifier}`,
    content: `# ${titlePrefix} - ${periodTitle}\n\n${combinedContent}`,
    createdAt: summaryDate,
    teamName: `${titlePrefix}`,
    reportType: reportType,
    progress: summaryProgress || null, // Ensure null if empty, consistent with Report type
    blockers: summaryBlockers || null,
    nextSteps: summaryNextSteps || null,
  };
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
    <div className="flex flex-col h-full ">
      <div className="p-3 md:p-4  ">
        <h2 className="font-semibold text-sm md:text-2xl md:pt-7 lg:pt-7 lg:px-4 mb-4">{reportTypeTitle}</h2>

        <Tabs value={currentReportType} onValueChange={(value) => onReportTypeChange(value as ReportType)} className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-gradient-to-l from-gray-800 via-pink-700 to-pink-700/20 text-white rounded-full border-2 border-purple-600 p-0 gap-0">
            <TabsTrigger
              value="daily"
              className="w-full h-full flex items-center justify-center gap-2 text-xs rounded-full transition-all duration-200 hover:bg-pink-800 data-[state=active]:bg-gradient-to-l from-pink-600 to-pink-800/50 data-[state=active]:text-white"
            >
              <CalendarDays className="h-4 w-4 shrink-0" />
              <span className="lg:text-base">Daily</span>
            </TabsTrigger>
            <TabsTrigger
              value="weekly"
              className="w-full h-full flex items-center justify-center gap-2 text-xs rounded-full transition-all duration-200 hover:bg-pink-800 data-[state=active]:bg-gradient-to-l from-pink-600 to-pink-800/50 data-[state=active]:text-white"
            >
              <Columns className="h-4 w-4 shrink-0" />
              <span className="lg:text-base">Weekly</span>
            </TabsTrigger>
            <TabsTrigger
              value="monthly"
              className="w-full h-full flex items-center justify-center gap-2 text-xs rounded-full transition-all duration-200 hover:bg-pink-800 data-[state=active]:bg-gradient-to-l from-pink-600 to-pink-800/50 data-[state=active]:text-white"
            >
              <Calendar className="h-4 w-4 shrink-0" />
              <span className="lg:text-base">Monthly</span>
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
      <ScrollArea className="flex-1">
        <div className="p-2 lg:px-4 ">
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
                  <CollapsibleTrigger className="flex w-full items-center justify-between p-2  text-sm md:text-base lg:text-xl  hover:bg-primary/10">
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
                          <span className={cn("text-xs md:text-sm lg:text-lg truncate w-full", isSummarySelected ? "text-gray-200" : "text-foreground/80")}>
                            {periodSummary.teamName} Ready!
                          </span>
                          <span className="text-xs text-muted-foreground lg:text-sm">
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
                          "w-full justify-start text-left mb-1 h-auto py-2 pl-4 md:pl-6 hover:bg-primary/10  ",
                          selectedReport?.id === report.id && "bg-muted font-semibold ",
                        )}
                        onClick={() => onReportSelect(report)}
                      >
                        <div className="flex flex-row items-center pl-2 space-x-2 min-w-0 flex-1">
                          <FileText className="h-3 w-3 md:h-4 md:w-4 text-primary/80 flex-shrink-0" />
                          <span className="font-medium text-xs md:text-s lg:text-base truncate">{report.teamName}</span>
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
          <SheetContent side="left" className="w-72 sm:w-80 p-0 ">
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
      <div className={cn("hidden md:flex w-64 lg:w-80 border-r bg-[#282828] flex-col h-full ", className)}>
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
