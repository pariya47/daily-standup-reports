"use client"

import { useState, useEffect } from "react"
import { format } from "date-fns"
import type { Report } from "@/lib/types"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { groupReportsByDate } from "@/lib/text-processor"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { ChevronDown, ChevronRight, FileText, Menu } from "lucide-react"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"

interface SidebarProps {
  reports: Report[]
  selectedReport: Report | null
  onReportSelect: (report: Report) => void
  className?: string
}

// Function to create a summary report from multiple reports
function createDailySummary(reports: Report[], date: string): Report {
  const combinedContent = reports
    .map((report, index) => {
      return report.content == null || report.content === "" ? "" : `## ${report.teamName}\n\n${report.content}`
    })
    .join("\n\n")

  return {
    id: `summary-${date}`,
    content: `# Daily Summary - ${format(new Date(date), "MMMM d, yyyy")}\n\n${combinedContent}`,
    createdAt: new Date(date),
    teamName: "Daily Summary",
  }
}

function SidebarContent({ reports, selectedReport, onReportSelect }: SidebarProps) {
  // Group reports by date
  const groupedReports = groupReportsByDate(reports)

  // Track open state for each date group
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({})

  // Initialize with only the latest date group open
  useEffect(() => {
    if (groupedReports.length > 0) {
      const initialOpenState: Record<string, boolean> = {}

      // Set only the first (latest) group to be open
      groupedReports.forEach((group, index) => {
        initialOpenState[group.date] = index === 0
      })

      setOpenGroups(initialOpenState)
    }
  }, [groupedReports.length])

  // Toggle a specific group
  const toggleGroup = (date: string) => {
    setOpenGroups((prev) => ({
      ...prev,
      [date]: !prev[date],
    }))
  }

  return (
    <div className="flex flex-col h-full">
      <div className="p-3 md:p-4 border-b">
        <h2 className="font-semibold text-sm md:text-base">Daily Standup Reports</h2>
      </div>
      <ScrollArea className="flex-1">
        <div className="p-2">
          {groupedReports.length > 0 ? (
            groupedReports.map((group) => {
              const dailySummary = createDailySummary(group.reports, group.date)

              return (
                <Collapsible
                  key={group.date}
                  open={openGroups[group.date]}
                  onOpenChange={() => toggleGroup(group.date)}
                  className="mb-2"
                >
                  <CollapsibleTrigger className="flex w-full items-center justify-between p-2 hover:bg-muted/50 rounded-md text-sm md:text-base">
                    <span className="font-medium text-left">{format(new Date(group.date), "MMM d, yyyy")}</span>
                    {openGroups[group.date] ? (
                      <ChevronDown className="h-4 w-4 flex-shrink-0" />
                    ) : (
                      <ChevronRight className="h-4 w-4 flex-shrink-0" />
                    )}
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    {/* Daily Summary Item */}
                    <Button
                      variant="ghost"
                      className={cn(
                        "w-full justify-start text-left mb-1 h-auto py-2 pl-4 md:pl-6 bg-primary/10 hover:bg-primary/20",
                        selectedReport?.id === dailySummary.id && "bg-muted",
                      )}
                      onClick={() => onReportSelect(dailySummary)}
                    >
                      <div className="flex items-center gap-2 w-full min-w-0">
                        <div className="flex flex-col items-start min-w-0 flex-1">
                          <span className="font-medium text-primary text-xs md:text-sm truncate w-full">
                            Daily Summary Ready!
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
                          selectedReport?.id === report.id && "bg-muted",
                        )}
                        onClick={() => onReportSelect(report)}
                      >
                        <div className="flex flex-row items-center pl-2 space-x-2 min-w-0 flex-1">
                          <FileText className="h-3 w-3 md:h-4 md:w-4 text-primary flex-shrink-0" />
                          <span className="font-medium text-xs md:text-sm truncate">{report.teamName}</span>
                        </div>
                      </Button>
                    ))}
                  </CollapsibleContent>
                </Collapsible>
              )
            })
          ) : (
            <p className="text-xs md:text-sm text-muted-foreground p-2">No reports found</p>
          )}
        </div>
      </ScrollArea>
    </div>
  )
}

export function Sidebar({ reports, selectedReport, onReportSelect, className }: SidebarProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      {/* Mobile Sidebar */}
      <div className="md:hidden">
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="fixed bottom-4 left-4 z-50 bg-background/80 backdrop-blur-sm">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Open sidebar</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-80 p-0">
            <SidebarContent
              reports={reports}
              selectedReport={selectedReport}
              onReportSelect={(report) => {
                onReportSelect(report)
                setIsOpen(false) // Close sidebar after selection on mobile
              }}
            />
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop Sidebar */}
      <div className={cn("hidden md:flex w-64 border-r bg-muted/10 flex-col h-full", className)}>
        <SidebarContent reports={reports} selectedReport={selectedReport} onReportSelect={onReportSelect} />
      </div>
    </>
  )
}
