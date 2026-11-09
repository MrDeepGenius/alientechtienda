import type { Config } from "tailwindcss";
export default { content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: { extend: { colors: { ink: "#05060A", ink2: "#090C14", b1: "#126BFF", b2: "#00A3FF", b3: "#00E5FF", mut: "#8995A8" } } },
  plugins: [] } satisfies Config;
