import { NextRequest } from "next/server";
import { lookupBadge, logBadgeView } from "@/lib/badge-service";
import { ok, fail, handleError } from "@/lib/api";
import { clientIp } from "@/lib/rate-limit";

// GET /api/v1/badge/{token}
// Public. Logs every view. Returns 410 if revoked or expired.
export async function GET(req: NextRequest, { params }: { params: { token: string } }) {
  try {
    const result = await lookupBadge(params.token);

    if (result.state === "not_found") return fail("Badge not found", 404);
    if (result.state === "gone") return fail(result.reason, 410);

    await logBadgeView(result.badgeId, {
      ip: clientIp(req.headers),
      userAgent: req.headers.get("user-agent"),
    });

    return ok({ badge: result.view });
  } catch (err) {
    return handleError(err);
  }
}
