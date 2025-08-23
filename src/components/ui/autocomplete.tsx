"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Check, ChevronsUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export interface AutocompleteOption {
  value: string;
  label: string;
  category?: string;
  metadata?: any;
}

interface AutocompleteProps {
  options: AutocompleteOption[];
  value?: string;
  onChange?: (value: string, option?: AutocompleteOption) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyText?: string;
  className?: string;
  disabled?: boolean;
}

export function Autocomplete({
  options,
  value,
  onChange,
  placeholder = "Select...",
  searchPlaceholder = "Search...",
  emptyText = "No results found.",
  className,
  disabled,
}: AutocompleteProps) {
  const [open, setOpen] = React.useState(false);
  const [searchValue, setSearchValue] = React.useState("");
  const [inputValue, setInputValue] = React.useState(value || "");

  const filteredOptions = React.useMemo(() => {
    if (!searchValue) return options;
    
    const search = searchValue.toLowerCase();
    return options.filter(
      (option) =>
        option.label.toLowerCase().includes(search) ||
        option.category?.toLowerCase().includes(search)
    );
  }, [options, searchValue]);

  const selectedOption = options.find((option) => option.value === value);

  React.useEffect(() => {
    setInputValue(selectedOption?.label || value || "");
  }, [value, selectedOption]);

  const handleInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && searchValue && filteredOptions.length === 0) {
      // Allow custom value
      onChange?.(searchValue, undefined);
      setOpen(false);
      setSearchValue("");
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            "w-full justify-between bg-gray-900/50 border-gray-700 text-gray-100",
            "hover:bg-gray-800 hover:border-gray-600",
            !value && "text-gray-500",
            className
          )}
          disabled={disabled}
        >
          {selectedOption ? selectedOption.label : (value || placeholder)}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0 bg-gray-900 border-gray-700">
        <Command className="bg-gray-900">
          <CommandInput
            placeholder={searchPlaceholder}
            value={searchValue}
            onValueChange={setSearchValue}
            onKeyDown={handleInputKeyDown}
            className="border-gray-700"
          />
          <CommandEmpty className="text-gray-500 py-6 text-center">
            <div>
              <p>{emptyText}</p>
              {searchValue && (
                <p className="mt-2 text-sm">
                  Press Enter to add "{searchValue}"
                </p>
              )}
            </div>
          </CommandEmpty>
          <CommandGroup className="max-h-[300px] overflow-auto">
            {filteredOptions.map((option) => (
              <CommandItem
                key={option.value}
                value={option.value}
                onMouseDown={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onChange?.(option.value, option);
                  setOpen(false);
                  setSearchValue("");
                  setInputValue(option.label);
                }}
                onSelect={() => {
                  onChange?.(option.value, option);
                  setOpen(false);
                  setSearchValue("");
                  setInputValue(option.label);
                }}
                className="text-gray-100 hover:bg-gray-800 cursor-pointer"
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    value === option.value ? "opacity-100" : "opacity-0"
                  )}
                />
                <div className="flex-1">
                  <div className="font-medium">{option.label}</div>
                  {option.category && (
                    <div className="text-xs text-gray-500">{option.category}</div>
                  )}
                </div>
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
