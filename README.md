# HackerDen 🚀

A modern, real-time collaborative platform built for hackathon teams. Streamline your team coordination, task management, and project submissions all in one place.

Built with React 19, Appwrite, and Tailwind CSS.

## ✨ Features

### 🏆 Hackathon Management
- **Hackathon Console** - Centralized dashboard for all your hackathons (ongoing, upcoming, completed)
- **Team Creation & Joining** - Create teams with unique join codes or join existing teams
- **Role-Based Permissions** - Team leaders with full control, members with appropriate access
- **OAuth Authentication** - Secure login with Google and GitHub

<!-- Add screenshot: Hackathon Console -->

### 📋 Real-Time Task Management
- **Kanban Board** - Four-column board (To-Do, In Progress, Blocked, Done) with drag-and-drop
- **Live Synchronization** - Instant task updates across all team members
- **Task Assignment** - Assign tasks with priority levels and custom labels
- **Progress Tracking** - Visual progress indicators and completion metrics

<!-- Add screenshot: Kanban Board -->

### 💬 Team Communication
- **Real-Time Chat** - Instant messaging with your team members
- **System Notifications** - Automated task activity updates
- **User Avatars** - Colorful avatars with team member names
- **Message History** - Persistent chat history with timestamps

<!-- Add screenshot: Team Chat -->

### 📁 File Sharing & Collaboration
- **File Upload** - Share images, PDFs, code files, and documents (up to 10MB)
- **Team File Library** - Centralized file browser with preview capabilities
- **Syntax Highlighting** - Code preview with language-specific highlighting
- **Real-Time Sync** - Live file updates across the team

<!-- Add screenshot: File Library -->

### 🏅 Judge Submission System
- **Submission Builder** - Comprehensive project submission forms
- **Public Judge Pages** - Shareable URLs for judges (no authentication required)
- **Auto-Aggregation** - Automatically pull data from tasks and files
- **Submission Lock** - Finalize submissions when judging begins

<!-- Add screenshot: Submission Builder -->

### 🎨 Modern UI/UX
- **Dark Theme** - Professional dark interface with green accents
- **Responsive Design** - Seamless experience from mobile to desktop
- **Smooth Animations** - Polished transitions and interactions
- **Accessibility** - WCAG compliant with keyboard navigation and screen reader support

<!-- Add screenshot: Dashboard Overview -->

## 🛠️ Tech Stack

- **Frontend**: React 19 + Vite
- **Styling**: Tailwind CSS with custom dark theme
- **UI Components**: shadcn/ui + Radix UI
- **Backend**: Appwrite (BaaS with real-time capabilities)
- **State Management**: React Context API
- **Routing**: React Router DOM
- **Testing**: Vitest + React Testing Library
- **Icons**: Lucide React
- **Deployment**: Netlify

## 🚀 Getting Started

### Prerequisites
- Node.js v18+
- npm or yarn
- Appwrite account (cloud or self-hosted)

### Installation

1. **Clone and install**
```bash
git clone <repository-url>
cd hackerden
npm install
```

2. **Configure environment**
```bash
cp .env.example .env
```

Edit `.env` with your Appwrite credentials:
```env
VITE_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
VITE_APPWRITE_PROJECT_ID=your-project-id
VITE_APPWRITE_DATABASE_ID=your-database-id
APPWRITE_API_KEY=your-server-api-key
VITE_PUBLIC_URL=http://localhost:5173
```

3. **Set up Appwrite backend**
```bash
npm run setup:enhancements
npm run validate:schema
```

4. **Start development server**
```bash
npm run dev
```

Visit `http://localhost:5173` and start collaborating!

### Quick Start
1. Register an account
2. Create or join a hackathon
3. Create or join a team with a join code
4. Start managing tasks and chatting with your team

## 📜 Available Scripts

```bash
# Development
npm run dev              # Start development server
npm run build            # Build for production
npm run preview          # Preview production build

# Testing
npm run test             # Run tests in watch mode
npm run test:run         # Run tests once

# Setup & Utilities
npm run setup:enhancements  # Set up Appwrite collections and storage
npm run validate:schema     # Validate database schema
npm run backup              # Create project backup
```

## 🤝 Contributing

We welcome contributions! Here's how you can help:

### Development Setup
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Run tests (`npm run test:run`)
5. Commit your changes (`git commit -m 'Add amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

### Code Style
- Follow the existing code style and conventions
- Use ESLint for code quality (`npm run lint`)
- Write tests for new features
- Ensure accessibility compliance (WCAG 2.1 AA)
- Use semantic commit messages

### Project Structure
```
src/
├── components/     # UI components (shadcn/ui + custom)
├── contexts/       # React contexts (Auth, Team, Notifications)
├── hooks/          # Custom React hooks
├── pages/          # Page components
├── services/       # API services (Appwrite integration)
├── utils/          # Utility functions
└── lib/            # Third-party integrations
```

### Testing
- Write unit tests for utilities and services
- Write component tests for UI components
- Ensure responsive design works on mobile and desktop
- Test real-time features with multiple users

### Documentation
- Update README for new features
- Add JSDoc comments for complex functions
- Update relevant docs in the `docs/` folder
- Include screenshots for UI changes

## 📚 Documentation

Detailed documentation is available in the `docs/` folder:
- `appwrite-setup.md` - Backend configuration guide
- `enhancement-setup-guide.md` - Feature setup instructions
- `development-guide.md` - Development workflow
- Additional feature-specific guides

## 📝 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

Built with:
- [React](https://react.dev/)
- [Appwrite](https://appwrite.io/)
- [Tailwind CSS](https://tailwindcss.com/)
- [shadcn/ui](https://ui.shadcn.com/)
- [Vite](https://vitejs.dev/)

---

Made with ❤️ for hackathon teams worldwide
