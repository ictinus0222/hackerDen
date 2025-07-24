# Project Structure

## Root Directory
```
├── frontend/          # React TypeScript frontend
├── backend/           # Express.js TypeScript backend
├── .kiro/            # Kiro specifications and steering
├── node_modules/     # Root dependencies (concurrently)
└── package.json      # Root package with workspace scripts
```

## Frontend Structure (`frontend/`)
```
├── src/
│   ├── components/   # React components with co-located tests
│   ├── types/        # TypeScript type definitions
│   └── ...
├── public/           # Static assets
├── dist/            # Build output
├── package.json     # Frontend dependencies
├── vite.config.ts   # Vite configuration
├── tailwind.config.js # Tailwind CSS configuration
└── tsconfig.*.json  # TypeScript configurations
```

## Backend Structure (`backend/`)
```
├── src/
│   ├── models/       # Mongoose models with validation
│   ├── routes/       # Express route handlers
│   ├── middleware/   # Express middleware (auth, error handling, rate limiting)
│   ├── utils/        # Utility functions and validation
│   ├── types/        # TypeScript type definitions
│   ├── config/       # Configuration files (database, etc.)
│   ├── test/         # Test setup and utilities
│   └── server.ts     # Main server entry point
├── dist/            # Build output
├── package.json     # Backend dependencies
└── tsconfig.json    # TypeScript configuration
```

## Code Organization Patterns

### Component Structure
- Components are co-located with their tests (`Component.tsx` + `Component.test.tsx`)
- Use TypeScript interfaces from `src/types/index.ts`
- Follow React functional component patterns with hooks

### Model Structure
- Mongoose models extend Document interface
- Include both instance and static methods
- Use pre-save middleware for validation
- Maintain indexes for query performance

### API Structure
- Routes handle HTTP endpoints with proper error handling
- Middleware for authentication, rate limiting, and error handling
- Zod schemas for request validation
- Consistent API response format

### Testing Structure
- Vitest for both frontend and backend testing
- React Testing Library for component tests
- MongoDB Memory Server for backend integration tests
- Co-located test files with source code

### Type Safety
- Shared type definitions between frontend and backend
- Strict TypeScript configuration
- Zod for runtime validation
- Mongoose schema validation