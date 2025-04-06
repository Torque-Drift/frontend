import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      boxShadow: {
        'neon': '0 0 5px theme(colors.cyan.400), 0 0 20px theme(colors.cyan.600)',
        'neon-purple': '0 0 5px theme(colors.purple.400), 0 0 20px theme(colors.purple.600)',
        'neon-rose': '0 0 5px theme(colors.rose.400), 0 0 20px theme(colors.rose.600)',
      },
      backgroundSize: {},
      backgroundImage: {
        'cyber-grid': 'linear-gradient(theme(colors.cyan.900/30) 1px, transparent 1px), linear-gradient(90deg, theme(colors.cyan.900/30) 1px, transparent 1px)',
        'noise': "url('/images/noise.png')",
      },
      colors: {
        'cyber': {
          'black': '#0a0a0f',
          'blue': '#094c8d',
          'purple': '#6919b1',
          'pink': '#df319c',
          'red': '#ff1654',
          'neon': '#00ffe9',
        },
      },
      keyframes: {
        'glitch': {
          '0%, 100%': { transform: 'translate(0)' },
          '20%': { transform: 'translate(-2px, 2px)' },
          '40%': { transform: 'translate(-2px, -2px)' },
          '60%': { transform: 'translate(2px, 2px)' },
          '80%': { transform: 'translate(2px, -2px)' },
        },
        'scan': {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100%)' },
        },
      },
      animation: {
        'glitch': 'glitch 0.3s infinite',
        'scan': 'scan 2s linear infinite',
      },
    },
  },
  plugins: [],
};
export default config;
