import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        primary: "#5750F1",
        stroke: "#E6EBF1",
        "stroke-dark": "#27303E",
        dark: {
          DEFAULT: "#111928",
          2: "#1F2A37",
          3: "#374151",
          4: "#4B5563",
          5: "#6B7280",
          6: "#9CA3AF",
          7: "#D1D5DB",
          8: "#E5E7EB",
        },
        gray: {
          DEFAULT: "#EFF4FB",
          dark: "#122031",
          1: "#F9FAFB",
          2: "#F3F4F6",
          3: "#E5E7EB",
          4: "#D1D5DB",
          5: "#9CA3AF",
          6: "#6B7280",
          7: "#374151",
        },
        green: "#22AD5C",
        red: {
          DEFAULT: "#F23030",
          light: {
            DEFAULT: "#F56060",
            3: "#FBC0C0",
            5: "#FEEBEB",
          },
        },
        "green-light-7": "#E9FBF0",
      },
      boxShadow: {
        card: "0px 1px 2px 0px rgba(0, 0, 0, 0.12)",
      },
    },
  },
  plugins: [],
};

export default config;
