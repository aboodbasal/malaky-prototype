import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  devIndicators: false,
  // Next generates AGENTS.md/CLAUDE.md by default; this repo doesn't want them.
  agentRules: false,
};

export default nextConfig;
