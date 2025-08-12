# Task Management Quick Reference

## Task Operations

### Creating Tasks
1. Click "Create Task" button on Kanban board
2. Fill out form (title and description required)
3. Set priority (Low/Medium/High)
4. Add labels (optional)
5. Assign to team member (team leaders only)
6. Click "Create Task"

### Editing Tasks
1. Hover over any task card
2. Click the blue edit icon
3. Modify any field in the form
4. Reassign task (team leaders only)
5. Click "Update Task"

### Deleting Tasks
1. Hover over any task card
2. Click the red delete icon
3. Confirm deletion in dialog

### Moving Tasks
1. **Desktop**: Click and drag task to different column
2. **Mobile**: Touch and hold, then drag to move
3. Task status updates automatically

## Role-Based Features

### Team Leaders (Owners)
- ✅ Create tasks assigned to any team member
- ✅ Edit any task in the team
- ✅ Reassign tasks to different members
- ✅ Delete any task
- ✅ Move tasks between columns
- ✅ See "Team Leader" badge in member list

### Regular Members
- ✅ Create tasks assigned to themselves
- ✅ Edit tasks (assignment stays with them)
- ✅ Delete tasks they created
- ✅ Move tasks between columns
- ✅ See "Member" role in team list

## Task Properties

### Required Fields
- **Title**: Task name (max 100 characters)
- **Description**: Task details (max 500 characters)

### Optional Fields
- **Priority**: Low (🟢), Medium (🟡), High (🔴)
- **Labels**: Custom tags for organization
- **Assignment**: Team member responsible for task

### System Fields
- **Status**: todo, in_progress, blocked, done
- **Created By**: Task creator (automatic)
- **Created At**: Creation timestamp
- **Updated At**: Last modification timestamp

## Visual Indicators

### Task Cards
- **Priority**: Color-coded badges (🟢🟡🔴)
- **Status**: Left border color and progress bar
- **Assignment**: Avatar with member initial
- **Labels**: Colored tags (max 3 shown)
- **Actions**: Edit (blue) and delete (red) buttons on hover

### Task Modal
- **Mode**: "Create New Task" vs "Edit Task" title
- **Assignment**: Dropdown (leaders) vs static display (members)
- **Validation**: Red borders and error messages
- **Loading**: Spinner and disabled state during operations

## Keyboard Shortcuts

### Task Cards
- **Tab**: Navigate between task cards
- **Enter/Space**: Open task for editing
- **Escape**: Close any open modals

### Task Modal
- **Tab**: Navigate between form fields
- **Enter**: Submit form (when focused on submit button)
- **Escape**: Close modal
- **Enter in label field**: Add new label

## Real-Time Features

### Automatic Updates
- Task changes appear immediately for all team members
- No page refresh required
- Optimistic updates for better user experience
- Conflict resolution handled automatically

### System Messages
- Task creation generates chat message
- Status changes create system notifications
- Assignment changes are logged
- Visual distinction for system vs user messages

## Troubleshooting

### Common Issues

#### Edit Button Not Appearing
- Ensure you're hovering over the task card
- Check that task card has proper hover states
- Verify onEdit prop is passed correctly

#### Assignment Dropdown Not Showing
- Verify user has team leader role
- Check that team members are loaded
- Ensure useTeamMembers hook is working

#### Changes Not Syncing
- Check network connection
- Verify Appwrite permissions
- Check browser console for errors
- Ensure real-time subscriptions are active

#### Form Not Pre-populating
- Verify editTask prop is passed correctly
- Check that task data is complete
- Ensure useEffect dependencies are correct

### Error Messages

#### "Failed to update task"
- Check Appwrite permissions
- Verify task still exists
- Check network connection
- Review server logs

#### "User or team information is missing"
- Ensure user is logged in
- Verify team context is loaded
- Check authentication state

#### "Task title is required"
- Fill out the title field
- Ensure title is not just whitespace
- Check form validation logic

## Best Practices

### Development
- Always pass onEdit prop to TaskCard components
- Handle both create and edit modes in TaskModal
- Use proper error boundaries around task operations
- Test with different user roles

### User Experience
- Provide clear visual feedback for all actions
- Use consistent styling across create/edit flows
- Ensure accessibility features are maintained
- Test on both desktop and mobile devices

### Performance
- Use real-time subscriptions for automatic updates
- Implement optimistic updates where appropriate
- Cache team member data to reduce API calls
- Debounce form validation for better performance

## API Reference

### TaskModal Props
```jsx
interface TaskModalProps {
  isOpen: boolean;           // Modal visibility
  onClose: () => void;       // Close handler
  onTaskCreated?: (task) => void;  // Create callback
  onTaskUpdated?: (task) => void;  // Update callback
  editTask?: Task | null;    // Task to edit (null for create)
}
```

### TaskCard Props
```jsx
interface TaskCardProps {
  task: Task;                // Task data
  onEdit?: (task) => void;   // Edit handler
  onDelete?: (id) => void;   // Delete handler
  // ... other existing props
}
```

### Service Methods
```jsx
// Update task fields
await taskService.updateTaskFields(taskId, {
  title: 'New Title',
  description: 'New Description',
  priority: 'high',
  labels: ['urgent', 'bug'],
  assignedTo: 'user-id',
  assigned_to: 'User Name'
});
```

This quick reference provides everything needed to understand and work with the task editing functionality in HackerDen MVP.