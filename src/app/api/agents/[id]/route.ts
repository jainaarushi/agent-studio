import { NextRequest, NextResponse } from "next/server";
import { getAgent, deleteAgent } from "@/lib/mock-data";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const agent = getAgent(id);
  if (!agent) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(agent);
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const agent = getAgent(id);
  if (!agent) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await request.json();
  Object.assign(agent, body);
  return NextResponse.json(agent);
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const deleted = deleteAgent(id);
  if (!deleted) return NextResponse.json({ error: "Cannot delete preset agents" }, { status: 400 });

  return NextResponse.json({ success: true });
}
