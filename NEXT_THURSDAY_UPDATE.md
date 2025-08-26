# Next Thursday Date Update

## Overview

Updated the scheduled page to display the next Thursday date instead of the current date, since Thursday is when the group coaching calls occur.

## Changes Made

### 1. Added `getNextThursday()` Function

```javascript
const getNextThursday = () => {
  const today = new Date();
  const currentDay = today.getDay();

  // Calculate days until next Thursday (4 = Thursday)
  // If today is Thursday, get next Thursday (7 days)
  let daysUntilThursday = (4 - currentDay + 7) % 7;
  if (daysUntilThursday === 0) {
    daysUntilThursday = 7; // If today is Thursday, get next Thursday
  }

  const nextThursday = new Date(today);
  nextThursday.setDate(today.getDate() + daysUntilThursday);

  return nextThursday.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};
```

### 2. Updated Calendar Display

- Replaced `getCurrentDate()` with `getNextThursday()` in the calendar display
- Added "Next Coaching Call" subtitle for clarity
- Updated styling to match the new design system:
  - Used `Card` component with green accent border
  - Larger calendar icon (w-8 h-8)
  - Green color for the calendar icon
  - Added subtitle in gray-400 color

### 3. Display Format

The calendar now shows:

- Small subtitle: "Next Coaching Call"
- Full date format: "Thursday, Month Day, Year"
- Example: "Thursday, August 28, 2025"

### 4. Preserved Footer Date

- Kept `getCurrentDate()` for the print footer
- This shows when the report was generated, not the coaching date

## Benefits

1. **Clear Communication**: Users immediately see when the next coaching call is scheduled
2. **Automatic Updates**: The date automatically updates to always show the next Thursday
3. **No Manual Updates**: No need to manually change the date each week
4. **Consistent Schedule**: Reinforces that coaching calls are always on Thursdays

## Logic Details

- If today is Sunday-Wednesday: Shows this week's Thursday
- If today is Thursday: Shows next week's Thursday
- If today is Friday-Saturday: Shows next week's Thursday

This ensures the date always represents the upcoming coaching call, never a past date.
