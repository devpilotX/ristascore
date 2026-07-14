/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        cream: "var(--cream)",
        "cream-2": "var(--cream-2)",
        ivory: "var(--ivory)",
        surface: "var(--surface)",
        maroon: "var(--maroon)",
        "maroon-dark": "var(--maroon-dark)",
        "maroon-soft": "var(--maroon-soft)",
        gold: "var(--gold)",
        "gold-dark": "var(--gold-dark)",
        "gold-soft": "var(--gold-soft)",
        ink: "var(--ink)",
        muted: "var(--muted)",
        line: "var(--line)",
        green: "var(--green)",
        amber: "var(--amber)",
        red: "var(--red)",
      },
      fontFamily: {
        serif: ["var(--serif)"],
        sans: ["var(--sans)"],
      },
    },
  },
  plugins: [],
};
