import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth-helpers";
import { ok, handleError } from "@/lib/api";

// GET /api/v1/admin/verifications
export async function GET() {
  try {
    await requireAdmin();
    const verifications = await db.verificationRequest.findMany({
      orderBy: { created_at: "desc" },
      take: 200,
      include: {
        subject: { select: { id: true, full_name: true } },
        trust_score: { select: { total_score: true, grade: true } },
        badge: { select: { token: true, is_active: true } },
      },
    });
    return ok({ verifications });
  } catch (err) {
    return handleError(err);
  }
}
