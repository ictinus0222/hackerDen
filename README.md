# HackerDen

A modern, hackathon-focused collaborative platform featuring comprehensive hackathon management, team coordination, advanced task tracking with drag-and-drop functionality, real-time communication, and engaging enhancement features including file sharing, gamification, and judge submissions.

## Features

### ✅ Implemented

#### 🎨 **Modern UI/UX Design**
- **Dark Theme Interface**: Comprehensive dark theme with consistent color palette and professional styling
- **Custom Design System**: Tailored color scheme with green accents and proper contrast ratios
- **Smooth Animations**: Fade-in effects, slide transitions, and hover states for enhanced user experience
- **Hidden Scrollbars**: Clean interface with hidden scrollbars while maintaining full scrolling functionality
- **Responsive Layout**: Adaptive design that works seamlessly across desktop, tablet, and mobile devices
- **Fixed Sidebar Navigation**: Always-visible navigation with proper viewport height and no scrolling
- **Enhanced Spacing**: Improved visual hierarchy with consistent padding, margins, and element spacing
- **Rounded Corners**: Smooth, modern button and component styling with 12px border radius
- **Progress Indicators**: Visual task completion progress bar in sidebar with color-coded status

#### 🏆 **Hackathon Management & Team Coordination**
- **User Authentication**: Secure registration, login, and session management
- **Hackathon Console**: Centralized dashboard showing all user's hackathons (ongoing, upcoming, completed)
- **Hackathon-Specific Dashboards**: Individual dashboards for each hackathon with team management
- **Team Creation**: Create teams with unique join codes and automatic ownership assignment
- **Team Management**: Join teams using invite codes with validation and duplicate prevention
- **Smart Routing**: Hackathon-focused navigation with UserHackathonConsole as the main landing page
- **Protected Routes**: Secure access to hackathon features with authentication guards
- **Team Leader Assignment**: Role-based permissions with team leaders able to assign tasks to any member
- **Status-Based Organization**: Hackathons grouped by status (ongoing, upcoming, completed) for better organization

#### 📋 **Advanced Task Management**
- **Kanban Board**: Four-column task board (To-Do, In Progress, Blocked, Done) with real-time updates
- **Task Creation**: Enhanced modal-based task creation with comprehensive form validation
- **Task Editing**: Full task editing functionality with role-based assignment permissions
- **Custom Dropdowns**: Consistent, theme-matching dropdown components for priority and assignment
- **Task Management**: Create, edit, delete, and organize tasks by status with priority levels and custom labels
- **Drag and Drop**: Full drag-and-drop support for moving tasks between columns (desktop and mobile)
- **Real-time Synchronization**: Instant task updates across all team members
- **Progress Tracking**: Task completion progress bar excluding blocked tasks from calculations
- **Visual Feedback**: Hover states, loading indicators, and smooth transitions

#### 💬 **Real-time Communication**
- **Team Chat**: Real-time messaging with dark theme integration and modern styling
- **User Avatars**: Colorful user avatars with initials and gradient backgrounds
- **Actual User Names**: Display of real team member names instead of generic placeholders
- **Message Styling**: Enhanced message bubbles with shadows, rings, and proper visual hierarchy
- **System Messages**: Automated task activity notifications with visual distinction
- **Message Management**: Send and receive messages with timestamps and user identification
- **Chat Setup Guide**: Automated setup assistance for Appwrite messages collection
- **Optimistic Updates**: Immediate message display with server confirmation

#### 🎯 **User Experience Enhancements**
- **Loading States**: Enhanced loading experience with contextual messages and spinners
- **Error Boundaries**: Graceful error handling with recovery options
- **Form Validation**: Comprehensive client-side validation with real-time feedback
- **Accessibility**: Proper ARIA labels, keyboard navigation, and screen reader support
- **Touch Optimization**: Mobile-friendly interactions with proper touch targets
- **Visual Feedback**: Consistent hover states, focus indicators, and transition effects

### 🚀 Enhancement Features (In Development)

#### 📁 **File Sharing & Collaboration**
- **File Upload System**: Support for images, PDFs, text files, and code files (up to 10MB)
- **File Library**: Team-shared file browser with preview capabilities
- **Annotation System**: Add comments and annotations to images and documents
- **Real-time Sync**: Live file updates and annotation notifications across team members

#### 💡 **Idea Management & Voting**
- **Idea Board**: Submit, discuss, and vote on project ideas and features
- **Democratic Voting**: Team-based voting system with real-time results
- **Idea Status Tracking**: Track ideas from submission to implementation
- **Task Integration**: Convert approved ideas directly into actionable tasks

#### 🎮 **Gamification & Achievements**
- **Point System**: Earn points for task completion, chat participation, and file sharing
- **Achievement Badges**: Unlock badges for milestones and team contributions
- **Celebration Effects**: Confetti animations and sound effects for accomplishments
- **Team Leaderboard**: Track individual and team progress with friendly competition

#### 🏆 **Judge Submission System**
- **Submission Builder**: Create comprehensive project submissions for judges
- **Public Pages**: Generate shareable, judge-friendly submission URLs
- **Auto-aggregation**: Automatically pull project data from tasks and team activity
- **Finalization System**: Lock submissions when hackathon judging begins

#### 📊 **In-App Polling**
- **Quick Polls**: Create team polls for decision-making and consensus building
- **Real-time Voting**: Live poll results with vote tracking and percentages
- **Poll History**: Track past decisions and convert winning options to tasks
- **Integration**: Seamless integration with chat and task management systems

#### 🤖 **System Bot & UX Enhancements**
- **Motivational Bot**: Friendly system bot with tips and encouragement
- **Easter Eggs**: Hidden features and fun interactions throughout the platform
- **Custom Reactions**: Emoji reactions for messages and tasks with custom emoji support
- **Enhanced Mobile**: Touch-optimized interactions and mobile-specific features

### 🚧 Future Roadmap
- **Advanced Analytics**: Team productivity insights and performance metrics
- **External Integrations**: GitHub, Slack, and other developer tool connections
- **Advanced Notifications**: Push notifications and customizable alert preferences
- **Team Templates**: Pre-configured team setups for different hackathon types

## Tech Stack

- **Frontend**: React 19 + Vite (Latest React features with fast development)
- **Styling**: Tailwind CSS (Custom design system with dark theme)
- **UI Components**: shadcn/ui with Radix UI primitives (Accessible, customizable components)
- **Backend**: Appwrite (Backend-as-a-Service with real-time capabilities and file storage)
- **Routing**: React Router DOM (Client-side routing with protected routes)
- **State Management**: React Context API (Global state for auth and team data)
- **Real-time**: Appwrite Realtime (Live updates for tasks, messages, and enhancements)
- **Icons**: Lucide React (Consistent SVG icon library)
- **Date Handling**: date-fns (Lightweight date formatting)
- **Rich Text**: React Markdown with syntax highlighting (For file annotations and descriptions)
- **File Storage**: Appwrite Storage (Secure file uploads with preview generation)

## Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- Appwrite instance (cloud or self-hosted)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd hackerden
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
Copy the example environment file and add your credentials:
```bash
cp .env.example .env.local
```

Then edit `.env.local` with your actual Appwrite credentials:
```env
VITE_APPWRITE_ENDPOINT=https://your-appwrite-endpoint
VITE_APPWRITE_PROJECT_ID=your-project-id
VITE_APPWRITE_DATABASE_ID=your-database-id
```

**Important**: Never commit `.env.local` to version control. It's automatically ignored by git.

4. Set up Appwrite:
Follow the setup guide in `docs/appwrite-setup.md` to configure your Appwrite instance.

5. Start the development server:
```bash
npm run dev
```

## Available Scripts

### Development
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

### Testing
- `npm run test` - Run tests in watch mode
- `npm run test:run` - Run tests once
- `npm run test:styling` - Run styling protection tests
- `npm run test:responsive` - Run responsive design tests

### Enhancement Setup
- `npm run setup:enhancements` - Set up enhancement features (collections, storage)
- `npm run setup:whiteboard` - Set up whiteboard feature
- `npm run setup:vault` - Set up team vault feature
- `npm run setup:documents` - Set up collaborative documents

### Utilities
- `npm run backup` - Create project backup
- `npm run backup:restore` - Restore from backup
- `npm run backup:cleanup` - Clean backup files

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ui/             # shadcn/ui base components (Button, Dialog, Card, etc.)
│   ├── AppwriteSetupGuide.jsx   # Appwrite setup instructions
│   ├── Chat.jsx                 # Real-time team chat interface with dark theme
│   ├── ErrorBoundary.jsx        # Error boundary for crash protection
│   ├── KanbanBoard.jsx          # Kanban board with full task management and hidden scrollbars
│   ├── Layout.jsx               # Main layout with fixed sidebar and responsive design
│   ├── LoadingSpinner.jsx       # Loading state component with animations
│   ├── Logo.jsx                 # HackerDen logo component with gradient styling
│   ├── MessageInput.jsx         # Message input form with dark theme styling
│   ├── MessageItem.jsx          # Individual message display with avatars and real names
│   ├── MessageList.jsx          # Scrollable message list with hidden scrollbars
│   ├── MessagesSetupGuide.jsx   # Messages collection setup guide
│   ├── MobileTabSwitcher.jsx    # Mobile tab navigation component
│   ├── ProgressBar.jsx          # Task completion progress bar component
│   ├── ProtectedRoute.jsx       # Route protection component
│   ├── Sidebar.jsx              # Fixed sidebar navigation with progress tracking
│   ├── TaskCard.jsx             # Individual task display with edit/delete actions
│   ├── TaskColumn.jsx           # Kanban column component with hidden scrollbars
│   ├── TaskModal.jsx            # Enhanced task creation/editing modal with custom dropdowns
│   └── TeamSelector.jsx         # Team creation/join selector
├── contexts/           # React contexts
│   ├── AuthContext.jsx          # User authentication state
│   ├── TeamContext.jsx          # Team membership and operations
│   └── HackathonNotificationContext.jsx  # Notification system
├── hooks/              # Custom React hooks
│   ├── useAuth.jsx              # Authentication hook
│   ├── useMessages.jsx          # Message data management hook
│   ├── useTasks.jsx             # Task data management hook
│   ├── useTeam.jsx              # Team operations hook
│   ├── useNotifications.jsx     # Notification management
│   └── useHackathonTeam.jsx     # Hackathon-specific team operations
├── lib/                # Third-party integrations
│   └── appwrite.js              # Appwrite configuration and utilities
├── pages/              # Page components
│   ├── Dashboard.jsx            # Main dashboard with responsive layout
│   ├── LoginPage.jsx            # User authentication page
│   ├── RegisterPage.jsx         # User registration page
│   ├── TeamCreationPage.jsx     # Team creation interface
│   └── TeamJoinPage.jsx         # Team joining interface
├── services/           # API services
│   ├── authService.js           # Authentication operations
│   ├── messageService.js        # Message management operations
│   ├── realtimeService.js       # Real-time subscription management
│   ├── taskService.js           # Task management operations
│   ├── teamMemberService.js     # Team member management with name caching
│   ├── teamService.js           # Team operations
│   ├── userNameService.js       # User name resolution and caching
│   ├── fileService.js           # File upload and annotation system (enhancement)
│   ├── ideaService.js           # Idea management and voting (enhancement)
│   ├── gamificationService.js   # Points and achievements (enhancement)
│   ├── submissionService.js     # Judge submission pages (enhancement)
│   ├── pollService.js           # In-app polling system (enhancement)
│   └── botService.js            # System bot and UX enhancements (enhancement)
├── utils/              # Utility functions and helpers
├── test/               # Test utilities and configurations
├── assets/             # Images, icons, static files
├── docs/               # Documentation
│   ├── enhancement-foundation.md    # Enhancement setup guide
│   ├── enhancement-features.md      # Comprehensive feature documentation
│   ├── enhancement-setup-guide.md   # Quick setup guide for enhancements
│   ├── appwrite-setup.md            # Backend setup guide
│   ├── dashboard-components.md      # Component documentation
│   └── development-guide.md         # Development workflow
├── scripts/            # Utility scripts
│   ├── setup-enhancements.js       # Enhancement collection and storage setup
│   ├── backup-utility.js           # Project backup system
│   └── workflow-demo.js            # Development workflow demonstration
├── .kiro/              # Kiro configuration and specifications
│   ├── specs/          # Project specifications
│   │   ├── hackerden-mvp/          # MVP requirements, design, and tasks
│   │   └── hackerden-enhancements/ # Enhancement requirements, design, and tasks
│   ├── settings/       # Kiro settings and configuration
│   └── steering/       # Development steering rules and guidelines
├── App.jsx             # Main app component
└── main.jsx            # Application entry point
```

## Modern UI/UX Design

### Dark Theme Interface
The application features a comprehensive dark theme with:

- **Consistent Color Palette**: Professional dark green theme with proper contrast ratios
- **Custom Design System**: Tailored colors defined in Tailwind config for consistency
- **Visual Hierarchy**: Enhanced spacing, typography, and component styling
- **Accessibility**: WCAG compliant contrast ratios and proper focus indicators

### Enhanced User Experience
- **Fixed Sidebar**: Always-visible navigation that never scrolls with page content
- **Hidden Scrollbars**: Clean interface with hidden scrollbars while maintaining functionality
- **Smooth Animations**: Fade-in effects, slide transitions, and hover states
- **Progress Tracking**: Visual task completion progress bar in sidebar
- **Rounded Corners**: Modern 12px border radius on buttons and components
- **Responsive Layout**: Adapts seamlessly from mobile to desktop

### Dashboard Layout

#### Responsive Design
The dashboard implements a responsive layout that adapts to different screen sizes:

- **Desktop (lg+)**: Fixed sidebar with main content area offset by sidebar width
- **Mobile/Tablet**: Collapsible sidebar with overlay for mobile navigation
- **Chat Integration**: Full-height chat with proper viewport constraints
- **Loading States**: Contextual loading spinners with descriptive messages
- **Error Handling**: Error boundaries that gracefully handle crashes with recovery options

### Layout Components

#### Layout Component
- **Header**: Contains app branding and user information with logout functionality
- **Main Content Area**: Responsive container for dashboard content
- **Navigation**: User-friendly navigation with proper spacing and styling

#### MobileTabSwitcher
- **Tab Navigation**: Clean tab interface for mobile users
- **Active States**: Visual indicators for the currently selected tab
- **Smooth Transitions**: Seamless switching between Kanban and Chat views

#### Error Boundary
- **Crash Protection**: Catches JavaScript errors in child components
- **Recovery Options**: Provides users with options to refresh and recover
- **Error Logging**: Logs errors to console for debugging purposes

#### Loading States
- **Contextual Messages**: Different loading messages based on the operation
- **Visual Feedback**: Animated spinners with consistent styling
- **User Experience**: Prevents confusion during data loading

### Team Dashboard Features
- **Team Information Header**: Displays team name, join code, and active status
- **Responsive Grid**: Automatically adjusts layout based on screen size
- **Component Placeholders**: Ready for Kanban and Chat implementation
- **Consistent Styling**: Uses Tailwind CSS for consistent design language

## Team Management Flow

### Team Routing Logic
The application implements smart routing based on user team membership:

- **Users with Teams**: Automatically redirected to team dashboard showing team information
- **Users without Teams**: Presented with team selection options (create or join)
- **Context-Aware Navigation**: Team state is managed globally and shared across components

### Team Creation Flow

1. **Registration/Login**: Users authenticate via email/password
2. **Team Selection**: Users without teams see the TeamSelector component
3. **Team Creation**: Users can create a new team with a unique name
4. **Join Code Generation**: System generates a 6-character alphanumeric join code
5. **Team Ownership**: Creator becomes team owner with full permissions
6. **Code Sharing**: Join code can be copied and shared with team members

### Team Joining Flow

1. **Join Code Entry**: Users enter a 6-character join code
2. **Code Validation**: System validates code format and existence
3. **Membership Check**: Prevents duplicate team memberships
4. **Team Assignment**: User is added as a team member
5. **Dashboard Redirect**: Automatic redirect to team dashboard

### Team Management Features
- **Smart Routing**: Automatic navigation based on team membership status
- **Team Context**: Global team state management with React Context
- **Form Validation**: Comprehensive validation for team names and join codes
- **Unique Join Code Generation**: Excludes confusing characters (0, O, I, 1)
- **Real-time Error Handling**: User-friendly error messages and loading states
- **Copy-to-Clipboard**: Join code sharing with visual feedback
- **Membership Management**: Automatic team membership creation and validation

### Team Leadership Features
- **Role-Based Access**: Team creators automatically become team leaders
- **Task Assignment**: Team leaders can assign tasks to any team member
- **Member Overview**: Visual distinction between team leaders and regular members
- **Assignment Control**: Regular members can only assign tasks to themselves
- **Leadership Indicators**: Clear visual indicators for team leader status
- **Permission Management**: Role-based UI elements and functionality

## Task Management System

### Kanban Board Features
- **Four-Column Layout**: To-Do, In Progress, Blocked, Done columns
- **Real-time Updates**: Live task synchronization across all team members
- **Responsive Design**: Adapts from single column (mobile) to four columns (desktop)
- **Task Creation**: Modal-based task creation with comprehensive form validation
- **Status Management**: Visual organization of tasks by current status
- **Team Filtering**: Automatic filtering of tasks by current team

### Task Creation Flow
1. **Access**: Click "Create Task" button on the Kanban board
2. **Form**: Fill out task title, description, priority, and labels
3. **Assignment**: Team leaders can assign to any member, regular members assign to themselves
4. **Validation**: Real-time form validation with error feedback
5. **Creation**: Task is created with 'todo' status and specified assignment
6. **Real-time Update**: New task appears immediately for all team members

### Task Editing Flow
1. **Access**: Hover over any task card and click the blue edit icon
2. **Modal**: Edit task modal opens with pre-populated form data
3. **Modify**: Update title, description, priority, labels, and assignment (team leaders only)
4. **Validation**: Real-time form validation with error feedback
5. **Update**: Changes are saved and synchronized in real-time
6. **Confirmation**: Updated task appears immediately for all team members

### Task Management Features
- **Full CRUD Operations**: Create, read, update, and delete tasks
- **Role-Based Assignment**: Team leaders can assign tasks to any team member
- **Form Validation**: Required field validation for title and description
- **Priority Levels**: Low, medium, and high priority with visual indicators
- **Label System**: Custom labels for task categorization and organization
- **Status Tracking**: Tasks are organized by status (todo, in_progress, blocked, done)
- **Drag and Drop**: Move tasks between columns using mouse (desktop) or touch (mobile)
- **Visual Feedback**: Drag operations and hover states with clear visual indicators
- **Real-time Sync**: All changes appear instantly across all team member devices
- **Error Handling**: Comprehensive error management with user-friendly messages
- **Loading States**: Visual feedback during all task operations

### Drag and Drop Features
- **Desktop Support**: Click and drag tasks between columns with visual feedback
- **Mobile Support**: Touch and hold to drag tasks on mobile devices
- **Visual Feedback**: Tasks become semi-transparent during drag, columns highlight on hover
- **Real-time Updates**: Status changes sync immediately across all team members
- **Error Handling**: Failed drag operations are handled gracefully
- **Touch Optimization**: Proper touch event handling prevents scrolling during drag

## Enhanced Chat System

### Real-time Chat Features
- **Dark Theme Integration**: Fully integrated dark theme with consistent styling
- **User Avatars**: Colorful gradient avatars with user initials for visual identification
- **Real User Names**: Displays actual team member names instead of generic placeholders
- **Enhanced Message Styling**: Modern message bubbles with shadows and subtle rings instead of borders
- **Team-Based Messaging**: Messages are filtered and displayed by team
- **Real-time Updates**: Live message synchronization using Appwrite subscriptions
- **Message Input**: Dark-themed input with green accent colors and smooth transitions
- **Auto-scroll**: Automatically scrolls to latest messages with hidden scrollbars
- **Optimistic Updates**: Messages appear immediately with server confirmation
- **Message Validation**: Client and server-side validation prevents empty messages
- **Loading Indicators**: Visual feedback during message transmission
- **Viewport Fitting**: Chat properly fits within viewport with scrollable message area

### Chat Components
- **Chat**: Main chat interface with message list and input form
- **MessageList**: Scrollable message display with loading states and empty state handling
- **MessageInput**: Message input form with Enter key support and loading spinner
- **MessageItem**: Individual message display with user info, timestamps, and message types
- **MessagesSetupGuide**: Setup assistance for Appwrite messages collection

### Message Management Features
- **Form Validation**: Prevents empty and whitespace-only message submission
- **User Identification**: Shows "You" for current user's messages vs. "Team Member" for others
- **Timestamp Formatting**: Human-readable time display using date-fns
- **Message Types**: Support for user messages and system notifications
- **Error Handling**: Comprehensive error management with setup guidance and recovery
- **Loading States**: Visual feedback during message operations with spinner animations
- **Keyboard Support**: Enter key to send, proper focus management
- **Responsive Design**: Adapts to mobile and desktop layouts

### Message Sending Process
1. **Input Validation**: Client-side validation prevents empty messages
2. **Optimistic Update**: Message appears immediately in chat
3. **Server Transmission**: Message sent to Appwrite with error handling
4. **Real-time Confirmation**: Server message received via subscription
5. **Duplicate Prevention**: Optimistic message removed when real message arrives

### Task-Chat Integration
The chat system automatically generates system messages for task activities:

- **Task Creation**: "📝 [Creator] created a new task: '[Title]'" (Blue theme)
- **Status Changes**: "🔄 Task '[Title]' moved to [Status]" (Green theme)
- **Task Completion**: "✅ Task completed: '[Title]'" (Green theme)

**Integration Features:**
- **Automatic Generation**: System messages appear without manual intervention
- **Visual Distinction**: Different colors and icons for different message types
- **Real-time Sync**: Messages appear instantly across all team members
- **Graceful Degradation**: Task operations continue even if messaging fails
- **Activity Timeline**: Creates a unified activity feed in chat

### Chat Flow
1. **Access**: Chat is available in the dashboard alongside the Kanban board
2. **Message Display**: All team messages are displayed in chronological order
3. **Send Message**: Type message and press Enter or click Send button
4. **Real-time Updates**: New messages appear instantly for all team members
5. **Auto-scroll**: Chat automatically scrolls to show latest messages
6. **System Messages**: Task activities automatically generate system messages
7. **Error Recovery**: Setup guide appears for collection configuration issues

## Architecture Components

### Context Providers
- **AuthContext**: Manages user authentication state and methods
- **TeamContext**: Manages team membership state and team operations

### Custom Hooks
- **useAuth**: Provides access to authentication context and methods
- **useTeam**: Provides access to team context, membership status, and team operations

### Key Components
- **TeamSelector**: Displays create/join options for users without teams
- **ProtectedRoute**: Ensures authenticated access to protected pages
- **Dashboard**: Smart dashboard that adapts based on team membership

### Routing Strategy
The application uses conditional routing based on team membership:
```javascript
// Users with teams see team dashboard
{hasTeam ? <TeamDashboard /> : <TeamSelector />}
```

### Team Context API
The `useTeam` hook provides the following methods and state:

```javascript
const {
  team,           // Current user's team object (null if no team)
  loading,        // Loading state for team operations
  error,          // Error message from team operations
  hasTeam,        // Boolean indicating if user has a team
  createTeam,     // Function to create a new team
  joinTeam,       // Function to join a team by code
  refreshTeam     // Function to refresh team data
} = useTeam();
```

## Database Schema

### MVP Collections

#### teams
- `name` (string): Team name
- `joinCode` (string): Unique 6-character join code
- `ownerId` (string): User ID of team owner
- `createdAt` (datetime): Creation timestamp
- `updatedAt` (datetime): Last update timestamp

#### team_members
- `teamId` (string): Reference to team
- `userId` (string): Reference to user
- `role` (string): 'owner' or 'member'
- `joinedAt` (datetime): Join timestamp

#### tasks
- `teamId` (string): Reference to team
- `title` (string): Task title
- `description` (string): Task description
- `status` (string): Task status ('todo', 'in_progress', 'blocked', 'done')
- `assignedTo` (string): User ID of assigned team member
- `createdBy` (string): User ID of task creator
- `createdAt` (datetime): Creation timestamp
- `updatedAt` (datetime): Last update timestamp

#### messages
- `teamId` (string): Reference to team
- `userId` (string): Reference to user (null for system messages)
- `content` (string): Message content
- `type` (string): Message type ('user', 'system', 'task_created', 'task_status_changed')
- `createdAt` (datetime): Creation timestamp
- `updatedAt` (datetime): Last update timestamp

### Enhancement Collections

#### files
- `teamId` (string): Reference to team
- `uploadedBy` (string): User ID of uploader
- `fileName` (string): Original file name
- `fileType` (string): MIME type
- `fileSize` (number): File size in bytes
- `storageId` (string): Appwrite Storage file ID
- `previewUrl` (string): Generated preview URL
- `annotationCount` (number): Number of annotations
- `createdAt` (datetime): Upload timestamp
- `updatedAt` (datetime): Last update timestamp

#### file_annotations
- `fileId` (string): Reference to file
- `userId` (string): User ID of annotator
- `content` (string): Annotation text
- `position` (object): Annotation position {x, y, width?, height?}
- `type` (string): Annotation type ('point', 'area', 'line')
- `createdAt` (datetime): Creation timestamp

#### ideas
- `teamId` (string): Reference to team
- `createdBy` (string): User ID of creator
- `title` (string): Idea title
- `description` (string): Idea description
- `tags` (array): Idea tags for categorization
- `status` (string): Idea status ('submitted', 'approved', 'in_progress', 'completed', 'rejected')
- `voteCount` (number): Total vote count
- `createdAt` (datetime): Creation timestamp
- `updatedAt` (datetime): Last update timestamp

#### idea_votes
- `ideaId` (string): Reference to idea
- `userId` (string): User ID of voter
- `createdAt` (datetime): Vote timestamp

#### user_points
- `userId` (string): Reference to user
- `teamId` (string): Reference to team
- `totalPoints` (number): Total points earned
- `pointsBreakdown` (object): Points by category {tasksCompleted, messagesPosted, filesUploaded, ideasSubmitted, votesGiven}
- `updatedAt` (datetime): Last update timestamp

#### achievements
- `userId` (string): Reference to user
- `achievementType` (string): Type of achievement
- `achievementName` (string): Display name
- `description` (string): Achievement description
- `iconUrl` (string): Achievement icon URL
- `pointsAwarded` (number): Points awarded for achievement
- `unlockedAt` (datetime): Unlock timestamp

#### submissions
- `teamId` (string): Reference to team
- `title` (string): Project title
- `description` (string): Project description
- `techStack` (array): Technologies used
- `challenges` (string): Challenges faced
- `accomplishments` (string): What was accomplished
- `futureWork` (string): Future improvements
- `demoUrl` (string): Live demo URL
- `repositoryUrl` (string): Code repository URL
- `isFinalized` (boolean): Whether submission is locked
- `publicUrl` (string): Public judge access URL
- `createdAt` (datetime): Creation timestamp
- `updatedAt` (datetime): Last update timestamp

#### polls
- `teamId` (string): Reference to team
- `createdBy` (string): User ID of creator
- `question` (string): Poll question
- `options` (array): Poll options
- `allowMultiple` (boolean): Allow multiple selections
- `expiresAt` (datetime): Poll expiration time
- `isActive` (boolean): Whether poll is active
- `totalVotes` (number): Total vote count
- `createdAt` (datetime): Creation timestamp

#### poll_votes
- `pollId` (string): Reference to poll
- `userId` (string): User ID of voter
- `selectedOptions` (array): Selected option indices
- `createdAt` (datetime): Vote timestamp

#### reactions
- `targetId` (string): ID of target (message or task)
- `targetType` (string): Type of target ('message', 'task')
- `userId` (string): User ID of reactor
- `emoji` (string): Emoji or custom emoji ID
- `isCustom` (boolean): Whether emoji is custom
- `createdAt` (datetime): Reaction timestamp

### Storage Buckets

#### team-files
- **Purpose**: Team file uploads and sharing
- **Size Limit**: 10MB per file
- **Supported Types**: Images, PDFs, text files, code files
- **Permissions**: Team-based read/write access

#### custom-emoji
- **Purpose**: Custom emoji and sticker uploads
- **Size Limit**: 1MB per file
- **Supported Types**: PNG, GIF, WebP images
- **Permissions**: Team-based read/write access

## Documentation

### Additional Documentation

#### Enhancement Features
- **Enhancement Features**: `docs/enhancement-features.md` - Comprehensive guide to all enhancement features
- **Enhancement Setup Guide**: `docs/enhancement-setup-guide.md` - Quick setup guide for enhancement features
- **Enhancement Foundation**: `docs/enhancement-foundation.md` - Technical foundation and architecture

#### MVP Documentation
- **Appwrite Setup**: `docs/appwrite-setup.md` - Backend configuration guide
- **Dashboard Components**: `docs/dashboard-components.md` - Detailed component documentation
- **Development Guide**: `docs/development-guide.md` - Development workflow and best practices
- **Task Editing Functionality**: `docs/task-editing-functionality.md` - Complete task editing system documentation
- **Task Management Quick Reference**: `docs/task-management-quick-reference.md` - Quick usage guide for task operations
- **Messaging System**: `docs/messaging-system.md` - Complete messaging system documentation
- **Drag and Drop Implementation**: `docs/drag-drop-implementation.md` - Complete drag and drop technical guide
- **Drag and Drop Quick Reference**: `docs/drag-drop-quick-reference.md` - Quick usage guide for drag and drop

## Contributing

1. Follow the existing code style and patterns
2. Run `npm run lint` before committing
3. Ensure all builds pass with `npm run build`
4. Update documentation for new features
5. Refer to component documentation in `docs/` for implementation details

## Development Workflow

This project follows a spec-driven development approach:

### MVP Foundation
- Requirements: `.kiro/specs/hackerden-mvp/requirements.md`
- Design: `.kiro/specs/hackerden-mvp/design.md`
- Tasks: `.kiro/specs/hackerden-mvp/tasks.md`

### Enhancement Features
- Requirements: `.kiro/specs/hackerden-enhancements/requirements.md`
- Design: `.kiro/specs/hackerden-enhancements/design.md`
- Tasks: `.kiro/specs/hackerden-enhancements/tasks.md`

### Architecture Principles
- **shadcn/ui First**: All new components use shadcn/ui primitives exclusively
- **MVP Compatibility**: Enhancements integrate seamlessly without breaking existing functionality
- **Progressive Enhancement**: Features degrade gracefully when disabled or unavailable
- **Mobile-First**: All features optimized for mobile and desktop experiences
- **Real-time by Default**: Live updates across all enhancement features

## License

This project is licensed under the MIT License.
