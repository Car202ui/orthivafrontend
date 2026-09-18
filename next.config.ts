import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Do not auto-generate AGENTS.md / CLAUDE.md on every `next dev`.
  agentRules: false,
};

export default nextConfig;
