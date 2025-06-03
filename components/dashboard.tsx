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
import type { Report } from "@/lib/types"

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.POSTGRES_NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.POSTGRES_NEXT_PUBLIC_SUPABASE_ANON_KEY

// Create client only if URL and key are available
const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null

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

      if (!supabase) {
        console.error("Supabase client not initialized")
        // Use mock data for development/preview
        const mockReports = [
          {
            id: "mock-1",
            content:
              "## Today's Accomplishments\n\n- **Dashboard UI Design:** Completed the main dashboard layout\n- **API Integration:** Successfully integrated the reporting module API\n- **Bug Fixes:** Fixed several critical bugs in the authentication flow\n\n## Tomorrow's Plan\n\n- Implement word cloud visualization\n- Improve filtering options\n- Start work on export functionality\n\n## Blockers\n\nNo blockers at the moment.",
            createdAt: new Date(),
            teamName: "Engineering",
          },
          {
            id: "mock-2",
            content:
              "## Today's Work\n\n- **UI Components:** Finalized components for the profile page\n- **Dashboard Mockups:** Created new dashboard layout designs\n- **User Testing:** Conducted onboarding flow testing\n\n## Next Steps\n\n- Work on design system documentation\n- Create illustrations for empty states\n\n## Issues\n\n- Waiting for stakeholder feedback on color scheme",
            createdAt: new Date(),
            teamName: "Design",
          },
          {
            id: "mock-3",
            content:
              "ทีมวิศวกรรม - รายงานประจำวัน\n\n## งานที่เสร็จแล้ว\n\n- **ระบบยืนยันตัวตน:** พัฒนาระบบการยืนยันตัวตนของผู้ใช้\n- **แก้ไขข้อบกพร่อง:** แก้ไขข้อบกพร่องในการแสดงผลแดชบอร์ด\n- **ปรับปรุงประสิทธิภาพ:** ปรับปรุงประสิทธิภาพการค้นหาข้อมูล\n\n## กำลังดำเนินการ\n\n- **API Integration:** ทำงานเกี่ยวกับการเชื่อมต่อ API กับบริการภายนอก\n- **Code Refactoring:** ปรับปรุงโค้ดเก่าในส่วนของ backend\n\n## ปัญหาที่พบ\n\n- รอทีมออกแบบเพื่อสรุปองค์ประกอบ UI",
            createdAt: subDays(new Date(), 1),
            teamName: "Engineering",
          },
          {
            id: "mock-4",
            content:
              "## Product Updates\n\n- **Feature Planning:** Completed roadmap for Q1 features\n- **User Research:** Analyzed user feedback from last sprint\n- **Stakeholder Meeting:** Presented progress to leadership team\n\n## Upcoming Tasks\n\n- Define acceptance criteria for new features\n- Schedule user interviews\n\n## Dependencies\n\n- Need engineering estimates for new features",
            createdAt: subDays(new Date(), 1),
            teamName: "Product",
          },
        ]
        setReports(mockReports)
        if (!selectedReport && mockReports.length > 0) {
          setSelectedReport(mockReports[0])
        }
        setIsLoading(false)
        return
      }

      try {
        // Fetch all reports without date filtering
        const { data, error } = await supabase.from("standup").select("*").order("created_at", { ascending: false })

        if (error) {
          console.error("Error fetching reports:", error)
          setIsLoading(false)
          return
        }

        const formattedReports = data.map((report) => ({
          id: report.id,
          content: report.content,
          createdAt: new Date(report.created_at),
          teamName: report.team_name,
        }))

        setReports(formattedReports)

        // Set default selected report if none selected
        if (
          formattedReports.length > 0 &&
          (!selectedReport || !formattedReports.find((r) => r.id === selectedReport.id))
        ) {
          setSelectedReport(formattedReports[0])
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
      <Sidebar reports={reports} selectedReport={selectedReport} onReportSelect={handleReportSelect} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="p-3 md:p-4 border-b flex flex-col sm:flex-row gap-2 sm:gap-4 items-start sm:items-center">
          <h2 className="scroll-m-20 text-xl md:text-3xl font-semibold tracking-tight first:mt-0 px-2 md:px-2 truncate flex-1 min-w-0">
            {selectedReport?.createdAt
              ? selectedReport.createdAt.toLocaleDateString('en-US', { day: '2-digit', month: 'long', timeZone: 'UTC' })
              : ""}: {selectedReport?.teamName
              ? selectedReport.teamName.charAt(0).toUpperCase() + selectedReport.teamName.slice(1)
              : "Untitled"}
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
            <Tabs defaultValue="wordcloud" className="h-full flex flex-col">
              <TabsList className="grid w-full grid-cols-2 mb-4">
                <TabsTrigger value="wordcloud" className="text-xs md:text-sm">
                  Wordcloud
                </TabsTrigger>
                <TabsTrigger value="fulltext" className="text-xs md:text-sm lg:text-lg hover:bg-[#3A3A3A] data-[state=active]:shadow-[0_0px_100px_rgba(203,92,255,0.8)] data-[state=active]:bg-gray-900">
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
