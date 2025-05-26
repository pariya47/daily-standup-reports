"use client"

import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"

interface NavigationButtonsProps {
  onPrevious: () => void
  onNext: () => void
  hasPrevious: boolean
  hasNext: boolean
}

export function NavigationButtons({ onPrevious, onNext, hasPrevious, hasNext }: NavigationButtonsProps) {
  return (
    <div className="flex gap-1 md:gap-2">
      <Button variant="outline" size="sm" onClick={onPrevious} disabled={!hasPrevious} className="h-8 w-8 p-0">
        <ChevronLeft className="h-3 w-3 md:h-4 md:w-4" />
        <span className="sr-only">Previous report</span>
      </Button>
      <Button variant="outline" size="sm" onClick={onNext} disabled={!hasNext} className="h-8 w-8 p-0">
        <ChevronRight className="h-3 w-3 md:h-4 md:w-4" />
        <span className="sr-only">Next report</span>
      </Button>
    </div>
  )
}
