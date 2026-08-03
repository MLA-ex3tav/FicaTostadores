import os from "os";
import type { NextConfig } from "next";
import { getBlobStoreHostname } from "@/lib/blob-storage";

const extraDevOrigins =
  process.env.EXTRA_DEV_ORIGINS?.split(",")
    .map((origin) => origin.trim())
    .filter(Boolean) ?? [];

function isIPv4Address(family: string | number): boolean {
  return family === "IPv4" || family === 4;
}

function getLocalNetworkDevOrigins(): string[] {
  if (process.env.NODE_ENV !== "development") {
    return [];
  }

  const origins = new Set<string>();

  for (const addresses of Object.values(os.networkInterfaces())) {
    if (!addresses) {
      continue;
    }

    for (const address of addresses) {
      if (isIPv4Address(address.family) && !address.internal) {
        origins.add(address.address);
      }
    }
  }

  return [...origins];
}

const blobHostname = getBlobStoreHostname();

const imageRemotePatterns: NonNullable<NextConfig["images"]>["remotePatterns"] =
  [];

if (blobHostname) {
  imageRemotePatterns.push({
    protocol: "https",
    hostname: blobHostname,
    port: "",
    pathname: "/**",
  });
}

imageRemotePatterns.push({
  protocol: "https",
  hostname: "*.public.blob.vercel-storage.com",
  port: "",
  pathname: "/**",
});

const nextConfig: NextConfig = {
  env: {
    NEXT_PUBLIC_BLOB_STORE_ID: process.env.BLOB_STORE_ID,
  },
  allowedDevOrigins: [
    "localhost",
    "127.0.0.1",
    ...getLocalNetworkDevOrigins(),
    ...extraDevOrigins,
  ],
  images: {
    qualities: [75, 80],
    localPatterns: [
      {
        pathname: "/images/**",
      },
      {
        pathname: "/uploads/**",
      },
    ],
    remotePatterns: imageRemotePatterns,
  },
};

export default nextConfig;
