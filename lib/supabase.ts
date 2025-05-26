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

// Mock data for development and preview
export const mockTeams = ["Engineering", "Design", "Product", "Marketing", "Sales"]

export const mockReports = (teams: string[]) => {
  return teams.flatMap((team) => {
    return Array.from({ length: 3 }).map((_, index) => ({
      id: `mock-${team}-${index}`,
      content: `This is a mock standup report for ${team} (Day ${index + 1}).
      
Today I completed:
- Dashboard UI design implementation
- API integration for the reporting module
- Fixed several bugs in the user authentication flow

Tomorrow I plan to:
- Implement the word cloud visualization
- Improve the filtering options
- Start work on the export functionality

No blockers at the moment.`,
      createdAt: new Date(Date.now() - index * 24 * 60 * 60 * 1000), // Days ago
      teamName: team,
    }))
  })
}
