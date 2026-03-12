import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
      },
    },
  },
  safelist: [
    "border-l-emerald-500", "bg-emerald-500/10", "text-emerald-400",
    "border-l-blue-500",    "bg-blue-500/10",    "text-blue-400",
    "border-l-violet-500",  "bg-violet-500/10",  "text-violet-400",
    "border-l-amber-500",   "bg-amber-500/10",   "text-amber-400",
  ],
  plugins: [],
};

export default config;
