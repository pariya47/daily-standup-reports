import { useMemo } from "react"; // Added useMemo import
import type { Report } from "@/lib/types"
import { findSentencesWithWord } from "@/lib/text-processor"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"

interface ReferencesDrawerProps {
  isOpen: boolean
  onClose: () => void
  word: string | null
  report: Report | null
}

const stripMarkdown = (text: string | null | undefined): string => {
  if (!text) return "";
  return text
    .replace(/\*\*(.*?)\*\*/g, '$1') // Replace **bold** with content
    .replace(/\*(.*?)\*/g, '$1')   // Replace *italic* with content
    .replace(/---/g, '')          // Remove --- rule lines
    .trim();
};

export function ReferencesDrawer({ isOpen, onClose, word, report }: ReferencesDrawerProps) {
  const searchableText = useMemo(() => {
    if (!report) return "";
    const sources = [
      report.progress,
      report.blockers,
      report.nextSteps
    ];
    // Join with newlines to preserve some separation for sentence finding,
    // but markdown stripping will clean it up further.
    return sources.map(s => s || "").join("\n\n"); 
  }, [report]);

  const cleanedSearchableText = useMemo(() => stripMarkdown(searchableText), [searchableText]);

  const sentences = word && report ? findSentencesWithWord(cleanedSearchableText, word) : []

  // Function to highlight word variations in text
  const highlightWord = (sentence: string, word: string) => {
    if (!word) return sentence

    // Create variations of the word to highlight
    const wordVariations = [
      word,
      word.toLowerCase(),
      word.toUpperCase(),
      word.replace(/[^a-zA-Z0-9\u0E00-\u0E7F]/g, ""),
      word.replace(/[^a-zA-Z0-9\u0E00-\u0E7F]/g, "-"),
      word.replace(/-/g, ""),
    ].filter(Boolean) // Remove empty strings

    // Create a regex pattern that matches any of the variations
    const pattern = wordVariations
      .map((v) => v.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&")) // Escape special regex chars
      .join("|")

    // Split by the pattern and wrap matches in highlight spans
    const parts = sentence.split(new RegExp(`(${pattern})`, "gi"))

    return parts.map((part, i) => {
      // Check if this part matches any of our variations (case insensitive)
      const isMatch = wordVariations.some(
        (v) =>
          part.toLowerCase() === v.toLowerCase() ||
          part.toLowerCase().replace(/[-]/g, "") === v.toLowerCase().replace(/[-]/g, ""),
      )

      return isMatch ? (
        <span key={i} className="bg-primary/20 text-primary font-semibold px-1 rounded">
          {part}
        </span>
      ) : (
        <span key={i}>{part}</span>
      )
    })
  }

  return (
    <Drawer open={isOpen} onOpenChange={onClose}>
      <DrawerContent className="bg-background/95 backdrop-blur-sm max-h-[80vh]">
        <div className="mx-auto w-full max-w-4xl">
          <DrawerHeader className="px-4 md:px-6">
            <DrawerTitle className="text-lg md:text-xl">References for "{word}"</DrawerTitle>
            <DrawerDescription className="text-sm md:text-base">
              Sentences where this word appears in the report
            </DrawerDescription>
          </DrawerHeader>
          <ScrollArea className="h-[40vh] md:h-[50vh] px-4 md:px-6">
            {sentences.length > 0 ? (
              <ul className="space-y-3 md:space-y-4 pb-4">
                {sentences.map((sentence, index) => (
                  <li key={index} className="p-3 rounded-md bg-muted/30 text-sm md:text-base leading-relaxed">
                    {highlightWord(sentence, word || "")}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-center text-muted-foreground py-8 text-sm md:text-base">
                No sentences found containing this word
              </p>
            )}
          </ScrollArea>
          <DrawerFooter className="px-4 md:px-6">
            <DrawerClose asChild>
              <Button variant="outline" className="text-sm md:text-base">
                Close [ESC]
              </Button>
            </DrawerClose>
          </DrawerFooter>
        </div>
      </DrawerContent>
    </Drawer>
  )
}
