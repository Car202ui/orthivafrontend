import createNextIntlPlugin from "next-intl/plugin";
import type { NextConfig } from "next";

// i18n lives under shared/ (see docs/ARCHITECTURE.md), not in next-intl's default src/i18n.
const withNextIntl = createNextIntlPlugin("./src/shared/i18n/request.ts");

const nextConfig: NextConfig = {
  // Do not auto-generate AGENTS.md / CLAUDE.md on every `next dev`.
  agentRules: false,
};

export default withNextIntl(nextConfig);
