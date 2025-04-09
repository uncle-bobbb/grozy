/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#C9D6DF",
        secondary: "#A2ADB6",
        accent: "#8F979F",
        neutral: "#F8F9FA",
        "neutral-content": "#333333",
        border: "#E2E5E7",
      },
    },
  },
  plugins: [],
}; 