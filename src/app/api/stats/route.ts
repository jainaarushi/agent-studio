import { NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { getStats } from "@/lib/data/stats";

export async function GET() {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const stats = await getStats(user.id);
  return NextResponse.json(stats);
}
