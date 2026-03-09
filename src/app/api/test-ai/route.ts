import { NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { getUserAIConfig } from "@/lib/ai/get-user-key";
import { createUserGemini, createUserAnthropic, createUserOpenAI, PROVIDER_MODELS } from "@/lib/ai/client";

export async function GET() {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: "No user" }, { status: 401 });

  // Step 1: Get AI config
  const aiConfig = await getUserAIConfig(user.id);
  if (!aiConfig) {
    return NextResponse.json({ error: "No AI config found", step: "getUserAIConfig" });
  }

  // Step 2: Create model
  const modelId = PROVIDER_MODELS[aiConfig.provider].default;

  try {
    const { generateText } = await import("ai");

    const aiModel = aiConfig.provider === "openai"
      ? createUserOpenAI(aiConfig.apiKey)(modelId)
      : aiConfig.provider === "gemini"
      ? createUserGemini(aiConfig.apiKey)(modelId)
      : createUserAnthropic(aiConfig.apiKey)(modelId);

    // Step 3: Simple test call
    const result = await generateText({
      model: aiModel,
      prompt: "Say hello in one word.",
    });

    return NextResponse.json({
      success: true,
      provider: aiConfig.provider,
      model: modelId,
      output: result.text,
      usage: result.usage,
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      provider: aiConfig.provider,
      model: modelId,
      keyPrefix: aiConfig.apiKey.substring(0, 8) + "...",
      error: error instanceof Error ? error.message : String(error),
    });
  }
}
