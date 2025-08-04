# Development Guide

## Dashboard Layout Development

### Quick Start for Dashboard Components

This guide helps developers understand and work with the dashboard layout system.

## Component Hierarchy

```
Dashboard (Page)
├── Layout (Wrapper)
│   ├── Header
│   └── Main Content
├── ErrorBoundary (Error Protection)
├── LoadingSpinner (Loading States)
├── Team Info Header
├── Desktop Layout (lg+)
│   ├── KanbanBoard
│   │   ├── TaskColumn (x4)
│   │   │   └── TaskCard (multiple)
│   │   └── AppwriteSetupGuide (error state)
│   └── Chat
└── Mobile Layout (<lg)
    └── MobileTabSwitcher
        ├── KanbanBoard
        │   ├── TaskColumn (x4)
        │   │   └── TaskCard (multiple)
        │   └── AppwriteSetupGuide (error state)
        └── Chat
```

## Development Workflow

### Adding New Dashboard Features

1. **Create Component**: Add new component in `src/components/`
2. **Import in Dashboard**: Add import to `src/pages/Dashboard.jsx`
3. **Add to Layout**: Place component in appropriate responsive container
4. **Test Responsiveness**: Verify desktop and mobile layouts
5. **Add Error Handling**: Wrap in ErrorBoundary if needed
6. **Update Documentation**: Add component docs to `docs/dashboard-components.md`

### Responsive Design Patterns

#### Desktop-First Component
```jsx
<div className="hidden lg:block">
  {/* Desktop only content */}
</div>
```

#### Mobile-First Component
```jsx
<div className="lg:hidden">
  {/* Mobile/tablet only content */}
</div>
```

#### Responsive Grid
```jsx
<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
  <div>Column 1</div>
  <div>Column 2</div>
</div>
```

### Error Handling Best Practices

#### Component-Level Error Boundary
```jsx
import ErrorBoundary from '../components/ErrorBoundary.jsx';

<ErrorBoundary>
  <YourComponent />
</ErrorBoundary>
```

#### Loading State Implementation
```jsx
import LoadingSpinner from '../components/LoadingSpinner.jsx';

{loading ? (
  <LoadingSpinner message="Loading your data..." />
) : (
  <YourContent />
)}
```

## Styling Guidelines

### Tailwind CSS Patterns

#### Container Patterns
```jsx
// Main container
<div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">

// Card container
<div className="bg-white rounded-lg shadow p-6">

// Spacing container
<div className="space-y-6">
```

#### Responsive Text
```jsx
// Headers
<h1 className="text-2xl font-bold text-gray-900">
<h2 className="text-xl font-semibold text-gray-900">

// Body text
<p className="text-gray-600">
<span className="text-sm text-gray-700">
```

#### Interactive Elements
```jsx
// Primary button
<button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors">

// Secondary button
<button className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-3 py-2 rounded-md text-sm font-medium transition-colors">
```

## Testing Dashboard Components

### Component Testing Checklist

- [ ] Component renders without errors
- [ ] Props are handled correctly
- [ ] Responsive design works on all breakpoints
- [ ] Error boundary catches component errors
- [ ] Loading states display properly
- [ ] Accessibility features work (keyboard nav, screen readers)

### Manual Testing Steps

1. **Desktop Testing**:
   - Verify side-by-side layout at 1024px+
   - Check component spacing and alignment
   - Test interactive elements (buttons, tabs)

2. **Mobile Testing**:
   - Verify tab switcher appears below 1024px
   - Test tab navigation functionality
   - Check touch targets are appropriate size

3. **Error Testing**:
   - Simulate component errors
   - Verify error boundary displays
   - Test recovery actions

4. **Loading Testing**:
   - Test loading states during data fetch
   - Verify loading messages are contextual
   - Check loading spinner animations

## Common Development Tasks

### Working with Kanban Board

#### Adding New Task Statuses
1. Update status arrays in `TaskColumn.jsx` and `TaskCard.jsx`
2. Add color schemes for new statuses
3. Update `useTasks.jsx` to handle new status grouping
4. Update `taskService.js` validation if needed

#### Customizing Task Cards
```jsx
// In TaskCard.jsx
const TaskCard = ({ task, onEdit, onDelete }) => {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      {/* Add custom fields here */}
      <div className="flex items-center justify-between">
        <span className="text-xs text-gray-500">Priority: {task.priority}</span>
        <button onClick={() => onEdit(task)}>Edit</button>
      </div>
    </div>
  );
};
```

#### Adding Real-time Features
```jsx
// Using the useTasks hook
const { tasks, tasksByStatus, loading, error } = useTasks();

// Tasks automatically update in real-time
// No additional setup needed for basic real-time functionality
```

### Adding a New Tab to Mobile Switcher

1. Update `MobileTabSwitcher.jsx`:
```jsx
const tabs = [
  { id: 'kanban', label: 'Kanban', component: children[0] },
  { id: 'chat', label: 'Chat', component: children[1] },
  { id: 'newtab', label: 'New Tab', component: children[2] } // Add new tab
];
```

2. Update Dashboard component:
```jsx
<MobileTabSwitcher>
  <KanbanBoard />
  <Chat />
  <NewComponent /> {/* Add new component */}
</MobileTabSwitcher>
```

### Modifying Layout Structure

1. **Header Changes**: Edit `src/components/Layout.jsx`
2. **Main Content**: Edit `src/pages/Dashboard.jsx`
3. **Responsive Behavior**: Update Tailwind classes
4. **Test Changes**: Verify all breakpoints work correctly

### Adding Loading States

```jsx
const [loading, setLoading] = useState(false);

// In your component
{loading ? (
  <LoadingSpinner message="Custom loading message..." />
) : (
  <YourContent />
)}
```

### Implementing Error Handling

```jsx
const [error, setError] = useState(null);

// Wrap risky operations
try {
  // Your code here
} catch (err) {
  setError(err.message);
}

// Display errors
{error && (
  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
    <p className="text-red-800">{error}</p>
  </div>
)}
```

### Working with Appwrite Services

#### Creating a New Service
```jsx
// src/services/newService.js
import { databases, DATABASE_ID, COLLECTIONS, Query } from '../lib/appwrite';

export const newService = {
  async getData(teamId) {
    try {
      const response = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.NEW_COLLECTION,
        [Query.equal('teamId', teamId)]
      );
      return response.documents;
    } catch (error) {
      console.error('Error fetching data:', error);
      throw new Error(`Failed to fetch data: ${error.message}`);
    }
  }
};
```

#### Using Real-time Subscriptions
```jsx
// In your custom hook
useEffect(() => {
  if (!team?.$id) return;

  const unsubscribe = client.subscribe(
    `databases.${DATABASE_ID}.collections.${COLLECTIONS.YOUR_COLLECTION}.documents`,
    (response) => {
      if (response.payload.teamId === team.$id) {
        handleRealtimeUpdate(response);
      }
    }
  );

  return () => {
    if (typeof unsubscribe === 'function') {
      unsubscribe();
    }
  };
}, [team?.$id]);
```

## Performance Optimization

### Component Optimization Tips

1. **Avoid Unnecessary Re-renders**:
   - Use `useMemo` for expensive calculations
   - Use `useCallback` for event handlers
   - Minimize prop drilling

2. **Lazy Loading**:
   - Consider lazy loading for heavy components
   - Use React.lazy() for code splitting

3. **CSS Optimization**:
   - Use Tailwind utilities instead of custom CSS
   - Avoid inline styles when possible
   - Minimize CSS-in-JS usage

## Debugging Common Issues

### Layout Issues
- **Problem**: Components not responsive
- **Solution**: Check Tailwind breakpoint classes (`lg:`, `sm:`, etc.)

### Error Boundary Issues
- **Problem**: Error boundary not catching errors
- **Solution**: Ensure ErrorBoundary wraps the problematic component

### Loading State Issues
- **Problem**: Loading spinner not showing
- **Solution**: Verify loading state is properly managed and conditional rendering is correct

### Mobile Tab Issues
- **Problem**: Tabs not switching properly
- **Solution**: Check MobileTabSwitcher state management and children array

## Code Review Checklist

### Before Submitting PR

- [ ] All components follow established patterns
- [ ] Responsive design tested on multiple breakpoints
- [ ] Error boundaries implemented where needed
- [ ] Loading states provide good user experience
- [ ] Accessibility features maintained
- [ ] Documentation updated for new components
- [ ] Code follows project style guidelines
- [ ] No console errors or warnings
- [ ] Build passes successfully

### Review Focus Areas

1. **Component Structure**: Proper separation of concerns
2. **Responsive Design**: Works across all device sizes
3. **Error Handling**: Graceful failure and recovery
4. **Performance**: No unnecessary re-renders or heavy operations
5. **Accessibility**: Keyboard navigation and screen reader support
6. **Documentation**: Clear comments and updated docs