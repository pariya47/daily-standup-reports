import type React from "react"
import "@/app/globals.css"
import { Inter, Prompt } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"

const inter = Inter({ subsets: ["latin"] })
const prompt = Prompt({ subsets: ["thai", "latin"], weight: ["400", "500", "700"] })

export const metadata = {
  title: "Standup Report Visualizer",
  description: "Visualize daily standup reports in an interactive 2D word cloud format",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={prompt.className}>
        {/* defaultTheme="dark" */}
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
