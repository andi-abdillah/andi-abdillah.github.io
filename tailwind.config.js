/** @type {import('tailwindcss').Config} */
import defaultTheme from "tailwindcss/defaultTheme";

export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        // The "* fallback" families are metric-adjusted @font-face rules generated
        // at build time by fontaine (see vite.config.js). They render the system
        // font at the real font's dimensions so the swap causes no layout shift.
        inter: ["Inter", "Inter fallback", ...defaultTheme.fontFamily.sans],
        futura: ["FuturaNowHeadline", "FuturaNowHeadline fallback", ...defaultTheme.fontFamily.sans],
      },
      colors: {
        primary: "#741ce8",
        secondary: "#ffcb05",
      },
    },
  },
  plugins: [],
};
