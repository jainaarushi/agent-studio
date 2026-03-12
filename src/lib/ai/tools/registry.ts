// Central registry of all tools available to agents
// Each tool is created at runtime with the user's API keys

export type ToolId =
  | "web-search"
  | "web-scrape"
  | "finance-data"
  | "data-query"
  | "deep-research"
  | "calculator";

// Maps agent slugs to the tool keys they require
// If an agent isn't listed here, it needs no tool keys
export const AGENT_REQUIRED_TOOL_KEYS: Record<string, string[]> = {
  "deep-research": ["tavily"],
  "journalist": ["tavily"],
  "web-intel": ["tavily"],
  "competitor-intel": ["tavily"],
  "sales-rep": ["tavily"],
  "product-launch": ["tavily"],
  "travel-planner": ["tavily"],
  "legal-advisor": ["tavily"],
  "recruitment-agent": ["tavily"],
  "real-estate-analyst": ["tavily"],
};

export function getRequiredToolKeys(agentSlug: string): string[] {
  return AGENT_REQUIRED_TOOL_KEYS[agentSlug] || [];
}
