const SIGNATURES: { mime: string; check: (buffer: Buffer) => boolean }[] = [
  {
    mime: "image/jpeg",
    check: (buffer) =>
      buffer.length >= 3 &&
      buffer[0] === 0xff &&
      buffer[1] === 0xd8 &&
      buffer[2] === 0xff,
  },
  {
    mime: "image/png",
    check: (buffer) =>
      buffer.length >= 8 &&
      buffer[0] === 0x89 &&
      buffer[1] === 0x50 &&
      buffer[2] === 0x4e &&
      buffer[3] === 0x47,
  },
  {
    mime: "image/gif",
    check: (buffer) =>
      buffer.length >= 6 &&
      (buffer.toString("ascii", 0, 6) === "GIF87a" ||
        buffer.toString("ascii", 0, 6) === "GIF89a"),
  },
  {
    mime: "image/webp",
    check: (buffer) =>
      buffer.length >= 12 &&
      buffer.toString("ascii", 0, 4) === "RIFF" &&
      buffer.toString("ascii", 8, 12) === "WEBP",
  },
  {
    mime: "image/avif",
    check: (buffer) =>
      buffer.length >= 12 &&
      buffer.toString("ascii", 4, 8) === "ftyp" &&
      buffer.toString("ascii", 8, 12).includes("avif"),
  },
  {
    mime: "image/heic",
    check: (buffer) =>
      buffer.length >= 12 &&
      buffer.toString("ascii", 4, 8) === "ftyp" &&
      (buffer.toString("ascii", 8, 12).includes("heic") ||
        buffer.toString("ascii", 8, 12).includes("heif") ||
        buffer.toString("ascii", 8, 12).includes("mif1")),
  },
];

export function detectImageMime(buffer: Buffer): string | null {
  for (const signature of SIGNATURES) {
    if (signature.check(buffer)) {
      return signature.mime;
    }
  }

  return null;
}

export function isAllowedImageBuffer(buffer: Buffer): boolean {
  return detectImageMime(buffer) !== null;
}
