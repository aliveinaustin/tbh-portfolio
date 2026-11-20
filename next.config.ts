import type { NextConfig } from "next";

// CSP is split in two: frame-ancestors/object-src/base-uri are narrow
// enough to enforce immediately (they don't touch script/style loading,
// so nothing can regress). script-src/connect-src ride in a separate
// Report-Only policy first, since 'unsafe-inline' is required (Next's
// own hydration bootstrap is an inline script, and a nonce would force
// every page to render dynamically instead of statically) and is worth
// watching in the console before ever enforcing it.
const ENFORCED_CSP = "frame-ancestors 'self'; object-src 'none'; base-uri 'self'";
const REPORT_ONLY_CSP = "script-src 'self' 'unsafe-inline' https://stats.thomasbrandonhays.com; connect-src 'self' 'unsafe-inline' https://stats.thomasbrandonhays.com";

const nextConfig: NextConfig = {
  /* config options here */
  output: 'standalone',
  devIndicators: false,
  // Omits the framework fingerprint from every response.
  poweredByHeader: false,
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
          { key: "Content-Security-Policy", value: ENFORCED_CSP },
          { key: "Content-Security-Policy-Report-Only", value: REPORT_ONLY_CSP },
        ],
      },
      // The anchor's `download` attribute alone is inconsistent across
      // browsers for same-origin PDFs — Chrome's built-in PDF viewer can
      // intercept the navigation and open it inline instead, and does so
      // unpredictably. Content-Disposition is a protocol-level instruction
      // the browser can't second-guess, so it always downloads.
      {
        source: "/Thomas_Hays_Resume.pdf",
        headers: [
          { key: "Content-Disposition", value: 'attachment; filename="Thomas_Hays_Resume.pdf"' },
        ],
      },
    ];
  },
};

export default nextConfig;
