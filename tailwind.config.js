/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f2f5',
          100: '#e1e6ea',
          200: '#c3cdd5',
          300: '#a5b4c0',
          400: '#879bab',
          500: '#30475e',
          600: '#2a3f54',
          700: '#24374a',
          800: '#1e2f40',
          900: '#182736',
        },
        dental: {
          primary: '#3fa2f6',    // Medium blue (main brand)
          secondary: '#0f67b1',  // Dark blue (dark sections)  
          accent: '#96c9f4',     // Light blue (highlights/accents)
          light: '#faffaf',      // Cream (backgrounds)
          gray: '#f8fafc',       // Neutral gray
          darkgray: '#64748b'    // Dark gray
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.6s ease-in-out',
        'slide-up': 'slideUp 0.6s ease-out',
        'bounce-gentle': 'bounceGentle 2s ease-in-out infinite'
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' }
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(30px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' }
        },
        bounceGentle: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-5px)' }
        }
      }
    },
  },
  plugins: [],
}