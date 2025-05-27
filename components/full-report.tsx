"use client"

import { useMemo } from "react"
import { useIsMobile } from "@/hooks/use-mobile"
import type { Report } from "@/lib/types"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs" // Added Tabs imports
import { ScrollArea } from "@/components/ui/scroll-area"
import type { JSX } from "react/jsx-runtime"

interface FullReportProps {
  report: Report
}

// Helper function to parse inline formatting (bold, italic, etc.)
function parseInlineFormatting(text: string): (string | JSX.Element)[] {
  const parts: (string | JSX.Element)[] = []
  let currentIndex = 0

  // Handle bold text (**text**)
  const boldRegex = /\*\*(.*?)\*\*/g
  let match
  let lastIndex = 0

  while ((match = boldRegex.exec(text)) !== null) {
    // Add text before the bold part
    if (match.index > lastIndex) {
      parts.push(text.substring(lastIndex, match.index))
    }

    // Add the bold part
    parts.push(
      <strong key={`bold-${currentIndex++}`} className="font-bold">
        {match[1]}
      </strong>,
    )

    lastIndex = match.index + match[0].length
  }

  // Add remaining text
  if (lastIndex < text.length) {
    parts.push(text.substring(lastIndex))
  }

  // If no formatting was found, return the original text
  if (parts.length === 0) {
    parts.push(text)
  }

  return parts
}

// Simple markdown-like renderer for basic formatting
function renderMarkdownLike(content: string): JSX.Element {
  if (!content) return <div>No content available</div>

  // Split content into lines
  const lines = content.split("\n")
  const elements: JSX.Element[] = []
  let currentIndex = 0
  let inList = false
  let listItems: JSX.Element[] = []

  const flushList = () => {
    if (listItems.length > 0) {
      elements.push(
        <ul key={`list-${currentIndex++}`} className="list-disc ml-4 md:ml-6 mb-3 md:mb-4 space-y-1">
          {listItems}
        </ul>,
      )
      listItems = []
      inList = false
    }
  }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]

    // Handle headers
    if (line.startsWith("# ")) {
      flushList()
      const headerText = line.substring(2)
      elements.push(
        <h1 key={currentIndex++} className="text-xl md:text-2xl font-bold mb-3 md:mb-4 mt-4 md:mt-6">
          {parseInlineFormatting(headerText)}
        </h1>,
      )
    } else if (line.startsWith("## ")) {
      flushList()
      const headerText = line.substring(3)
      elements.push(
        <h2 key={currentIndex++} className="text-lg md:text-xl font-bold mb-2 md:mb-3 mt-3 md:mt-5">
          {parseInlineFormatting(headerText)}
        </h2>,
      )
    } else if (line.startsWith("### ")) {
      flushList()
      const headerText = line.substring(4)
      elements.push(
        <h3 key={currentIndex++} className="text-base md:text-lg font-bold mb-2 mt-2 md:mt-4">
          {parseInlineFormatting(headerText)}
        </h3>,
      )
    }
    // Handle bullet points
    else if (line.startsWith("- ") || line.startsWith("* ")) {
      const bulletText = line.substring(2)
      listItems.push(
        <li key={currentIndex++} className="mb-1 text-sm md:text-base">
          {parseInlineFormatting(bulletText)}
        </li>,
      )
      inList = true
    }
    // Handle numbered lists
    else if (/^\d+\.\s/.test(line)) {
      if (inList && listItems.length > 0) {
        // Flush current unordered list
        flushList()
      }
      const match = line.match(/^\d+\.\s(.*)/)
      if (match) {
        // For numbered lists, we'll create individual ordered list items
        // In a more complex implementation, you might want to group consecutive numbered items
        elements.push(
          <ol key={currentIndex++} className="list-decimal ml-4 md:ml-6 mb-2">
            <li className="mb-1 text-sm md:text-base">{parseInlineFormatting(match[1])}</li>
          </ol>,
        )
      }
    }
    // Handle empty lines
    else if (line.trim() === "") {
      flushList()
      elements.push(<div key={currentIndex++} className="mb-2" />)
    }
    // Handle regular paragraphs
    else if (line.trim() !== "") {
      flushList()
      elements.push(
        <p key={currentIndex++} className="mb-2 text-sm md:text-base leading-relaxed">
          {parseInlineFormatting(line)}
        </p>,
      )
    }
  }

  // Flush any remaining list items
  flushList()

  return <div className="prose prose-invert max-w-none text-sm md:text-base">{elements}</div>
}

export function FullReport({ report }: FullReportProps) {
  const isMobile = useIsMobile(); // Called useIsMobile

  const renderedContent = useMemo(() => {
    if (!report) {
      return <div className="p-4 text-sm md:text-base italic">No report data available.</div>;
    }

    if (!isMobile) {
      // Desktop 3-column layout
      return (
        <div className="flex flex-col md:flex-row md:space-x-4 space-y-4 md:space-y-0">
          {/* Progress Column */}
          <div className="flex-1 p-3 rounded-lg border bg-green-100 dark:bg-green-900/30 border-green-500/50">
            <h3 className="text-lg font-semibold mb-3 text-green-700 dark:text-green-300">Progress</h3>
            {(report.progress && report.progress.length > 0) ? (
              <ul className="space-y-1 list-disc pl-5">
                {report.progress.map((item, index) => (
                  <li key={`prog-${index}`} className="text-sm text-gray-800 dark:text-gray-200">
                    {parseInlineFormatting(item)}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-gray-600 dark:text-gray-400 italic">No progress items reported.</p>
            )}
          </div>

          {/* Blockers Column */}
          <div className="flex-1 p-3 rounded-lg border bg-red-100 dark:bg-red-900/30 border-red-500/50">
            <h3 className="text-lg font-semibold mb-3 text-red-700 dark:text-red-300">Blockers</h3>
            {(report.blockers && report.blockers.length > 0) ? (
              <ul className="space-y-1 list-disc pl-5">
                {report.blockers.map((item, index) => (
                  <li key={`block-${index}`} className="text-sm text-gray-800 dark:text-gray-200">
                    {parseInlineFormatting(item)}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-gray-600 dark:text-gray-400 italic">No blockers reported.</p>
            )}
          </div>

          {/* Next Steps Column */}
          <div className="flex-1 p-3 rounded-lg border bg-blue-100 dark:bg-blue-900/30 border-blue-500/50">
            <h3 className="text-lg font-semibold mb-3 text-blue-700 dark:text-blue-300">Next Steps</h3>
            {(report.nextSteps && report.nextSteps.length > 0) ? (
              <ul className="space-y-1 list-disc pl-5">
                {report.nextSteps.map((item, index) => (
                  <li key={`next-${index}`} className="text-sm text-gray-800 dark:text-gray-200">
                    {parseInlineFormatting(item)}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-gray-600 dark:text-gray-400 italic">No next steps defined.</p>
            )}
          </div>
        </div>
      );
    } else {
      // Mobile: Tabs-based layout
      return (
        <Tabs defaultValue="progress" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="progress" className="data-[state=active]:border-b-2 data-[state=active]:text-green-600 data-[state=active]:border-green-600 dark:data-[state=active]:text-green-400 dark:data-[state=active]:border-green-400">Progress</TabsTrigger>
            <TabsTrigger value="blockers" className="data-[state=active]:border-b-2 data-[state=active]:text-red-600 data-[state=active]:border-red-600 dark:data-[state=active]:text-red-400 dark:data-[state=active]:border-red-400">Blockers</TabsTrigger>
            <TabsTrigger value="nextSteps" className="data-[state=active]:border-b-2 data-[state=active]:text-blue-600 data-[state=active]:border-blue-600 dark:data-[state=active]:text-blue-400 dark:data-[state=active]:border-blue-400">Next Steps</TabsTrigger>
          </TabsList>

          <TabsContent value="progress" className="mt-4 p-3 rounded-lg border bg-green-50 dark:bg-green-900/20 border-green-500/30">
            {(report.progress && report.progress.length > 0) ? (
              <ul className="space-y-1 list-disc pl-4">
                {report.progress.map((item, index) => (
                  <li key={`prog-${index}`} className="text-sm text-gray-800 dark:text-gray-200">
                    {parseInlineFormatting(item)}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-gray-600 dark:text-gray-400 italic">No progress items reported.</p>
            )}
          </TabsContent>

          <TabsContent value="blockers" className="mt-4 p-3 rounded-lg border bg-red-50 dark:bg-red-900/20 border-red-500/30">
            {(report.blockers && report.blockers.length > 0) ? (
              <ul className="space-y-1 list-disc pl-4">
                {report.blockers.map((item, index) => (
                  <li key={`block-${index}`} className="text-sm text-gray-800 dark:text-gray-200">
                    {parseInlineFormatting(item)}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-gray-600 dark:text-gray-400 italic">No blockers reported.</p>
            )}
          </TabsContent>

          <TabsContent value="nextSteps" className="mt-4 p-3 rounded-lg border bg-blue-50 dark:bg-blue-900/20 border-blue-500/30">
            {(report.nextSteps && report.nextSteps.length > 0) ? (
              <ul className="space-y-1 list-disc pl-4">
                {report.nextSteps.map((item, index) => (
                  <li key={`next-${index}`} className="text-sm text-gray-800 dark:text-gray-200">
                    {parseInlineFormatting(item)}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-gray-600 dark:text-gray-400 italic">No next steps defined.</p>
            )}
          </TabsContent>
        </Tabs>
      );
    }
  }, [report, isMobile]);

  return (
    <Card className="w-full h-full min-h-[400px] md:min-h-[600px]">
      <CardContent className="p-2 md:p-4 h-full">
        <ScrollArea className="h-full pr-2 md:pr-4">
          <div className="min-h-full">
            {renderedContent}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
