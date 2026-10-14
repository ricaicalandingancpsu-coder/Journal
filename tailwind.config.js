import defaultTheme from 'tailwindcss/defaultTheme';
import forms from '@tailwindcss/forms';

const token = (name) => `rgb(var(--${name}) / <alpha-value>)`;

/** @type {import('tailwindcss').Config} */
export default {
    content: ['./resources/views/**/*.blade.php', './resources/js/**/*.jsx'],

    theme: {
        extend: {
            colors: {
                paper: token('paper'),
                card: token('card'),
                blush: token('blush'),
                rose: { DEFAULT: token('rose'), deep: token('rose-deep') },
                lavender: { DEFAULT: token('lavender'), deep: token('lavender-deep') },
                ink: { DEFAULT: token('ink'), soft: token('ink-soft') },
                line: token('line'),
                onrose: token('on-rose'),
            },
            fontFamily: {
                display: ['Fraunces', 'Georgia', ...defaultTheme.fontFamily.serif],
                sans: ['"Hanken Grotesk"', ...defaultTheme.fontFamily.sans],
                script: ['Caveat', 'cursive'],
            },
            boxShadow: {
                soft: '0 1px 2px rgb(var(--ink) / 0.04), 0 8px 24px -12px rgb(var(--ink) / 0.14)',
                lift: '0 2px 4px rgb(var(--ink) / 0.05), 0 18px 36px -16px rgb(var(--ink) / 0.22)',
            },
        },
    },

    plugins: [forms({ strategy: 'class' })],
};
