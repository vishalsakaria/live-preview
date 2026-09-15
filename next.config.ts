import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // `headers()` lets Next.js attach extra HTTP response headers to matching
  // routes, on every request, without touching individual route handlers.
  // See https://nextjs.org/docs/app/api-reference/config/next-config-js/headers
  async headers() {
    return [
      {
        // Contentful's live preview pane embeds the site in an iframe, which the
        // browser only allows if it is listed in frame-ancestors. Do not add an
        // X-Frame-Options header here; it would block the pane regardless.
        source: "/:path*",
        headers: [
          {
            key: "Content-Security-Policy",
            value:
              "frame-ancestors 'self' https://app.contentful.com https://app.eu.contentful.com;",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
