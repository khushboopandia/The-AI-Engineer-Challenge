import type { NextConfig } from "next";

// Where the FastAPI backend lives. In local dev it defaults to the uvicorn
// server on :8000; set BACKEND_URL to point somewhere else. In production we
// leave /api alone so it goes to the same origin (e.g. Vercel's Python function).
const backendUrl =
  process.env.BACKEND_URL ??
  (process.env.NODE_ENV === "development" ? "http://localhost:8000" : undefined);

const nextConfig: NextConfig = {
  async rewrites() {
    if (!backendUrl) return [];
    // Proxying through Next keeps the browser on one origin, so the frontend
    // can always call a relative "/api/chat" path.
    return [{ source: "/api/:path*", destination: `${backendUrl}/api/:path*` }];
  },
};

export default nextConfig;
