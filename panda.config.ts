import { defineConfig } from "@pandacss/dev";
import { recipes, slotRecipes } from "./src/theme/recipes";

export default defineConfig({
  preflight: true,
  include: [
    "./src/app/**/*.{js,jsx,ts,tsx}",
    "./src/components/**/*.{js,jsx,ts,tsx}",
    "./src/features/**/*.{js,jsx,ts,tsx}",
  ],
  exclude: [],
  jsxFramework: "react",
  theme: {
    extend: {
      recipes,
      slotRecipes,
    },
  },
  outdir: "styled-system",
});
