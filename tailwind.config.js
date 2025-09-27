/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: process.env.DARK_MODE ? process.env.DARK_MODE : 'class',
  content: [
    './app/**/*.{html,js,jsx,ts,tsx,mdx}',
    './components/**/*.{html,js,jsx,ts,tsx,mdx}',
    './utils/**/*.{html,js,jsx,ts,tsx,mdx}',
    './*.{html,js,jsx,ts,tsx,mdx}',
    './src/**/*.{html,js,jsx,ts,tsx,mdx}',
  ],
  presets: [require('nativewind/preset')],
  important: 'html',
  safelist: [
    {
      pattern:
        /(bg|border|text|stroke|fill)-(primary|secondary|tertiary|error|success|warning|info|typography|outline|background|indicator)-(0|50|100|200|300|400|500|600|700|800|900|950|white|gray|black|error|warning|muted|success|info|light|dark|primary)/,
    },
  ],
  theme: {
    extend: {
      colors: {
        black: {
          primary: "var(--color-black-primary)",
        },
        pink: {
          wall: "var(--color-pink-wall)",
          primary: "var(--color-pink-primary)",
          secondary: "var(--color-pink-secondary)",
          button: "var(--color-pink-button)"
        },
        green: {
          wall: "var(--color-green-wall)",
          primary: "var(--color-green-primary)",
          secondary: "var(--color-green-secondary)",
          button: "var(--color-green-button)"
        },
        blue: {
          wall: "var(--color-blue-wall)",
          primary: "var(--color-blue-primary)",
          secondary: "var(--color-blue-secondary)",
          button: "var(--color-blue-button)"
        },
      },
      fontFamily: {
        roboto: ['var(--font-roboto)'],
      },
    },
  },
};
