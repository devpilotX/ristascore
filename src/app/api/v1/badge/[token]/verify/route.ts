import { NextRequest } from "next/server";
import { lookupBadge, logBadgeView } from "@/lib/badge-service";
import { resolveApiKey } from "@/lib/auth-helpers";
import { ok, fail, handleError } from "@/lib/api";
import { rateLimit, clientIp } from "@/lib/rate-limit";

// GET /api/v1/badge/{token}/verify
// B2B. Requires a valid X-API-Key header. Rate limited per key.
export async function GET(req: NextRequest, { params }: { params: { token: string } }) {
  try {
    const apiKey = await resolveApiKey(req.headers.get("x-api-key"));
    if (!apiKey) return fail("A valid X-API-Key header is required", 401);

    const rl = rateLimit(`b2b:${apiKey.id}`, 60, 60_000);
    if (!rl.ok) return fail("Rate limit reached. Try again shortly.", 429);

    const result = await lookupBadge(params.token);
    if (result.state === "not_found") return fail("Badge not found", 404);
    if (result.state === "gone") return fail(result.reason, 410);

    await logBadgeView(result.badgeId, {
      ip: clientIp(req.headers),
      userAgent: req.headers.get("user-agent"),
      apiKeyId: apiKey.id,
    });

    return ok({ badge: result.view, verified_by: apiKey.label });
  } catch (err) {
    return handleError(err);
  }
}
