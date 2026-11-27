import { createHash } from "node:crypto"
import { readdirSync, readFileSync } from "node:fs"
import { fileURLToPath } from "node:url"

function buildPhotoManifest() {
  const directory = new URL("./public/products/", import.meta.url)
  const entries = readdirSync(fileURLToPath(directory), { withFileTypes: true })
  const manifest = Object.create(null)
  for (const file of entries) {
    if (!file.isFile() || !/^[A-Za-z0-9_-]{1,80}\.webp$/.test(file.name)) continue
    const content = readFileSync(new URL(file.name, directory))
    manifest[file.name.slice(0, -5)] = createHash("sha256").update(content).digest("hex").slice(0, 16)
  }
  return JSON.stringify(manifest)
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    // Versionado de logos y assets existentes.
    NEXT_PUBLIC_ASSET_VERSION:
      process.env.NEXT_PUBLIC_ASSET_VERSION ||
      process.env.VERCEL_DEPLOYMENT_ID ||
      process.env.VERCEL_GIT_COMMIT_SHA ||
      "local",
    NEXT_PUBLIC_CATALOG_LOCAL_PHOTOS_ENABLED: process.env.NEXT_PUBLIC_CATALOG_LOCAL_PHOTOS_ENABLED === "1" ? "1" : "0",
    NEXT_PUBLIC_CATALOG_PHOTO_MANIFEST: process.env.NEXT_PUBLIC_CATALOG_LOCAL_PHOTOS_ENABLED === "1" ? buildPhotoManifest() : "{}",
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
}

export default nextConfig
