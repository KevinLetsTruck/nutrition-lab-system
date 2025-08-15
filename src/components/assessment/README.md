# Assessment Components

This directory contains all React components for the AI-powered functional medicine assessment interface.

## Component Structure

```
/components/assessment/
├── AssessmentFlow.tsx      # Main orchestration component
├── QuestionRenderer.tsx    # Dynamic question type renderer
├── questions/              # Individual question type components
│   ├── LikertScale.tsx    # 0-10 scale questions
│   ├── MultipleChoice.tsx # Single choice from options
│   ├── YesNo.tsx         # Binary yes/no questions
│   ├── Frequency.tsx     # How often questions
│   ├── Duration.tsx      # How long questions
│   ├── TextInput.tsx     # Free text responses
│   ├── MultiSelect.tsx   # Multiple choice selections
│   └── NumberInput.tsx   # Numeric input with validation
├── progress/              # Progress tracking components
│   ├── AssessmentProgress.tsx # Detailed progress sidebar
│   └── ProgressBar.tsx       # Compact progress header
└── index.ts              # Barrel exports
```

## Main Components

### AssessmentFlow

The primary component that manages the entire assessment experience.

```tsx
import { AssessmentFlow } from '@/components/assessment';

<AssessmentFlow 
  assessmentId="assessment-123"
  clientId="client-456"
  onComplete={() => router.push('/results')}
/>
```

**Features:**
- Loads questions from AI engine
- Handles response submission
- Manages pause/resume functionality
- Shows real-time progress
- Auto-save notifications
- Mobile responsive design

### QuestionRenderer

Dynamically renders the appropriate question component based on type.

```tsx
<QuestionRenderer
  question={currentQuestion}
  value={currentValue}
  onChange={setValue}
  onSubmit={handleSubmit}
  disabled={isLoading}
/>
```

**Supported Question Types:**
- `LIKERT_SCALE` - 0-10 scale with labels
- `MULTIPLE_CHOICE` - Single selection from options
- `YES_NO` - Binary choice
- `FREQUENCY` - How often (never to daily)
- `DURATION` - Time periods
- `TEXT` - Free text input
- `MULTI_SELECT` - Multiple selections
- `NUMBER` - Numeric input with validation

## Question Components

Each question type has specific features:

### LikertScale
- Visual 0-10 scale
- Optional labels at key points
- Seed oil risk highlighting
- Touch-friendly design

### MultipleChoice
- Radio button style selection
- Optional descriptions
- Seed oil risk indicators
- Clear visual feedback

### YesNo
- Large touch targets
- Visual icons
- Clear selected state

### Frequency
- Predefined frequency options
- Customizable via question config
- Seed oil exposure warnings

### Duration
- Time period selections
- Long-term exposure indicators
- Clear progression

### TextInput
- Character counter
- Min/max length validation
- Suggestion chips
- Auto-resize textarea

### MultiSelect
- Checkbox style selections
- Min/max selection limits
- Selection counter
- Disabled state for limit

### NumberInput
- Increment/decrement buttons
- Min/max validation
- Unit display
- Threshold warnings

## Progress Components

### AssessmentProgress
Full progress display showing:
- Overall completion percentage
- Time remaining estimate
- Module breakdown
- Current module indicator
- Motivational messages

### ProgressBar
Compact header showing:
- Current module
- Question number
- Completion percentage
- Pause/resume button

## Seed Oil Features

Components include special handling for seed oil assessment:
- Orange highlighting for high-risk responses
- Warning messages for concerning patterns
- Visual indicators on relevant questions
- Risk level badges

## Styling

All components use:
- Tailwind CSS for styling
- Consistent color scheme
- Hover/focus states
- Disabled states
- Mobile-first design
- Smooth transitions

## Usage Example

```tsx
'use client';

import { useState } from 'react';
import { AssessmentFlow } from '@/components/assessment';

export default function AssessmentPage({ params }) {
  const { id: assessmentId } = params;
  
  return (
    <AssessmentFlow
      assessmentId={assessmentId}
      clientId="client-123"
      onComplete={() => {
        console.log('Assessment completed!');
      }}
    />
  );
}
```

## Accessibility

All components include:
- Keyboard navigation
- ARIA labels
- Focus indicators
- Screen reader support
- Color contrast compliance

## Performance

Optimizations include:
- Lazy loading of question types
- Memoized components
- Debounced inputs
- Efficient re-renders
- Progress caching

## Testing

Components can be tested with:
```tsx
import { render, fireEvent } from '@testing-library/react';
import { QuestionRenderer } from '@/components/assessment';

test('renders likert scale question', () => {
  const question = {
    id: 'Q1',
    type: 'LIKERT_SCALE',
    text: 'How often do you feel tired?',
    // ...
  };
  
  const { getByText } = render(
    <QuestionRenderer 
      question={question}
      value={null}
      onChange={() => {}}
      onSubmit={() => {}}
    />
  );
  
  expect(getByText('How often do you feel tired?')).toBeInTheDocument();
});
```
