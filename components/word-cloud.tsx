"use client"

import { useEffect, useRef, useState } from "react"
import { processText } from "@/lib/text-processor"
import { Card, CardContent } from "@/components/ui/card"
import type { Report } from "@/lib/types"

const stripMarkdown = (text: string | null | undefined): string => {
  if (!text) return "";
  return text
    .replace(/\*\*(.*?)\*\*/g, '$1') 
    .replace(/\*(.*?)\*/g, '$1')   
    .replace(/---/g, '')          
    .trim();
};

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
    console.log("[WordCloud Debug] Report received:", report);
    if (report) {
      console.log("[WordCloud Debug] report.progress:", report.progress);
      console.log("[WordCloud Debug] report.blockers:", report.blockers);
      console.log("[WordCloud Debug] report.nextSteps:", report.nextSteps);
    }

    if (!report) {
      const noReportWords = [{ text: "No report selected", value: 1 }];
      console.log("[WordCloud Debug] Final words state to be set:", noReportWords);
      console.log("[WordCloud Debug] Setting loading to false.");
      setWords(noReportWords);
      setLoading(false);
      return;
    }

    const cleanedProgress = stripMarkdown(report.progress);
    const cleanedBlockers = stripMarkdown(report.blockers);
    const cleanedNextSteps = stripMarkdown(report.nextSteps);

    const textSources = [
      cleanedProgress,
      cleanedBlockers,
      cleanedNextSteps
    ];
    const nonEmptySources = textSources.filter(s => s && s.trim() !== "");
    const combinedText = nonEmptySources.join(" ").replace(/\s+/g, ' ').trim();
    console.log("[WordCloud Debug] combinedText for processText:", combinedText);

    if (!combinedText) {
      const noCombinedTextWords = [{ text: "No significant words to display", value: 1 }];
      console.log("[WordCloud Debug] Final words state to be set:", noCombinedTextWords);
      console.log("[WordCloud Debug] Setting loading to false.");
      setWords(noCombinedTextWords);
      setLoading(false);
      return;
    }

    setLoading(true);
    let wordsVariable: Array<{ text: string; value: number }>;
    try {
      const processedWords = processText(combinedText, stopWordFilter);
      console.log("[WordCloud Debug] processedWords from processText:", processedWords);
      if (processedWords.length === 0) {
        wordsVariable = [{ text: "No significant words found", value: 1 }];
      } else {
        wordsVariable = processedWords;
      }
    } catch (error) {
      console.error("[WordCloud Debug] Error processing text in WordCloud:", error);
      wordsVariable = [{ text: "Error processing text", value: 1 }];
      console.log("[WordCloud Debug] Final words state to be set:", wordsVariable);
      console.log("[WordCloud Debug] Setting loading to false.");
      setWords(wordsVariable);
      setLoading(false);
      return; // Explicitly return after handling error
    }
    console.log("[WordCloud Debug] Final words state to be set:", wordsVariable);
    console.log("[WordCloud Debug] Setting loading to false.");
    setWords(wordsVariable);
    setLoading(false);
  }, [report?.id, report?.progress, report?.blockers, report?.nextSteps, stopWordFilter]);

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
    if (!report) {
      setOriginalWords({});
      return;
    }

    const cleanedProgress = stripMarkdown(report.progress);
    const cleanedBlockers = stripMarkdown(report.blockers);
    const cleanedNextSteps = stripMarkdown(report.nextSteps);

    const textSources = [
      cleanedProgress,
      cleanedBlockers,
      cleanedNextSteps
    ];
    const nonEmptySources = textSources.filter(s => s && s.trim() !== "");
    const combinedText = nonEmptySources.join(" ").replace(/\s+/g, ' ').trim();
    
    if (!combinedText) {
      setOriginalWords({});
      return;
    }

    const wordMap: Record<string, string> = {};
    const wordRegex = /[\w\u0E00-\u0E7F]+-?[\w\u0E00-\u0E7F]+|[\w\u0E00-\u0E7F]+/g; // Keep the existing regex
    const matches = combinedText.match(wordRegex) || [];

    matches.forEach((word) => {
      const normalized = word.toLowerCase();
      const withoutSpecialChars = normalized.replace(/[^a-z0-9\u0E00-\u0E7F]/g, "");
      wordMap[normalized] = word;
      if (withoutSpecialChars !== normalized) { 
         wordMap[withoutSpecialChars] = word;
      }
    });

    setOriginalWords(wordMap);
  }, [report?.id, report?.progress, report?.blockers, report?.nextSteps]);

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
