/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{ts,tsx,js,jsx}',
    './components/**/*.{ts,tsx,js,jsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ['var(--font-syne)', 'sans-serif'],
        body:    ['var(--font-dm-sans)', 'sans-serif'],
        mono:    ['var(--font-jetbrains)', 'monospace'],
      },
      colors: {
        ink: {
          950: '#06070A',
          900: '#0D0F15',
          800: '#13161F',
          700: '#1B1F2E',
          600: '#232840',
          500: '#2E3454',
        },
        azure: {
          DEFAULT: '#3D7EFF',
          50:  '#EBF1FF',
          100: '#C7D8FF',
          200: '#94B4FF',
          300: '#618FFF',
          400: '#3D7EFF',
          500: '#1A5EFF',
          600: '#0042E0',
        },
        electric: '#60EFFF',
        violet:   '#A78BFA',
        rose:     '#FB7185',
        success: {
          DEFAULT: '#22D3A0',
          dim:     'rgba(34,211,160,0.12)',
        },
        warn: {
          DEFAULT: '#F59E0B',
          dim:     'rgba(245,158,11,0.12)',
        },
        danger: {
          DEFAULT: '#FF5757',
          dim:     'rgba(255,87,87,0.12)',
        },
      },
      boxShadow: {
        'glow-sm': '0 0 20px rgba(61,126,255,0.2)',
        'glow-md': '0 0 40px rgba(61,126,255,0.3)',
        'card':    '0 1px 1px rgba(0,0,0,0.3),0 4px 20px rgba(0,0,0,0.25),inset 0 1px 0 rgba(255,255,255,0.04)',
        'btn':     '0 4px 16px rgba(61,126,255,0.3),inset 0 1px 0 rgba(255,255,255,0.15)',
      },
      keyframes: {
        orb: {
          '0%,100%': { transform: 'translate(0,0) scale(1)' },
          '33%':     { transform: 'translate(40px,-30px) scale(1.1)' },
          '66%':     { transform: 'translate(-20px,20px) scale(0.95)' },
        },
        slideIn: {
          from: { opacity: '0', transform: 'translateY(16px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          from: { opacity: '0' },
          to:   { opacity: '1' },
        },
        pulseGlow: {
          '0%,100%': { boxShadow: '0 0 20px rgba(61,126,255,0.2)' },
          '50%':     { boxShadow: '0 0 40px rgba(61,126,255,0.5)' },
        },
        shimmer: {
          '0%':   { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition:  '200% 0' },
        },
      },
      animation: {
        orb:       'orb 14s ease-in-out infinite',
        slideIn:   'slideIn 0.5s cubic-bezier(0.34,1.56,0.64,1) forwards',
        fadeIn:    'fadeIn 0.4s ease-out forwards',
        pulseGlow: 'pulseGlow 3s ease-in-out infinite',
        shimmer:   'shimmer 2s linear infinite',
      },
    },
  },
  plugins: [],
};
