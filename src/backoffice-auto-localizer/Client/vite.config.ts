import { defineConfig } from "vite";

// Output is served by the RCL at /App_Plugins/backoffice-auto-localizer/ (StaticWebAssetBasePath).
export default defineConfig({
  build: {
    lib: { entry: "src/index.ts", formats: ["es"], fileName: "backoffice-auto-localizer" },
    outDir: "../wwwroot",
    emptyOutDir: true,
    sourcemap: true,
    rollupOptions: { external: [/^@umbraco/] },
  },
});
