import { NextRequest } from "next/server";
import { lookupBadge } from "@/lib/badge-service";
import { badgeQrPng } from "@/lib/qr";

// GET /api/v1/badge/{token}/qr
// Returns a PNG QR code that points at the public badge page.
export async function GET(_req: NextRequest, { params }: { params: { token: string } }) {
  const result = await lookupBadge(params.token);
  if (result.state === "not_found") {
    return new Response("Badge not found", { status: 404 });
  }
  if (result.state === "gone") {
    return new Response(result.reason, { status: 410 });
  }

  const png = await badgeQrPng(params.token);
  return new Response(png as unknown as BodyInit, {
    status: 200,
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
