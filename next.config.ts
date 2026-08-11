import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // The portfolio is a self-contained static site in /public. Serving it at "/" via a
  // beforeFiles rewrite keeps the URL clean and, crucially, keeps relative links working:
  // "resume.html" inside index.html then resolves to /resume.html, which exists.
  async rewrites() {
    return {
      beforeFiles: [{ source: "/", destination: "/index.html" }],
      afterFiles: [],
      fallback: [],
    };
  },
};

export default nextConfig;
