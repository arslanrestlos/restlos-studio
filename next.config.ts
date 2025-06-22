import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  turbopack: {
    resolveAlias: {
      underscore: 'lodash',
    },
    resolveExtensions: ['.mdx', '.tsx', '.ts', '.jsx', '.js', '.json'],
  },
  // ESLint Konfiguration
  eslint: {
    // Ignoriert ESLint Fehler während des Builds (für Production)
    ignoreDuringBuilds: true,
  },

  // TypeScript Konfiguration
  typescript: {
    // Ignoriert TypeScript Fehler während des Builds (für Production)
    ignoreBuildErrors: true,
  },

  // Image Optimierung
  images: {
    domains: [
      'localhost',
      // Füge hier deine Domains hinzu, falls du externe Bilder verwendest
    ],
  },
};

export default nextConfig;
