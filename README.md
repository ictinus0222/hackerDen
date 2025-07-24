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

The backend will be available at `http://localhost:3000`

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
```

## Development

### Frontend
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Testing**: Vitest + React Testing Library
- **Real-time**: Socket.io Client
- **Drag & Drop**: React DnD with HTML5 backend
- **Routing**: React Router
- **API Client**: Custom fetch-based client with automatic token management
- **State Management**: React hooks with custom useProject hook

### Backend
- **Runtime**: Node.js with TypeScript (ES modules)
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose
- **Real-time**: Socket.io
- **Authentication**: JWT
- **Validation**: Zod schemas for request validation
- **Testing**: Vitest with MongoDB Memory Server
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
- **Pivot Tracking**: Document and track major direction changes
- **Submission Package**: Generate clean submission pages for judges
- **Real-time Collaboration**: Live updates across all team members
- **Mobile Responsive**: Works on phones and tablets
- **JWT Authentication**: Secure project-based authentication system
- **Type-Safe API**: Full TypeScript support with Zod validation and automatic date conversion
- **Comprehensive Testing**: Vitest with MongoDB Memory Server for backend, React Testing Library for frontend


## Architecture

The application follows a modern web architecture:
- React frontend with real-time WebSocket connections
- Express.js backend with REST API and Socket.io
- MongoDB for data persistence
- JWT-based authentication
- Mobile-first responsive design

### Task Management System

The task management system provides a complete Kanban-style workflow:

- **TaskBoard Component**: Main container with drag-and-drop functionality using React DnD
- **TaskColumn Component**: Individual columns (To Do, In Progress, Done) with drop zones
- **TaskCard Component**: Individual task cards with edit/delete actions
- **TaskModal Component**: Modal for creating and editing tasks
- **Backend API**: RESTful endpoints for CRUD operations on tasks
- **Real-time Updates**: Socket.io integration for live collaboration (planned)



### API Client Architecture

The frontend includes a comprehensive API service layer (`frontend/src/services/api.ts`) that provides:

- **Automatic Token Management**: JWT tokens are automatically stored and included in requests
- **Type-Safe Responses**: Full TypeScript support with proper type inference
- **Date Conversion**: Automatic conversion of ISO date strings to JavaScript Date objects
- **Error Handling**: Consistent error handling with custom ApiError class
- **Request/Response Interceptors**: Centralized handling of authentication and data transformation
- **Task Management API**: Complete CRUD operations for task management with project-scoped access

### Validation Architecture

The backend uses a robust validation system with Zod schemas:

- **Runtime Validation**: All API inputs are validated using Zod schemas
- **Type Safety**: Validation schemas provide compile-time type checking
- **Consistent Error Handling**: Standardized validation error responses
- **Schema Reuse**: Shared validation schemas between different endpoints
- **Column Type Safety**: Task columns are validated against enum types ('todo' | 'inprogress' | 'done')

#### API Usage Example

```typescript
import { projectApi, taskApi, setAuthToken } from '../services/api';

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
```

#### Validation Example

```typescript
// Backend validation with Zod
import { validateProjectCreation, validateTaskCreation } from '../utils/validation.js';

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

All endpoints require JWT authentication via Bearer token, except for project creation which returns the initial token.



## Contributing

1. Follow the existing code style and conventions
2. Write tests for new features
3. Update documentation as needed
4. Ensure all tests pass before submitting

## License

MIT