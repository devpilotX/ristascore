import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { apiKeySchema } from "@/lib/schemas";
import { requireUser } from "@/lib/auth-helpers";
import { ok, handleError } from "@/lib/api";
import { generateApiKey } from "@/lib/tokens";

// POST /api/v1/api-keys
// The plaintext key is returned exactly once. Only its hash is stored.
export async function POST(req: NextRequest) {
  try {
    const user = await requireUser();
    const body = await req.json();
    const input = apiKeySchema.parse(body);

    const { plaintext, hash } = generateApiKey();
    const key = await db.apiKey.create({
      data: { owner_id: user.id, key_hash: hash, label: input.label },
      select: { id: true, label: true, created_at: true, is_active: true },
    });

    return ok({ api_key: key, plaintext, note: "Save this key now. It will not be shown again." }, 201);
  } catch (err) {
    return handleError(err);
  }
}

// GET /api/v1/api-keys
export async function GET() {
  try {
    const user = await requireUser();
    const keys = await db.apiKey.findMany({
      where: { owner_id: user.id },
      orderBy: { created_at: "desc" },
      select: { id: true, label: true, created_at: true, is_active: true },
    });
    return ok({ api_keys: keys });
  } catch (err) {
    return handleError(err);
  }
}
