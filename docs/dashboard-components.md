# Dashboard Components Documentation

This document provides detailed information about the dashboard layout components implemented in HackerDen MVP.

## Overview

The dashboard layout system provides a responsive, user-friendly interface for team collaboration. It includes a main layout structure, responsive design patterns, error handling, and loading states.

## Components

### Layout Component (`src/components/Layout.jsx`)

The main layout wrapper that provides consistent structure across the application.

#### Features
- **Header Section**: App branding and user navigation
- **User Information**: Displays logged-in user's name
- **Logout Functionality**: Secure logout with error handling
- **Responsive Container**: Proper spacing and max-width constraints

#### Usage
```jsx
import Layout from '../components/Layout.jsx';

const MyPage = () => {
  return (
    <Layout>
      <div>Your page content here</div>
    </Layout>
  );
};
```

#### Props
- `children` (ReactNode): Content to be rendered within the layout

---

### Dashboard Component (`src/pages/Dashboard.jsx`)

The main dashboard page that adapts based on user's team membership status.

#### Features
- **Team Status Detection**: Shows different content based on team membership
- **Responsive Layout**: Desktop side-by-side, mobile tab-based
- **Team Information Header**: Displays team name, join code, and status
- **Error Boundary Integration**: Crash protection for the entire dashboard
- **Loading States**: Contextual loading messages

#### Layout Modes
1. **No Team**: Shows TeamSelector component
2. **Has Team**: Shows responsive dashboard with Kanban and Chat

#### Responsive Breakpoints
- **Desktop (lg+)**: `lg:grid lg:grid-cols-2` - Side-by-side layout
- **Mobile/Tablet**: `lg:hidden` - Tab-based interface

---

### MobileTabSwitcher Component (`src/components/MobileTabSwitcher.jsx`)

Provides tab-based navigation for mobile devices to switch between Kanban and Chat views.

#### Features
- **Tab Navigation**: Clean, accessible tab interface
- **Active State Management**: Visual indicators for selected tab
- **Responsive Visibility**: Only shown on mobile/tablet devices
- **Smooth Transitions**: CSS transitions for tab switching

#### Usage
```jsx
import MobileTabSwitcher from '../components/MobileTabSwitcher.jsx';

<MobileTabSwitcher>
  <KanbanBoard />
  <Chat />
</MobileTabSwitcher>
```

#### Props
- `children` (Array): Array of exactly 2 React components [Kanban, Chat]

#### State Management
- Uses `useState` to track active tab ('kanban' | 'chat')
- Defaults to 'kanban' tab on initial load

---

### ErrorBoundary Component (`src/components/ErrorBoundary.jsx`)

React error boundary that catches JavaScript errors and provides recovery options.

#### Features
- **Error Catching**: Catches errors in child component tree
- **User-Friendly UI**: Clean error display with recovery options
- **Console Logging**: Logs errors for debugging purposes
- **Recovery Actions**: Refresh page button for error recovery

#### Usage
```jsx
import ErrorBoundary from '../components/ErrorBoundary.jsx';

<ErrorBoundary>
  <YourComponent />
</ErrorBoundary>
```

#### Error State UI
- Red-themed error message box
- Clear error description
- "Refresh Page" button for recovery
- Accessible design with proper ARIA attributes

---

### LoadingSpinner Component (`src/components/LoadingSpinner.jsx`)

Reusable loading component with customizable messages.

#### Features
- **Animated Spinner**: CSS-based spinning animation
- **Customizable Message**: Contextual loading messages
- **Consistent Styling**: Matches app design system
- **Centered Layout**: Proper centering for various container sizes

#### Usage
```jsx
import LoadingSpinner from '../components/LoadingSpinner.jsx';

<LoadingSpinner message="Loading your team..." />
```

#### Props
- `message` (string, optional): Custom loading message (default: "Loading...")

---

### KanbanBoard Component (`src/components/KanbanBoard.jsx`)

Placeholder component for the Kanban board functionality (to be implemented in Task 4).

#### Current State
- Displays placeholder content
- Maintains proper styling and layout structure
- Ready for Kanban implementation

---

### Chat Component (`src/components/Chat.jsx`)

Placeholder component for the chat functionality (to be implemented in Task 5).

#### Current State
- Displays placeholder content
- Maintains proper styling and layout structure
- Ready for chat implementation

## Responsive Design Strategy

### Desktop Layout (lg and above)
```css
.hidden.lg:grid.lg:grid-cols-2.lg:gap-6
```
- Side-by-side layout with equal column widths
- 6-unit gap between Kanban and Chat components
- Fixed height of 600px for consistent layout

### Mobile Layout (below lg)
```css
.lg:hidden
```
- Tab-based interface using MobileTabSwitcher
- Full-width components
- Touch-friendly tab navigation

### Breakpoint Strategy
- Uses Tailwind's `lg` breakpoint (1024px) as the main responsive breakpoint
- Mobile-first approach with desktop enhancements
- Consistent spacing and typography across breakpoints

## Styling Guidelines

### Color Scheme
- **Primary**: Blue tones (`blue-600`, `blue-500`)
- **Success**: Green tones (`green-100`, `green-800`)
- **Error**: Red tones (`red-600`, `red-700`)
- **Neutral**: Gray scale (`gray-50` to `gray-900`)

### Typography
- **Headers**: `text-xl font-semibold` to `text-2xl font-bold`
- **Body**: `text-sm` to `text-base`
- **Code**: `font-mono font-bold` for join codes

### Spacing
- **Component Gaps**: `space-y-6` for vertical spacing
- **Grid Gaps**: `lg:gap-6` for desktop grid layouts
- **Padding**: `p-6` for component internal spacing
- **Margins**: `mb-2` to `mb-4` for element separation

## Error Handling Strategy

### Error Boundary Implementation
1. **Component Level**: Each major component wrapped in ErrorBoundary
2. **Graceful Degradation**: Fallback UI when components crash
3. **Recovery Options**: User-initiated recovery actions
4. **Logging**: Console logging for development debugging

### Loading State Management
1. **Contextual Messages**: Different messages for different operations
2. **Visual Feedback**: Consistent spinner animations
3. **Timeout Handling**: Prevents infinite loading states
4. **User Communication**: Clear indication of what's loading

## Accessibility Features

### Keyboard Navigation
- Tab navigation for all interactive elements
- Focus indicators on buttons and tabs
- Proper tab order throughout the interface

### Screen Reader Support
- Semantic HTML structure
- ARIA labels where appropriate
- Descriptive text for loading states and errors

### Color Contrast
- Meets WCAG AA standards for color contrast
- Clear visual hierarchy with proper contrast ratios
- Consistent color usage throughout the interface

## Performance Considerations

### Component Optimization
- Functional components with hooks for better performance
- Minimal re-renders through proper state management
- Lazy loading preparation for future components

### CSS Optimization
- Tailwind CSS for minimal bundle size
- Utility-first approach reduces custom CSS
- Responsive classes minimize media query overhead

### Bundle Size
- Tree-shaking friendly component exports
- Minimal external dependencies
- Efficient import patterns

## Future Enhancements

### Planned Improvements
1. **Animation System**: Smooth transitions between states
2. **Theme Support**: Dark/light mode toggle
3. **Customizable Layout**: User preferences for layout options
4. **Advanced Error Recovery**: More sophisticated error handling

### Integration Points
1. **Kanban Board**: Will integrate with task management system
2. **Chat System**: Will integrate with real-time messaging
3. **Team Management**: Enhanced team member display and management
4. **Notifications**: Toast notifications for user actions

## Testing Strategy

### Component Testing
- Unit tests for individual components
- Integration tests for component interactions
- Responsive design testing across breakpoints

### Error Boundary Testing
- Simulated error conditions
- Recovery action testing
- Error logging verification

### Accessibility Testing
- Screen reader compatibility
- Keyboard navigation testing
- Color contrast validation

## Maintenance Guidelines

### Code Organization
- Keep components focused and single-purpose
- Maintain consistent naming conventions
- Document complex logic and state management

### Style Maintenance
- Use Tailwind utility classes consistently
- Avoid custom CSS unless necessary
- Maintain responsive design patterns

### Error Handling Updates
- Regularly review error boundary effectiveness
- Update error messages for clarity
- Monitor error logs for common issues