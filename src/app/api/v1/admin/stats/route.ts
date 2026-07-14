import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth-helpers";
import { ok, handleError } from "@/lib/api";

// GET /api/v1/admin/stats
export async function GET() {
  try {
    await requireAdmin();
    const [users, consents, verifications, badges, activeBadges, disputes] = await Promise.all([
      db.user.count(),
      db.consent.count(),
      db.verificationRequest.count(),
      db.trustBadge.count(),
      db.trustBadge.count({ where: { is_active: true } }),
      db.dispute.count(),
    ]);
    return ok({
      stats: { users, consents, verifications, badges, active_badges: activeBadges, disputes },
    });
  } catch (err) {
    return handleError(err);
  }
}
