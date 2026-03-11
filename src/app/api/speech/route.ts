import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseEnabled } from "@/lib/supabase/server";
import { decryptApiKey } from "@/lib/ai/encrypt";

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser();
    if (user.isDemo) {
      return NextResponse.json({ error: "Sign in to use voice input" }, { status: 401 });
    }

    // Get Wispr API key
    let wisprApiKey: string | null = null;

    if (isSupabaseEnabled()) {
      const supabase = await createClient();
      if (supabase) {
        const { data } = await supabase
          .from("users")
          .select("wispr_api_key")
          .eq("id", user.id)
          .single();

        if (data?.wispr_api_key) {
          try {
            wisprApiKey = decryptApiKey(data.wispr_api_key);
          } catch {
            return NextResponse.json({ error: "Failed to decrypt Wispr key" }, { status: 500 });
          }
        }
      }
    }

    if (!wisprApiKey) {
      return NextResponse.json({ error: "No Wispr API key. Add one in Settings." }, { status: 402 });
    }

    const { audio, language } = await request.json();

    if (!audio || typeof audio !== "string") {
      return NextResponse.json({ error: "audio (base64) is required" }, { status: 400 });
    }

    // Call Wispr Flow REST API
    const wisprRes = await fetch("https://platform-api.wisprflow.ai/api/v1/dash/api", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${wisprApiKey}`,
      },
      body: JSON.stringify({
        audio,
        language: language || ["en"],
      }),
    });

    if (!wisprRes.ok) {
      const errText = await wisprRes.text();
      console.error("Wispr API error:", wisprRes.status, errText);
      if (wisprRes.status === 401) {
        return NextResponse.json({ error: "Invalid Wispr API key. Check Settings." }, { status: 401 });
      }
      return NextResponse.json({
        error: `Wispr API error (${wisprRes.status}): ${errText}`,
      }, { status: wisprRes.status });
    }

    const result = await wisprRes.json();

    return NextResponse.json({
      text: result.text || "",
      language: result.detected_language || "en",
    });
  } catch (err) {
    console.error("Speech API error:", err);
    return NextResponse.json({
      error: `Speech processing failed: ${err instanceof Error ? err.message : "Unknown error"}`,
    }, { status: 500 });
  }
}
