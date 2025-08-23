# Autocomplete Implementation for Medications & Supplements

## Overview

We've implemented an intelligent autocomplete system for the medication and supplement inputs in the assessment intake form. This feature enhances user experience by:

1. **Suggesting common medications and supplements** from a curated database
2. **Auto-filling dosages** when available
3. **Allowing custom entries** for items not in the database
4. **Categorizing items** for better organization

## Components

### 1. Autocomplete Component (`src/components/ui/autocomplete.tsx`)
- Built on top of shadcn/ui Command component
- Provides searchable dropdown with categories
- Supports keyboard navigation
- Dark theme optimized

### 2. Supporting UI Components
- **Command** (`src/components/ui/command.tsx`) - Core search functionality
- **Popover** (`src/components/ui/popover.tsx`) - Dropdown container
- **Dialog** (`src/components/ui/dialog.tsx`) - Modal support

### 3. Data Sources (`lib/data/medications-supplements.ts`)
- **Common Medications**: 50+ medications across categories:
  - Cardiovascular
  - Diabetes
  - Mental Health
  - Pain Management
  - Gastrointestinal
  - Respiratory
  - And more...

- **Common Supplements**: 40+ supplements across categories:
  - Vitamins
  - Minerals
  - Herbs
  - Amino Acids
  - Probiotics
  - Specialty supplements

## Features

### Smart Auto-fill
When a user selects a medication or supplement from the dropdown:
- The name is populated
- If available, the first common dosage is auto-filled
- User can still modify the dosage as needed

### Custom Entries
Users can type any medication or supplement not in the database. The autocomplete accepts custom values, ensuring flexibility for less common items.

### Search Functionality
- Real-time filtering as users type
- Searches both item names and categories
- Case-insensitive matching

## Usage in Intake Form

```tsx
<Autocomplete
  options={medicationOptions}
  value={med.name}
  onChange={(value, option) => {
    updateMedication(index, "name", value);
    // Auto-fill dosage if available
    if (option?.metadata?.commonDosages?.length > 0) {
      updateMedication(index, "dosage", option.metadata.commonDosages[0]);
    }
  }}
  placeholder="Select or type medication..."
  searchPlaceholder="Search medications..."
  emptyText="Type to search or add custom medication"
/>
```

## Future Enhancements

1. **Fuzzy Search**: Implement fuzzy matching for typos
2. **Brand Names**: Add common brand names alongside generic names
3. **Frequency Templates**: Pre-fill common frequencies (e.g., "Once daily", "Twice daily")
4. **Drug Interactions**: Warn about potential interactions
5. **Supplement Stacks**: Suggest common supplement combinations
6. **Recent Items**: Show recently used medications/supplements first
7. **Dosage Calculator**: Help calculate dosages based on weight/age

## Dependencies

- `cmdk`: Command menu component library
- `@radix-ui/react-popover`: Accessible popover primitive
- `@radix-ui/react-dialog`: Accessible dialog primitive
