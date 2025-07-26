# hackerDen - Hackathon Management Tool

A focused MVP designed to streamline the workflow of hackathon teams from formation to submission.

## Project Structure

```
├── frontend/          # React TypeScript frontend with Vite
├── backend/           # Express.js TypeScript backend
└── .kiro/            # Kiro specifications and configuration
```

## Quick Start

### Prerequisites

- Node.js (v18 or higher)
- MongoDB (local or MongoDB Atlas)
- npm or yarn

### Frontend Setup

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

The frontend will be available at `http://localhost:5173`

### Backend Setup

```bash
cd backend
npm install
cp .env.example .env
npm run dev
```

The backend will be available at `http://localhost:3000` (includes WebSocket server)

### Environment Configuration

#### Frontend (.env)
```
VITE_API_URL=http://localhost:3000
VITE_SOCKET_URL=http://localhost:3000
```

#### Backend (.env)
```
PORT=3000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/hackathon-management
FRONTEND_URL=http://localhost:5173
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d
BASE_URL=http://localhost:3000
```

**Note**: `BASE_URL` is used for generating public submission page URLs. In production, set this to your actual domain.

## Development

### Frontend
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS with custom responsive breakpoints (`xs: 475px` for enhanced small screen support)
- **Testing**: Vitest + React Testing Library
- **Real-time**: Socket.io Client with automatic reconnection
- **Drag & Drop**: React DnD with HTML5 backend
- **Routing**: React Router
- **API Client**: Custom fetch-based client with automatic token management
- **WebSocket Client**: Type-safe Socket.io client with automatic reconnection and room management
- **State Management**: React hooks with custom useProject hook
- **Responsive Design**: Mobile-first with enhanced small screen support using custom breakpoints

### Backend
- **Runtime**: Node.js with TypeScript (ES modules)
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose
- **Real-time**: Socket.io
- **Authentication**: JWT
- **Validation**: Zod schemas for request validation
- **Testing**: Vitest with MongoDB Memory Server

## Available Scripts

### Root Level
- `npm run install:all` - Install dependencies for all projects
- `npm run dev` - Start both frontend and backend in development mode
- `npm run build` - Build both frontend and backend for production
- `npm run test` - Run tests for both frontend and backend

### Frontend
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run test` - Run tests in watch mode
- `npm run test:run` - Run tests once
- `npm run lint` - Run ESLint

### Backend
- `npm run dev` - Start development server with hot reload
- `npm run build` - Build TypeScript to JavaScript
- `npm run start` - Start production server
- `npm run test` - Run tests in watch mode
- `npm run test:run` - Run tests once

## Features

- **Project Hub**: Centralized project information and team management
- **Task Board**: Visual Kanban-style task management with drag-and-drop functionality
  - Create, edit, and delete tasks
  - Move tasks between columns (To Do, In Progress, Done)
  - Assign tasks to team members
  - Real-time task updates across all team members
- **Pivot Tracking**: Document and track major direction changes with dedicated logging system
  - Log pivots with description and reasoning
  - View chronological pivot history (newest first)
  - Track pivot count in project overview
  - Form validation and error handling
- **Submission Package**: Complete submission management system for judges
  - **SubmissionForm Component**: User-friendly form with URL validation and completion tracking
  - **SubmissionPackage Component**: Main container with loading states and error handling
  - **PublicSubmissionPage Component**: Clean, professional judge-facing pages
  - Create and update submission packages with GitHub, presentation, and demo video URLs
  - Automatic completion status tracking based on required fields (GitHub + presentation URLs)
  - Real-time completion progress with visual indicators
  - Generate public submission pages for judges with clean, professional layout
  - Real-time submission updates across team members via WebSocket
  - URL validation with specific error messages and format checking
  - Automatic public page generation with shareable URLs
  - Judge-accessible public pages without authentication requirements
  - Copy-to-clipboard functionality for sharing submission URLs
  - Platform-specific icons and labels (GitHub, YouTube, Google Slides, etc.)
- **Real-time Collaboration**: Live updates across all team members
- **Mobile Responsive**: Works on phones and tablets with enhanced small screen support
- **JWT Authentication**: Secure project-based authentication system
- **Type-Safe API**: Full TypeScript support with Zod validation and automatic date conversion
- **Comprehensive Testing**: Vitest with MongoDB Memory Server for backend, React Testing Library for frontend, comprehensive API client testing with mocked fetch and localStorage
- **Judge-Friendly Submissions**: Public submission pages accessible without authentication for easy judge evaluation


## Architecture

The application follows a modern web architecture:
- React frontend with real-time WebSocket connections
- Express.js backend with REST API and Socket.io
- MongoDB for data persistence
- JWT-based authentication
- Public submission pages for judges without authentication
- Mobile-first responsive design with custom Tailwind breakpoints

### Responsive Design Configuration

The frontend uses Tailwind CSS with custom breakpoints for enhanced mobile experience:

```javascript
// tailwind.config.js
theme: {
  extend: {
    screens: {
      'xs': '475px',  // Custom breakpoint for small screens
    },
  },
}
```

**Breakpoint Usage:**
- `xs` (475px+): Enhanced layout for larger phones and small tablets
- `sm` (640px+): Standard small screen breakpoint
- `md` (768px+): Tablet and desktop layouts
- `lg` (1024px+): Large desktop layouts

This configuration ensures optimal user experience across all device sizes, with particular attention to the 375px-640px range where many mobile devices fall.

### Task Management System

The task management system provides a complete Kanban-style workflow:

- **TaskBoard Component**: Main container with drag-and-drop functionality using React DnD
- **TaskColumn Component**: Individual columns (To Do, In Progress, Done) with drop zones
- **TaskCard Component**: Individual task cards with edit/delete actions
- **TaskModal Component**: Modal for creating and editing tasks
- **Backend API**: RESTful endpoints for CRUD operations on tasks
- **API Client**: Type-safe task API with comprehensive test coverage
- **Real-time Updates**: Socket.io integration for live collaboration with project rooms and event broadcasting

### Pivot Tracking System

The pivot tracking system allows teams to document major direction changes:

- **PivotLog Component**: Main container displaying pivot history with chronological ordering
- **PivotForm Component**: Form for logging new pivots with validation and error handling
- **Backend API**: RESTful endpoints for creating and retrieving pivot entries
- **API Client**: Type-safe pivot API with comprehensive validation
- **Project Integration**: Pivot count displayed in project overview statistics
- **Validation**: Client and server-side validation for required fields and character limits

### Submission Package System

The submission package system provides comprehensive submission management for judges:

- **SubmissionForm Component**: User-friendly form with URL validation, completion tracking, and real-time progress indicators
- **SubmissionPackage Component**: Main container component with loading states, error handling, and public URL management
- **PublicSubmissionPage Component**: Clean, professional judge-facing pages with platform-specific icons and responsive design
- **Submission Model**: MongoDB model with automatic completion status tracking and public data methods
- **Backend API**: RESTful endpoints for creating, updating, and retrieving submissions with proper authentication
- **Public Pages**: Judge-accessible public submission pages without authentication requirements
- **URL Validation**: Client and server-side validation for GitHub, presentation, and demo video URLs
- **Auto-completion**: Automatic tracking of submission completeness based on required fields (GitHub + presentation URLs)
- **Public URL Generation**: Automatic generation of shareable public submission page URLs
- **Real-time Updates**: Socket.io integration for live submission updates across team members
- **Judge Interface**: Clean, professional public pages for judge evaluation with copy-to-clipboard functionality
- **Platform Recognition**: Automatic detection and display of platform-specific icons (GitHub, YouTube, Google Slides, etc.)

### Real-time Collaboration System

The application provides comprehensive real-time collaboration through WebSocket connections using Socket.io:

#### WebSocket Architecture

- **Backend SocketService**: Centralized WebSocket management (`backend/src/services/socketService.ts`)
- **Frontend SocketService**: Type-safe client-side WebSocket management (`frontend/src/services/socket.ts`)
- **Project Rooms**: Users join project-specific rooms for isolated communication
- **Connection Management**: Automatic handling of user connections, disconnections, and room management with reconnection logic
- **Event Broadcasting**: Real-time updates are broadcast to all team members in the same project
- **User Tracking**: Active user tracking with connection status and project association
- **Singleton Pattern**: Single socket instance shared across the application for consistent state management

#### Real-time Events

The system broadcasts the following real-time events to all team members:

**Project Events:**
- `project:updated` - Project information changes (name, idea, deadlines, criteria)
- `member:joined` - New team member added
- `member:left` - Team member removed
- `pivot:logged` - New pivot entry added

**Task Events:**
- `task:created` - New task created
- `task:updated` - Task information updated
- `task:moved` - Task moved between columns
- `task:deleted` - Task deleted

**Submission Events:**
- `submission:updated` - Submission package updated

**User Events:**
- `user-joined` - User connected to project room
- `user-left` - User disconnected from project room

#### WebSocket Connection Flow

1. **Connection**: Client connects to WebSocket server with automatic reconnection
2. **Room Joining**: Client emits `join-project` with `projectId` and optional `userName`
3. **Validation**: Server validates project exists using `Project.findByProjectId()`
4. **Room Management**: User leaves previous room and joins new project room
5. **Notifications**: Other team members are notified of user joining
6. **Event Listening**: Client receives real-time updates for project activities
7. **Reconnection**: Automatic reconnection with exponential backoff and project room rejoining

#### Frontend SocketService Features

The new frontend SocketService provides:

- **Type-Safe Events**: Full TypeScript support for all socket events
- **Automatic Reconnection**: Exponential backoff with configurable retry limits
- **Connection Status Tracking**: Real-time connection state monitoring
- **Project Room Management**: Automatic rejoining of project rooms after reconnection
- **Event Listener Management**: Clean subscription/unsubscription patterns
- **Error Handling**: Comprehensive error handling with listener isolation
- **Singleton Pattern**: Single instance shared across the application

#### Implementation Example

```typescript
import { socketService } from '../services/socket';

// Backend - Broadcasting task updates
const socketService = getSocketService();
if (socketService) {
  socketService.emitTaskCreated(projectId, taskObject);
}

// Frontend - Using the SocketService
// Join a project room
socketService.joinProject('project-123', 'John Doe');

// Listen for real-time updates with type safety
socketService.on('task:created', (task) => {
  setTasks(prev => [...prev, task]);
});

socketService.on('project:updated', (project) => {
  setProject(project);
});

// Monitor connection status
const cleanup = socketService.onConnectionChange((connected) => {
  setIsConnected(connected);
});

// Cleanup when component unmounts
useEffect(() => {
  return () => {
    socketService.off('task:created', taskCreatedHandler);
    cleanup();
  };
}, []);
```

#### Error Handling

- **Project Validation**: Validates project existence before allowing room joins
- **Connection Errors**: Graceful handling of connection failures and timeouts
- **Room Management**: Automatic cleanup when users disconnect
- **Error Events**: Dedicated error events for client-side error handling
- **Error Events**: Dedicated error events for client-side error handling

### API Client Architecture

The frontend includes a comprehensive API service layer (`frontend/src/services/api.ts`) that provides:

- **Automatic Token Management**: JWT tokens are automatically stored and included in requests
- **Type-Safe Responses**: Full TypeScript support with proper type inference
- **Date Conversion**: Automatic conversion of ISO date strings to JavaScript Date objects
- **Error Handling**: Consistent error handling with custom ApiError class
- **Request/Response Interceptors**: Centralized handling of authentication and data transformation
- **Task Management API**: Complete CRUD operations for task management with project-scoped access
- **Pivot Tracking API**: Full CRUD operations for pivot logging with validation and error handling
- **Submission Management API**: Complete submission package management with URL validation and public page generation
- **Input Validation**: Client-side validation with automatic trimming and required field checks
- **Comprehensive Testing**: Full test coverage with mocked fetch and localStorage (`frontend/src/services/api.test.ts`)

#### API Testing Coverage

The API client includes comprehensive test coverage that validates:

- **Token Management**: Setting, getting, and clearing JWT tokens with localStorage persistence
- **Task CRUD Operations**: Creating, reading, updating, and deleting tasks with proper validation
- **Pivot CRUD Operations**: Creating and reading pivot entries with validation and error handling
- **Submission CRUD Operations**: Creating, updating, and reading submission packages with URL validation
- **Input Validation**: Client-side validation with automatic trimming and required field checks
- **Error Handling**: Proper error propagation and custom ApiError handling
- **Date Conversion**: Automatic conversion of ISO date strings to JavaScript Date objects
- **Request Headers**: Proper authentication headers and content-type handling
- **Mock Testing**: Comprehensive mocking of fetch API and localStorage for isolated testing

### Validation Architecture

The backend uses a robust validation system with Zod schemas:

- **Runtime Validation**: All API inputs are validated using Zod schemas
- **Type Safety**: Validation schemas provide compile-time type checking
- **Consistent Error Handling**: Standardized validation error responses
- **Schema Reuse**: Shared validation schemas between different endpoints
- **Column Type Safety**: Task columns are validated against enum types ('todo' | 'inprogress' | 'done')
- **Input Constraints**: Automatic validation of field lengths, required fields, and data formats
  - Project names: 1-200 characters
  - Task titles: 1-200 characters  
  - Task descriptions: max 1000 characters
  - Team member names: 1-100 characters
  - Pivot descriptions and reasons: 1-1000 characters each
  - Submission URLs: Valid HTTP/HTTPS URLs with platform-specific validation
- **Date Validation**: Automatic parsing and validation of ISO date strings with logical ordering constraints
- **Pivot Tracking**: Complete validation for pivot entries with required description and reason fields
- **Submission Management**: URL validation for GitHub, presentation, and demo video URLs with automatic completion tracking

#### API Usage Example

```typescript
import { projectApi, taskApi, pivotApi, submissionApi, setAuthToken } from '../services/api';

// Create a new project
const { project, token } = await projectApi.create({
  projectName: 'My Hackathon Project',
  oneLineIdea: 'A revolutionary idea to change the world',
  creatorName: 'John Doe'
});

// Token is automatically stored for future requests
const updatedProject = await projectApi.update(project.projectId, {
  projectName: 'Updated Project Name'
});

// Add team members
const newMember = await projectApi.addMember(project.projectId, {
  name: 'Jane Smith',
  role: 'Designer'
});

// Task management
const tasks = await taskApi.getByProject(project.projectId);

const newTask = await taskApi.create(project.projectId, {
  title: 'Implement user authentication',
  description: 'Add login and registration functionality',
  columnId: 'todo',
  assignedTo: 'Jane Smith'
});

// Update task status
const updatedTask = await taskApi.update(newTask.id, {
  columnId: 'inprogress'
});

// Delete task
await taskApi.delete(newTask.id);

// Pivot tracking
const pivots = await pivotApi.getByProject(project.projectId);

const newPivot = await pivotApi.create(project.projectId, {
  description: 'Changed from mobile app to web app',
  reason: 'Web development is faster for our team'
});

// Submission management
const submission = await submissionApi.createOrUpdate(project.projectId, {
  githubUrl: 'https://github.com/team/hackathon-project',
  presentationUrl: 'https://slides.com/presentation',
  demoVideoUrl: 'https://youtube.com/watch?v=demo'
});

// Get submission for team
const teamSubmission = await submissionApi.getByProject(project.projectId);

// Get public submission page data (no auth required)
const publicSubmission = await submissionApi.getPublic(project.projectId);
```

#### Validation Example

```typescript
// Backend validation with Zod
import { validateProjectCreation, validateTaskCreation, validatePivotEntry } from '../utils/validation.js';

// This will throw an error if validation fails
const validatedData = validateProjectCreation({
  projectName: 'My Project',
  oneLineIdea: 'A great idea',
  creatorName: 'John Doe'
});

// Task validation with column type safety
const validatedTask = validateTaskCreation({
  title: 'Implement authentication',
  description: 'Add login functionality',
  columnId: 'todo', // Validated against enum: 'todo' | 'inprogress' | 'done'
  assignedTo: 'John Doe'
});

// Pivot entry validation
const validatedPivot = validatePivotEntry({
  description: 'Changed from mobile app to web app',
  reason: 'Web development is faster for our team'
});

// Submission package validation
const validatedSubmission = validateSubmissionCreation({
  githubUrl: 'https://github.com/team/hackathon-project',
  presentationUrl: 'https://slides.com/presentation',
  demoVideoUrl: 'https://youtube.com/watch?v=demo'
});
```

### Authentication Flow

1. **Project Creation**: When a project is created, a JWT token is generated and returned
2. **Token Storage**: The token is automatically stored in localStorage and memory
3. **Automatic Headers**: All subsequent API requests include the Bearer token
4. **Token Persistence**: Tokens persist across browser sessions
5. **Error Handling**: Invalid or expired tokens trigger appropriate error responses

### API Endpoints

#### Project Management
- `POST /api/projects` - Create new project
- `GET /api/projects/:id` - Get project details
- `PUT /api/projects/:id` - Update project information
- `POST /api/projects/:id/members` - Add team member
- `DELETE /api/projects/:id/members/:memberId` - Remove team member

#### Task Management
- `GET /api/projects/:id/tasks` - Get all tasks for a project
- `POST /api/projects/:id/tasks` - Create new task
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task

#### Pivot Tracking
- `POST /api/projects/:id/pivots` - Log new pivot entry
- `GET /api/projects/:id/pivots` - Get pivot history (sorted by most recent first)

#### Submission Management
- `POST /api/projects/:id/submission` - Create or update submission package
- `GET /api/projects/:id/submission` - Get submission package for project team
- `GET /api/submission/:id/public` - Get public submission page for judges (no auth required)

All endpoints require JWT authentication via Bearer token, except for project creation which returns the initial token, and the public submission page which is accessible to judges without authentication.

#### WebSocket Events

The WebSocket server provides real-time communication through Socket.io:

**Client Events (sent to server):**
- `join-project` - Join a project room for real-time updates
  - Payload: `{ projectId: string, userName?: string }`
- `leave-project` - Leave current project room

**Server Events (sent to clients):**
- `joined-project` - Confirmation of successful room join
- `user-joined` - Another user joined the project room
- `user-left` - Another user left the project room
- `project:updated` - Project information was updated
- `member:joined` - New team member was added
- `member:left` - Team member was removed
- `pivot:logged` - New pivot entry was logged
- `task:created` - New task was created
- `task:updated` - Task was updated
- `task:moved` - Task was moved between columns
- `task:deleted` - Task was deleted
- `submission:updated` - Submission package was updated
- `error` - WebSocket error occurred

**Connection URL:** `ws://localhost:3000` (development) or your production WebSocket URL

#### Frontend SocketService API

The frontend SocketService provides a comprehensive API for WebSocket management:

```typescript
import { socketService } from '../services/socket';

// Connection management
socketService.connect();                    // Manual connection
socketService.disconnect();                 // Disconnect and cleanup
socketService.isConnected();               // Check connection status
socketService.reconnect();                 // Force reconnection

// Project management
socketService.joinProject(projectId, userName);  // Join project room
socketService.leaveProject();                    // Leave current project
socketService.getCurrentProjectId();             // Get current project ID

// Event listeners with type safety
socketService.on('task:created', (task) => { /* handle task */ });
socketService.off('task:created', handler);      // Remove listener

// Connection status monitoring
const cleanup = socketService.onConnectionChange((connected) => {
  console.log('Connection status:', connected);
});

// Reconnection status
socketService.getReconnectAttempts();       // Current attempt count
socketService.getMaxReconnectAttempts();    // Maximum attempts (5)
```

#### SocketService Configuration

The SocketService is configured with:
- **Transports**: WebSocket and polling fallback
- **Timeout**: 10 second connection timeout
- **Reconnection**: Automatic with exponential backoff
- **Max Attempts**: 5 reconnection attempts
- **Delay Range**: 1-5 second reconnection delay

## Contributing

1. Follow the existing code style and conventions
2. Write tests for new features
3. Update documentation as needed
4. Ensure all tests pass before submitting

## License

MIT