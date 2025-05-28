"use client"

import { useMemo } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import type { Report } from "@/lib/types";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import type { JSX } from "react/jsx-runtime";
import { Navigation ,Frown,Blocks} from "lucide-react"

interface FullReportProps {
  report: Report | null;
}

const processMultilineText = (text: string | null | undefined): string[] => {
  if (!text || text.trim() === "") {
    return [];
  }
  return text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
};

// Helper function to parse inline formatting (bold, italic, etc.)
function parseInlineFormatting(text: string): (string | JSX.Element)[] {
  const parts: (string | JSX.Element)[] = [];
  let currentIndex = 0;

  // Handle bold text (**text**)
  const boldRegex = /\*\*(.*?)\*\*/g;
  let match;
  let lastIndex = 0;

  while ((match = boldRegex.exec(text)) !== null) {
    // Add text before the bold part
    if (match.index > lastIndex) {
      parts.push(text.substring(lastIndex, match.index));
    }

    // Add the bold part
    parts.push(
      <strong key={`bold-${currentIndex++}`} className="font-bold">
        {match[1]}
      </strong>,
    );

    lastIndex = match.index + match[0].length;
  }

  // Add remaining text
  if (lastIndex < text.length) {
    parts.push(text.substring(lastIndex));
  }

  // If no formatting was found, return the original text
  if (parts.length === 0) {
    parts.push(text);
  }

  return parts;
}

export function FullReport({ report }: FullReportProps) {
  const isMobile = useIsMobile();

  const renderedContent = useMemo(() => {
    if (!report) {
      return <div className="p-4 text-sm md:text-base italic">No report data available.</div>;
    }

    if (isMobile) {
      // Mobile Tabs Layout
      return (
        <Tabs defaultValue="progress" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="progress" className="data-[state=active]:border-b-2 data-[state=active]:text-green-600 data-[state=active]:border-green-600 dark:data-[state=active]:text-green-400 dark:data-[state=active]:border-green-400"><Blocks className="h-3 w-3 lg:h-4 lg:w-4 mr-1 sm:mr-2" />Progress</TabsTrigger>
            <TabsTrigger value="blockers" className="data-[state=active]:border-b-2 data-[state=active]:text-red-600 data-[state=active]:border-red-600 dark:data-[state=active]:text-red-400 dark:data-[state=active]:border-red-400"><Frown className="h-3 w-3 lg:h-4 lg:w-4 mr-1 sm:mr-2" />Blockers</TabsTrigger>
            <TabsTrigger value="nextSteps" className="data-[state=active]:border-b-2 data-[state=active]:text-blue-600 data-[state=active]:border-blue-600 dark:data-[state=active]:text-blue-400 dark:data-[state=active]:border-blue-400"><Navigation className="h-3 w-3 lg:h-4 lg:w-4 mr-1 " /> Next Steps</TabsTrigger>
          </TabsList>

          <TabsContent value="progress" className="mt-4 p-3 rounded-lg border bg-green-50 dark:bg-green-900/20 border-green-500/30">
            {(() => {
              const progressItems = processMultilineText(report.progress);
              return progressItems.length > 0 ? (
                <ul className="space-y-1 list-disc pl-4">
                  {progressItems.map((item, index) => (
                    <li key={`prog-${index}`} className="text-sm text-gray-800 dark:text-gray-200">
                      {parseInlineFormatting(item)}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-gray-600 dark:text-gray-400 italic">No progress items reported.</p>
              );
            })()}
          </TabsContent>

          <TabsContent value="blockers" className="mt-4 p-3 rounded-lg border bg-red-50 dark:bg-red-900/20 border-red-500/30">
            {(() => {
              const blockersItems = processMultilineText(report.blockers);
              return blockersItems.length > 0 ? (
                <ul className="space-y-1 list-disc pl-4">
                  {blockersItems.map((item, index) => (
                    <li key={`block-${index}`} className="text-sm text-gray-800 dark:text-gray-200">
                      {parseInlineFormatting(item)}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-gray-600 dark:text-gray-400 italic">No blockers reported.</p>
              );
            })()}
          </TabsContent>

          <TabsContent value="nextSteps" className="mt-4 p-3 rounded-lg border bg-blue-50 dark:bg-blue-900/20 border-blue-500/30">
            {(() => {
              const nextStepsItems = processMultilineText(report.nextSteps);
              return nextStepsItems.length > 0 ? (
                <ul className="space-y-1 list-disc pl-4">
                  {nextStepsItems.map((item, index) => (
                    <li key={`next-${index}`} className="text-sm text-gray-800 dark:text-gray-200">
                      {parseInlineFormatting(item)}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-gray-600 dark:text-gray-400 italic">No next steps defined.</p>
              );
            })()}
          </TabsContent>
        </Tabs>
      );
    } else {
      // Desktop Column Layout
      return (
        <div className="flex flex-col md:flex-row md:space-x-4 space-y-4 md:space-y-0">
          {/* Progress Column */}
          <div className="flex-1 p-3 rounded-lg border bg-green-100 dark:bg-green-900/30 border-green-500/50">
            <h3 className="text-lg font-semibold mb-3 text-green-700 dark:text-green-300 lg:text-3xl"><Blocks className="h- w-3 lg:h-6 lg:w-6 mr-1 sm:mr-2 inline" />Progress</h3>
            {(() => {
              const progressItems = processMultilineText(report.progress);
              return progressItems.length > 0 ? (
                <ul className="space-y-1 list-disc pl-5">
                  {progressItems.map((item, index) => (
                    <li key={`prog-${index}`} className="text-sm text-gray-800 dark:text-gray-200 lg:text-lg">
                      {parseInlineFormatting(item)}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-gray-600 dark:text-gray-400 italic">No progress items reported.</p>
              );
            })()}
          </div>

          {/* Blockers Column */}
          <div className="flex-1 p-3 rounded-lg border bg-red-100 dark:bg-red-900/30 border-red-500/50">
            <h3 className="text-lg font-semibold mb-3 text-red-700 dark:text-red-300 lg:text-3xl"><Frown className="h-3 w-3 lg:h-6 lg:w-6 mr-1 sm:mr-2 inline" />Blockers</h3>
            {(() => {
              const blockersItems = processMultilineText(report.blockers);
              return blockersItems.length > 0 ? (
                <ul className="space-y-1 list-disc pl-5">
                  {blockersItems.map((item, index) => (
                    <li key={`block-${index}`} className="text-sm text-gray-800 dark:text-gray-200 lg:text-lg">
                      {parseInlineFormatting(item)}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-gray-600 dark:text-gray-400 italic">No blockers reported.</p>
              );
            })()}
          </div>

          {/* Next Steps Column */}
          <div className="flex-1 p-3 rounded-lg border bg-blue-100 dark:bg-blue-900/30 border-blue-500/50">
            <h3 className="text-lg font-semibold mb-3 text-blue-700 dark:text-blue-300 lg:text-3xl"><Navigation className="h-3 w-3 lg:h-6 lg:w-6 mr-1 sm:mr-2 inline" />Next Steps</h3>
            {(() => {
              const nextStepsItems = processMultilineText(report.nextSteps);
              return nextStepsItems.length > 0 ? (
                <ul className="space-y-1 list-disc pl-5">
                  {nextStepsItems.map((item, index) => (
                    <li key={`next-${index}`} className="text-sm text-gray-800 dark:text-gray-200 lg:text-lg">
                      {parseInlineFormatting(item)}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-gray-600 dark:text-gray-400 italic">No next steps defined.</p>
              );
            })()}
          </div>
        </div>
      );
    }
  }, [report, isMobile]);

  return (
    <Card className="w-full h-full min-h-[400px] md:min-h-[600px]">
      <CardContent className="p-2 md:p-4 h-full">
        <ScrollArea className="h-full pr-2 md:pr-4">
          {/* Content will go here, determined by useMemo */}
          {renderedContent}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
