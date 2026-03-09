import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { reviseTask } from "@/lib/data/tasks";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const { note } = await request.json();

  const updated = await reviseTask(user.id, id, note);
  if (!updated) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json(updated);
}
