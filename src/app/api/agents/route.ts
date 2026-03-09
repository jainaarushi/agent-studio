import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { listAgents, createAgent } from "@/lib/data/agents";
import { z } from "zod";

const createAgentSchema = z.object({
  name: z.string().min(1).max(100),
  slug: z.string().min(1).max(100),
  description: z.string().max(500).nullable().optional(),
  long_description: z.string().max(2000).nullable().optional(),
  icon: z.string().min(1).max(10),
  color: z.string().min(1),
  gradient: z.string().min(1),
  system_prompt: z.string().min(1).max(10000),
  model: z.string().min(1),
});

export async function GET() {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const agents = await listAgents(user.id);
  return NextResponse.json(agents);
}

export async function POST(request: NextRequest) {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const parsed = createAgentSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const agent = await createAgent(user.id, {
    ...parsed.data,
    description: parsed.data.description ?? null,
    long_description: parsed.data.long_description ?? null,
  });

  return NextResponse.json(agent, { status: 201 });
}
