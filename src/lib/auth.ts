import { createClient as createServerClient } from "@/lib/supabase/server";

const DEMO_USER_ID = "u1000000-0000-0000-0000-000000000001";

export async function getAuthUser(): Promise<{ id: string; email: string } | null> {
  const supabase = await createServerClient();
  if (!supabase) {
    // Demo mode — return fake user
    return { id: DEMO_USER_ID, email: "demo@cadre.app" };
  }

  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) return null;
  return { id: user.id, email: user.email || "" };
}
