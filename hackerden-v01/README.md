# HackerDen V01

A seamless, frictionless collaboration platform designed specifically for hackathon teams.

## Features

- Unified project dashboard
- Real-time team chat
- Kanban task management
- Activity feed and help alerts
- File management and submissions
- Mobile-first responsive design
- Real-time synchronization

## Tech Stack

- **Frontend**: React 18 with Vite
- **Styling**: Tailwind CSS
- **Backend**: Appwrite Cloud (BaaS)
- **Deployment**: Netlify

## Getting Started

### Prerequisites

- Node.js 18 or higher
- npm or yarn

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:5173](http://localhost:5173) in your browser

### Building for Production

```bash
npm run build
```

### Deployment

This project is configured for deployment on Netlify. The `netlify.toml` file contains the necessary configuration.

## Project Structure

```
src/
├── components/     # Reusable UI components
├── pages/         # Page components
├── utils/         # Utility functions
├── App.jsx        # Main app component
└── main.jsx       # Entry point
```

## Development

- The project uses Vite for fast development and building
- Tailwind CSS is configured for styling
- ESLint is set up for code linting

## License

MIT