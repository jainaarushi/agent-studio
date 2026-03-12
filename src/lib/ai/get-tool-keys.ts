import { createClient } from "@/lib/supabase/server";
import { isSupabaseEnabled } from "@/lib/supabase/server";
import { decryptApiKey } from "./encrypt";

export interface UserToolKeys {
  tavily?: string;
  firecrawl?: string;
  serp?: string;
}

export async function getUserToolKeys(userId: string): Promise<UserToolKeys> {
  if (!isSupabaseEnabled()) return {};

  const supabase = await createClient();
  if (!supabase) return {};

  const { data } = await supabase
    .from("users")
    .select("tavily_api_key, firecrawl_api_key, serp_api_key")
    .eq("id", userId)
    .single();

  if (!data) return {};

  const keys: UserToolKeys = {};

  if (data.tavily_api_key) {
    try {
      keys.tavily = decryptApiKey(data.tavily_api_key);
    } catch { /* skip */ }
  }
  if (data.firecrawl_api_key) {
    try {
      keys.firecrawl = decryptApiKey(data.firecrawl_api_key);
    } catch { /* skip */ }
  }
  if (data.serp_api_key) {
    try {
      keys.serp = decryptApiKey(data.serp_api_key);
    } catch { /* skip */ }
  }

  return keys;
}
