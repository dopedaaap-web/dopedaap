/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,ts,jsx,tsx}", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      boxShadow: {
        panel: "0 0 0 1px rgba(255,255,255,0.06), 0 24px 60px rgba(0,0,0,0.45)"
      }
    }
  },
  plugins: []
};
