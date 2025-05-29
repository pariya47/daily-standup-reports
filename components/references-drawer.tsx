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
  const cleanedProgress = useMemo(() => stripMarkdown(report?.progress), [report?.progress]);
  const cleanedBlockers = useMemo(() => stripMarkdown(report?.blockers), [report?.blockers]);
  const cleanedNextSteps = useMemo(() => stripMarkdown(report?.nextSteps), [report?.nextSteps]);

  const sourcesToSearch = useMemo(() => {
    if (!report) return [];
    return [
      { text: cleanedProgress, source: 'Progress' },
      { text: cleanedBlockers, source: 'Blockers' },
      { text: cleanedNextSteps, source: 'Next Steps' }
    ].filter(s => s.text && s.text.trim() !== ''); // Only include sources with actual text
  }, [report, cleanedProgress, cleanedBlockers, cleanedNextSteps]);

  const sentencesFound = useMemo(() => {
    if (word && report && sourcesToSearch.length > 0) {
      return findSentencesWithWord(sourcesToSearch, word);
    }
    return [];
  }, [word, report, sourcesToSearch]);

  const getSourceBadgeClass = (source: string): string => {
    switch (source.toLowerCase()) {
      case 'progress':
        return 'bg-green-100 text-green-700 dark:bg-green-700/20 dark:text-green-300';
      case 'blockers':
        return 'bg-red-100 text-red-700 dark:bg-red-700/20 dark:text-red-300';
      case 'next steps':
        return 'bg-blue-100 text-blue-700 dark:bg-blue-700/20 dark:text-blue-300';
      default:
        return 'bg-gray-100 text-gray-700 dark:bg-gray-700/20 dark:text-gray-300';
    }
  };

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
            {sentencesFound.length > 0 ? (
              <ul className="space-y-3 md:space-y-4 pb-4">
                {sentencesFound.map((item, index) => (
                  <li key={index} className="p-3 rounded-md bg-muted/30 text-sm md:text-base leading-relaxed">
                    <div className="flex items-center mb-1">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${getSourceBadgeClass(item.source)}`}>
                        {item.source}
                      </span>
                    </div>
                    {highlightWord(item.sentence, word || "")}
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
