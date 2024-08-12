import daisyui from "daisyui"
import typography from "@tailwindcss/typography"

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [
    typography,
    daisyui,
  ],
  daisyui: {
    themes: ["cupcake", "night"],
  },
  darkMode: ['class', '[data-theme="night"]']
}