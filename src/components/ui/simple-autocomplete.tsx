"use client";

import * as React from "react";
import { Check, ChevronsUpDown } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input"; // Using Input for the text field
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

interface SimpleAutocompleteProps {
  options: AutocompleteOption[];
  value: string;
  onChange: (value: string, option?: AutocompleteOption) => void;
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
  placeholder = "Select item...",
  searchPlaceholder = "Search...",
  emptyText = "No results found.",
  className,
  disabled,
}: SimpleAutocompleteProps) {
  const [open, setOpen] = React.useState(false);
  const [inputValue, setInputValue] = React.useState(value || ""); // State for the text input
  const inputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    setInputValue(value || "");
  }, [value]);

  const filteredOptions = React.useMemo(() => {
    if (!inputValue) return options;
    const search = inputValue.toLowerCase();
    return options.filter(
      (option) =>
        option.label.toLowerCase().includes(search) ||
        option.category?.toLowerCase().includes(search)
    );
  }, [options, inputValue]);

  const handleSelect = (option: AutocompleteOption) => {
    setInputValue(option.label);
    onChange(option.value, option);
    setOpen(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    onChange(newValue); // Update parent state with current input value
    setOpen(true); // Open dropdown when typing
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && inputValue && filteredOptions.length === 0) {
      // Allow custom value on Enter if no options match
      onChange(inputValue);
      setOpen(false);
      inputRef.current?.blur(); // Close keyboard on mobile
    }
  };



  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Input
          ref={inputRef}
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleInputKeyDown}
          placeholder={placeholder}
          className={cn(
            "w-full justify-between bg-gray-900/50 border-2 border-gray-700 text-gray-100",
            "hover:bg-gray-800 hover:border-gray-600",
            !value && "text-gray-500",
            className
          )}
          disabled={disabled}
        />
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0 bg-gray-900 border-gray-700">
        <div className="max-h-[300px] overflow-auto">
          {filteredOptions.length === 0 && inputValue ? (
            <div className="text-gray-500 py-6 text-center">
              <p>{emptyText}</p>
              <p className="mt-2 text-sm">
                Press Enter to add "{inputValue}"
              </p>
            </div>
          ) : filteredOptions.length === 0 && !inputValue ? (
            <div className="text-gray-500 py-6 text-center">
              <p>{emptyText}</p>
            </div>
          ) : (
            filteredOptions.map((option) => (
              <div
                key={option.value}
                onClick={() => handleSelect(option)}
                className="flex items-center p-2 cursor-pointer text-gray-100 hover:bg-gray-800"
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
            ))
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
