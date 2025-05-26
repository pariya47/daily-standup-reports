"use client"

import * as React from "react"
import { Check, ChevronsUpDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Badge } from "@/components/ui/badge"

interface TeamSelectorProps {
  availableTeams: string[]
  selectedTeams: string[]
  onTeamsChange: (teams: string[]) => void
}

export function TeamSelector({ availableTeams, selectedTeams, onTeamsChange }: TeamSelectorProps) {
  const [open, setOpen] = React.useState(false)

  const toggleTeam = (team: string) => {
    if (selectedTeams.includes(team)) {
      onTeamsChange(selectedTeams.filter((t) => t !== team))
    } else {
      onTeamsChange([...selectedTeams, team])
    }
  }

  const removeTeam = (team: string) => {
    onTeamsChange(selectedTeams.filter((t) => t !== team))
  }

  return (
    <div className="flex flex-col gap-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" role="combobox" aria-expanded={open} className="w-[200px] justify-between">
            {selectedTeams.length > 0
              ? `${selectedTeams.length} team${selectedTeams.length > 1 ? "s" : ""} selected`
              : "Select teams"}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[200px] p-0">
          <Command>
            <CommandInput placeholder="Search teams..." />
            <CommandList>
              <CommandEmpty>No team found.</CommandEmpty>
              <CommandGroup>
                {availableTeams.map((team) => (
                  <CommandItem key={team} value={team} onSelect={() => toggleTeam(team)}>
                    <Check className={cn("mr-2 h-4 w-4", selectedTeams.includes(team) ? "opacity-100" : "opacity-0")} />
                    {team}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      {selectedTeams.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-1">
          {selectedTeams.map((team) => (
            <Badge key={team} variant="secondary" className="text-xs">
              {team}
              <button className="ml-1 rounded-full hover:bg-muted" onClick={() => removeTeam(team)}>
                ×
              </button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  )
}
