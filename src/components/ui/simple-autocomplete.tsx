"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Check, ChevronsUpDown, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";

export interface AutocompleteOption {
  value: string;
  label: string;
  category?: string;
  metadata?: any;
}

interface SimpleAutocompleteProps {
  options: AutocompleteOption[];
  value?: string;
  onChange?: (value: string, option?: AutocompleteOption) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyText?: string;
  className?: string;
  disabled?: boolean;
}

export function SimpleAutocomplete({
  options,
  value,
  onChange,
  placeholder = "Select...",
  searchPlaceholder = "Search...",
  emptyText = "No results found.",
  className,
  disabled,
}: SimpleAutocompleteProps) {
  const [open, setOpen] = React.useState(false);
  const [searchValue, setSearchValue] = React.useState("");

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

  const handleSelect = (option: AutocompleteOption) => {
    onChange?.(option.value, option);
    setOpen(false);
    setSearchValue("");
  };

  const handleCustomValue = () => {
    if (searchValue && filteredOptions.length === 0) {
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
        <div className="flex items-center border-b border-gray-700 p-2">
          <Input
            placeholder={searchPlaceholder}
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleCustomValue();
              }
            }}
            className="h-8 border-0 bg-transparent focus:ring-0"
          />
          {searchValue && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSearchValue("")}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
        <div className="max-h-[300px] overflow-auto p-1">
          {filteredOptions.length === 0 && searchValue && (
            <div className="py-6 text-center text-sm text-gray-500">
              <p>{emptyText}</p>
              <p className="mt-2">Press Enter to add "{searchValue}"</p>
            </div>
          )}
          {filteredOptions.map((option) => (
            <div
              key={option.value}
              className={cn(
                "relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none",
                "text-gray-100 hover:bg-gray-800",
                value === option.value && "bg-gray-800"
              )}
              onClick={() => handleSelect(option)}
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
            </div>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}
