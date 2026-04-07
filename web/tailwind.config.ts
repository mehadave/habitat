import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      colors: {
        navy: {
          DEFAULT: '#0B1437',
          surface: '#0F1B45',
          card: 'rgba(255,255,255,0.04)',
        },
        'primary-blue': '#2563EB',
        'sky-blue': '#93C5FD',
        'mid-blue': '#60A5FA',
        'alert-red': '#F87171',
        gold: '#FBBF24',
      },
      backgroundImage: {
        'gradient-ocean': 'linear-gradient(180deg, #0B1437 0%, #0F1B45 100%)',
      },
      animation: {
        wave: 'wave 6s ease-in-out infinite',
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'scale-pop': 'scalePop 0.3s ease-out',
        'dolphin-jump': 'dolphinJump 0.8s ease-in-out',
        'xp-toast': 'xpToast 2.5s ease-in-out forwards',
        'confetti-fall': 'confettiFall 3s ease-in forwards',
      },
      keyframes: {
        wave: {
          '0%, 100%': { transform: 'translateX(0)' },
          '50%': { transform: 'translateX(-30px)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        scalePop: {
          '0%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.4)' },
          '100%': { transform: 'scale(1)' },
        },
        dolphinJump: {
          '0%': { transform: 'translateY(0) rotate(0deg)', opacity: '1' },
          '40%': { transform: 'translateY(-40px) rotate(-20deg)', opacity: '1' },
          '70%': { transform: 'translateY(-20px) rotate(10deg)', opacity: '1' },
          '100%': { transform: 'translateY(0) rotate(0deg)', opacity: '0' },
        },
        xpToast: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '15%': { transform: 'translateY(0)', opacity: '1' },
          '70%': { transform: 'translateY(0)', opacity: '1' },
          '100%': { transform: 'translateY(-20px)', opacity: '0' },
        },
        confettiFall: {
          '0%': { transform: 'translateY(-100px) rotate(0deg)', opacity: '1' },
          '100%': { transform: 'translateY(110vh) rotate(720deg)', opacity: '0' },
        },
      },
    },
  },
  plugins: [],
} satisfies Config
