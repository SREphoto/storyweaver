/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./**/*.{js,ts,jsx,tsx}",
    ],
    darkMode: 'class',
    theme: {
        extend: {
            colors: {
                brand: {
                    bg: 'rgb(var(--color-bg) / <alpha-value>)',
                    surface: 'rgb(var(--color-surface) / <alpha-value>)',
                    primary: 'rgb(var(--color-primary) / <alpha-value>)',
                    secondary: 'rgb(var(--color-secondary) / <alpha-value>)',
                    accent: 'rgb(var(--color-accent) / <alpha-value>)',
                    text: 'rgb(var(--color-text) / <alpha-value>)',
                    'text-muted': 'rgb(var(--color-text-muted) / <alpha-value>)',
                },
                comic: {
                    yellow: '#FFD700',
                    red: '#DC2626',
                    cyan: '#06b6d4',
                    black: '#111111',
                }
            },
            fontFamily: {
                sans: ['Inter', 'sans-serif'],
                serif: ['Lora', 'serif'],
                comic: ['Comic Neue', 'cursive'],
                bangers: ['Bangers', 'cursive'],
            },
            backdropBlur: {
                xs: '2px',
            }
        },
    },
    plugins: [],
}
