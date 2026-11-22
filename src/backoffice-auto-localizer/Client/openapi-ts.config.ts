import { defineConfig } from "@hey-api/openapi-ts";

// Run the Web project first, then `npm run generate-client`.
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0"; // local dev certificate

export default defineConfig({
  input: "https://localhost:44382/umbraco/swagger/backoffice-auto-localizer/swagger.json",
  output: "src/api",
  plugins: [{ name: "@hey-api/client-fetch", throwOnError: true }, { name: "@hey-api/sdk", asClass: true }],
});
