// @ts-check
import { defineConfig } from "astro/config";

import mdx from "@astrojs/mdx";
import react from "@astrojs/react";
import { remarkYamlTable } from "./src/utils/remarkYamlTable.js";

// https://astro.build/config
export default defineConfig({
  integrations: [
    react(),
    mdx({
      remarkPlugins: [remarkYamlTable],
    }),
  ],
});
