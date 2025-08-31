# Badge Components Documentation

## Overview

The Badge component system provides consistent status and priority visualization across the HackerDen application. Built on top of Shadcn UI v4, these components ensure accessibility compliance and maintain the existing theme system.

## Components

### Base Badge Component

The foundational badge component with multiple variants.

```jsx
import { Badge } from './ui/badge';

// Basic usage
<Badge>Default Badge</Badge>

// With variants
<Badge variant="secondary">Secondary</Badge>
<Badge variant="destructive">Error</Badge>
<Badge variant="outline">Outlined</Badge>
```

### StatusBadge Component

Displays task status with semantic colors and icons.

```jsx
import { StatusBadge } from './ui/status-badge';

<StatusBadge status="todo" />        // 📋 To-Do
<StatusBadge status="in_progress" /> // ⚡ In Progress  
<StatusBadge status="blocked" />     // 🚫 Blocked
<StatusBadge status="done" />        // ✅ Done
```

**Props:**
- `status`: 'todo' | 'in_progress' | 'blocked' | 'done'
- `className`: Additional CSS classes
- Standard HTML span attributes

### PriorityBadge Component

Displays task priority with color-coded indicators.

```jsx
import { PriorityBadge } from './ui/status-badge';

<PriorityBadge priority="high" />                    // 🔴
<PriorityBadge priority="medium" />                  // 🟡
<PriorityBadge priority="low" />                     // 🟢
<PriorityBadge priority="high" showLabel={true} />   // 🔴 High
```

**Props:**
- `priority`: 'high' | 'medium' | 'low'
- `showLabel`: boolean - Whether to show text label
- `className`: Additional CSS classes
- Standard HTML span attributes

### TaskIdBadge Component

Displays shortened task identifiers.

```jsx
import { TaskIdBadge } from './ui/status-badge';

<TaskIdBadge taskId="123456789abcdef" /> // #cdef
```

**Props:**
- `taskId`: string - Full task ID (displays last 4 characters)
- `className`: Additional CSS classes
- Standard HTML span attributes

### LabelBadge Component

Displays task labels/tags.

```jsx
import { LabelBadge } from './ui/status-badge';

<LabelBadge label="Frontend" />
<LabelBadge label="Bug Fix" />
```

**Props:**
- `label`: string - Label text to display
- `className`: Additional CSS classes
- Standard HTML span attributes

## Accessibility Features

All badge components include:

- **ARIA Labels**: Descriptive labels for screen readers
- **Semantic Markup**: Proper HTML structure
- **Keyboard Support**: Focusable when interactive
- **Color Contrast**: WCAG 2.1 AA compliant contrast ratios
- **High Contrast Mode**: Support for system high contrast settings

## Theme Integration

The badges integrate seamlessly with the existing CSS custom properties:

- Uses `--primary`, `--destructive`, `--muted` color variables
- Supports dark/light mode switching
- Maintains HackerDen brand colors (green accents)
- Responsive to theme changes

## Usage in TaskCard

Example of combined usage in the TaskCard component:

```jsx
<div className="flex items-center space-x-2">
  <TaskIdBadge taskId={task.$id} />
  <PriorityBadge priority={task.priority} />
  <StatusBadge status={task.status} />
  {task.labels?.map(label => (
    <LabelBadge key={label} label={label} />
  ))}
</div>
```

## Customization

### Custom Variants

Add custom variants to the badge component:

```jsx
// In badge.jsx, add to badgeVariants
"custom-variant": "border-transparent bg-custom text-custom-foreground"
```

### Custom Styling

Apply additional styles:

```jsx
<StatusBadge 
  status="in_progress" 
  className="animate-pulse ring-2 ring-primary/20" 
/>
```

## Testing

Comprehensive test coverage includes:

- Component rendering
- Accessibility compliance
- ARIA attribute validation
- Keyboard navigation
- Theme integration
- Visual regression testing

Run tests with:
```bash
npm test -- badge.test.jsx
```

## Performance Considerations

- Components are memoized for optimal re-rendering
- CSS classes are pre-computed using class-variance-authority
- Minimal DOM footprint with semantic HTML
- Efficient theme switching without layout shifts

## Browser Support

- Modern browsers (Chrome, Firefox, Safari, Edge)
- Screen readers (NVDA, JAWS, VoiceOver)
- High contrast mode support
- Reduced motion preference support