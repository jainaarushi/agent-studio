import { NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { getStats } from "@/lib/data/stats";

export async function GET() {
  const user = await getAuthUser();

  if (user.isDemo) {
    return NextResponse.json({ working: 0, review: 0, spent: 0 });
  }

  const stats = await getStats(user.id);
  return NextResponse.json(stats);
}
