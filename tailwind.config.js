/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/renderer/src/**/*.{html,js,ts,jsx,tsx}', './src/renderer/index.html'],
  theme: {
    extend: {
      colors: {
        bg: 'var(--color-bg)',
        surface: 'var(--color-surface)',
        'surface-2': 'var(--color-surface-2)',
        accent: 'var(--color-accent)',
        muted: 'var(--color-text-muted)',
        border: 'var(--color-border)'
      }
    }
  },
  plugins: []
}
