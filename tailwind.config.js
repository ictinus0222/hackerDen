export default {
  content: [
    './src/**/*.{js,jsx,ts,tsx}',
    './public/index.html',
  ],
  theme: {
    extend: {
      colors: {
        // Dark green theme colors from JSON
        'primary': '#00C853',
        'primary-hover': '#00B24A',
        'background-dark': '#121C1B',
        'background-sidebar': '#1A2423',
        'background-card': '#1E2B29',
        'text-primary': '#FFFFFF',
        'text-secondary': '#B0B8B6',
        'accent-graph': '#00C853',

        // Sidebar specific colors
        'sidebar-hover': '#1E2B29',
        'sidebar-active': '#22312F',

        // Legacy support (mapped to new system)
        'dark-primary': '#FFFFFF',        // text primary
        'dark-secondary': '#B0B8B6',     // text secondary
        'dark-tertiary': '#9ca3af',      // tertiary text
        'dark-muted': '#6b7280',         // muted text
        'dark-elevated': '#1E2B29',      // elevated surfaces (cards)
        'dark-surface': '#1E2B29',       // modal and surface backgrounds
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      fontSize: {
        'h1': ['20px', { fontWeight: '700', lineHeight: '1.2' }],
        'h2': ['16px', { fontWeight: '600', lineHeight: '1.3' }],
        'body': ['14px', { fontWeight: '400', lineHeight: '1.5' }],
      },
      spacing: {
        'base': '16px',
        'card': '16px',
        'sidebar': '240px',
        'nav': '12px',
      },
      borderRadius: {
        'card': '8px',
        'button': '12px',
      },
      boxShadow: {
        'card': '0px 1px 4px rgba(0, 0, 0, 0.2)',
      },
      height: {
        'navbar': '56px',
      },
      width: {
        'sidebar': '240px',
      },
    },
  },
  plugins: [],
};