import createNextIntlPlugin from "next-intl/plugin";
import type { NextConfig } from "next";

const withNextIntl = createNextIntlPlugin();

const nextConfig: NextConfig = {
  // Do not auto-generate AGENTS.md / CLAUDE.md on every `next dev`.
  agentRules: false,
};

export default withNextIntl(nextConfig);
