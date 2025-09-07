# HackerDen

A modern, hackathon-focused collaborative platform that provides comprehensive team coordination and project management. Built with React 19 and Appwrite, HackerDen offers hackathon management, real-time team collaboration, advanced task tracking, file sharing, and judge submission systems.

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
- **User Authentication**: Secure OAuth authentication with Google and GitHub
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

### 🚀 Enhancement Features (Foundation Complete, Core Features Implemented)

The HackerDen Enhancement Suite provides essential collaboration features for hackathon teams. The foundation is complete with Appwrite collections and storage buckets configured, and core enhancement features are now implemented and ready for use.

#### 📁 **File Sharing & Collaboration System**
- **File Upload & Storage**: Support for images, PDFs, text files, and code files (up to 10MB per file)
- **Team File Library**: Shared file browser with preview capabilities and metadata tracking
- **Real-time Synchronization**: Live file updates across all team members
- **Syntax Highlighting**: Code file preview with language-specific highlighting for development files



#### 🏆 **Judge Submission System**
- **Comprehensive Submission Builder**: Project description, tech stack, challenges, accomplishments, future work
- **Public Judge Pages**: Generate shareable URLs accessible without authentication for easy judge access
- **Auto-aggregation**: Automatically pull project data from completed tasks and uploaded files
- **Finalization System**: Lock submissions when hackathon judging begins to prevent further edits



#### 📱 **Enhanced Mobile Experience**
- **Touch-Optimized Interactions**: Large touch targets, swipe gestures, and long-press functionality
- **Camera Integration**: Direct photo upload from mobile camera for file sharing
- **Auto-Save Forms**: Prevent data loss on mobile with continuous form saving

## Enhancement Development Status

### ✅ Foundation Complete
- [x] **Enhancement Architecture**: All 10 Appwrite collections and 2 storage buckets configured
- [x] **Service Layer**: Complete service files with comprehensive error handling and real-time integration
- [x] **shadcn/ui Integration**: Component library fully configured for consistent enhancement UI
- [x] **Setup Scripts**: Automated enhancement setup with comprehensive testing and validation
- [x] **MVP Integration Points**: Chat notifications, task conversion, and team-scoped data

### ✅ Core Features Implemented
- [x] **File Sharing System**: Complete upload and preview system with EnhancedFileService
- [x] **Judge Submission Pages**: Builder interface and public submission pages with auto-save
- [x] **Error Handling**: Comprehensive error boundaries, retry mechanisms, and offline support
- [x] **Feature Flags**: Dynamic feature management with user-level controls

### 🚧 Currently Implementing
- [ ] **Real-time Integration**: Appwrite subscriptions for live updates across all features
- [ ] **Mobile Optimization**: Touch interactions and responsive enhancement components
- [ ] **Advanced Analytics**: Team productivity insights and performance metrics

### 🔮 Future Roadmap
- **External Integrations**: GitHub, Slack, and other developer tool connections
- **Advanced Notifications**: Push notifications and customizable alert preferences
- **Team Templates**: Pre-configured team setups for different hackathon types
- **AI Features**: Smart suggestions and automated task creation
- **Advanced File Preview**: PDF viewer and 3D model support

## Tech Stack

### Core Framework
- **Frontend**: React 19 + Vite (Latest React features with fast development and HMR)
- **Styling**: Tailwind CSS 4.x (Custom design system with dark theme and animations)
- **UI Components**: shadcn/ui with Radix UI primitives (Accessible, customizable components)
- **Backend**: Appwrite (Backend-as-a-Service with real-time capabilities and file storage)

### State & Data Management
- **Routing**: React Router DOM 7.x (Client-side routing with protected routes)
- **State Management**: React Context API (Global state for auth, team, and feature data)
- **Real-time**: Appwrite Realtime (Live updates for tasks, messages, and enhancements)
- **Forms**: React Hook Form (Performant forms with validation)
- **Error Handling**: React Error Boundary (Comprehensive error management)

### Enhancement Features
- **File Storage**: Appwrite Storage (Secure file uploads with preview generation)
- **Rich Text**: React Markdown with remark-gfm and rehype-highlight (Markdown rendering)
- **Syntax Highlighting**: highlight.js (Code file preview with language detection)
- **Notifications**: Sonner (Toast notifications with dark theme support)
- **Icons**: Lucide React (Consistent SVG icon library with 1000+ icons)
- **Date Handling**: date-fns (Lightweight date formatting and manipulation)

### Development & Testing
- **Build Tool**: Vite 7.x (Fast build tool with React plugin and path aliases)
- **Testing**: Vitest + React Testing Library (Unit and integration testing)
- **Linting**: ESLint 9.x (Code quality with React hooks and refresh plugins)
- **Package Manager**: npm (Dependency management with package-lock.json)
- **Environment**: dotenv (Environment variable management)

### Performance & UX
- **Animations**: CSS animations and Tailwind transitions (Performance-optimized)
- **Responsive Design**: Mobile-first with Tailwind breakpoints
- **Accessibility**: WCAG compliant with proper ARIA implementation
- **Progressive Enhancement**: Features degrade gracefully
- **Offline Support**: Local storage caching with sync capabilities

## Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- Appwrite instance (cloud or self-hosted)

### Installation

1. **Clone the repository:**
```bash
git clone <repository-url>
cd hackerden
```

2. **Install dependencies:**
```bash
npm install
```

3. **Set up environment variables:**
Copy the example environment file and configure your Appwrite credentials:
```bash
cp .env.example .env
```

Edit `.env` with your Appwrite project details:
```env
# Core Appwrite Configuration (Required)
VITE_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
VITE_APPWRITE_PROJECT_ID=your-project-id
VITE_APPWRITE_DATABASE_ID=your-database-id

# Server API Key (Required for setup scripts)
APPWRITE_API_KEY=your-server-api-key

# Public URL Configuration (Required for production)
# Set this to your production domain for correct submission URLs and OAuth callbacks
VITE_PUBLIC_URL=https://hackerden.netlify.app

# Enhancement Feature Flags (Optional)
VITE_ENABLE_FILE_SHARING=true
VITE_ENABLE_ANIMATIONS=true
```

**Security Note**: Never commit `.env` to version control. It's automatically ignored by git.

4. **Set up Appwrite backend:**
Create the required database collections and storage buckets:
```bash
# Set up core MVP collections (teams, tasks, messages, etc.)
# Follow the guide in docs/appwrite-setup.md

# Set up enhancement collections and storage buckets
npm run setup:enhancements

# Verify database schema
npm run validate:schema

# Test database connectivity
npm run test:database
```

5. **Verify installation:**
Run tests to ensure everything is working correctly:
```bash
# Run all tests
npm run test:run

# Test enhancement services specifically
npm run test:run -- src/services/__tests__/enhancementServices.test.js

# Test UI components
npm run test:run -- src/components/__tests__/
```

6. **Start development server:**
```bash
npm run dev
```

The application will be available at `http://localhost:5173` with hot module replacement enabled.

### Quick Start Guide

1. **Register an account** at `/register`
2. **Create or join a hackathon** from the console
3. **Create or join a team** using the team selector
4. **Start collaborating** with tasks, chat, and enhancement features

### Troubleshooting Installation

**Common Issues:**
- **Appwrite connection errors**: Verify your endpoint and project ID
- **Permission errors**: Ensure your API key has database and storage permissions
- **Setup script failures**: Check that your database exists in Appwrite Console
- **Missing collections**: Run `npm run setup:enhancements` to create required collections

**Getting Help:**
- Check `docs/enhancement-setup-guide.md` for detailed setup instructions
- Review `docs/troubleshooting-*.md` files for specific issues
- Ensure Node.js version 18+ is installed
- Verify npm dependencies are correctly installed

## Feature Flag System

HackerDen includes a dynamic feature flag system that allows for controlled rollout and testing of enhancement features:

### Feature Management
- **Dynamic Control**: Enable/disable features without code changes
- **User-Level Flags**: Individual user feature preferences
- **Team-Level Flags**: Team-specific feature availability
- **Gradual Rollout**: Controlled feature deployment and testing
- **A/B Testing**: Support for feature experimentation
- **Performance Modes**: Lite modes for slower devices or connections

### Available Feature Flags
```env
VITE_ENABLE_FILE_SHARING=true      # File upload and preview system
VITE_ENABLE_ANIMATIONS=true        # UI transitions and effects
```

### Feature Flag Management
Access the feature flag management interface at `/feature-flags` to:
- View current feature status
- Toggle features for testing
- Monitor feature usage and performance
- Configure user-specific preferences

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
- `npm run setup:enhancements` - Set up all enhancement features (collections, storage buckets, permissions)
- `npm run check:storage` - Verify storage bucket configuration and permissions
- `npm run validate:schema` - Validate database schema and collection setup
- `npm run test:database` - Test database operations and connectivity
- `npm run setup:whiteboard` - Set up whiteboard feature (future enhancement)
- `npm run setup:vault` - Set up team vault feature (future enhancement)
- `npm run setup:documents` - Set up collaborative documents (future enhancement)

### Utilities
- `npm run backup` - Create project backup
- `npm run backup:restore` - Restore from backup
- `npm run backup:cleanup` - Clean backup files

## Architecture & Design Patterns

### Service Layer Architecture
HackerDen follows a clean service layer pattern for maintainable and testable code:

- **BaseService**: Common functionality for all services (error handling, validation)
- **Feature Services**: Specialized services for each major feature (tasks, files, ideas, etc.)
- **Error Handling**: Comprehensive error boundaries and retry mechanisms
- **Offline Support**: Local caching and sync capabilities for resilient operation

### Component Architecture
- **Atomic Design**: Components organized by complexity (atoms, molecules, organisms)
- **shadcn/ui Foundation**: Consistent design system with Radix UI primitives
- **Responsive First**: Mobile-first design with progressive enhancement
- **Accessibility**: WCAG 2.1 AA compliance with proper ARIA implementation

### State Management Patterns
- **Context Providers**: Global state for authentication, teams, and notifications
- **Custom Hooks**: Encapsulated business logic with reusable state management
- **Real-time Integration**: Appwrite subscriptions with automatic cleanup
- **Error Boundaries**: Graceful error handling with recovery mechanisms

### Development Patterns
- **Feature Flags**: Dynamic feature control for gradual rollouts
- **Progressive Enhancement**: Core functionality works without enhancements
- **Offline-First**: Local storage with background sync capabilities
- **Performance Optimization**: Lazy loading, code splitting, and efficient rendering

## Project Structure

```
src/
├── components/          # Reusable UI components (80+ components)
│   ├── ui/             # shadcn/ui base components (Button, Dialog, Card, etc.)
│   ├── AppwriteSetupGuide.jsx   # Appwrite setup instructions
│   ├── KanbanBoard.jsx          # Kanban board with full task management
│   ├── Layout.jsx               # Main layout with fixed sidebar and responsive design
│   ├── HackathonLayout.jsx      # Hackathon-specific layout with navigation
│   ├── ConsoleLayout.jsx        # User console layout for hackathon management
│   ├── ErrorBoundary.jsx        # Error boundary for crash protection
│   ├── EnhancementErrorBoundary.jsx # Advanced error handling for enhancements
│   ├── LoadingSpinner.jsx       # Loading state component with animations
│   ├── EnhancementLoadingStates.jsx # Feature-specific skeleton loaders
│   ├── Logo.jsx                 # HackerDen logo component with gradient styling
│   ├── MessageInput.jsx         # Message input form with dark theme styling
│   ├── MessageItem.jsx          # Individual message display with avatars and real names
│   ├── MessageList.jsx          # Scrollable message list with hidden scrollbars
│   ├── MobileTabSwitcher.jsx    # Mobile tab navigation component
│   ├── ProgressBar.jsx          # Task completion progress bar component
│   ├── ProtectedRoute.jsx       # Route protection component
│   ├── Sidebar.jsx              # Fixed sidebar navigation with progress tracking
│   ├── HackathonSidebar.jsx     # Hackathon-specific sidebar with enhancement features
│   ├── TaskCard.jsx             # Individual task display with edit/delete actions
│   ├── TaskColumn.jsx           # Kanban column component with hidden scrollbars
│   ├── TaskModal.jsx            # Enhanced task creation/editing modal
│   ├── TeamSelector.jsx         # Team creation/join selector
│   ├── HackathonTeamSelector.jsx # Hackathon-specific team selection
│   ├── FileUpload.jsx           # File upload with progress and validation
│   ├── FileLibrary.jsx          # Team file browser and management
│   ├── FilePreview.jsx          # File preview system
│   ├── SubmissionBuilder.jsx    # Judge submission form builder
│   ├── SubmissionPreview.jsx    # Submission preview and finalization
│   ├── FeatureFlagManager.jsx   # Dynamic feature flag controls
│   ├── EnhancementRetryMechanisms.jsx # Advanced retry and error recovery
│   └── ThemeProvider.jsx        # Dark theme provider with system detection
├── contexts/           # React contexts
│   ├── AuthContext.jsx          # User authentication state
│   ├── TeamContext.jsx          # Team membership and operations
│   └── HackathonNotificationContext.jsx  # Notification system
├── hooks/              # Custom React hooks (15+ hooks)
│   ├── useAuth.jsx              # Authentication hook
│   ├── useMessages.jsx          # Message data management hook
│   ├── useTasks.jsx             # Task data management hook
│   ├── useTeam.jsx              # Team operations hook
│   ├── useNotifications.jsx     # Notification management
│   ├── useHackathonTeam.jsx     # Hackathon-specific team operations
│   ├── useFeatureFlags.jsx      # Dynamic feature flag management
│   ├── useEnhancementErrorHandling.jsx # Comprehensive error handling
│   ├── useNetworkErrorHandling.jsx # Network-specific error handling
│   ├── useValidationErrorHandling.jsx # Form validation with custom rules
│   ├── useFileUpload.jsx        # File upload with progress tracking
│   └── useSubmissions.jsx       # Judge submission management
├── lib/                # Third-party integrations
│   └── appwrite.js              # Appwrite configuration and utilities
├── pages/              # Page components (20+ pages)
│   ├── LoginPage.jsx            # User authentication page
│   ├── RegisterPage.jsx         # User registration page
│   ├── OAuthCallbackPage.jsx    # OAuth authentication callback
│   ├── UserHackathonConsole.jsx # Main hackathon console (landing page)
│   ├── CreateHackathonPage.jsx  # Hackathon creation interface
│   ├── HackathonDashboardContent.jsx # Individual hackathon dashboard
│   ├── TeamCreationPage.jsx     # Team creation interface
│   ├── TeamJoinPage.jsx         # Team joining interface
│   ├── WhiteboardPage.jsx       # Collaborative whiteboard (future)
│   ├── PublicSubmissionPage.jsx # Public judge submission pages
│   ├── FeatureFlagPage.jsx      # Feature flag management interface
│   └── [Demo Pages]             # Various demo and test pages
├── services/           # API services
│   ├── authService.js           # Authentication operations
│   ├── messageService.js        # Message management operations
│   ├── realtimeService.js       # Real-time subscription management
│   ├── taskService.js           # Task management operations
│   ├── teamMemberService.js     # Team member management with name caching
│   ├── teamService.js           # Team operations
│   ├── userNameService.js       # User name resolution and caching
│   ├── hackathonService.js      # Hackathon management and operations
│   ├── vaultService.js          # Team vault and credential management
│   ├── fileService.js           # File upload and storage system
│   ├── EnhancedFileService.js   # Advanced file operations with error handling
│   ├── submissionService.js     # Judge submission pages and public URLs
│   ├── featureFlagService.js    # Dynamic feature flag management
│   ├── EnhancementErrorReporting.js # Comprehensive error reporting system
│   ├── EnhancementOfflineService.js # Offline support and caching
│   └── BaseService.js           # Base service class with common functionality
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
│   ├── setup-enhancements.js       # Enhancement collection and storage setup (10 collections, 2 storage buckets)
│   ├── backup-utility.js           # Project backup system
│   ├── workflow-demo.js            # Development workflow demonstration
│   ├── setup-vault.js              # Team vault feature setup (future enhancement)
│   ├── setup-whiteboard.js         # Whiteboard feature setup (future enhancement)
│   └── setup-collaborative-documents.js  # Collaborative documents setup (future enhancement)
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

## Comprehensive Error Handling System

### Advanced Error Management
HackerDen includes a sophisticated error handling system that ensures graceful degradation and excellent user experience even when things go wrong:

- **Feature-Specific Error Boundaries**: Intelligent error categorization for file sharing and submissions
- **Retry Mechanisms**: Exponential backoff with user-controlled retry options and progress visualization
- **Offline Resilience**: Local storage caching with operation queueing for sync when back online
- **User-Friendly Feedback**: Clear error messages with recovery suggestions and actionable steps
- **Error Analytics**: Comprehensive error reporting and monitoring with health metrics
- **Graceful Fallbacks**: Basic functionality preservation when enhancement features fail

### Error Handling Features
- **Network Error Recovery**: Intelligent connection testing and retry logic
- **File Upload Validation**: Size and type validation with detailed error feedback
- **Form Validation**: Real-time validation with custom rules and error display
- **Batch Operation Support**: Individual error tracking for multiple operations
- **Performance Monitoring**: Memory management and resource optimization
- **Security Features**: Sensitive data filtering and user privacy protection

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
- `createdAt` (datetime): Upload timestamp
- `updatedAt` (datetime): Last update timestamp



#### submissions
- `teamId` (string): Reference to team
- `title` (string): Project title
- `description` (string): Project description
- `techStack` (array): Array of technology strings
- `challenges` (string): Challenges faced during development
- `accomplishments` (string): Key accomplishments and features
- `futureWork` (string): Planned future improvements
- `demoUrl` (string): Live demo URL
- `repositoryUrl` (string): Source code repository URL
- `isFinalized` (boolean): Whether submission is locked for judging
- `publicUrl` (string): Public judge-accessible URL
- `createdAt` (datetime): Creation timestamp
- `updatedAt` (datetime): Last update timestamp


### Storage Buckets

#### team-files
- **Purpose**: Team file uploads and sharing
- **Size Limit**: 10MB per file
- **Supported Types**: Images (JPG, PNG, GIF, WebP, SVG), Documents (PDF, TXT, MD, CSV), Code (JS, TS, JSX, TSX, CSS, HTML, XML, JSON)
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

We welcome contributions to HackerDen! This project is designed to be developer-friendly and follows clear patterns for easy contribution.

### Quick Start for Contributors

1. **Fork and Clone**
```bash
git clone https://github.com/your-username/hackerden.git
cd hackerden
npm install
```

2. **Set Up Development Environment**
```bash
cp .env.example .env
# Add your Appwrite credentials
npm run setup:enhancements
npm run test:run
```

3. **Start Development**
```bash
npm run dev
```

### Development Guidelines

#### Code Style
- **Components**: Use functional components with hooks exclusively
- **UI Library**: Use shadcn/ui components only - no other UI libraries
- **Styling**: Tailwind CSS with existing design tokens and dark theme
- **State Management**: React Context for global state, local state for components
- **Error Handling**: Always wrap async operations with proper error boundaries
- **Testing**: Add tests for new features and maintain existing test coverage

#### Architecture Patterns
- **Service Layer**: Follow existing service patterns with BaseService inheritance
- **Progressive Enhancement**: Core functionality must work without enhancements
- **Mobile-First**: Design for mobile, enhance for desktop
- **Accessibility**: Maintain WCAG 2.1 AA compliance
- **Performance**: Use React.memo, useMemo, and lazy loading appropriately

#### Feature Development
- **Feature Flags**: Use feature flags for new enhancement features
- **Real-time**: Integrate with Appwrite subscriptions for live updates
- **Offline Support**: Consider offline scenarios and local caching
- **Error Recovery**: Implement retry mechanisms and graceful fallbacks

### Testing Requirements

```bash
# Run all tests
npm run test

# Test specific areas
npm run test:run -- src/services/__tests__/
npm run test:run -- src/components/__tests__/

# Test styling and responsiveness
npm run test:styling
npm run test:responsive

# Lint code
npm run lint

# Build for production
npm run build
```

### Contribution Areas

**High Priority:**
- Real-time integration for enhancement features
- Mobile touch interactions and gestures
- Performance optimizations
- Accessibility improvements
- Cross-browser compatibility

**Enhancement Features:**
- Advanced file preview (PDF viewer, code editor)
- Team analytics and productivity insights
- External integrations (GitHub, Slack, Discord)
- AI-powered suggestions and automation
- Advanced notification system

**Documentation:**
- API documentation improvements
- Component usage examples
- Setup and deployment guides
- Troubleshooting guides

### Pull Request Process

1. **Create Feature Branch**
```bash
git checkout -b feature/your-feature-name
```

2. **Development Checklist**
- [ ] Follow existing code patterns and style
- [ ] Add or update tests for your changes
- [ ] Ensure all tests pass (`npm run test`)
- [ ] Lint your code (`npm run lint`)
- [ ] Test mobile responsiveness
- [ ] Verify accessibility compliance
- [ ] Update documentation if needed

3. **Submit Pull Request**
- Clear description of changes
- Screenshots for UI changes
- Test results and coverage
- Breaking changes noted

### Getting Help

- **Documentation**: Check `docs/` folder for detailed guides
- **Issues**: Search existing issues before creating new ones
- **Discussions**: Use GitHub Discussions for questions and ideas
- **Code Examples**: Review existing components and services for patterns

### Development Resources

- **Component Library**: [shadcn/ui documentation](https://ui.shadcn.com/)
- **Backend**: [Appwrite documentation](https://appwrite.io/docs)
- **Styling**: [Tailwind CSS documentation](https://tailwindcss.com/docs)
- **Testing**: [Vitest documentation](https://vitest.dev/)
- **React**: [React 19 documentation](https://react.dev/)

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

## Project Vision

HackerDen aims to provide essential tools for effective hackathon collaboration. We believe that great tools should work reliably and help teams focus on building amazing projects. Our platform provides the core features teams need to organize, communicate, and showcase their work effectively.

### Core Values
- **Developer Experience**: Tools should be intuitive and powerful
- **Accessibility**: Everyone should be able to participate fully
- **Performance**: Fast, responsive, and reliable operation
- **Community**: Open source collaboration and knowledge sharing
- **Innovation**: Pushing the boundaries of what collaboration tools can be

## Acknowledgments

- **[shadcn/ui](https://ui.shadcn.com/)**: For the excellent component library and design system that makes our UI consistent and accessible
- **[Appwrite](https://appwrite.io/)**: For the powerful backend-as-a-service platform that handles our data, authentication, and real-time features
- **[React Team](https://react.dev/)**: For React 19's amazing new features and performance improvements
- **[Tailwind CSS](https://tailwindcss.com/)**: For the utility-first CSS framework that powers our responsive design
- **[Vite](https://vitejs.dev/)**: For the lightning-fast build tool that makes development a joy
- **Contributors**: Thanks to all contributors who help make HackerDen better for the hackathon community

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

**Built with ❤️ for the hackathon community**

*Streamline your hackathon workflow with HackerDen's comprehensive collaboration platform.*
