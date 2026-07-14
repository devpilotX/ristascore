import { db } from "@/lib/db";
import { hasRedis } from "@/lib/env";

// GET /api/v1/health
export async function GET() {
  let dbOk = false;
  try {
    await db.$queryRaw`SELECT 1`;
    dbOk = true;
  } catch {
    dbOk = false;
  }

  const body = {
    status: dbOk ? "ok" : "degraded",
    db: dbOk,
    redis: hasRedis,
    time: new Date().toISOString(),
  };
  return Response.json(body, { status: dbOk ? 200 : 503 });
}
