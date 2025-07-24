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
- **Drag & Drop**: React DnD
- **Routing**: React Router

### Backend
- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose
- **Real-time**: Socket.io
- **Authentication**: JWT
- **Testing**: Vitest

## Available Scripts

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
- **Task Board**: Visual Kanban-style task management with drag-and-drop
- **Pivot Tracking**: Document and track major direction changes
- **Submission Package**: Generate clean submission pages for judges
- **Real-time Collaboration**: Live updates across all team members
- **Mobile Responsive**: Works on phones and tablets

## Architecture

The application follows a modern web architecture:
- React frontend with real-time WebSocket connections
- Express.js backend with REST API and Socket.io
- MongoDB for data persistence
- JWT-based authentication
- Mobile-first responsive design

## Contributing

1. Follow the existing code style and conventions
2. Write tests for new features
3. Update documentation as needed
4. Ensure all tests pass before submitting

## License

MIT