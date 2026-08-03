import sharp from "sharp";
import {
  CAROUSEL_IMAGE_SPEC,
  PRODUCT_IMAGE_SPEC,
} from "@/lib/product-images";

export type UploadImageVariant = "carousel" | "product" | "gallery" | "primary";

const WEBP_QUALITY = 80;

function getMaxDimensions(variant: UploadImageVariant): {
  width: number;
  height: number;
} {
  switch (variant) {
    case "carousel":
    case "primary":
      return {
        width: CAROUSEL_IMAGE_SPEC.width,
        height: CAROUSEL_IMAGE_SPEC.height,
      };
    case "product":
    case "gallery":
      return {
        width: PRODUCT_IMAGE_SPEC.width,
        height: PRODUCT_IMAGE_SPEC.height,
      };
    default: {
      const unreachable: never = variant;
      return unreachable;
    }
  }
}

export function parseUploadImageVariant(value: FormDataEntryValue | null): UploadImageVariant {
  if (value === "carousel" || value === "product" || value === "gallery" || value === "primary") {
    return value;
  }

  return "product";
}

export async function optimizeUploadImage(
  buffer: Buffer,
  variant: UploadImageVariant = "product",
): Promise<Buffer> {
  const { width, height } = getMaxDimensions(variant);

  return sharp(buffer, { animated: false })
    .rotate()
    .resize(width, height, {
      fit: "inside",
      withoutEnlargement: true,
    })
    .webp({ quality: WEBP_QUALITY, effort: 4 })
    .toBuffer();
}
