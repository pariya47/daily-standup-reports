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

// Helper function to parse inline formatting (bold, italic, etc.)
// parseInlineFormatting remains the same as it's used by renderMarkdownLike

// New renderMarkdownLike function
function renderMarkdownLike(content: string | null | undefined): JSX.Element | null {
  if (!content || content.trim() === "") {
    return null; 
  }

  const lines = content.split('\n');
  const elements: JSX.Element[] = [];
  let currentListType: 'ul' | 'ol' | null = null;
  let listItems: JSX.Element[] = [];
  let keyCounter = 0; // For unique keys

  const flushList = () => {
    if (listItems.length > 0 && currentListType) {
      if (currentListType === 'ul') {
        elements.push(<ul key={`list-${keyCounter++}`} className="list-disc pl-5 space-y-1 mb-2">{listItems}</ul>);
      } else if (currentListType === 'ol') {
        elements.push(<ol key={`list-${keyCounter++}`} className="list-decimal pl-5 space-y-1 mb-2">{listItems}</ol>);
      }
      listItems = [];
    }
    currentListType = null;
  };

  lines.forEach((line) => {
    const trimmedLine = line.trim(); // Trim line first for accurate pattern matching

    if (trimmedLine.startsWith("# ")) {
      flushList();
      elements.push(<h1 key={`h1-${keyCounter++}`} className="text-xl font-bold mb-2 mt-3">{parseInlineFormatting(trimmedLine.substring(2))}</h1>);
    } else if (trimmedLine.startsWith("## ")) {
      flushList();
      elements.push(<h2 key={`h2-${keyCounter++}`} className="text-lg font-semibold mb-2 mt-2">{parseInlineFormatting(trimmedLine.substring(3))}</h2>);
    } else if (trimmedLine.startsWith("### ")) {
      flushList();
      elements.push(<h3 key={`h3-${keyCounter++}`} className="text-base font-medium mb-1 mt-1">{parseInlineFormatting(trimmedLine.substring(4))}</h3>);
    } else if (trimmedLine.startsWith("- ") || trimmedLine.startsWith("* ")) {
      if (currentListType !== 'ul') {
        flushList();
        currentListType = 'ul';
      }
      listItems.push(<li key={`item-${keyCounter++}`}>{parseInlineFormatting(trimmedLine.substring(2))}</li>);
    } else if (/^\d+\.\s/.test(trimmedLine)) {
       if (currentListType !== 'ol') {
         flushList();
         currentListType = 'ol';
       }
       listItems.push(<li key={`item-${keyCounter++}`}>{parseInlineFormatting(trimmedLine.replace(/^\d+\.\s/, ''))}</li>);
    } else {
      flushList();
      if (trimmedLine.length > 0) {
        elements.push(<p key={`para-${keyCounter++}`} className="mb-2 leading-relaxed">{parseInlineFormatting(trimmedLine)}</p>);
      } else if (lines.length > 1 && elements.length > 0 && !(elements[elements.length - 1].type === 'div' && elements[elements.length - 1].props.className === 'h-2')) {
        // Add a smaller break for empty lines between content, but not multiple consecutive breaks.
        elements.push(<div key={`break-${keyCounter++}`} className="h-2" />);
      }
    }
  });

  flushList(); 

  if (elements.length === 0) return null;
  // Note: prose-sm sets font size, dark:prose-invert handles dark mode. max-w-none removes max width constraint.
  return <div className="prose prose-sm dark:prose-invert max-w-none">{elements}</div>;
}

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
              const progressRendered = renderMarkdownLike(report.progress);
              return progressRendered ? progressRendered : <p className="text-sm text-gray-600 dark:text-gray-400 italic">No progress items reported.</p>;
            })()}
          </TabsContent>

          <TabsContent value="blockers" className="mt-4 p-3 rounded-lg border bg-red-50 dark:bg-red-900/20 border-red-500/30">
            {(() => {
              const blockersRendered = renderMarkdownLike(report.blockers);
              return blockersRendered ? blockersRendered : <p className="text-sm text-gray-600 dark:text-gray-400 italic">No blockers reported.</p>;
            })()}
          </TabsContent>

          <TabsContent value="nextSteps" className="mt-4 p-3 rounded-lg border bg-blue-50 dark:bg-blue-900/20 border-blue-500/30">
            {(() => {
              const nextStepsRendered = renderMarkdownLike(report.nextSteps);
              return nextStepsRendered ? nextStepsRendered : <p className="text-sm text-gray-600 dark:text-gray-400 italic">No next steps defined.</p>;
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
              const progressRendered = renderMarkdownLike(report.progress);
              return progressRendered ? progressRendered : <p className="text-sm text-gray-600 dark:text-gray-400 italic">No progress items reported.</p>;
            })()}
          </div>

          {/* Blockers Column */}
          <div className="flex-1 p-3 rounded-lg border bg-red-100 dark:bg-red-900/30 border-red-500/50">
            <h3 className="text-lg font-semibold mb-3 text-red-700 dark:text-red-300 lg:text-3xl"><Frown className="h-3 w-3 lg:h-6 lg:w-6 mr-1 sm:mr-2 inline" />Blockers</h3>
            {(() => {
              const blockersRendered = renderMarkdownLike(report.blockers);
              return blockersRendered ? blockersRendered : <p className="text-sm text-gray-600 dark:text-gray-400 italic">No blockers reported.</p>;
            })()}
          </div>

          {/* Next Steps Column */}
          <div className="flex-1 p-3 rounded-lg border bg-blue-100 dark:bg-blue-900/30 border-blue-500/50">
            <h3 className="text-lg font-semibold mb-3 text-blue-700 dark:text-blue-300 lg:text-3xl"><Navigation className="h-3 w-3 lg:h-6 lg:w-6 mr-1 sm:mr-2 inline" />Next Steps</h3>
            {(() => {
              const nextStepsRendered = renderMarkdownLike(report.nextSteps);
              return nextStepsRendered ? nextStepsRendered : <p className="text-sm text-gray-600 dark:text-gray-400 italic">No next steps defined.</p>;
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
