"use client"

import * as React from "react"
import { CheckIcon, ChevronsUpDownIcon, Loader2 } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { useCountries } from "@/lib/hooks"

interface CountrySelectorProps {
  value?: string
  onValueChange?: (value: string) => void
  placeholder?: string
  className?: string
}

export function CountrySelector({ 
  value, 
  onValueChange, 
  placeholder = "Select country...",
  className 
}: CountrySelectorProps) {
  const [open, setOpen] = React.useState(false)
  const { data: countries, isLoading, error } = useCountries()

  const selectedCountry = countries?.find((country) => country.name.common === value)

  const handleSelect = (currentValue: string) => {
    const newValue = currentValue === value ? "" : currentValue
    onValueChange?.(newValue)
    setOpen(false)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("w-full justify-between", className)}
        >
          {selectedCountry ? (
            <div className="flex items-center gap-2">
              <img 
                src={selectedCountry.flags.svg} 
                alt={selectedCountry.flags.alt || `${selectedCountry.name.common} flag`}
                className="w-4 h-3 object-cover rounded-sm"
              />
              <span>{selectedCountry.name.common}</span>
            </div>
          ) : (
            placeholder
          )}
          <ChevronsUpDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" align="start">
        <Command>
          <CommandInput placeholder="Search country..." />
          <CommandList>
            {isLoading && (
              <div className="flex items-center justify-center py-6">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="ml-2 text-sm text-muted-foreground">Loading countries...</span>
              </div>
            )}
            {error && (
              <div className="py-6 text-center text-sm text-red-500">
                Failed to load countries. Please try again.
              </div>
            )}
            {countries && countries.length === 0 && (
              <CommandEmpty>No countries found.</CommandEmpty>
            )}
            {countries && countries.length > 0 && (
              <>
                <CommandEmpty>No country found.</CommandEmpty>
                <CommandGroup>
                  {countries.map((country) => (
                    <CommandItem
                      key={country.name.common}
                      value={country.name.common}
                      onSelect={handleSelect}
                      className="flex items-center gap-2"
                    >
                      <img 
                        src={country.flags.svg} 
                        alt={country.flags.alt || `${country.name.common} flag`}
                        className="w-4 h-3 object-cover rounded-sm"
                      />
                      <span>{country.name.common}</span>
                      <CheckIcon
                        className={cn(
                          "ml-auto h-4 w-4",
                          value === country.name.common ? "opacity-100" : "opacity-0"
                        )}
                      />
                    </CommandItem>
                  ))}
                </CommandGroup>
              </>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}