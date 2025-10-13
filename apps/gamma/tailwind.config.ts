import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        wc: {
          black: '#000000',
          cyan: '#00FFFF',
          red: '#FF3131',
          green: '#39FF14',
          pink: '#FF00FF',
        },
      },
      borderRadius: {
        glass: 'var(--glass-radius)',
        'glass-lg': 'var(--glass-radius-lg)',
      },
    },
  },
  plugins: [
    ({ addUtilities }) =>
      addUtilities({
        '.glass': {
          borderRadius: 'var(--glass-radius)',
          background: 'linear-gradient(to bottom, rgba(255,255,255,.08), var(--glass-bg))',
          border: '1px solid var(--glass-border)',
          boxShadow: '0 10px 30px var(--glass-shadow)',
          WebkitBackdropFilter: 'blur(var(--glass-blur)) saturate(1.15)',
          backdropFilter: 'blur(var(--glass-blur)) saturate(1.15)',
          backgroundImage: 'var(--glass-noise)',
        },
        '.glass-strong': {
          borderRadius: 'var(--glass-radius-lg)',
          background: 'linear-gradient(to bottom, rgba(255,255,255,.08), var(--glass-bg-strong))',
          border: '1px solid var(--glass-highlight)',
        },
        '.focus-wc': {
          outline: '3px solid #00FFFF',
          outlineOffset: '2px',
        },
      }),
  ],
};

export default config;
