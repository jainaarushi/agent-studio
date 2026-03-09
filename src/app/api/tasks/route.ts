import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { listTasks, createTask } from "@/lib/data/tasks";
import { createTaskSchema } from "@/lib/validators/task";
import { mockTasks } from "@/lib/mock-data";

export async function GET(request: NextRequest) {
  const user = await getAuthUser();

  // Demo user — return mock tasks
  if (user.isDemo) {
    const { searchParams } = new URL(request.url);
    const section = searchParams.get("section") || undefined;
    const filtered = section ? mockTasks.filter((t) => t.section === section) : mockTasks;
    return NextResponse.json(filtered);
  }

  const { searchParams } = new URL(request.url);
  const section = searchParams.get("section") || undefined;
  const status = searchParams.get("status") || undefined;

  const tasks = await listTasks(user.id, { section, status });
  return NextResponse.json(tasks);
}

export async function POST(request: NextRequest) {
  const user = await getAuthUser();
  if (user.isDemo) return NextResponse.json({ error: "Sign up to create tasks", login: true }, { status: 401 });

  const body = await request.json();
  const parsed = createTaskSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const task = await createTask(user.id, parsed.data);
  return NextResponse.json(task, { status: 201 });
}
