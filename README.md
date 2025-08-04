# HackerDen MVP

A collaborative platform for hackathon teams featuring team management, task tracking, and real-time communication.

## Features

### ✅ Implemented
- **User Authentication**: Registration, login, and session management
- **Team Creation**: Create teams with unique join codes
- **Team Management**: Join teams using invite codes
- **Team Routing Logic**: Smart routing based on team membership status
- **Protected Routes**: Secure access to team features
- **Dashboard Layout**: Responsive dashboard with header, navigation, and main content areas
- **Responsive Design**: Desktop side-by-side layout and mobile tab switching
- **Error Boundaries**: Graceful error handling with recovery options
- **Loading States**: Enhanced loading experience with contextual messages
- **Kanban Board**: Four-column task board with real-time updates
- **Task Creation**: Modal-based task creation with form validation
- **Task Management**: Create, display, and organize tasks by status

### 🚧 In Development
- Task editing and deletion functionality
- Real-time chat functionality
- Team member management
- Advanced task features (assignments, due dates, priorities)

## Tech Stack

- **Frontend**: React 19 + Vite
- **Styling**: Tailwind CSS
- **Backend**: Appwrite (BaaS)
- **Routing**: React Router DOM
- **State Management**: React Context API

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
Create a `.env` file in the root directory:
```env
VITE_APPWRITE_ENDPOINT=https://your-appwrite-endpoint
VITE_APPWRITE_PROJECT_ID=your-project-id
VITE_APPWRITE_DATABASE_ID=your-database-id
```

4. Set up Appwrite:
Follow the setup guide in `docs/appwrite-setup.md` to configure your Appwrite instance.

5. Start the development server:
```bash
npm run dev
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── AppwriteSetupGuide.jsx   # Appwrite setup instructions
│   ├── Chat.jsx                 # Chat component placeholder
│   ├── ErrorBoundary.jsx        # Error boundary for crash protection
│   ├── KanbanBoard.jsx          # Kanban board with task management
│   ├── Layout.jsx               # Main layout with header and navigation
│   ├── LoadingSpinner.jsx       # Loading state component
│   ├── MobileTabSwitcher.jsx    # Mobile tab navigation component
│   ├── ProtectedRoute.jsx       # Route protection component
│   ├── TaskCard.jsx             # Individual task display component
│   ├── TaskColumn.jsx           # Kanban column component
│   ├── TaskModal.jsx            # Task creation modal component
│   └── TeamSelector.jsx         # Team creation/join selector
├── contexts/           # React contexts
│   ├── AuthContext.jsx
│   └── TeamContext.jsx
├── hooks/              # Custom React hooks
│   ├── useAuth.jsx
│   ├── useTasks.jsx             # Task data management hook
│   └── useTeam.jsx
├── lib/                # Third-party integrations
│   └── appwrite.js
├── pages/              # Page components
│   ├── Dashboard.jsx            # Main dashboard with responsive layout
│   ├── LoginPage.jsx
│   ├── RegisterPage.jsx
│   ├── TeamCreationPage.jsx
│   └── TeamJoinPage.jsx
├── services/           # API services
│   ├── authService.js
│   ├── taskService.js           # Task management operations
│   └── teamService.js
├── docs/               # Documentation
│   ├── appwrite-setup.md        # Backend setup guide
│   ├── dashboard-components.md  # Component documentation
│   └── development-guide.md     # Development workflow
└── App.jsx             # Main app component
```

## Dashboard Layout

### Responsive Design
The dashboard implements a responsive layout that adapts to different screen sizes:

- **Desktop (lg+)**: Side-by-side layout with Kanban board and Chat components
- **Mobile/Tablet**: Tab-based interface allowing users to switch between Kanban and Chat views
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
2. **Form**: Fill out task title and description (both required)
3. **Validation**: Real-time form validation with error feedback
4. **Creation**: Task is created with 'todo' status and assigned to current user
5. **Real-time Update**: New task appears immediately for all team members

### Task Management Features
- **Form Validation**: Required field validation for title and description
- **Auto-Assignment**: New tasks are automatically assigned to the creator
- **Status Tracking**: Tasks are organized by status (todo, in_progress, blocked, done)
- **Real-time Sync**: Changes appear instantly across all team member devices
- **Error Handling**: Comprehensive error management with user-friendly messages
- **Loading States**: Visual feedback during task operations

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

### Collections

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

#### messages (planned)
- Chat message fields

## Documentation

### Additional Documentation
- **Appwrite Setup**: `docs/appwrite-setup.md` - Backend configuration guide
- **Dashboard Components**: `docs/dashboard-components.md` - Detailed component documentation
- **Development Guide**: `docs/development-guide.md` - Development workflow and best practices

## Contributing

1. Follow the existing code style and patterns
2. Run `npm run lint` before committing
3. Ensure all builds pass with `npm run build`
4. Update documentation for new features
5. Refer to component documentation in `docs/` for implementation details

## Development Workflow

This project follows a spec-driven development approach:
- Requirements are defined in `.kiro/specs/hackerden-mvp/requirements.md`
- Design decisions are documented in `.kiro/specs/hackerden-mvp/design.md`
- Implementation tasks are tracked in `.kiro/specs/hackerden-mvp/tasks.md`

## License

This project is licensed under the MIT License.
