"use client"

import { useEffect, useRef, useState } from "react"
import { processText } from "@/lib/text-processor"
import { Card, CardContent } from "@/components/ui/card"
import type { Report } from "@/lib/types"

interface WordCloudProps {
  report: Report
  stopWordFilter: "english" | "thai" | "any"
  onWordClick: (word: string) => void
}

export function WordCloud({ report, stopWordFilter, onWordClick }: WordCloudProps) {
  const [words, setWords] = useState<Array<{ text: string; value: number }>>([])
  const [loading, setLoading] = useState(true)
  const containerRef = useRef<HTMLDivElement>(null)

  // Process text to generate word cloud data
  useEffect(() => {
    if (!report?.content) {
      setWords([])
      setLoading(false)
      return
    }

    setLoading(true)
    try {
      // Process the text to generate word cloud data
      const processedWords = processText(report.content, stopWordFilter)

      // Ensure we have at least some words to display
      if (processedWords.length === 0) {
        // Add a default word if no words were found
        setWords([{ text: "No significant words found", value: 1 }])
      } else {
        setWords(processedWords)
      }
    } catch (error) {
      console.error("Error processing text:", error)
      // Provide fallback data in case of error
      setWords([{ text: "Error processing text", value: 1 }])
    }
    setLoading(false)
  }, [report, stopWordFilter])

  // Get the maximum value for scaling
  const maxValue = words.length > 0 ? Math.max(...words.map((word) => word.value)) : 1

  // Function to determine word color based on value
  const getWordColor = (value: number) => {
    const ratio = value / maxValue
    if (ratio > 0.75) return "#ff6b6b" // Tier 1: Coral Red
    if (ratio > 0.5) return "#4ecdc4" // Tier 2: Teal
    if (ratio > 0.25) return "#45b7d1" // Tier 3: Sky Blue
    return "#ffffff" // Tier 4: White
  }

  // Function to determine font size based on value (responsive)
  const getFontSize = (value: number) => {
    const ratio = value / maxValue
    // Mobile-first responsive font sizes
    if (ratio > 0.75) return "text-2xl sm:text-3xl md:text-4xl lg:text-5xl" // Largest
    if (ratio > 0.5) return "text-xl sm:text-2xl md:text-3xl lg:text-4xl" // Large
    if (ratio > 0.25) return "text-lg sm:text-xl md:text-2xl lg:text-3xl" // Medium
    return "text-base sm:text-lg md:text-xl" // Small
  }

  // Store original form of words for reference lookup
  const [originalWords, setOriginalWords] = useState<Record<string, string>>({})

  // When processing text, store a mapping of normalized words to their original form
  useEffect(() => {
    if (!report?.content) return

    // Create a simple mapping of lowercase words to their original form
    const wordMap: Record<string, string> = {}

    // Extract words with regex that preserves special characters
    const wordRegex = /[\w\u0E00-\u0E7F]+-?[\w\u0E00-\u0E7F]+|[\w\u0E00-\u0E7F]+/g
    const matches = report.content.match(wordRegex) || []

    matches.forEach((word) => {
      // Store both the original word and versions without special chars
      const normalized = word.toLowerCase()
      const withoutSpecialChars = normalized.replace(/[^a-z0-9\u0E00-\u0E7F]/g, "")

      wordMap[normalized] = word
      wordMap[withoutSpecialChars] = word
    })

    setOriginalWords(wordMap)
  }, [report?.content])

  // Handle word click with original form if available
  const handleWordClick = (word: string) => {
    // Try to find the original form of the word
    const originalForm = originalWords[word.toLowerCase()] || word
    onWordClick(originalForm)
  }

  return (
    <Card className="w-full h-full min-h-[400px] md:min-h-[600px]">
      <CardContent className="p-2 md:p-4 h-full overflow-auto" ref={containerRef}>
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-muted-foreground text-sm md:text-base">Generating word cloud...</p>
          </div>
        ) : words.length > 0 ? (
          <div className="flex flex-wrap justify-center items-center gap-2 md:gap-4 p-2 md:p-4 h-full">
            {words.map((word, index) => (
              <div
                key={`${word.text}-${index}`}
                className={`${getFontSize(word.value)} font-semibold cursor-pointer transition-all duration-300 hover:scale-110 hover:shadow-glow active:scale-95 select-none`}
                style={{
                  color: getWordColor(word.value),
                  textShadow: "0 0 5px rgba(0,0,0,0.3)",
                  padding: "0.125rem 0.25rem",
                  lineHeight: "1.2",
                }}
                onClick={() => handleWordClick(word.text)}
              >
                {word.text}
              </div>
            ))}
          </div>
        ) : (
          <div className="flex items-center justify-center h-full">
            <p className="text-muted-foreground text-sm md:text-base text-center px-4">No words found to display</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
