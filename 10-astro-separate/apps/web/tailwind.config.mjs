/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{astro,html,js,jsx,ts,tsx,vue,svelte}"],
  theme: {
    extend: {
      colors: {
        ink: "#0b1220",
        mist: "#f4f6fb",
        accent: "#2563eb",
      },
    },
  },
  plugins: [],
};
