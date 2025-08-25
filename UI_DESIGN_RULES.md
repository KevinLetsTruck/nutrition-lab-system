# UI Design Rules - Text Visibility Standards

## CRITICAL RULE: NO WHITE TEXT ON WHITE BACKGROUNDS

This document establishes mandatory design standards to prevent text visibility issues across the application.

## 1. Text Color Requirements

### Primary Text

- **Headings (h1-h6)**: Always use `text-gray-900` or `text-black`
- **Body text**: Always use `text-gray-900` or `text-gray-800`
- **Labels**: Always use `text-gray-900` with explicit class
- **Question text**: Always use `text-gray-900`

### Secondary Text

- **Descriptions**: Use `text-gray-600` or `text-gray-700`
- **Helper text**: Use `text-gray-600`
- **Placeholder text**: Use `text-gray-500`

### NEVER USE

- ❌ Default text color without explicit class
- ❌ `text-white` unless on dark backgrounds
- ❌ Relying on inherited text colors
- ❌ Assuming component library defaults are visible

## 2. Background Requirements

### Light Backgrounds

- **Page backgrounds**: Use `bg-gray-50` or `bg-white`
- **Card backgrounds**: Use `bg-white` with shadows
- **Input backgrounds**: Use `bg-white` or `bg-gray-50`

### Dark Backgrounds

- Only use dark backgrounds (`bg-gray-800`, `bg-gray-900`) with:
  - `text-white`
  - `text-gray-100`
  - `text-gray-200`

## 3. Component-Specific Rules

### Forms

```tsx
// ✅ CORRECT
<Label className="text-gray-900 font-medium">Label Text</Label>
<RadioGroupItem value="yes" />
<Label htmlFor="yes" className="text-gray-900 cursor-pointer">Yes</Label>

// ❌ WRONG
<Label>Label Text</Label>  // No explicit text color
<Label className="cursor-pointer">Yes</Label>  // Missing text color
```

### Buttons

```tsx
// ✅ CORRECT - Primary buttons
<Button className="bg-blue-500 text-white hover:bg-blue-600">Submit</Button>

// ✅ CORRECT - Secondary buttons
<Button variant="outline" className="text-gray-900 border-gray-300">Cancel</Button>

// ❌ WRONG
<Button>Submit</Button>  // Relying on defaults
```

### Cards

```tsx
// ✅ CORRECT
<Card className="bg-white shadow-lg border border-gray-200">
  <CardHeader className="bg-gray-50 border-b">
    <CardTitle className="text-gray-900">Title</CardTitle>
  </CardHeader>
  <CardContent>
    <p className="text-gray-900">Content</p>
  </CardContent>
</Card>

// ❌ WRONG
<Card>
  <CardTitle>Title</CardTitle>  // No explicit text color
</Card>
```

## 4. Testing Checklist

Before committing any UI changes, verify:

- [ ] All text has explicit color classes
- [ ] Text is visible against its background
- [ ] Labels for form elements have `text-gray-900`
- [ ] No white text on white backgrounds
- [ ] No reliance on default/inherited colors
- [ ] Tested in both light and dark browser themes

## 5. Common Patterns

### Question Display

```tsx
<h2 className="text-xl font-medium text-gray-900">{question.text}</h2>
```

### Form Labels

```tsx
<Label htmlFor="id" className="text-gray-900 font-medium cursor-pointer">
  Label Text
</Label>
```

### Descriptions

```tsx
<p className="text-gray-600 text-sm">Helper text here</p>
```

### Error Messages

```tsx
<div className="text-red-800 bg-red-50 p-3 rounded">Error message</div>
```

### Success Messages

```tsx
<div className="text-green-800 bg-green-50 p-3 rounded">Success message</div>
```

## 6. Enforcement

- **Code Reviews**: Reject any PR that doesn't follow these rules
- **Component Library**: Create wrapper components that enforce these standards
- **Linting**: Add ESLint rules to catch missing text color classes
- **Testing**: Include visual regression tests

## 7. Quick Reference

| Element       | Class                               | Never Use                 |
| ------------- | ----------------------------------- | ------------------------- |
| Main headings | `text-gray-900`                     | No class                  |
| Body text     | `text-gray-900`                     | Default color             |
| Labels        | `text-gray-900 font-medium`         | No explicit color         |
| Descriptions  | `text-gray-600`                     | `text-gray-400`           |
| Links         | `text-blue-600 hover:text-blue-800` | Default blue              |
| Errors        | `text-red-800`                      | `text-red-500` on white   |
| Success       | `text-green-800`                    | `text-green-500` on white |

## Remember: ALWAYS SPECIFY TEXT COLOR EXPLICITLY!
