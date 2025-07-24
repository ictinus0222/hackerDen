# Technology Stack

## Architecture
- **Frontend**: React 18 with TypeScript, Vite build tool
- **Backend**: Express.js with TypeScript on Node.js
- **Database**: MongoDB with Mongoose ODM
- **Real-time**: Socket.io for WebSocket connections
- **Authentication**: JWT-based auth

## Frontend Stack
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS v4
- **Testing**: Vitest + React Testing Library + jsdom
- **Routing**: React Router v7
- **Drag & Drop**: React DnD with HTML5 backend
- **Real-time**: Socket.io Client

## Backend Stack
- **Runtime**: Node.js with TypeScript (ES modules)
- **Framework**: Express.js v5
- **Database**: MongoDB with Mongoose
- **Validation**: Zod schemas
- **Testing**: Vitest with MongoDB Memory Server
- **Authentication**: JWT + bcryptjs
- **Real-time**: Socket.io

## Development Commands

### Root Level
```bash
npm run install:all    # Install all dependencies
npm run dev            # Start both frontend and backend
npm run build          # Build both projects
npm run test           # Run all tests
```

### Frontend (cd frontend)
```bash
npm run dev            # Start dev server (localhost:5173)
npm run build          # Build for production
npm run test           # Run tests in watch mode
npm run test:run       # Run tests once
npm run lint           # Run ESLint
```

### Backend (cd backend)
```bash
npm run dev            # Start dev server with hot reload (localhost:3000)
npm run build          # Build TypeScript to JavaScript
npm run start          # Start production server
npm run test           # Run tests in watch mode
npm run test:run       # Run tests once
```

## Environment Setup
- Copy `.env.example` to `.env` in both frontend and backend directories
- Frontend uses `VITE_` prefixed environment variables
- Backend requires MongoDB connection and JWT secret