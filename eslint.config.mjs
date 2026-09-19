import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

/**
 * Architecture boundaries (see docs/ARCHITECTURE.md):
 *   app/      -> features (public index only) + shared
 *   features/ -> own files (relative) + shared. Never another feature.
 *   shared/   -> shared only. Never features or app.
 */
const FEATURES = ["identity", "patients", "clinics", "orders", "planning", "payments", "followups"];

const deepFeatureImports = {
  group: ["@/features/*/*"],
  message: "Import a feature through its public index: @/features/<name>. Inside a feature use relative paths.",
};

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    files: ["src/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            deepFeatureImports,
            { group: ["@/lib/*", "@/components/*", "@/i18n/*"], message: "Old layout. Use @/shared/* or @/features/*." },
          ],
        },
      ],
    },
  },
  {
    files: ["src/shared/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            deepFeatureImports,
            { group: ["@/features/*", "@/app/*"], message: "shared/ must not depend on features or app." },
          ],
        },
      ],
    },
  },
  ...FEATURES.map((feature) => ({
    files: [`src/features/${feature}/**/*.{ts,tsx}`],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            deepFeatureImports,
            {
              group: ["@/features/*", `!@/features/${feature}`],
              message: `A feature must not import another feature (${feature} may only use shared/).`,
            },
            { group: ["@/app/*"], message: "features/ must not depend on app/." },
          ],
        },
      ],
    },
  })),
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Vendored oidc-client-ts browser bundle used by public/silent-renew.html
    "public/oidc-client-ts.min.js",
  ]),
]);

export default eslintConfig;
