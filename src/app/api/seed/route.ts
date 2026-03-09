import { NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseEnabled } from "@/lib/supabase/server";
import { PRESET_AGENTS } from "@/seed/agents";

export async function POST() {
  if (!isSupabaseEnabled()) {
    return NextResponse.json({ message: "Demo mode — agents already loaded in memory" });
  }

  const user = await getAuthUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = await createClient();
  if (!supabase) {
    return NextResponse.json({ error: "Supabase not available" }, { status: 500 });
  }

  // Check which preset agents this user already has
  const { data: existing } = await supabase
    .from("agents")
    .select("slug")
    .eq("user_id", user.id)
    .eq("is_preset", true);

  const existingSlugs = new Set((existing || []).map((a: { slug: string }) => a.slug));

  // Only insert agents that don't already exist for this user
  const toInsert = PRESET_AGENTS
    .filter((a) => !existingSlugs.has(a.slug))
    .map((a) => ({
      name: a.name,
      slug: a.slug,
      description: a.description,
      long_description: a.long_description,
      icon: a.icon,
      color: a.color,
      gradient: a.gradient,
      system_prompt: a.system_prompt,
      model: a.model,
      is_preset: true,
      is_public: true,
      user_id: user.id,
    }));

  if (toInsert.length === 0) {
    return NextResponse.json({
      message: "All preset agents already exist",
      count: existingSlugs.size,
    });
  }

  const { error } = await supabase.from("agents").insert(toInsert);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    message: `Seeded ${toInsert.length} preset agents`,
    seeded: toInsert.map((a) => a.name),
  });
}
