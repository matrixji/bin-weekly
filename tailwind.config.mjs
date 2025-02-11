/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./src/**/*.{astro,html,js,jsx,md,svelte,ts,tsx,vue}"],
  theme: {
    extend: {
      screens: {
        lg: "1080px",
        xl: "1412px",
        md: "736px",
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
};
