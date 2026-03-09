import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { approveTask } from "@/lib/data/tasks";

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const updated = await approveTask(user.id, id);
  if (!updated) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json(updated);
}
