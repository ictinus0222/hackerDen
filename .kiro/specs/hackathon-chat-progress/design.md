# Design Document

## Overview

The hackathon chat page will be implemented as a new route within the existing hackathon workspace structure. This feature provides a dedicated chat interface that displays real-time messages, task updates, and vault secret updates in a unified communication stream for hackathon teams.

The design leverages the current HackathonWrapper and HackathonLayout components, integrating seamlessly with the existing authentication, team management, and real-time infrastructure. The page will use shadcn/ui components from the shad cn mcp server for consistent styling and accessibility, building upon the existing messaging system.

## Architecture

### Component Hierarchy

```
HackathonWrapper
└── HackathonDashboard
    └── Routes
        └── ChatPage (NEW)
            ├── HackathonLayout (existing wrapper)
            └── ChatContainer (NEW)
                ├── ChatHeader (NEW)
                └── ChatSection (existing, enhanced)
                    ├── MessageList (existing)
                    ├── MessageInput (existing)
                    └── MessageItem (existing, enhanced)
```

### Data Flow Architecture

```
Real-time Updates:
TaskService → Task Events → System Messages → MessageService → Chat Display
VaultService → Vault Events → System Messages → MessageService → Chat Display

Real-time Chat:
MessageInput → MessageService → Appwrite → Real-time Subscription → MessageList

System Message Sources:
- Task creation, status changes, completion
- Vault secret additions, updates, deletions
- User messages and team communication
```

## Components and Interfaces

### ChatPage Component

**Purpose**: Main page component that provides dedicated chat interface for hackathon teams

**Props Interface**:
```typescript
interface ChatPageProps {
  // No direct props - uses hackathon context from URL params
}
```

**Key Features**:
- Full-screen chat interface optimized for team communication
- Real-time message synchronization
- Error boundary for graceful failure handling
- Loading states for chat initialization

### ChatContainer Component

**Purpose**: Container component that manages chat layout and state

**Props Interface**:
```typescript
interface ChatContainerProps {
  hackathon: Hackathon;
  team: Team;
  className?: string;
}
```

**Key Features**:
- Responsive chat layout
- Message state management
- Integration with existing useMessages hook
- Error handling and retry logic

### ChatHeader Component

**Purpose**: Header section displaying team and hackathon context

**Props Interface**:
```typescript
interface ChatHeaderProps {
  hackathon: Hackathon;
  team: Team;
  onlineMembers?: number;
}
```

**Visual Elements**:
- Team name and hackathon title
- Online member count indicator
- Chat status indicators
- Navigation breadcrumbs

### Enhanced MessageItem Component

**Purpose**: Extended message display supporting task and vault system messages

**Props Interface**:
```typescript
interface EnhancedMessageItemProps extends MessageItemProps {
  message: Message;
  isSystemMessage: boolean;
}

interface Message {
  $id: string;
  content: string;
  type: 'user' | 'system' | 'task_created' | 'task_status_changed' | 'vault_secret_added' | 'vault_secret_updated' | 'vault_secret_deleted';
  userId?: string;
  userName?: string;
  $createdAt: string;
  systemData?: SystemMessageData;
}

interface SystemMessageData {
  eventType: string;
  details: any;
  relatedId?: string; // task ID or vault secret ID
}
```

**Visual Elements**:
- Enhanced styling for different message types
- Task-related system messages with task context
- Vault-related system messages with secret context
- Improved accessibility for system messages

## Data Models

### Enhanced Message Types

```typescript
// Extending existing message types for task and vault updates
interface TaskSystemMessage extends SystemMessage {
  type: 'task_created' | 'task_status_changed' | 'task_completed';
  systemData: {
    taskId: string;
    taskTitle: string;
    oldStatus?: string;
    newStatus?: string;
    assignedTo?: string;
    createdBy?: string;
  };
}

interface VaultSystemMessage extends SystemMessage {
  type: 'vault_secret_added' | 'vault_secret_updated' | 'vault_secret_deleted';
  systemData: {
    secretId: string;
    secretName: string;
    action: 'added' | 'updated' | 'deleted';
    modifiedBy: string;
    category?: string;
  };
}

interface UserMessage extends Message {
  type: 'user';
  userId: string;
  userName: string;
}

type EnhancedMessage = UserMessage | TaskSystemMessage | VaultSystemMessage;
```

### System Message Integration

```typescript
interface SystemMessageConfig {
  task_created: {
    icon: '📝';
    color: 'blue';
    template: (data: any) => string;
  };
  task_status_changed: {
    icon: '🔄' | '✅';
    color: 'green';
    template: (data: any) => string;
  };
  vault_secret_added: {
    icon: '🔐';
    color: 'purple';
    template: (data: any) => string;
  };
  vault_secret_updated: {
    icon: '🔄';
    color: 'orange';
    template: (data: any) => string;
  };
  vault_secret_deleted: {
    icon: '🗑️';
    color: 'red';
    template: (data: any) => string;
  };
}
```

## Error Handling

### System Message Errors

**Scenario**: Task or vault system message generation failures
**Handling**: 
- Continue with core functionality (task/vault operations)
- Log system message failures as warnings
- Retry mechanism for critical system messages
- Graceful degradation to basic operation completion

**Implementation**:
```typescript
const sendSystemMessage = async (teamId: string, messageData: SystemMessageData) => {
  try {
    await messageService.sendSystemMessage(teamId, messageData.content, messageData.type);
  } catch (error) {
    console.warn('Failed to send system message:', error);
    // Don't fail the parent operation
    // Could implement retry logic for critical messages
  }
};
```

### Real-time Connection Errors

**Scenario**: WebSocket connection failures
**Handling**:
- Automatic reconnection attempts
- Offline mode indicators
- Cached data display during outages
- User notification of connection status

### Chat Integration Errors

**Scenario**: Message sending failures during task/vault updates
**Handling**:
- Task and vault operations continue independently
- Failed system messages logged but don't block operations
- Retry mechanism for critical notifications
- User feedback for communication issues

## Testing Strategy

### Unit Testing

**Components to Test**:
- ChatContainer message handling logic
- Enhanced MessageItem system message rendering
- ChatHeader team context display
- System message integration with task/vault services

**Test Cases**:
```typescript
describe('ChatContainer', () => {
  it('renders task system messages with correct styling', () => {
    const taskMessage = {
      type: 'task_created',
      content: '📝 John created a new task: "Setup API"',
      systemData: { taskId: '123', taskTitle: 'Setup API' }
    };
    render(<MessageItem message={taskMessage} />);
    expect(screen.getByText(/Setup API/)).toHaveClass('text-blue-700');
  });

  it('renders vault system messages with correct styling', () => {
    const vaultMessage = {
      type: 'vault_secret_added',
      content: '🔐 API key added to vault',
      systemData: { secretName: 'API_KEY', action: 'added' }
    };
    render(<MessageItem message={vaultMessage} />);
    expect(screen.getByText(/API key added/)).toHaveClass('text-purple-700');
  });

  it('displays loading state when chat is initializing', () => {
    render(<ChatContainer loading={true} />);
    expect(screen.getByTestId('chat-skeleton')).toBeInTheDocument();
  });
});
```

### Integration Testing

**Real-time Data Flow**:
- Task creation/update → System message → Chat display
- Vault secret changes → System message → Chat notification
- User messages → Real-time sync → All team members

**Cross-component Communication**:
- Task service integration with message system
- Vault service integration with message system
- Real-time message synchronization across team members

### End-to-End Testing

**User Workflows**:
1. User joins hackathon team → Chat page loads with message history
2. User creates/updates task → System message appears in chat
3. User adds/modifies vault secret → System message appears in chat
4. Multiple users active → Real-time chat synchronization

**Performance Testing**:
- Large message history loading
- Frequent system message generation
- Multiple concurrent users
- Network interruption recovery

### Accessibility Testing

**Screen Reader Compatibility**:
- Progress announcements for screen readers
- Chat message accessibility
- Keyboard navigation through progress panels
- Focus management during real-time updates

**Visual Accessibility**:
- High contrast mode support
- Progress indicators with text alternatives
- Color-blind friendly progress visualizations
- Scalable text and UI elements

## Implementation Phases

### Phase 1: Basic Chat Page Structure
- Create ChatProgressPage component
- Integrate with existing HackathonDashboard routing
- Implement basic layout with chat section
- Add navigation and breadcrumbs

### Phase 2: Progress Panel Foundation
- Create ProgressPanel component structure
- Implement TeamProgressOverview with basic metrics
- Add loading and error states
- Connect to existing task data

### Phase 3: Real-time Progress Updates
- Implement progress calculation service
- Add real-time progress event listening
- Create ProgressNotificationSystem
- Integrate with existing message system

### Phase 4: Enhanced Progress Visualization
- Implement MemberProgressCards
- Add MilestoneTracker component
- Create progress animations and transitions
- Add celebration effects for achievements

### Phase 5: Polish and Optimization
- Performance optimization for real-time updates
- Accessibility improvements
- Mobile responsiveness refinements
- Error handling enhancements

## Technical Considerations

### Performance Optimization

**Real-time Update Throttling**:
- Debounce rapid progress updates
- Batch multiple progress events
- Optimize re-render cycles with React.memo
- Use virtual scrolling for large message lists

**Data Caching Strategy**:
- Cache progress calculations
- Implement stale-while-revalidate pattern
- Local storage for offline progress data
- Efficient state management with context optimization

### Scalability Considerations

**Large Team Support**:
- Pagination for member progress cards
- Efficient progress aggregation algorithms
- Optimized database queries for progress data
- Rate limiting for progress update events

**High Message Volume**:
- Message virtualization for performance
- Intelligent message batching
- Progress notification deduplication
- Efficient WebSocket event handling

### Security Considerations

**Progress Data Access**:
- Team-based progress data isolation
- User permission validation for progress viewing
- Secure progress update authentication
- Audit logging for progress modifications

**Real-time Security**:
- WebSocket connection authentication
- Progress event validation
- Rate limiting for progress updates
- XSS prevention in progress notifications