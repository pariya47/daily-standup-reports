"use client"

import { useMemo } from "react"
import type { Report } from "@/lib/types"
import { Card, CardContent } from "@/components/ui/card"
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
  const renderedContent = useMemo(() => {
    if (!report?.content) return null
    return renderMarkdownLike(report.content)
  }, [report?.content])

  return (
    <Card className="w-full h-full min-h-[400px] md:min-h-[600px]">
      <CardContent className="p-2 md:p-4 h-full">
        <ScrollArea className="h-full pr-2 md:pr-4">
          <div className="min-h-full">
            {renderedContent || (
              <div className="whitespace-pre-wrap text-sm md:text-base leading-relaxed">
                {report?.content || "No content available"}
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
