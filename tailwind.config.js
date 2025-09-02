import tailwindcssAnimate from 'tailwindcss-animate';

export default {
  content: [
    './src/**/*.{js,jsx,ts,tsx}',
    './public/index.html',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Shadcn color system using CSS variables
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        card: {
          DEFAULT: 'var(--card)',
          foreground: 'var(--card-foreground)',
        },
        popover: {
          DEFAULT: 'var(--popover)',
          foreground: 'var(--popover-foreground)',
        },
        primary: {
          DEFAULT: 'var(--primary)',
          foreground: 'var(--primary-foreground)',
        },
        secondary: {
          DEFAULT: 'var(--secondary)',
          foreground: 'var(--secondary-foreground)',
        },
        muted: {
          DEFAULT: 'var(--muted)',
          foreground: 'var(--muted-foreground)',
        },
        accent: {
          DEFAULT: 'var(--accent)',
          foreground: 'var(--accent-foreground)',
        },
        destructive: {
          DEFAULT: 'var(--destructive)',
          foreground: 'var(--destructive-foreground)',
        },
        border: 'var(--border)',
        input: 'var(--input)',
        ring: 'var(--ring)',
        chart: {
          1: 'var(--chart-1)',
          2: 'var(--chart-2)',
          3: 'var(--chart-3)',
          4: 'var(--chart-4)',
          5: 'var(--chart-5)',
        },
        sidebar: {
          DEFAULT: 'var(--sidebar)',
          foreground: 'var(--sidebar-foreground)',
          primary: 'var(--sidebar-primary)',
          'primary-foreground': 'var(--sidebar-primary-foreground)',
          accent: 'var(--sidebar-accent)',
          'accent-foreground': 'var(--sidebar-accent-foreground)',
          border: 'var(--sidebar-border)',
          ring: 'var(--sidebar-ring)',
        },

        // Legacy HackerDen colors for backward compatibility
        'primary-hover': '#00B24A',
        'background-dark': '#121C1B',
        'background-sidebar': '#1A2423',
        'background-card': '#1E2B29',
        'text-primary': '#FFFFFF',
        'text-secondary': '#B0B8B6',
        'accent-graph': '#00C853',
        'sidebar-hover': '#1E2B29',
        'sidebar-active': '#22312F',
        'dark-primary': '#FFFFFF',
        'dark-secondary': '#B0B8B6',
        'dark-tertiary': '#9ca3af',
        'dark-muted': '#6b7280',
        'dark-elevated': '#1E2B29',
        'dark-surface': '#1E2B29',
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
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
        'card': '8px',
        'button': '12px',
      },
      boxShadow: {
        'card': '0px 1px 4px rgba(0, 0, 0, 0.2)',
        xs: 'var(--shadow-xs)',
        sm: 'var(--shadow-sm)',
        md: 'var(--shadow-md)',
        lg: 'var(--shadow-lg)',
        xl: 'var(--shadow-xl)',
        '2xl': 'var(--shadow-2xl)',
      },
      height: {
        'navbar': '56px',
      },
      width: {
        'sidebar': '240px',
      },
    },
  },
  plugins: [tailwindcssAnimate],
};