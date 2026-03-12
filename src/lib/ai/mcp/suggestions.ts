import type { MCPServerSuggestion } from "./types";

/**
 * Pre-built MCP server suggestions for the Settings UI.
 * These are popular MCP servers that work well with specific agents.
 * Inspired by awesome-llm-apps tool integrations (GitHub, Slack, DBs, CRMs).
 */
export const MCP_SERVER_SUGGESTIONS: MCPServerSuggestion[] = [
  {
    type: "github",
    name: "GitHub",
    description: "Access repos, PRs, issues, and code. Agents can review code, manage issues, and read repo contents.",
    icon: "GH",
    color: "#24292F",
    urlPlaceholder: "https://mcp.github.com/sse",
    authPlaceholder: "GitHub personal access token (ghp_...)",
    authRequired: true,
    recommendedAgents: ["code-reviewer", "debugger", "sprint-planner", "project-planner", "fullstack-developer"],
    docsUrl: "https://github.com/modelcontextprotocol/servers/tree/main/src/github",
  },
  {
    type: "slack",
    name: "Slack",
    description: "Read channels, send messages, search history. Agents can access team context and post updates.",
    icon: "SL",
    color: "#4A154B",
    urlPlaceholder: "http://localhost:3001/sse",
    authPlaceholder: "Slack Bot Token (xoxb-...)",
    authRequired: true,
    recommendedAgents: ["meeting-notes", "project-planner", "customer-support"],
    docsUrl: "https://github.com/modelcontextprotocol/servers/tree/main/src/slack",
  },
  {
    type: "postgres",
    name: "PostgreSQL",
    description: "Query your database directly. Agents can analyze data, generate reports, and explore schemas.",
    icon: "PG",
    color: "#336791",
    urlPlaceholder: "http://localhost:3002/sse",
    authPlaceholder: "PostgreSQL connection string",
    authRequired: true,
    recommendedAgents: ["data-analyst", "debugger", "fullstack-developer"],
    docsUrl: "https://github.com/modelcontextprotocol/servers/tree/main/src/postgres",
  },
  {
    type: "google-sheets",
    name: "Google Sheets",
    description: "Read and write spreadsheet data. Agents can analyze and update your Google Sheets.",
    icon: "GS",
    color: "#34A853",
    urlPlaceholder: "http://localhost:3003/sse",
    authPlaceholder: "Google service account JSON key",
    authRequired: true,
    recommendedAgents: ["data-analyst", "project-planner", "recruitment-agent"],
    docsUrl: "https://github.com/modelcontextprotocol/servers/tree/main/src/google-sheets",
  },
  {
    type: "linear",
    name: "Linear",
    description: "Manage issues, projects, and cycles. Agents can create tickets, update status, and plan sprints.",
    icon: "LN",
    color: "#5E6AD2",
    urlPlaceholder: "http://localhost:3004/sse",
    authPlaceholder: "Linear API key (lin_api_...)",
    authRequired: true,
    recommendedAgents: ["sprint-planner", "project-planner", "debugger"],
    docsUrl: "https://github.com/modelcontextprotocol/servers/tree/main/src/linear",
  },
  {
    type: "jira",
    name: "Jira",
    description: "Access projects, issues, and boards. Agents can manage tickets and plan sprints.",
    icon: "JR",
    color: "#0052CC",
    urlPlaceholder: "http://localhost:3005/sse",
    authPlaceholder: "Jira API token",
    authRequired: true,
    recommendedAgents: ["sprint-planner", "project-planner", "debugger"],
    docsUrl: "https://github.com/modelcontextprotocol/servers/tree/main/src/jira",
  },
  {
    type: "notion",
    name: "Notion",
    description: "Read and write pages, databases. Agents can access your knowledge base and documentation.",
    icon: "NT",
    color: "#000000",
    urlPlaceholder: "http://localhost:3006/sse",
    authPlaceholder: "Notion integration token (secret_...)",
    authRequired: true,
    recommendedAgents: ["meeting-notes", "project-planner", "technical-writer"],
    docsUrl: "https://github.com/modelcontextprotocol/servers/tree/main/src/notion",
  },
  {
    type: "sentry",
    name: "Sentry",
    description: "Access error tracking and performance data. Agents can analyze bugs and diagnose issues.",
    icon: "ST",
    color: "#362D59",
    urlPlaceholder: "http://localhost:3007/sse",
    authPlaceholder: "Sentry auth token",
    authRequired: true,
    recommendedAgents: ["debugger", "code-reviewer", "fullstack-developer"],
    docsUrl: "https://github.com/modelcontextprotocol/servers/tree/main/src/sentry",
  },
  {
    type: "browserbase",
    name: "Browserbase",
    description: "Full browser automation. Agents can interact with web apps, fill forms, and extract data from JS-heavy sites.",
    icon: "BB",
    color: "#FF6B00",
    urlPlaceholder: "http://localhost:3008/sse",
    authPlaceholder: "Browserbase API key",
    authRequired: true,
    recommendedAgents: ["web-intel", "competitor-intel", "sales-rep"],
    docsUrl: "https://github.com/browserbase/mcp-server-browserbase",
  },
  {
    type: "custom",
    name: "Custom Server",
    description: "Connect any MCP-compatible server. Provide the Streamable HTTP or SSE endpoint URL.",
    icon: "MCP",
    color: "#6366F1",
    urlPlaceholder: "https://your-server.com/mcp or http://localhost:PORT/sse",
    authPlaceholder: "Auth token (optional)",
    authRequired: false,
    recommendedAgents: [],
    docsUrl: "https://modelcontextprotocol.io/docs",
  },
];

export function getSuggestionForType(type: string): MCPServerSuggestion | undefined {
  return MCP_SERVER_SUGGESTIONS.find(s => s.type === type);
}

/**
 * Agents that strongly benefit from MCP — running them without MCP
 * produces generic output. Returns the recommended MCP server types
 * and a user-facing message explaining what MCP would unlock.
 */
export interface MCPRecommendation {
  serverTypes: string[];
  serverNames: string[];
  message: string;
  settingsHint: string;
}

const AGENT_MCP_RECOMMENDATIONS: Record<string, MCPRecommendation> = {
  "code-reviewer": {
    serverTypes: ["github"],
    serverNames: ["GitHub"],
    message: "Connect your GitHub to review actual PRs, diffs, and repo code instead of generic advice.",
    settingsHint: "Add a GitHub MCP server in Settings → External Tool Servers to unlock real code review.",
  },
  "debugger": {
    serverTypes: ["github", "sentry"],
    serverNames: ["GitHub", "Sentry"],
    message: "Connect GitHub and/or Sentry to pull real error logs, stack traces, and code context.",
    settingsHint: "Add GitHub or Sentry MCP servers in Settings → External Tool Servers for real debugging.",
  },
  "sprint-planner": {
    serverTypes: ["linear", "jira"],
    serverNames: ["Linear", "Jira"],
    message: "Connect your project tracker to read the real backlog and plan sprints with actual tickets.",
    settingsHint: "Add a Linear or Jira MCP server in Settings → External Tool Servers for real sprint planning.",
  },
  "project-planner": {
    serverTypes: ["linear", "jira", "notion"],
    serverNames: ["Linear", "Jira", "Notion"],
    message: "Connect your project management tools to create plans based on real project data.",
    settingsHint: "Add Linear, Jira, or Notion MCP servers in Settings → External Tool Servers.",
  },
  "customer-support": {
    serverTypes: ["slack"],
    serverNames: ["Slack"],
    message: "Connect Slack to access customer conversation history and team context.",
    settingsHint: "Add a Slack MCP server in Settings → External Tool Servers for contextual support.",
  },
  "meeting-notes": {
    serverTypes: ["slack", "notion"],
    serverNames: ["Slack", "Notion"],
    message: "Connect Slack or Notion to pull meeting context, attendee info, and prior notes.",
    settingsHint: "Add Slack or Notion MCP servers in Settings → External Tool Servers.",
  },
  "data-analyst": {
    serverTypes: ["postgres", "google-sheets"],
    serverNames: ["PostgreSQL", "Google Sheets"],
    message: "Connect your database or spreadsheets to analyze real data instead of just uploaded files.",
    settingsHint: "Add a PostgreSQL or Google Sheets MCP server in Settings → External Tool Servers.",
  },
  "fullstack-developer": {
    serverTypes: ["github"],
    serverNames: ["GitHub"],
    message: "Connect GitHub to read your actual codebase, issues, and PRs for contextualized development help.",
    settingsHint: "Add a GitHub MCP server in Settings → External Tool Servers.",
  },
  "sales-rep": {
    serverTypes: ["hubspot", "salesforce"],
    serverNames: ["HubSpot", "Salesforce"],
    message: "Connect your CRM to pull real prospect data, deal history, and contact information.",
    settingsHint: "Add a HubSpot or Salesforce MCP server in Settings → External Tool Servers.",
  },
  "recruitment-agent": {
    serverTypes: ["google-sheets", "notion"],
    serverNames: ["Google Sheets", "Notion"],
    message: "Connect your ATS or spreadsheets to access real candidate data and job requirements.",
    settingsHint: "Add a Google Sheets or Notion MCP server in Settings → External Tool Servers.",
  },
  "web-intel": {
    serverTypes: ["browserbase"],
    serverNames: ["Browserbase"],
    message: "Connect Browserbase for full browser automation to scrape JS-heavy sites and interact with web apps.",
    settingsHint: "Add a Browserbase MCP server in Settings → External Tool Servers.",
  },
};

/**
 * Check if an agent would benefit from MCP servers that aren't configured.
 * Returns null if no recommendation, or the recommendation if MCP would help.
 */
export function getAgentMCPRecommendation(
  agentSlug: string,
  configuredServerTypes: string[],
): MCPRecommendation | null {
  const rec = AGENT_MCP_RECOMMENDATIONS[agentSlug];
  if (!rec) return null;

  // Check if ANY recommended server type is already configured
  const hasAny = rec.serverTypes.some(t => configuredServerTypes.includes(t));
  if (hasAny) return null; // User already has at least one relevant MCP server

  return rec;
}
