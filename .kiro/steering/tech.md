# HackerDen Tech Stack

## Frontend Stack
- **Framework**: React 19 with Vite for fast development and modern features
- **Styling**: Tailwind CSS with custom dark theme design system
- **UI Components**: shadcn/ui components with Radix UI primitives
- **Routing**: React Router DOM with protected routes and context-aware navigation
- **State Management**: React Context API for global state (Auth, Team, Notifications)
- **Icons**: Lucide React for consistent SVG icons
- **Date Handling**: date-fns for lightweight date formatting

## Backend Integration
- **Backend-as-a-Service**: Appwrite for authentication, database, and real-time features
- **Real-time Updates**: Appwrite Realtime subscriptions for live task and message sync
- **Authentication**: Email/password with session management, OAuth support
- **Database**: Document-based storage with collections and relationships

## Build System & Tools
- **Build Tool**: Vite with React plugin and path aliases (@/ for src/)
- **Package Manager**: npm with package-lock.json
- **Linting**: ESLint with React hooks and refresh plugins
- **Testing**: Vitest with jsdom, React Testing Library, accessibility testing
- **CSS Processing**: PostCSS with Tailwind CSS and animations

## Common Commands
```bash
# Development
npm run dev                    # Start development server
npm run build                  # Build for production
npm run preview               # Preview production build

# Testing
npm run test                  # Run tests in watch mode
npm run test:run             # Run tests once
npm run test:styling         # Run styling protection tests
npm run test:responsive      # Run responsive design tests

# Linting & Quality
npm run lint                 # Run ESLint

# Backup & Utilities
npm run backup               # Create project backup
npm run backup:restore       # Restore from backup
npm run backup:cleanup       # Clean backup files

# Feature Setup
npm run setup:whiteboard     # Setup whiteboard feature
npm run setup:vault         # Setup team vault feature
npm run setup:documents     # Setup collaborative documents
```

## Key Dependencies
- **UI Framework**: React 19, React DOM, React Router DOM
- **Styling**: Tailwind CSS, tailwindcss-animate, class-variance-authority, clsx, tailwind-merge
- **UI Components**: @radix-ui/* components, lucide-react, cmdk, sonner
- **Backend**: appwrite, node-appwrite
- **Forms**: react-hook-form
- **Markdown**: react-markdown, remark-gfm, rehype-highlight
- **Utilities**: date-fns, highlight.js, react-error-boundary, react-resizable-panels

## Environment Configuration
```env
VITE_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
VITE_APPWRITE_PROJECT_ID=your-project-id
VITE_APPWRITE_DATABASE_ID=your-database-id
```

## Development Patterns
- **Component Architecture**: Functional components with hooks
- **State Management**: Context providers with custom hooks
- **Error Handling**: Error boundaries with graceful fallbacks
- **Loading States**: Consistent loading spinners and skeleton loaders
- **Real-time**: Appwrite subscriptions with automatic cleanup
- **Responsive Design**: Mobile-first with Tailwind breakpoints
- **Accessibility**: ARIA labels, keyboard navigation, focus management