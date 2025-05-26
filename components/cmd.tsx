"use client"

import * as React from "react"
import { Calculator, Calendar, CreditCard, Settings, Smile, User } from "lucide-react"

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command"

export function CommandDialogDemo() {
  const [open, setOpen] = React.useState(false)

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "f" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((open) => !open)
      }
    }

    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [])

  return (
    <>
      <p className="text-xs md:text-sm text-muted-foreground hidden sm:block">
        Press{" "}
        <kbd className="pointer-events-none inline-flex h-4 md:h-5 select-none items-center gap-1 rounded border bg-muted px-1 md:px-1.5 font-mono text-[9px] md:text-[10px] font-medium text-muted-foreground opacity-100">
          <span className="text-xs">⌘</span>F for search
        </kbd>
      </p>
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Type a command or search..." className="text-sm md:text-base" />
        <CommandList>
          <CommandEmpty className="text-sm md:text-base">No results found.</CommandEmpty>
          <CommandGroup heading="Suggestions">
            <CommandItem className="text-sm md:text-base">
              <Calendar />
              <span>Calendar</span>
            </CommandItem>
            <CommandItem className="text-sm md:text-base">
              <Smile />
              <span>Search Emoji</span>
            </CommandItem>
            <CommandItem className="text-sm md:text-base">
              <Calculator />
              <span>Calculator</span>
            </CommandItem>
          </CommandGroup>
          <CommandSeparator />
          <CommandGroup heading="Settings">
            <CommandItem className="text-sm md:text-base">
              <User />
              <span>Profile</span>
              <CommandShortcut>⌘P</CommandShortcut>
            </CommandItem>
            <CommandItem className="text-sm md:text-base">
              <CreditCard />
              <span>Billing</span>
              <CommandShortcut>⌘B</CommandShortcut>
            </CommandItem>
            <CommandItem className="text-sm md:text-base">
              <Settings />
              <span>Settings</span>
              <CommandShortcut>⌘S</CommandShortcut>
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  )
}
