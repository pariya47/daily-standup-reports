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
    return Array.from({ length: count }).map((_, index) => {
      let progress_val;
      switch (index % 5) {
        case 0: progress_val = null; break;
        case 1: progress_val = undefined; break;
        case 2: progress_val = [`Progress A for ${team} ${reportType} ${index + 1}`, "Progress B"]; break;
        case 3: progress_val = [`Detailed progress for item ${index + 1}`]; break;
        case 4: progress_val = []; break;
      }

      let blockers_val;
      switch (index % 6) {
        case 0: blockers_val = undefined; break;
        case 1: blockers_val = null; break;
        case 2: blockers_val = [`Blocker X for ${team} ${reportType} ${index + 1}`]; break;
        case 3: blockers_val = []; break;
        case 4: blockers_val = [`Critical Blocker Y for ${team}`, "Dependency Z"]; break;
        case 5: blockers_val = undefined; break;
      }

      let nextSteps_val;
      switch (index % 4) {
        case 0: nextSteps_val = [`Next Step 1 for ${team} ${reportType} ${index + 1}`, "Next Step 2"]; break;
        case 1: nextSteps_val = []; break;
        case 2: nextSteps_val = null; break;
        case 3: nextSteps_val = undefined; break;
      }
      
      return {
        id: `mock-${reportType}-${team}-${index}`,
        content: `Legacy content for ${team} ${reportType} report ${index + 1}.`,
        createdAt: new Date(Date.now() - index * (reportType === 'daily' ? 1 : reportType === 'weekly' ? 7 : 30) * 24 * 60 * 60 * 1000), // Days ago
        teamName: team,
        reportType: reportType,
        progress: progress_val,
        blockers: blockers_val,
        nextSteps: nextSteps_val,
      };
    })
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

  return data.map((dbReport: any) => {
    let createdAtDate = null;
    if (dbReport.created_at) {
      try {
        const parsedDate = new Date(dbReport.created_at);
        if (!isNaN(parsedDate.getTime())) {
          createdAtDate = parsedDate;
        } else {
          console.warn(`Invalid date string received for daily report ID ${dbReport.id}: ${dbReport.created_at}`);
        }
      } catch (e) {
        console.warn(`Error parsing date for daily report ID ${dbReport.id}: ${dbReport.created_at}`, e);
      }
    }
    return {
      id: String(dbReport.id),
      content: String(dbReport.content || ''),
      teamName: String(dbReport.team_name || dbReport.teamName || 'Unknown Team'), // common variations
      progress: Array.isArray(dbReport.progress) ? dbReport.progress.map(String) : [],
      blockers: Array.isArray(dbReport.blockers) ? dbReport.blockers.map(String) : [],
      nextSteps: Array.isArray(dbReport.next_steps) ? dbReport.next_steps.map(String) : [],
      createdAt: createdAtDate,
      reportType: 'daily'
    };
  }) || [];
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

  return data.map((dbReport: any) => {
    let createdAtDate = null;
    if (dbReport.created_at) {
      try {
        const parsedDate = new Date(dbReport.created_at);
        if (!isNaN(parsedDate.getTime())) {
          createdAtDate = parsedDate;
        } else {
          console.warn(`Invalid date string received for weekly report ID ${dbReport.id}: ${dbReport.created_at}`);
        }
      } catch (e) {
        console.warn(`Error parsing date for weekly report ID ${dbReport.id}: ${dbReport.created_at}`, e);
      }
    }
    return {
      id: String(dbReport.id),
      content: String(dbReport.content || ''),
      teamName: String(dbReport.team_name || dbReport.teamName || 'Unknown Team'),
      progress: Array.isArray(dbReport.progress) ? dbReport.progress.map(String) : [],
      blockers: Array.isArray(dbReport.blockers) ? dbReport.blockers.map(String) : [],
      nextSteps: Array.isArray(dbReport.next_steps) ? dbReport.next_steps.map(String) : [],
      createdAt: createdAtDate,
      reportType: 'weekly'
    };
  }) || [];
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

  return data.map((dbReport: any) => {
    let createdAtDate = null;
    if (dbReport.created_at) {
      try {
        const parsedDate = new Date(dbReport.created_at);
        if (!isNaN(parsedDate.getTime())) {
          createdAtDate = parsedDate;
        } else {
          console.warn(`Invalid date string received for monthly report ID ${dbReport.id}: ${dbReport.created_at}`);
        }
      } catch (e)
      {
        console.warn(`Error parsing date for monthly report ID ${dbReport.id}: ${dbReport.created_at}`, e);
      }
    }
    return {
      id: String(dbReport.id),
      content: String(dbReport.content || ''),
      teamName: String(dbReport.team_name || dbReport.teamName || 'Unknown Team'),
      progress: Array.isArray(dbReport.progress) ? dbReport.progress.map(String) : [],
      blockers: Array.isArray(dbReport.blockers) ? dbReport.blockers.map(String) : [],
      nextSteps: Array.isArray(dbReport.next_steps) ? dbReport.next_steps.map(String) : [],
      createdAt: createdAtDate,
      reportType: 'monthly'
    };
  }) || [];
}
