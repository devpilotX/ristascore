import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth-helpers";
import { ok, handleError } from "@/lib/api";

// GET /api/v1/admin/badge-audit?token=rs_...
// Returns the view log for a badge, or the most recent views across all badges.
export async function GET(req: NextRequest) {
  try {
    await requireAdmin();
    const token = req.nextUrl.searchParams.get("token");

    if (token) {
      const badge = await db.trustBadge.findUnique({ where: { token } });
      if (!badge) return ok({ logs: [] });
      const logs = await db.badgeAuditLog.findMany({
        where: { badge_id: badge.id },
        orderBy: { viewed_at: "desc" },
        take: 200,
      });
      return ok({ logs });
    }

    const logs = await db.badgeAuditLog.findMany({
      orderBy: { viewed_at: "desc" },
      take: 200,
    });
    return ok({ logs });
  } catch (err) {
    return handleError(err);
  }
}
