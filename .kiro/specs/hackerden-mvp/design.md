# Design Document

## Overview

HackerDen MVP is a real-time team collaboration platform built specifically for hackathon teams. The architecture prioritizes simplicity and rapid development using React + Appwrite, focusing on three core features: team management, Kanban task boards, and real-time chat.

The design emphasizes a serverless approach where Appwrite handles all backend concerns (authentication, database, real-time subscriptions), allowing the React frontend to focus purely on user experience and component logic.

## Architecture

### Technology Stack

**Frontend:**
- React 18 with Vite for fast development and building
- Tailwind CSS for responsive, utility-first styling
- HTML5 Drag and Drop API for Kanban interactions
- Appwrite Web SDK for all backend interactions

**Backend (Serverless):**
- Appwrite Cloud for authentication, database, and real-time features
- No custom server required - all logic handled client-side or via Appwrite Functions

**Deployment:**
- Netlify for continuous deployment from GitHub
- Environment variables for Appwrite configuration

### System Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   React App     │    │   Appwrite       │    │   Netlify       │
│                 │    │   Cloud          │    │   Hosting       │
│ ┌─────────────┐ │    │                  │    │                 │
│ │ Auth        │ │◄──►│ Authentication   │    │ Static Assets   │
│ │ Components  │ │    │                  │    │                 │
│ └─────────────┘ │    │ ┌──────────────┐ │    │ Environment     │
│                 │    │ │ Collections: │ │    │ Variables       │
│ ┌─────────────┐ │    │ │ - teams      │ │    │                 │
│ │ Team        │ │◄──►│ │ - team_members│ │    │                 │
│ │ Components  │ │    │ │ - tasks      │ │    │                 │
│ └─────────────┘ │    │ │ - messages   │ │    │                 │
│                 │    │ └──────────────┘ │    │                 │
│ ┌─────────────┐ │    │                  │    │                 │
│ │ Kanban      │ │◄──►│ Real-time        │    │                 │
│ │ Components  │ │    │ Subscriptions    │    │                 │
│ └─────────────┘ │    │                  │    │                 │
│                 │    │                  │    │                 │
│ ┌─────────────┐ │    │                  │    │                 │
│ │ Chat        │ │◄──►│                  │    │                 │
│ │ Components  │ │    │                  │    │                 │
│ └─────────────┘ │    │                  │    │                 │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

## Components and Interfaces

### Core Application Structure

```
src/
├── components/
│   ├── auth/
│   │   ├── LoginPage.jsx
│   │   ├── RegisterPage.jsx
│   │   └── ProtectedRoute.jsx
│   ├── team/
│   │   ├── TeamCreationPage.jsx
│   │   ├── TeamJoinPage.jsx
│   │   └── TeamSelector.jsx
│   ├── dashboard/
│   │   ├── Dashboard.jsx
│   │   ├── KanbanBoard.jsx
│   │   ├── TaskCard.jsx
│   │   ├── TaskModal.jsx
│   │   └── Chat.jsx
│   └── common/
│       ├── Layout.jsx
│       └── LoadingSpinner.jsx
├── services/
│   ├── appwrite.js
│   ├── auth.js
│   ├── teams.js
│   ├── tasks.js
│   └── chat.js
├── hooks/
│   ├── useAuth.js
│   ├── useTeam.js
│   ├── useTasks.js
│   └── useChat.js
└── utils/
    ├── constants.js
    └── helpers.js
```

### Component Interfaces

**Dashboard Component:**
- Props: `user` (current user object)
- State: `activeView` (for mobile: 'kanban' | 'chat')
- Responsibilities: Layout management, responsive behavior, team data fetching

**KanbanBoard Component:**
- Props: `teamId`, `userId`
- State: `tasks` (array), `draggedTask` (object)
- Methods: `handleTaskCreate()`, `handleTaskMove()`, `handleDragStart()`, `handleDrop()`

**Chat Component:**
- Props: `teamId`, `userId`
- State: `messages` (array), `newMessage` (string)
- Methods: `sendMessage()`, `subscribeToMessages()`

**TaskCard Component:**
- Props: `task` (object), `onMove` (function)
- State: None (stateless)
- Methods: Drag event handlers

## Data Models

### Appwrite Collections

**teams**
```javascript
{
  $id: string,           // Auto-generated
  name: string,          // Team name
  join_code: string,     // 6-character unique code
  owner_id: string,      // User ID of team creator
  created_at: datetime,  // Auto-generated
  updated_at: datetime   // Auto-generated
}
```

**team_members**
```javascript
{
  $id: string,           // Auto-generated
  team_id: string,       // Reference to teams collection
  user_id: string,       // Reference to users collection
  role: string,          // 'owner' | 'member'
  joined_at: datetime,   // Auto-generated
}
```

**tasks**
```javascript
{
  $id: string,           // Auto-generated
  team_id: string,       // Reference to teams collection
  title: string,         // Task title
  description: string,   // Task description (optional)
  status: string,        // 'todo' | 'in_progress' | 'blocked' | 'done'
  assigned_to: string,   // User ID (optional)
  created_by: string,    // User ID of creator
  created_at: datetime,  // Auto-generated
  updated_at: datetime   // Auto-generated
}
```

**messages**
```javascript
{
  $id: string,           // Auto-generated
  team_id: string,       // Reference to teams collection
  user_id: string,       // Reference to users collection
  content: string,       // Message content
  type: string,          // 'user' | 'system'
  created_at: datetime,  // Auto-generated
}
```

### Client-Side Data Flow

1. **Authentication Flow:**
   - User registers/logs in via Appwrite Auth
   - App checks if user belongs to a team
   - Redirects to team selection or dashboard accordingly

2. **Team Management Flow:**
   - Create team → Generate join code → Add user as owner to team_members
   - Join team → Validate code → Add user as member to team_members

3. **Real-Time Data Flow:**
   - Subscribe to tasks collection filtered by team_id
   - Subscribe to messages collection filtered by team_id
   - All updates propagate automatically via Appwrite Realtime

## Error Handling

### Client-Side Error Handling

**Authentication Errors:**
- Invalid credentials → Display user-friendly error message
- Network errors → Show retry option with offline indicator
- Session expiry → Redirect to login with context preservation

**Team Operations Errors:**
- Invalid join code → Clear error message with retry option
- Duplicate team names → Suggest alternatives
- Permission errors → Graceful degradation of features

**Real-Time Connection Errors:**
- Connection loss → Show reconnecting indicator
- Failed subscriptions → Automatic retry with exponential backoff
- Sync conflicts → Use Appwrite's last-write-wins resolution

### Error Boundaries

Implement React Error Boundaries at key levels:
- App-level boundary for catastrophic errors
- Dashboard-level boundary for feature-specific errors
- Component-level boundaries for isolated failures

## Testing Strategy

### Unit Testing
- Test individual components with React Testing Library
- Mock Appwrite SDK calls for isolated testing
- Focus on user interactions and state management

### Integration Testing
- Test complete user flows (register → join team → create task)
- Test real-time synchronization between multiple browser instances
- Verify responsive behavior across device sizes

### End-to-End Testing
- Automated tests for critical paths using Playwright or Cypress
- Manual testing on actual mobile devices
- Performance testing for real-time features under load

### CI/CD Testing Strategy
- Run unit tests on every commit
- Deploy to staging environment for integration testing
- Manual verification checklist before production deployment

## Performance Considerations

### Real-Time Optimization
- Limit message history to last 100 messages for initial load
- Implement pagination for task history if needed
- Use Appwrite's built-in query optimization

### Mobile Performance
- Lazy load non-critical components
- Optimize bundle size with Vite's tree shaking
- Use CSS transforms for smooth drag animations

### Caching Strategy
- Leverage Appwrite's built-in caching for static data
- Implement optimistic updates for better perceived performance
- Cache team and user data in React state/context