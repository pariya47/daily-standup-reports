"use client"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface StopWordFilterProps {
  value: "english" | "thai" | "any"
  onChange: (value: "english" | "thai" | "any") => void
}

export function StopWordFilter({ value, onChange }: StopWordFilterProps) {
  return (
    <div className="flex flex-col gap-2">
      <Select value={value} onValueChange={(val) => onChange(val as "english" | "thai" | "any")}>
        <SelectTrigger className="w-full sm:w-[180px] h-8 text-xs md:text-sm">
          <SelectValue placeholder="Filter language" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="english" className="text-xs md:text-sm">
            English words only
          </SelectItem>
          <SelectItem value="thai" className="text-xs md:text-sm">
            Thai words only
          </SelectItem>
          <SelectItem value="any" className="text-xs md:text-sm">
            All languages
          </SelectItem>
        </SelectContent>
      </Select>
    </div>
  )
}
