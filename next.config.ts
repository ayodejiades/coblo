import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Transformers.js pulls in onnxruntime-node for server environments.
  // The browser build must never resolve it, or the client bundle explodes.
  serverExternalPackages: ["@huggingface/transformers", "onnxruntime-node", "sharp"],
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.alias = {
        ...config.resolve.alias,
        "onnxruntime-node": false,
        sharp: false,
      };
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        crypto: false,
      };
    }
    return config;
  },
};

export default nextConfig;
