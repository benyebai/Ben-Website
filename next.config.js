const nextConfig = {
  turbopack: {
    root: __dirname,
  },
  async rewrites() {
    return {
      fallback: [
        {
          source: "/:path*",
          destination: "/",
        },
      ],
    };
  },
};

module.exports = nextConfig;
