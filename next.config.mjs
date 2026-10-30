/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
  cacheComponents: true,
  partialPrefetching: true,
  // The plan calls the tool "Rank Checker"; keep the original address working too.
  async redirects() {
    return [
      { source: "/rank-checker", destination: "/rank-guidance", permanent: true },
      // Courses now live inside each college; Services and Stories were removed.
      { source: "/courses", destination: "/colleges", permanent: true },
      { source: "/services", destination: "/contact", permanent: true },
      { source: "/stories", destination: "/", permanent: true },
    ];
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
