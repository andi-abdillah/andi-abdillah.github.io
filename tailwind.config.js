/** @type {import('tailwindcss').Config} */
import defaultTheme from "tailwindcss/defaultTheme";

export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        open: ["Open Sans", ...defaultTheme.fontFamily.sans],
      },
      colors: {
        primary: "#741ce8",
        secondary: "#ffcb05",
      },
    },
  },
  plugins: [],
};
