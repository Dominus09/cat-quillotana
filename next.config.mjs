/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    // Cada deploy en Vercel tiene un ID distinto → logos en /public se recargan sin caché vieja.
    // Si no usas Vercel, define NEXT_PUBLIC_ASSET_VERSION en tu CI/hosting.
    NEXT_PUBLIC_ASSET_VERSION:
      process.env.NEXT_PUBLIC_ASSET_VERSION ||
      process.env.VERCEL_DEPLOYMENT_ID ||
      process.env.VERCEL_GIT_COMMIT_SHA ||
      "local",
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
}

export default nextConfig
