import { NextResponse } from "next/server";
import { getCatalogConfig } from "@/lib/catalog-config-server";

export async function GET() {
  const config = await getCatalogConfig();
  return NextResponse.json(config);
}
