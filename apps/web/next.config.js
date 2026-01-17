/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  // Force rebuild with cache busting
  generateBuildId: async () => {
    return 'modern-ui-' + Date.now()
  }
}

module.exports = nextConfig
