import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  output: 'standalone',
  devIndicators: false,
  // The anchor's `download` attribute alone is inconsistent across
  // browsers for same-origin PDFs — Chrome's built-in PDF viewer can
  // intercept the navigation and open it inline instead, and does so
  // unpredictably. Content-Disposition is a protocol-level instruction
  // the browser can't second-guess, so it always downloads.
  async headers() {
    return [
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
