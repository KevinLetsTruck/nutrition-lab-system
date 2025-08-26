# FNTP Dark Theme Design System

## 🎨 Color Palette

### Base Colors
- **Primary Background**: `bg-[#1a1f2e]` - Main page background
- **Secondary Background**: `bg-gray-800/50` - Cards and sections
- **Tertiary Background**: `bg-gray-900/50` - Nested elements
- **Border Color**: `border-gray-700` - All borders
- **Border Subtle**: `border-gray-800` - Subtle borders (headers)

### Text Colors
- **Primary Text**: `text-white` - Headers, important text
- **Secondary Text**: `text-gray-300` - Regular content
- **Tertiary Text**: `text-gray-400` - Descriptions, helper text
- **Muted Text**: `text-gray-500` - Less important info

### Interactive States
- **Hover Background**: `hover:bg-gray-700`
- **Hover Text**: `hover:text-white`
- **Active Background**: `bg-gray-700`
- **Focus Ring**: `focus:ring-purple-600`

### Brand Colors
- **Purple**: `text-purple-600`, `bg-purple-600`, `hover:bg-purple-700`
- **Green**: `text-green-400`, `bg-green-600`, `hover:bg-green-700`
- **Blue**: `text-blue-400`, `bg-blue-600`, `hover:bg-blue-700`
- **Red**: `text-red-400`, `bg-red-600`, `hover:bg-red-700`
- **Orange**: `text-orange-400`, `bg-orange-600`, `hover:bg-orange-700`
- **Yellow**: `text-yellow-400`, `bg-yellow-600`, `hover:bg-yellow-700`

## 🧩 Component Patterns

### Page Container
```tsx
<div className="min-h-screen bg-[#1a1f2e]">
  {/* Content */}
</div>
```

### Cards
```tsx
<Card className="bg-gray-800/50 border-gray-700">
  <CardHeader>
    <CardTitle className="text-white">Title</CardTitle>
    <CardDescription className="text-gray-400">Description</CardDescription>
  </CardHeader>
  <CardContent>
    {/* Content */}
  </CardContent>
</Card>
```

### Buttons

#### Primary Button
```tsx
<Button className="bg-purple-600 hover:bg-purple-700 text-white">
  Primary Action
</Button>
```

#### Success Button
```tsx
<Button className="bg-green-600 hover:bg-green-700 text-white">
  Success Action
</Button>
```

#### Outline Button
```tsx
<Button variant="outline" className="border-gray-600 text-gray-300 hover:bg-gray-700">
  Secondary Action
</Button>
```

### Badges

#### Success Badge
```tsx
<Badge className="bg-green-500/10 text-green-400 border-green-500/20">
  Active
</Badge>
```

#### Warning Badge
```tsx
<Badge className="bg-orange-500/10 text-orange-400 border-orange-500/20">
  Warning
</Badge>
```

#### Error Badge
```tsx
<Badge className="bg-red-500/10 text-red-400 border-red-500/20">
  Error
</Badge>
```

#### Info Badge
```tsx
<Badge className="bg-blue-500/10 text-blue-400 border-blue-500/20">
  Info
</Badge>
```

### Headers
```tsx
<div className="bg-gray-800/50 border-b border-gray-800">
  <div className="container mx-auto px-4 py-4">
    <h1 className="text-2xl font-bold text-white">Page Title</h1>
    <p className="text-sm text-gray-400">Page description</p>
  </div>
</div>
```

### Tabs
```tsx
<Tabs defaultValue="tab1" className="space-y-4">
  <TabsList className="grid w-full grid-cols-3 bg-gray-800/50 border-gray-700">
    <TabsTrigger value="tab1" className="data-[state=active]:bg-gray-700 data-[state=active]:text-white">
      Tab 1
    </TabsTrigger>
  </TabsList>
  <TabsContent value="tab1">
    <Card className="bg-gray-800/50 border-gray-700">
      {/* Tab content */}
    </Card>
  </TabsContent>
</Tabs>
```

### Forms

#### Input
```tsx
<Input className="bg-gray-900/50 border-gray-700 text-white placeholder:text-gray-500" />
```

#### Textarea
```tsx
<Textarea className="bg-gray-900/50 border-gray-700 text-white placeholder:text-gray-500" />
```

#### Checkbox
```tsx
<input type="checkbox" className="rounded bg-gray-700 border-gray-600 text-purple-600 focus:ring-purple-600" />
```

### Status Indicators

#### Success
```tsx
<div className="h-2 w-2 bg-green-500 rounded-full animate-pulse" />
```

#### Warning
```tsx
<div className="h-2 w-2 bg-orange-500 rounded-full animate-pulse" />
```

#### Error
```tsx
<div className="h-2 w-2 bg-red-500 rounded-full animate-pulse" />
```

## 📐 Layout Guidelines

### Spacing
- Use consistent padding: `p-4` or `p-6` for containers
- Card spacing: `space-y-4` between cards
- Section margins: `mb-6` for major sections

### Borders
- Always use `border-gray-700` for primary borders
- Use `border-gray-800` for subtle borders (like headers)
- Border radius: `rounded-lg` for cards, `rounded` for smaller elements

### Typography
- Headers: `font-bold text-white`
- Descriptions: `text-sm text-gray-400`
- Regular text: `text-gray-300`
- Links: `text-purple-400 hover:text-purple-300`

## ⚠️ Important Rules

1. **ALWAYS** use `bg-[#1a1f2e]` as the main page background
2. **NEVER** use white backgrounds or light colors
3. **ALWAYS** include hover states for interactive elements
4. **ENSURE** sufficient contrast between text and backgrounds
5. **USE** semi-transparent backgrounds for overlays: `bg-gray-800/50`

## 🔄 State-Based Styling

### Active States
```tsx
className={isActive ? 'bg-gray-700 text-white' : 'text-gray-300 hover:text-white'}
```

### Conditional Borders
```tsx
className={hasError ? 'border-red-500 bg-gray-800/50' : 'bg-gray-800/50 border-gray-700'}
```

### Disabled States
```tsx
className="opacity-50 cursor-not-allowed"
```

## 📱 Responsive Design

- Use Tailwind's responsive prefixes: `sm:`, `md:`, `lg:`, `xl:`
- Mobile-first approach
- Hide/show elements: `hidden md:flex`
- Grid columns: `grid-cols-1 md:grid-cols-2 lg:grid-cols-4`

## 🚀 Quick Reference

```tsx
// Page wrapper
<div className="min-h-screen bg-[#1a1f2e]">

// Content container
<div className="container mx-auto px-4 py-6">

// Card
<Card className="bg-gray-800/50 border-gray-700">

// Primary button
<Button className="bg-purple-600 hover:bg-purple-700 text-white">

// Outline button
<Button variant="outline" className="border-gray-600 text-gray-300 hover:bg-gray-700">

// Success badge
<Badge className="bg-green-500/10 text-green-400 border-green-500/20">

// Text hierarchy
<h1 className="text-2xl font-bold text-white">
<p className="text-sm text-gray-400">
<span className="text-gray-300">
```

## 🎯 Implementation Checklist

When creating new pages or components:

- [ ] Use `bg-[#1a1f2e]` for main background
- [ ] Use `bg-gray-800/50` for cards
- [ ] Use `border-gray-700` for borders
- [ ] Use `text-white` for headers
- [ ] Use `text-gray-400` for descriptions
- [ ] Add hover states to all interactive elements
- [ ] Test in dark mode only
- [ ] Ensure proper contrast ratios
- [ ] Follow the component patterns above
