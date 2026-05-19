/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class", // Crucial para o funcionamento do tema
  theme: {
    extend: {
      colors: {
        // Paleta customizada baseada na Stripe (Light) e Gemini (Dark)
        brand: {
          light: "#FFFFFF",
          "light-subtle": "#F6F9FC",
          dark: "#131314", // Fundo Gemini
          "dark-subtle": "#1E1F20", // Superfície Gemini
          accent: "#4F46E5", // Índigo Stripe
          "accent-light": "#818CF8", // Índigo claro para Dark Mode
        },
        "text-primary": {
          light: "#1A1F36", // Cinza escuro Stripe
          dark: "#E3E3E3", // Off-white Gemini
        },
        "text-secondary": {
          light: "#4F566B",
          dark: "#C4C7C5",
        },
      },
    },
  },
  plugins: [],
};
