# HackerDen Project Structure

## Root Directory Organization
```
hackerden/
├── src/                    # Source code
├── docs/                   # Documentation (25+ guides)
├── scripts/                # Utility scripts (backup, setup, workflow)
├── public/                 # Static assets
├── .kiro/                  # Kiro configuration and specs
├── node_modules/           # Dependencies
└── dist/                   # Build output
```

## Source Code Structure (`src/`)
```
src/
├── components/             # Reusable UI components (50+ components)
│   ├── ui/                # shadcn/ui base components
│   └── __tests__/         # Component tests
├── contexts/              # React contexts (Auth, Team, Notifications)
├── hooks/                 # Custom React hooks (15+ hooks)
│   └── __tests__/         # Hook tests
├── lib/                   # Third-party integrations and utilities
├── pages/                 # Page components (20+ pages)
├── services/              # API services (12+ service modules)
│   └── __tests__/         # Service tests
├── test/                  # Test utilities and configurations
├── utils/                 # Utility functions and helpers
├── assets/                # Images, icons, static files
├── App.jsx                # Main app component
├── main.jsx               # Application entry point
└── index.css              # Global styles and CSS variables
```

## Component Organization
- **Base Components** (`components/ui/`): shadcn/ui components (Button, Input, Dialog, etc.)
- **Feature Components** (`components/`): Business logic components (KanbanBoard, Chat, TaskModal)
- **Layout Components**: Layout, Sidebar, Header, ErrorBoundary
- **Page Components** (`pages/`): Route-level components (Dashboard, LoginPage, etc.)

## Service Layer Architecture
```
services/
├── authService.js          # Authentication operations
├── hackathonService.js     # Hackathon management
├── teamService.js          # Team operations
├── taskService.js          # Task management
├── messageService.js       # Real-time messaging
├── vaultService.js         # Secure credential management
├── realtimeService.js      # Real-time subscription management
├── documentService.js      # Collaborative documents
└── userNameService.js      # User name resolution and caching
```

## Context and State Management
```
contexts/
├── AuthContext.jsx         # User authentication state
├── TeamContext.jsx         # Team membership and operations
└── HackathonNotificationContext.jsx  # Notification system
```

## Custom Hooks Pattern
```
hooks/
├── useAuth.jsx             # Authentication hook
├── useTeam.jsx             # Team operations hook
├── useTasks.jsx            # Task management hook
├── useMessages.jsx         # Chat messaging hook
├── useVault.jsx            # Vault operations hook
├── useNotifications.jsx    # Notification management
└── useHackathonTeam.jsx    # Hackathon-specific team operations
```

## File Naming Conventions
- **Components**: PascalCase (e.g., `TaskCard.jsx`, `KanbanBoard.jsx`)
- **Hooks**: camelCase with `use` prefix (e.g., `useAuth.jsx`, `useTasks.jsx`)
- **Services**: camelCase with `Service` suffix (e.g., `taskService.js`, `authService.js`)
- **Pages**: PascalCase with `Page` suffix (e.g., `LoginPage.jsx`, `Dashboard.jsx`)
- **Utilities**: camelCase (e.g., `sessionUtils.js`, `stylingProtection.js`)
- **Tests**: Match source file with `.test.jsx` or `.test.js` suffix

## Import Path Aliases
- `@/` maps to `src/` directory
- `@/components` for component imports
- `@/hooks` for custom hooks
- `@/services` for API services
- `@/lib` for utilities and integrations
- `@/pages` for page components

## Documentation Structure (`docs/`)
```
docs/
├── appwrite-setup.md       # Backend configuration
├── development-guide.md    # Development workflow
├── style-guide.md          # Design system guide
├── task-*.md              # Task management docs
├── messaging-system.md     # Chat system docs
├── drag-drop-*.md         # Drag and drop guides
├── mobile-*.md            # Mobile optimization
└── *.md                   # Feature-specific documentation
```

## Configuration Files
- `vite.config.js`: Build configuration with path aliases
- `tailwind.config.js`: Styling configuration with custom theme
- `components.json`: shadcn/ui configuration
- `eslint.config.js`: Code quality rules
- `vitest.config.js`: Test configuration
- `package.json`: Dependencies and scripts

## Database Schema Organization
```
Collections:
├── hackathons             # Hackathon information
├── teams                  # Team details and join codes
├── team_members           # Team membership with roles
├── tasks                  # Task management
├── messages               # Real-time messaging
├── vault_secrets          # Encrypted credentials
└── vault_access_requests  # Access request workflow
```

## Development Workflow Files
- **Backup System**: `scripts/backup-utility.js` for file versioning
- **Setup Scripts**: Feature-specific setup automation
- **Test Utilities**: Comprehensive testing infrastructure
- **Styling Protection**: Automated CSS regression prevention

## Key Architectural Patterns
- **Service Layer**: Centralized API operations with error handling
- **Context Providers**: Global state management with custom hooks
- **Component Composition**: Reusable components with clear responsibilities
- **Real-time Integration**: Appwrite subscriptions with automatic cleanup
- **Error Boundaries**: Graceful error handling and recovery
- **Responsive Design**: Mobile-first with Tailwind breakpoints
- **Accessibility**: WCAG compliance with proper ARIA implementation