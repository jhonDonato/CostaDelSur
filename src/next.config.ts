import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**',
      },
    ],
  },
  devIndicators: {
    buildActivity: false,
  },
  // The following is a workaround for a NextJS bug that causes cross-origin errors in Cloud Workstations.
  // The bug is tracked here: https://github.com/vercel/next.js/issues/67371
  // @ts-ignore - This is a valid experimental property, but may not be in the current TS types.
  experimental: {
    allowedNextBundlerVitalsRequests: [
      'https://6000-firebase-studio-1765151641841.cluster-zhw3w37rxzgkutusbbhib6qhra.cloudworkstations.dev',
    ],
  },
};

export default nextConfig;
