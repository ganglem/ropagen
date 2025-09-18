import type { NextConfig } from "next";
import createNextIntlPlugin from 'next-intl/plugin';
import { createMDX } from 'fumadocs-mdx/next';

const nextConfig: NextConfig = {
  /* config options here */
};

const withMDX = createMDX({
    // customise the config file path
    // configPath: "source.config.ts"
});


const withNextIntl = createNextIntlPlugin();

export default withMDX(withNextIntl(nextConfig));