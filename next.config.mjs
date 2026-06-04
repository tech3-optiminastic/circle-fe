import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Pin the workspace root so Next ignores stray parent lockfiles when tracing.
  outputFileTracingRoot: __dirname,
  // Hide the dev-tools indicator that overlaps the bottom of the sidebar.
  devIndicators: false,
};

export default nextConfig;
