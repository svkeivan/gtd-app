import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: "#e6f1ff",
          100: "#bcd7ff",
          200: "#85b4ff",
          300: "#4d91ff",
          400: "#1a6dff",
          500: "#0052e6",
          600: "#0040b3",
          700: "#002e80",
          800: "#001c4d",
          900: "#000a1a",
        },
        secondary: {
          50: "#e6fff9",
          100: "#b3ffef",
          200: "#80ffe6",
          300: "#4dffdc",
          400: "#1affd2",
          500: "#00e6b8",
          600: "#00b38f",
          700: "#008066",
          800: "#004d3d",
          900: "#001a14",
        },
        accent: {
          50: "#fff2e6",
          100: "#ffd9b3",
          200: "#ffbf80",
          300: "#ffa64d",
          400: "#ff8c1a",
          500: "#e67300",
          600: "#b35900",
          700: "#804000",
          800: "#4d2600",
          900: "#1a0d00",
        },
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
       
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        chart: {
          "1": "hsl(var(--chart-1))",
          "2": "hsl(var(--chart-2))",
          "3": "hsl(var(--chart-3))",
          "4": "hsl(var(--chart-4))",
          "5": "hsl(var(--chart-5))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
    },
  },
  plugins: [require("tailwindcss-animate"), require("@tailwindcss/typography")],
} satisfies Config;
