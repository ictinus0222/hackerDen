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

A fully functional Kanban board with four columns for task management, task creation, and real-time updates.

#### Features
- **Four-Column Layout**: To-Do, In Progress, Blocked, Done columns
- **Task Creation**: "Create Task" button that opens a modal for new task creation
- **Real-time Updates**: Live task updates using Appwrite subscriptions
- **Responsive Design**: Adapts from 1 column (mobile) to 4 columns (desktop)
- **Task Management**: Display tasks filtered by team with proper status grouping
- **Error Handling**: Comprehensive error states with setup guidance
- **Loading States**: Contextual loading messages during data fetch

#### Usage
```jsx
import KanbanBoard from '../components/KanbanBoard.jsx';

<KanbanBoard />
```

#### Dependencies
- `useTasks` hook for task data management
- `useTeam` hook for team context
- `useAuth` hook for user authentication
- `TaskColumn` component for column rendering
- `TaskModal` component for task creation
- `AppwriteSetupGuide` component for setup assistance

#### State Management
- Fetches tasks automatically when team changes
- Groups tasks by status (todo, in_progress, blocked, done)
- Handles real-time task updates via Appwrite subscriptions
- Manages loading and error states
- Controls task creation modal visibility

#### Task Creation Flow
1. User clicks "Create Task" button in the board header
2. TaskModal opens with form for title and description
3. Form validation ensures required fields are filled
4. Task is created with 'todo' status and assigned to current user
5. Modal closes and new task appears in To-Do column via real-time updates

#### Error States
- **Collection Missing**: Shows setup guide when tasks collection doesn't exist
- **Schema Issues**: Provides detailed instructions for missing attributes
- **Permission Errors**: Clear messaging for access issues
- **Network Errors**: Graceful handling of connection issues

---

### TaskModal Component (`src/components/TaskModal.jsx`)

Modal component for creating new tasks with form validation and error handling.

#### Features
- **Modal Interface**: Clean, accessible modal overlay with proper focus management
- **Form Validation**: Required field validation for title and description
- **Error Handling**: Comprehensive error display and user feedback
- **Loading States**: Disabled form during submission with visual feedback
- **Auto-Assignment**: Tasks are automatically assigned to the current user
- **Status Setting**: New tasks are created with 'todo' status by default

#### Usage
```jsx
import TaskModal from '../components/TaskModal.jsx';

<TaskModal
  isOpen={isModalOpen}
  onClose={() => setIsModalOpen(false)}
  onTaskCreated={handleTaskCreated}
/>
```

#### Props
- `isOpen` (boolean): Controls modal visibility
- `onClose` (function): Callback when modal should be closed
- `onTaskCreated` (function, optional): Callback when task is successfully created

#### Form Fields
- **Title** (required): Task title with validation
- **Description** (required): Task description with validation
- **Auto-filled**: assignedTo and createdBy are set to current user

#### Validation Rules
- Title must not be empty or whitespace-only
- Description must not be empty or whitespace-only
- Real-time validation with error clearing on input

#### Error Handling
- **Field Validation**: Individual field error messages
- **General Errors**: API errors and missing user/team information
- **Network Errors**: Graceful handling of connection issues
- **User Feedback**: Clear error messages with recovery guidance

#### Accessibility Features
- **Keyboard Navigation**: Tab navigation and escape key support
- **Focus Management**: Proper focus trapping within modal
- **Screen Reader Support**: Semantic HTML and ARIA labels
- **Visual Indicators**: Clear visual feedback for form states

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
---


### TaskColumn Component (`src/components/TaskColumn.jsx`)

Individual column component for the Kanban board that displays tasks for a specific status.

#### Features
- **Status-Based Styling**: Color-coded headers and borders for each status
- **Task Count Display**: Shows number of tasks in each column
- **Scrollable Content**: Handles overflow with proper scrolling
- **Empty State**: User-friendly message when no tasks exist
- **Responsive Layout**: Adapts to different screen sizes

#### Usage
```jsx
import TaskColumn from '../components/TaskColumn.jsx';

<TaskColumn
  title="To-Do"
  status="todo"
  tasks={todoTasks}
  className="min-h-0"
/>
```

#### Props
- `title` (string): Display name for the column
- `status` (string): Task status ('todo', 'in_progress', 'blocked', 'done')
- `tasks` (array): Array of task objects to display
- `className` (string, optional): Additional CSS classes

#### Color Scheme
- **To-Do**: Gray theme (`border-gray-300`, `bg-gray-50`)
- **In Progress**: Blue theme (`border-blue-300`, `bg-blue-50`)
- **Blocked**: Red theme (`border-red-300`, `bg-red-50`)
- **Done**: Green theme (`border-green-300`, `bg-green-50`)

---

### TaskCard Component (`src/components/TaskCard.jsx`)

Individual task display component with task information and status indicators.

#### Features
- **Task Information**: Title, description, and timestamps
- **Status Badge**: Color-coded status indicator
- **Responsive Text**: Proper text truncation and line clamping
- **Hover Effects**: Visual feedback on interaction
- **Timestamp Display**: Creation and update time formatting

#### Usage
```jsx
import TaskCard from '../components/TaskCard.jsx';

<TaskCard task={taskObject} />
```

#### Props
- `task` (object): Task object with required fields:
  - `$id` (string): Unique task identifier
  - `title` (string): Task title
  - `description` (string, optional): Task description
  - `status` (string): Current task status
  - `$createdAt` (string): ISO timestamp of creation
  - `$updatedAt` (string): ISO timestamp of last update

#### Status Labels
- `todo` → "To-Do"
- `in_progress` → "In Progress"
- `blocked` → "Blocked"
- `done` → "Done"

---

### AppwriteSetupGuide Component (`src/components/AppwriteSetupGuide.jsx`)

Helper component that provides step-by-step instructions for setting up the Appwrite tasks collection.

#### Features
- **Error Detection**: Identifies collection vs. schema issues
- **Step-by-Step Guide**: Clear instructions for manual setup
- **Visual Hierarchy**: Well-organized sections with proper styling
- **External Links**: Direct links to Appwrite Console
- **Code Examples**: Formatted attribute specifications

#### Usage
```jsx
import AppwriteSetupGuide from '../components/AppwriteSetupGuide.jsx';

<AppwriteSetupGuide error={errorMessage} />
```

#### Props
- `error` (string): Error message from failed task operations

#### Setup Sections
1. **Collection Creation**: Instructions for creating the tasks collection
2. **Attribute Setup**: Required attributes with types and constraints
3. **Permissions**: Proper permission configuration
4. **Indexes**: Optional but recommended database indexes

---

## Task Management System

### useTasks Hook (`src/hooks/useTasks.jsx`)

Custom React hook for managing task data and real-time updates.

#### Features
- **Team-Based Filtering**: Automatically filters tasks by current team
- **Real-time Subscriptions**: Live updates via Appwrite subscriptions
- **Status Grouping**: Organizes tasks by status for Kanban display
- **Error Handling**: Comprehensive error management
- **Loading States**: Proper loading state management

#### Usage
```jsx
import { useTasks } from '../hooks/useTasks.jsx';

const MyComponent = () => {
  const { tasks, tasksByStatus, loading, error, refetch } = useTasks();
  
  // Use the task data...
};
```

#### Return Values
- `tasks` (array): All tasks for the current team
- `tasksByStatus` (object): Tasks grouped by status
  - `todo` (array): Tasks with 'todo' status
  - `in_progress` (array): Tasks with 'in_progress' status
  - `blocked` (array): Tasks with 'blocked' status
  - `done` (array): Tasks with 'done' status
- `loading` (boolean): Loading state indicator
- `error` (string|null): Error message if any
- `refetch` (function): Manual refresh function

#### Real-time Events
- **Create**: New tasks appear automatically
- **Update**: Task changes reflect immediately
- **Delete**: Removed tasks disappear from the board

---

### taskService (`src/services/taskService.js`)

Service module for task-related Appwrite operations.

#### Features
- **CRUD Operations**: Create, read, update task operations
- **Team Filtering**: Queries tasks by team ID
- **Real-time Subscriptions**: Manages Appwrite real-time connections
- **Error Handling**: Detailed error messages and logging
- **Status Management**: Task status update functionality

#### Methods

##### `createTask(teamId, taskData)`
Creates a new task for the specified team with automatic status and assignment.

**Parameters:**
- `teamId` (string): Team identifier
- `taskData` (object): Task information
  - `title` (string): Task title
  - `description` (string, optional): Task description
  - `assignedTo` (string): User ID of assignee
  - `createdBy` (string): User ID of creator

**Automatic Fields:**
- `status`: Always set to 'todo' for new tasks
- `teamId`: Set to the provided team identifier

**Returns:** Promise resolving to created task object

**Usage Example:**
```javascript
const newTask = await taskService.createTask(team.$id, {
  title: 'Implement user authentication',
  description: 'Add login and registration functionality',
  assignedTo: user.$id,
  createdBy: user.$id
});
```

##### `getTeamTasks(teamId)`
Retrieves all tasks for a specific team.

**Parameters:**
- `teamId` (string): Team identifier

**Returns:** Promise resolving to array of task objects

##### `updateTaskStatus(taskId, status)`
Updates the status of an existing task.

**Parameters:**
- `taskId` (string): Task identifier
- `status` (string): New status ('todo', 'in_progress', 'blocked', 'done')

**Returns:** Promise resolving to updated task object

##### `subscribeToTasks(teamId, callback)`
Sets up real-time subscription for task updates.

**Parameters:**
- `teamId` (string): Team identifier
- `callback` (function): Function to handle real-time updates

**Returns:** Unsubscribe function

#### Error Handling
- **Collection Missing**: Specific error for missing tasks collection
- **Schema Issues**: Detailed error for missing attributes
- **Permission Errors**: Clear messaging for access issues
- **Network Errors**: Graceful handling of connection problems

---

## Development Utilities

### testData (`src/utils/testData.js`)

Development utility for creating sample tasks for testing and development.

#### Features
- **Sample Task Generation**: Creates realistic test tasks
- **Status Distribution**: Distributes tasks across different statuses
- **Team Integration**: Creates tasks for specific teams
- **Development Aid**: Helps with testing Kanban functionality

#### Methods

##### `createTestTasks(teamId, userId)`
Creates a set of sample tasks for development and testing.

**Parameters:**
- `teamId` (string): Team identifier
- `userId` (string): User identifier for task assignment

**Returns:** Promise resolving to array of created tasks

**Sample Tasks Created:**
- Project setup task (todo)
- UI mockup task (in_progress)
- Authentication task (done)
- Team management task (todo)
- Critical bug fix (blocked)

##### `clearTestTasks(teamId)`
Utility function for clearing test tasks (logging only).

**Parameters:**
- `teamId` (string): Team identifier

**Returns:** Promise resolving to count of tasks that would be deleted