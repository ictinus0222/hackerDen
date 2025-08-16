# HackerDen Style Guide

A comprehensive design system guide for the HackerDen hackathon management platform.

## Overview

HackerDen uses a modern dark theme design system built with Tailwind CSS and React. The design emphasizes clean aesthetics, accessibility, and a professional developer-focused experience.

## Design Principles

- **Dark-first Design**: Optimized for developer workflows with reduced eye strain
- **Clean & Modern**: Minimal visual noise with purposeful use of space
- **Accessibility**: WCAG compliant with proper focus states and semantic markup
- **Mobile-first**: Responsive design that works across all devices
- **Performance**: Lightweight animations and optimized rendering

## Color System

### Primary Colors
```css
/* Brand Colors */
--primary: #00C853          /* Main brand green */
--primary-hover: #00B24A    /* Hover state */

/* Background Colors */
--background-dark: #121C1B     /* Main background */
--background-sidebar: #1A2423  /* Sidebar background */
--background-card: #1E2B29     /* Card/modal backgrounds */

/* Text Colors */
--text-primary: #FFFFFF     /* Primary text (headings, important content) */
--text-secondary: #B0B8B6   /* Secondary text (body, descriptions) */
--text-tertiary: #9ca3af    /* Tertiary text (metadata, timestamps) */
--text-muted: #6b7280       /* Muted text (placeholders, disabled) */
```

### Status Colors
```css
/* Task Status Colors */
--status-todo: #6b7280      /* Gray - To Do */
--status-progress: #3b82f6  /* Blue - In Progress */
--status-blocked: #ef4444   /* Red - Blocked */
--status-done: #10b981      /* Green - Completed */

/* Priority Colors */
--priority-high: #ef4444    /* Red */
--priority-medium: #f59e0b  /* Yellow */
--priority-low: #10b981     /* Green */
```

### Semantic Colors
```css
/* Success, Warning, Error */
--success: #10b981
--warning: #f59e0b
--error: #ef4444
--info: #3b82f6
```

## Typography

### Font Family
- **Primary**: Inter (Google Fonts)
- **Fallback**: system-ui, sans-serif
- **Monospace**: font-mono (for codes, IDs)

### Font Sizes & Weights
```css
/* Headings */
.text-h1 { font-size: 20px; font-weight: 700; line-height: 1.2; }
.text-h2 { font-size: 16px; font-weight: 600; line-height: 1.3; }

/* Body Text */
.text-body { font-size: 14px; font-weight: 400; line-height: 1.5; }
.text-sm { font-size: 12px; }
.text-xs { font-size: 10px; }
```

### Usage Guidelines
- **H1**: Page titles, main headings
- **H2**: Section headings, card titles
- **Body**: Default text, descriptions
- **Small**: Metadata, timestamps, helper text
- **Extra Small**: Labels, badges, status indicators

## Spacing System

### Base Units
```css
--spacing-base: 16px    /* Standard spacing unit */
--spacing-card: 16px    /* Card padding */
--spacing-nav: 12px     /* Navigation spacing */
```

### Spacing Scale
- **xs**: 4px (0.25rem)
- **sm**: 8px (0.5rem)
- **base**: 16px (1rem)
- **lg**: 24px (1.5rem)
- **xl**: 32px (2rem)
- **2xl**: 48px (3rem)

## Component System

### Buttons

#### Primary Button
```jsx
<button className="btn-primary">
  Primary Action
</button>
```
- **Use for**: Main actions, form submissions, CTAs
- **Colors**: Green gradient background, white text
- **States**: Hover darkens, focus ring, disabled opacity

#### Secondary Button
```jsx
<button className="btn-secondary">
  Secondary Action
</button>
```
- **Use for**: Secondary actions, cancel buttons
- **Colors**: Dark background, light text, subtle border
- **States**: Hover lightens background and text

#### Gradient Buttons
```jsx
<button className="bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all duration-200 font-medium">
  Gradient Action
</button>
```
- **Use for**: Special actions, team creation, important CTAs

### Cards

#### Basic Card
```jsx
<div className="card-enhanced">
  Card content
</div>
```
- **Background**: `#1E2B29`
- **Border radius**: 8px
- **Padding**: 16px
- **Shadow**: Subtle drop shadow

#### Hover Card
```jsx
<div className="card-enhanced card-hover">
  Interactive card content
</div>
```
- **Use for**: Clickable cards, navigation items
- **Effect**: Scale and shadow increase on hover

### Form Elements

#### Input Fields
```jsx
<input className="w-full px-3 py-2 bg-background-sidebar border border-dark-primary/20 rounded-lg text-white placeholder-dark-tertiary focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent" />
```

#### Dropdowns
```jsx
<select className="w-full px-4 py-3 text-base rounded-xl bg-background-sidebar border border-dark-primary/30 text-white focus:outline-none focus:ring-2 focus:ring-green-500">
  <option>Option 1</option>
</select>
```

### Status Indicators

#### Task Status
```jsx
<span className="status-todo">To Do</span>
<span className="status-progress">In Progress</span>
<span className="status-blocked">Blocked</span>
<span className="status-done">Done</span>
```

#### Priority Badges
```jsx
<span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-red-500/20 text-red-300 border border-red-500/30">
  High Priority
</span>
```

### Avatars

#### User Avatar
```jsx
<div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
  <span className="text-sm font-bold text-white">
    {user.name[0].toUpperCase()}
  </span>
</div>
```

#### Team Avatar
```jsx
<div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
  <span className="text-sm font-bold text-white">T</span>
</div>
```

## Layout Patterns

### Dashboard Grid
```jsx
<div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
  {/* Navigation cards */}
</div>

<div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
  {/* Summary widgets */}
</div>
```

### Sidebar Layout
```css
.sidebar {
  width: 240px;
  background: #1A2423;
  /* Responsive: hidden on mobile, overlay on tablet */
}
```

### Chat Layout
```jsx
<div className="chat-container">
  {/* Height: calc(100vh - 8rem) */}
  {/* Min height: 400px */}
</div>
```

## Animation System

### Transitions
```css
/* Standard transition */
transition: all 0.2s ease;

/* Hover effects */
transition: transform 0.3s ease, box-shadow 0.3s ease;

/* Focus states */
transition: ring 0.15s ease;
```

### Keyframe Animations
```css
/* Fade in */
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

/* Slide up */
@keyframes slideUp {
  from { opacity: 0; transform: translateY(15px) scale(0.95); }
  to { opacity: 1; transform: translateY(0) scale(1); }
}
```

### Usage Classes
```jsx
<div className="animate-fade-in">Fading in content</div>
<div className="animate-slide-up">Sliding up content</div>
```

## Responsive Design

### Breakpoints
```css
/* Mobile first approach */
sm: 640px   /* Small devices */
md: 768px   /* Medium devices */
lg: 1024px  /* Large devices */
xl: 1280px  /* Extra large devices */
```

### Mobile Optimizations
- **Touch targets**: Minimum 44px height for interactive elements
- **Font sizes**: Larger base font size on mobile
- **Spacing**: Adjusted padding and margins
- **Navigation**: Collapsible sidebar, bottom navigation

### Responsive Patterns
```jsx
{/* Responsive grid */}
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

{/* Responsive text */}
<h1 className="text-xl md:text-2xl lg:text-3xl">

{/* Responsive spacing */}
<div className="p-4 md:p-6 lg:p-8">
```

## Accessibility Guidelines

### Focus Management
- **Focus rings**: 2px green ring with offset
- **Focus visible**: Only show focus rings for keyboard navigation
- **Tab order**: Logical tab sequence through interactive elements

### Color Contrast
- **Text on dark backgrounds**: Minimum 4.5:1 contrast ratio
- **Interactive elements**: Clear visual distinction between states
- **Status indicators**: Don't rely solely on color

### Semantic HTML
```jsx
{/* Proper heading hierarchy */}
<h1>Page Title</h1>
<h2>Section Title</h2>

{/* Form labels */}
<label htmlFor="input-id">Label Text</label>
<input id="input-id" />

{/* Button roles */}
<button type="button" aria-label="Close dialog">×</button>
```

### ARIA Attributes
```jsx
{/* Modal dialogs */}
<div role="dialog" aria-modal="true" aria-labelledby="modal-title">

{/* Status updates */}
<div role="status" aria-live="polite">

{/* Navigation */}
<nav aria-label="Main navigation">
```

## Icon System

### Icon Library
- **Source**: Heroicons (outline and solid variants)
- **Size**: Consistent 16px (w-4 h-4) or 20px (w-5 h-5)
- **Color**: Inherits from parent text color

### Common Icons
```jsx
{/* Navigation */}
<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="..." />
</svg>

{/* Status indicators */}
<svg className="w-4 h-4 text-green-400" fill="currentColor" viewBox="0 0 20 20">
  <path fillRule="evenodd" d="..." clipRule="evenodd" />
</svg>
```

## Best Practices

### Performance
- **Lazy loading**: Use React.lazy for route components
- **Image optimization**: Proper sizing and formats
- **Animation performance**: Use transform and opacity for animations
- **Bundle splitting**: Code splitting for better loading

### Maintainability
- **Consistent naming**: Follow BEM-like conventions for custom classes
- **Component composition**: Prefer composition over inheritance
- **Prop validation**: Use TypeScript or PropTypes
- **Documentation**: Comment complex styling decisions

### Testing
- **Visual regression**: Test component snapshots
- **Accessibility**: Test with screen readers and keyboard navigation
- **Responsive**: Test across different viewport sizes
- **Cross-browser**: Ensure compatibility with major browsers

## Implementation Examples

### Team Selector Component
```jsx
const TeamSelector = () => (
  <div className="space-y-4">
    <div className="text-center mb-6">
      <h3 className="text-lg font-semibold text-white mb-2">Join a Team</h3>
      <p className="text-sm text-dark-tertiary">
        Create a new team or join an existing one
      </p>
    </div>
    
    <button className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all duration-200 font-medium">
      <PlusIcon className="w-5 h-5" />
      <span>Create New Team</span>
    </button>
  </div>
);
```

### Message Item Component
```jsx
const MessageItem = ({ message, isOwn }) => (
  <div className={`flex mb-4 ${isOwn ? 'justify-end' : 'justify-start'}`}>
    <div className="flex items-end space-x-2 max-w-sm">
      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
        <span className="text-xs font-bold text-white">
          {message.user[0].toUpperCase()}
        </span>
      </div>
      <div className={`px-4 py-2 rounded-lg ${
        isOwn 
          ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white' 
          : 'bg-background-sidebar text-white'
      }`}>
        <p className="text-sm">{message.content}</p>
      </div>
    </div>
  </div>
);
```

### Task Card Component
```jsx
const TaskCard = ({ task }) => (
  <div className="card-enhanced rounded-xl p-4 hover:scale-105 transition-all duration-300">
    <div className="flex items-center justify-between mb-3">
      <h3 className="font-semibold text-white truncate">{task.title}</h3>
      <div className="flex items-center space-x-1">
        <button className="p-1 rounded-md hover:bg-blue-500/20 text-slate-400 hover:text-blue-400">
          <EditIcon className="w-4 h-4" />
        </button>
      </div>
    </div>
    
    <div className="flex items-center space-x-2 mb-3">
      <span className={`text-xs px-2 py-1 rounded ${
        task.priority === 'high' ? 'bg-red-500/20 text-red-300' :
        task.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-300' :
        'bg-green-500/20 text-green-300'
      }`}>
        {task.priority} priority
      </span>
    </div>
    
    <div className="w-full bg-slate-700/60 rounded-full h-1.5">
      <div className={`h-1.5 rounded-full transition-all duration-500 ${
        task.status === 'done' ? 'bg-gradient-to-r from-emerald-500 to-green-500 w-full' :
        task.status === 'in_progress' ? 'bg-gradient-to-r from-green-500 to-emerald-500 w-1/2' :
        'w-0'
      }`} />
    </div>
  </div>
);
```

## Conclusion

This style guide provides a comprehensive foundation for maintaining consistency across the HackerDen platform. Regular updates should be made as the design system evolves, and all team members should reference this guide when implementing new features or components.

For questions or suggestions regarding the design system, please refer to the development team or create an issue in the project repository.