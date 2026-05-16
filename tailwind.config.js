/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Cormorant Garamond"', 'Georgia', 'serif'],
        body: ['"DM Sans"', 'system-ui', 'sans-serif'],
      },
      colors: {
        pink: { DEFAULT: '#EC2461', dim: 'rgba(236,36,97,0.12)', border: 'rgba(236,36,97,0.3)' },
        cs: {
          black: '#0A0A0A',
          surface: '#141414',
          surface2: '#1C1C1C',
          border: 'rgba(255,255,255,0.08)',
          muted: 'rgba(255,255,255,0.45)',
          soft: 'rgba(255,255,255,0.72)',
        }
      },
      animation: {
        'fade-up': 'fadeUp 0.5s ease forwards',
        'fade-in': 'fadeIn 0.4s ease forwards',
      },
      keyframes: {
        fadeUp: { from: { opacity: 0, transform: 'translateY(16px)' }, to: { opacity: 1, transform: 'translateY(0)' } },
        fadeIn: { from: { opacity: 0 }, to: { opacity: 1 } },
      }
    },
  },
  plugins: [],
}
