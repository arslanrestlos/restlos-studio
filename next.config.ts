import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
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

  // Experimentelle Features (falls benötigt)
  experimental: {
    // Für bessere Performance
    turbo: {
      rules: {
        '*.svg': {
          loaders: ['@svgr/webpack'],
          as: '*.js',
        },
      },
    },
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
