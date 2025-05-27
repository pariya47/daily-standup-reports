import { createClient } from "@supabase/supabase-js"

// Initialize Supabase client with proper error handling
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Create a singleton instance of the Supabase client
let supabaseInstance: ReturnType<typeof createClient> | null = null

export function getSupabaseClient() {
  if (!supabaseUrl || !supabaseKey) {
    console.warn("Supabase URL or key is missing. Using mock data instead.")
    return null
  }

  if (!supabaseInstance) {
    supabaseInstance = createClient(supabaseUrl, supabaseKey)
  }

  return supabaseInstance
}

import { Report, ReportType } from "./types";

// Mock data for development and preview
export const mockTeams = ["Engineering", "Design", "Product", "Marketing", "Sales"]

export const mockReports = (teams: string[], reportType: ReportType, count: number = 3) => {
  return teams.flatMap((team) => {
    return Array.from({ length: count }).map((_, index) => ({
      id: `mock-${reportType}-${team}-${index}`,
      content: `This is a mock ${reportType} report for ${team} (Day ${index + 1}).
      
Today I completed:
- Dashboard UI design implementation
- API integration for the reporting module
- Fixed several bugs in the user authentication flow

Tomorrow I plan to:
- Implement the word cloud visualization
- Improve the filtering options
- Start work on the export functionality

No blockers at the moment.`,
      createdAt: new Date(Date.now() - index * (reportType === 'daily' ? 1 : reportType === 'weekly' ? 7 : 30) * 24 * 60 * 60 * 1000), // Days ago
      teamName: team,
      reportType: reportType,
      progress: index % 3 === 0 
        ? [`Mock progress item 1 for ${team} ${reportType} ${index + 1}`, "Mock progress item 2"] 
        : (index % 3 === 1 ? ["Another progress item"] : []),
      blockers: index % 4 === 0 
        ? [`Mock blocker for ${team} ${reportType} ${index + 1}`] 
        : (index % 4 === 1 ? [] : undefined), // undefined for some cases
      nextSteps: index % 2 === 0 
        ? [`Mock next step 1 for ${team} ${reportType} ${index + 1}`, `Mock next step 2`]
        : [`A single next step for ${team} ${reportType} ${index + 1}`],
    }))
  })
}

export async function fetchDailyReports(): Promise<Report[]> {
  const supabase = getSupabaseClient()
  if (!supabase) {
    console.log("Supabase client not available, returning mock daily reports.")
    return mockReports(mockTeams, 'daily')
  }

  const { data, error } = await supabase
    .from("standup")
    .select("*, progress, blockers, next_steps")
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching daily reports:", error)
    console.log("Returning mock daily reports due to error.")
    return mockReports(mockTeams, 'daily')
  }

  return data.map((report) => ({ ...report, reportType: 'daily' })) || []
}

export async function fetchWeeklyReports(): Promise<Report[]> {
  const supabase = getSupabaseClient()
  if (!supabase) {
    console.log("Supabase client not available, returning mock weekly reports.")
    return mockReports(mockTeams, 'weekly')
  }

  const { data, error } = await supabase
    .from("weekly_reports")
    .select("*, progress, blockers, next_steps")
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching weekly reports:", error)
    console.log("Returning mock weekly reports due to error.")
    return mockReports(mockTeams, 'weekly')
  }

  return data.map((report) => ({ ...report, reportType: 'weekly' })) || []
}

export async function fetchMonthlyReports(): Promise<Report[]> {
  const supabase = getSupabaseClient()
  if (!supabase) {
    console.log("Supabase client not available, returning mock monthly reports.")
    return mockReports(mockTeams, 'monthly')
  }

  const { data, error } = await supabase
    .from("monthly_reports")
    .select("*, progress, blockers, next_steps")
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching monthly reports:", error)
    console.log("Returning mock monthly reports due to error.")
    return mockReports(mockTeams, 'monthly')
  }

  return data.map((report) => ({ ...report, reportType: 'monthly' })) || []
}
