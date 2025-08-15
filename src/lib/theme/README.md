# Theme System Usage Guide

## Overview

The theme system provides a centralized way to manage colors across the application, ensuring consistency and making theme changes easier.

## Basic Usage

### Import the theme

```typescript
import { theme } from "@/lib/theme/colors";
```

### Using theme colors in components

#### Backgrounds

```tsx
// Primary background (darkest)
<div className={theme.bg.primary}>

// Secondary background
<div className={theme.bg.secondary}>

// Card background
<Card className={theme.bg.card}>

// Hover state
<button className={`${theme.bg.secondary} ${theme.bg.hover}`}>
```

#### Text Colors

```tsx
// Primary text (brightest)
<h1 className={theme.text.primary}>

// Secondary text
<p className={theme.text.secondary}>

// Muted text
<span className={theme.text.muted}>
```

#### Borders

```tsx
// Standard border
<div className={`border ${theme.border.primary}`}>

// Input with focus state
<input className={`border ${theme.border.primary} ${theme.border.focus}`}>
```

#### Status Messages

```tsx
// Success message
<div className={theme.status.success}>
  Operation completed successfully
</div>

// Error message
<div className={theme.status.error}>
  An error occurred
</div>
```

#### Form Elements

```tsx
// Input field
<input className={`${theme.input.base} ${theme.input.focus}`} />

// Primary button
<button className={theme.button.primary}>
  Save Changes
</button>

// Secondary button
<button className={theme.button.secondary}>
  Cancel
</button>
```

## Complete Component Example

```tsx
import { theme } from "@/lib/theme/colors";

export function ExampleCard() {
  return (
    <div
      className={`${theme.bg.card} ${theme.border.primary} border rounded-lg p-6`}
    >
      <h2 className={`${theme.text.primary} text-xl font-bold mb-2`}>
        Card Title
      </h2>
      <p className={`${theme.text.secondary} mb-4`}>
        This is a description using secondary text color.
      </p>

      <div className={`${theme.status.info} p-3 rounded mb-4`}>
        Info message with proper dark mode styling
      </div>

      <div className="flex gap-2">
        <button className={`${theme.button.primary} px-4 py-2 rounded`}>
          Primary Action
        </button>
        <button className={`${theme.button.secondary} px-4 py-2 rounded`}>
          Secondary Action
        </button>
      </div>
    </div>
  );
}
```

## Combining with Tailwind Classes

You can combine theme classes with regular Tailwind utilities:

```tsx
<div className={`${theme.bg.card} p-6 rounded-lg shadow-lg`}>
  <h3 className={`${theme.text.primary} text-lg font-semibold mb-2`}>
    Combined Styling
  </h3>
</div>
```

## Best Practices

1. **Always use theme colors** instead of hardcoding Tailwind color classes
2. **Combine multiple theme classes** when needed (e.g., base + hover states)
3. **Use status colors** for feedback messages and alerts
4. **Keep consistency** by using the appropriate color for each context

## Future Enhancement

The theme system is designed to support multiple themes. To add a light theme:

```typescript
// In colors.ts
export const lightTheme = {
  bg: {
    primary: "bg-white",
    secondary: "bg-gray-50",
    // ... etc
  },
};

// Switch themes based on user preference
export const theme = isDarkMode ? darkTheme : lightTheme;
```
