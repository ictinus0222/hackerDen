export default {
  content: [
    './src/**/*.{js,jsx,ts,tsx}',
    './public/index.html',
  ],
  theme: {
    extend: {
      colors: {
        // Main theme colors
        background: '#F8FAFC',
        card: '#FFFFFF',
        border: '#E5E7EB',
        heading: '#1E293B',
        body: '#334155',
        muted: '#94A3B8',
        
        // Accent colors
        accentBlue: '#60A5FA',
        accentPurple: '#A78BFA',
        accentOrange: '#FDBA74',
        
        // Consistent text colors
        'text-primary': '#111827',    // gray-900 - main text
        'text-secondary': '#6B7280',  // gray-500 - secondary text
        'text-tertiary': '#9CA3AF',   // gray-400 - tertiary text
        'text-muted': '#9CA3AF',      // gray-400 - muted text
        
        // Consistent border colors
        'border-primary': '#E5E7EB',  // gray-200 - main borders
        'border-secondary': '#D1D5DB', // gray-300 - secondary borders
        
        // Legacy dark theme colors (for backward compatibility)
        'dark-primary': '#111827',    // gray-900
        'dark-secondary': '#6B7280',  // gray-500  
        'dark-tertiary': '#9CA3AF',   // gray-400
        'dark-muted': '#9CA3AF',      // gray-400
        'dark-elevated': '#F3F4F6',   // gray-100 - elevated surfaces
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      borderRadius: {
        '2xl': '2rem',
        'xl': '1.25rem',
        'full': '9999px',
      },
      boxShadow: {
        'cluely': '0 8px 32px 0 rgba(30, 41, 59, 0.08)',
      },
    },
  },
  plugins: [],
};