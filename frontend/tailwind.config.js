/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Brand colors
        electric: {
          50: '#e6faff',
          100: '#b3f2ff',
          200: '#80e9ff',
          300: '#4de0ff',
          400: '#1ad7ff',
          500: '#00D4FF',
          600: '#00aacf',
          700: '#00809f',
          800: '#00566f',
          900: '#002c3f',
        },
        neon: {
          50: '#efffea',
          100: '#c6ffb3',
          200: '#9dff7d',
          300: '#74ff46',
          400: '#55ff27',
          500: '#39FF14',
          600: '#2ecf10',
          700: '#239f0c',
          800: '#186f08',
          900: '#0d3f04',
        },
        dark: {
          bg: '#0A0A0F',
          card: '#12121A',
          elevated: '#1A1A28',
          border: '#2A2A3E',
          muted: '#3A3A52',
          hover: '#222235',
        },
        // Status colors
        success: '#39FF14',
        warning: '#FFB800',
        danger: '#FF3366',
        info: '#00D4FF',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Space Grotesk', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-electric': 'linear-gradient(135deg, #00D4FF 0%, #0080FF 100%)',
        'gradient-neon': 'linear-gradient(135deg, #39FF14 0%, #00D4FF 100%)',
        'gradient-dark': 'linear-gradient(135deg, #0A0A0F 0%, #12121A 100%)',
        'card-glow': 'linear-gradient(135deg, rgba(0, 212, 255, 0.05) 0%, rgba(57, 255, 20, 0.05) 100%)',
      },
      boxShadow: {
        'electric': '0 0 20px rgba(0, 212, 255, 0.3)',
        'electric-lg': '0 0 40px rgba(0, 212, 255, 0.4)',
        'neon': '0 0 20px rgba(57, 255, 20, 0.3)',
        'neon-lg': '0 0 40px rgba(57, 255, 20, 0.4)',
        'card': '0 4px 24px rgba(0, 0, 0, 0.4)',
        'card-hover': '0 8px 40px rgba(0, 0, 0, 0.6)',
        'glow-blue': '0 0 15px rgba(0, 212, 255, 0.5), 0 0 30px rgba(0, 212, 255, 0.2)',
        'glow-green': '0 0 15px rgba(57, 255, 20, 0.5), 0 0 30px rgba(57, 255, 20, 0.2)',
        'inner-glow': 'inset 0 1px 0 rgba(255,255,255,0.06)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'fade-in': 'fadeIn 0.3s ease-out',
        'spin-slow': 'spin 3s linear infinite',
        'bounce-gentle': 'bounceGentle 2s ease-in-out infinite',
      },
      keyframes: {
        glow: {
          'from': { boxShadow: '0 0 10px rgba(0, 212, 255, 0.3)' },
          'to': { boxShadow: '0 0 30px rgba(0, 212, 255, 0.7)' },
        },
        slideUp: {
          'from': { transform: 'translateY(20px)', opacity: '0' },
          'to': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          'from': { transform: 'translateY(-20px)', opacity: '0' },
          'to': { transform: 'translateY(0)', opacity: '1' },
        },
        fadeIn: {
          'from': { opacity: '0' },
          'to': { opacity: '1' },
        },
        bounceGentle: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-5px)' },
        },
      },
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.5rem',
        '3xl': '2rem',
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '100': '25rem',
        '112': '28rem',
        '128': '32rem',
      },
      screens: {
        'xs': '475px',
      },
      transitionDuration: {
        '400': '400ms',
      },
    },
  },
  plugins: [],
}
