# AgentStudio: Complete Agent Implementation Plan

> Reference: [awesome-llm-apps](https://github.com/Shubhamsaboo/awesome-llm-apps/)
> Goal: Every agent works with real tools and beautiful, agent-specific UI — not generic text-in/text-out.

---

## Table of Contents
1. [Architecture Overview](#1-architecture-overview)
2. [Settings & API Key Management](#2-settings--api-key-management)
3. [Tool System (Backend)](#3-tool-system-backend)
4. [Pipeline System Upgrade](#4-pipeline-system-upgrade)
5. [Agent-Specific Input UI](#5-agent-specific-input-ui)
6. [Agent-Specific Output UI](#6-agent-specific-output-ui)
7. [Execution Engine Upgrade](#7-execution-engine-upgrade)
8. [Agent Catalog (All Agents)](#8-agent-catalog-all-agents)
9. [File-by-File Implementation Order](#9-file-by-file-implementation-order)
10. [Dependencies](#10-dependencies)

---

## 1. Architecture Overview

### Current Flow
```
User fills title/description → picks agent → run → generateText(system_prompt, title+desc) → markdown output
```

### New Flow
```
User fills AGENT-SPECIFIC FORM → picks agent → run →
  pipeline steps with REAL TOOL CALLS (web search, finance API, SQL, scraping) →
  AGENT-SPECIFIC OUTPUT RENDERER (charts, tables, itineraries, code blocks)
```

### Key Principle: Streamlit → Next.js Translation

awesome-llm-apps uses Streamlit where each agent is a standalone Python script with:
- `st.text_input()` → We use **agent-specific input components** mounted in the create-task-modal
- `st.sidebar` for API keys → We use the **Settings page** (already has OpenAI/Gemini/Anthropic/Wispr)
- `st.spinner()` → We already have **real-time step progress with polling**
- `st.markdown(response)` → We use **agent-specific output renderers** in task-detail-modal
- `agent.run(query)` → We use **`generateText()` with Vercel AI SDK tool calling**
- External tools (YFinance, DuckDB, Firecrawl) → We use **server-side tool functions** called via Vercel AI SDK

The difference: Streamlit apps are disposable scripts. AgentStudio is a **platform** where every agent shares auth, key management, task history, cost tracking, and review/approve workflows. Each agent just plugs in its unique input form, tools, and output renderer.

---

## 2. Settings & API Key Management

### Problem
awesome-llm-apps agents require additional API keys beyond the core LLM key:
- **Firecrawl** — for deep web research, web scraping
- **Tavily** — alternative web search API
- **SerpAPI** — Google search results
- **Yahoo Finance** — free, no key needed (use yfinance npm equivalent)
- **DuckDB** — local, no key needed

### Solution: Add "Tool Keys" Section to Settings Page

**File to modify:** `src/app/(app)/settings/page.tsx`

Add a new "Tool API Keys" card below the existing "Voice Input" card:

```typescript
// New provider type — extend the existing system
type ToolProvider = "tavily" | "firecrawl" | "serp";

// New tool keys config
const toolProviders = [
  {
    id: "tavily" as ToolProvider,
    name: "Tavily",
    icon: "🔍",
    color: "#2563EB",
    gradient: "linear-gradient(135deg, #2563EB, #3B82F6)",
    placeholder: "tvly-...",
    description: "Web search for research agents. Powers Deep Research, Journalist, Competitor Intel.",
    link: "https://tavily.com",
    linkText: "Get free key at tavily.com (1000 free searches/month)",
    badge: "Free Tier",
    badgeColor: "#2563EB",
    validation: (key: string) => key.startsWith("tvly-"),
    validationError: "Invalid Tavily key. Must start with tvly-",
  },
  {
    id: "firecrawl" as ToolProvider,
    name: "Firecrawl",
    icon: "🔥",
    color: "#F97316",
    gradient: "linear-gradient(135deg, #F97316, #FB923C)",
    placeholder: "fc-...",
    description: "Advanced web scraping and deep research. Used by Web Intel, Deep Research agents.",
    link: "https://firecrawl.dev",
    linkText: "Get key at firecrawl.dev (500 free credits)",
    badge: "Optional",
    badgeColor: "#F97316",
    validation: (key: string) => key.startsWith("fc-"),
    validationError: "Invalid Firecrawl key. Must start with fc-",
  },
  {
    id: "serp" as ToolProvider,
    name: "SerpAPI",
    icon: "🌐",
    color: "#059669",
    gradient: "linear-gradient(135deg, #059669, #10B981)",
    placeholder: "...",
    description: "Google search results for research agents. Alternative to Tavily.",
    link: "https://serpapi.com",
    linkText: "Get key at serpapi.com (100 free searches/month)",
    badge: "Optional",
    badgeColor: "#059669",
    validation: () => true,
    validationError: "",
  },
];
```

### Backend changes for tool keys:

**File:** `src/app/api/user/api-key/route.ts`

Extend the valid providers list:
```typescript
// Change line 58:
if (!provider || !["openai", "gemini", "anthropic", "wispr", "tavily", "firecrawl", "serp"].includes(provider)) {
```

Add validation for new providers and column mappings.

**Database:** Add columns to `users` table:
```sql
ALTER TABLE users ADD COLUMN tavily_api_key TEXT;
ALTER TABLE users ADD COLUMN firecrawl_api_key TEXT;
ALTER TABLE users ADD COLUMN serp_api_key TEXT;
```

**File:** `src/lib/ai/get-user-key.ts`

Add a new function:
```typescript
export async function getUserToolKeys(userId: string): Promise<{
  tavily?: string;
  firecrawl?: string;
  serp?: string;
}> {
  // Decrypt and return tool API keys for the user
  // Used by tool functions during pipeline execution
}
```

### How agents indicate they need a tool key

Each agent definition in `src/seed/agents.ts` gets a new field:
```typescript
required_tool_keys?: ToolProvider[];  // e.g., ["tavily"] for research agents
```

When a user tries to run an agent that needs a tool key they haven't set up:
- Return **402** with a specific message: "This agent needs a Tavily API key for web search. Add it in Settings."
- The auth overlay (already exists) shows a countdown and redirects to `/settings`.

### What agents need which keys

| Agent | Required Key | Why |
|-------|-------------|-----|
| Deep Research | tavily OR firecrawl | Web search for research |
| Journalist | tavily | Search for news sources |
| Competitor Intelligence | tavily | Search competitor info |
| Web Intel / Web Scraper | firecrawl OR tavily | Scrape/search web pages |
| Product Launch Intel | tavily | Market research |
| Sales Intelligence | tavily | Prospect research |
| Investment Analyst | NONE (free Yahoo Finance API) | - |
| Data Analyst | NONE (local SQL processing) | - |
| Travel Planner | tavily | Search destinations |
| All other agents | NONE | Pure LLM, no external tools |

**Key insight:** Most agents work with just an LLM key. Only ~8 agents need Tavily (the most useful one), and Tavily has a free tier (1000 searches/month). Firecrawl is optional/advanced.

---

## 3. Tool System (Backend)

### 3A: Tool Registry

**Create file:** `src/lib/ai/tools/registry.ts`

```typescript
import { tool } from "ai"; // Vercel AI SDK tool definition
import { z } from "zod";

// Central registry of all tools available to agents
export const TOOL_DEFINITIONS = {
  "web-search": {
    name: "web_search",
    description: "Search the web for current information on any topic",
    parameters: z.object({
      query: z.string().describe("The search query"),
      max_results: z.number().optional().default(5).describe("Max results to return"),
    }),
    // execute function is injected at runtime with the user's API key
  },

  "web-scrape": {
    name: "web_scrape",
    description: "Fetch and extract content from a specific URL",
    parameters: z.object({
      url: z.string().url().describe("URL to scrape"),
      extract: z.string().optional().describe("What to extract from the page"),
    }),
  },

  "finance-data": {
    name: "get_stock_data",
    description: "Get stock price, fundamentals, analyst recommendations, and financial data",
    parameters: z.object({
      symbol: z.string().describe("Stock ticker symbol (e.g., AAPL, GOOGL)"),
      data_type: z.enum(["price", "fundamentals", "recommendations", "history", "comparison"]),
      period: z.string().optional().default("1mo").describe("Time period for history"),
    }),
  },

  "data-query": {
    name: "query_data",
    description: "Run a SQL query on the uploaded data",
    parameters: z.object({
      sql: z.string().describe("SQL query to execute on the 'uploaded_data' table"),
    }),
  },

  "calculator": {
    name: "calculate",
    description: "Perform mathematical calculations",
    parameters: z.object({
      expression: z.string().describe("Math expression to evaluate"),
    }),
  },
};
```

### 3B: Tool Implementations

**Create file:** `src/lib/ai/tools/web-search.ts`

```typescript
// Tavily web search implementation
// Tavily is preferred because:
// 1. Free tier (1000 searches/month)
// 2. Returns clean, structured results (not raw HTML)
// 3. Has a "search depth" parameter (basic vs advanced)
// 4. Returns answer snippets, not just links

import { tool } from "ai";
import { z } from "zod";

export function createWebSearchTool(tavilyApiKey: string) {
  return tool({
    description: "Search the web for current information. Returns relevant results with snippets.",
    parameters: z.object({
      query: z.string().describe("Search query"),
      search_depth: z.enum(["basic", "advanced"]).optional().default("basic"),
      max_results: z.number().optional().default(5),
    }),
    execute: async ({ query, search_depth, max_results }) => {
      const response = await fetch("https://api.tavily.com/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          api_key: tavilyApiKey,
          query,
          search_depth,
          max_results,
          include_answer: true,
          include_raw_content: false,
        }),
      });

      if (!response.ok) throw new Error(`Tavily search failed: ${response.statusText}`);
      const data = await response.json();

      return {
        answer: data.answer,
        results: data.results.map((r: any) => ({
          title: r.title,
          url: r.url,
          content: r.content,
          score: r.score,
        })),
      };
    },
  });
}
```

**Create file:** `src/lib/ai/tools/web-scrape.ts`

```typescript
// Firecrawl web scraping implementation
// Falls back to basic fetch+cheerio if no Firecrawl key

import { tool } from "ai";
import { z } from "zod";

export function createWebScrapeTool(firecrawlApiKey?: string) {
  return tool({
    description: "Fetch and extract content from a URL. Returns the page content as clean text.",
    parameters: z.object({
      url: z.string().url().describe("URL to fetch"),
    }),
    execute: async ({ url }) => {
      if (firecrawlApiKey) {
        // Use Firecrawl for better extraction
        const response = await fetch("https://api.firecrawl.dev/v1/scrape", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${firecrawlApiKey}`,
          },
          body: JSON.stringify({
            url,
            formats: ["markdown"],
          }),
        });
        const data = await response.json();
        return { content: data.data?.markdown || "Failed to extract content", url };
      } else {
        // Basic fetch fallback (no key needed)
        const response = await fetch(url, {
          headers: { "User-Agent": "AgentStudio/1.0" },
        });
        const html = await response.text();
        // Strip HTML tags for basic extraction
        const text = html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim().slice(0, 10000);
        return { content: text, url };
      }
    },
  });
}
```

**Create file:** `src/lib/ai/tools/finance-data.ts`

```typescript
// Yahoo Finance data via free API (no key needed!)
// Uses the unofficial Yahoo Finance API endpoints that don't require authentication

import { tool } from "ai";
import { z } from "zod";

export function createFinanceDataTool() {
  return tool({
    description: "Get stock market data including price, fundamentals, recommendations, and history",
    parameters: z.object({
      symbol: z.string().describe("Stock ticker (e.g., AAPL, TSLA, GOOGL)"),
      data_type: z.enum(["quote", "fundamentals", "history"]).describe("Type of data"),
    }),
    execute: async ({ symbol, data_type }) => {
      const ticker = symbol.toUpperCase();

      if (data_type === "quote") {
        // Get current quote data
        const res = await fetch(
          `https://query1.finance.yahoo.com/v8/finance/chart/${ticker}?interval=1d&range=5d`
        );
        const data = await res.json();
        const meta = data.chart?.result?.[0]?.meta;
        if (!meta) return { error: `No data found for ${ticker}` };

        return {
          symbol: ticker,
          price: meta.regularMarketPrice,
          previousClose: meta.previousClose,
          change: (meta.regularMarketPrice - meta.previousClose).toFixed(2),
          changePercent: (((meta.regularMarketPrice - meta.previousClose) / meta.previousClose) * 100).toFixed(2) + "%",
          currency: meta.currency,
          exchange: meta.exchangeName,
        };
      }

      if (data_type === "fundamentals") {
        // Use quoteSummary for P/E, market cap, etc.
        const res = await fetch(
          `https://query2.finance.yahoo.com/v10/finance/quoteSummary/${ticker}?modules=financialData,defaultKeyStatistics,summaryDetail`
        );
        const data = await res.json();
        const result = data.quoteSummary?.result?.[0];
        if (!result) return { error: `No fundamentals for ${ticker}` };

        const fin = result.financialData || {};
        const stats = result.defaultKeyStatistics || {};
        const summary = result.summaryDetail || {};

        return {
          symbol: ticker,
          marketCap: summary.marketCap?.fmt,
          peRatio: summary.trailingPE?.fmt,
          forwardPE: summary.forwardPE?.fmt,
          dividendYield: summary.dividendYield?.fmt,
          fiftyTwoWeekHigh: summary.fiftyTwoWeekHigh?.fmt,
          fiftyTwoWeekLow: summary.fiftyTwoWeekLow?.fmt,
          revenue: fin.totalRevenue?.fmt,
          profitMargin: fin.profitMargins?.fmt,
          targetMeanPrice: fin.targetMeanPrice?.fmt,
          recommendationKey: fin.recommendationKey,
          numberOfAnalystOpinions: fin.numberOfAnalystOpinions?.raw,
          beta: stats.beta?.fmt,
        };
      }

      if (data_type === "history") {
        // Get 6 months of daily data for charting
        const res = await fetch(
          `https://query1.finance.yahoo.com/v8/finance/chart/${ticker}?interval=1d&range=6mo`
        );
        const data = await res.json();
        const result = data.chart?.result?.[0];
        if (!result) return { error: `No history for ${ticker}` };

        const timestamps = result.timestamp || [];
        const closes = result.indicators?.quote?.[0]?.close || [];

        // Return sampled data points (every 5 days to keep it manageable)
        const points = timestamps
          .filter((_: number, i: number) => i % 5 === 0)
          .map((ts: number, i: number) => ({
            date: new Date(ts * 1000).toISOString().split("T")[0],
            close: closes[i * 5]?.toFixed(2),
          }));

        return { symbol: ticker, period: "6mo", data: points };
      }

      return { error: "Unknown data_type" };
    },
  });
}
```

**Create file:** `src/lib/ai/tools/data-query.ts`

```typescript
// SQL query execution on uploaded CSV/spreadsheet data
// Uses alasql for in-memory SQL processing (no external service needed)

import { tool } from "ai";
import { z } from "zod";

// We'll store the uploaded data in memory during task execution
// The data gets parsed by the existing file upload system and passed to the pipeline

export function createDataQueryTool(data: Record<string, unknown>[], columns: string[]) {
  return tool({
    description: `Run SQL queries on the uploaded data. The table is called 'uploaded_data'. Available columns: ${columns.join(", ")}`,
    parameters: z.object({
      sql: z.string().describe("SQL query. Use 'uploaded_data' as the table name."),
    }),
    execute: async ({ sql }) => {
      // Dynamic import alasql (it's a heavy library)
      const alasql = (await import("alasql")).default;

      // Register the data as a temporary table
      alasql("DROP TABLE IF EXISTS uploaded_data");
      alasql("CREATE TABLE uploaded_data");
      alasql.tables.uploaded_data.data = data;

      try {
        const result = alasql(sql);
        return {
          success: true,
          rows: Array.isArray(result) ? result.slice(0, 100) : result, // Cap at 100 rows
          rowCount: Array.isArray(result) ? result.length : 1,
        };
      } catch (err) {
        return {
          success: false,
          error: err instanceof Error ? err.message : "Query failed",
        };
      }
    },
  });
}
```

**Create file:** `src/lib/ai/tools/deep-research.ts`

```typescript
// Deep research tool that combines web search with iterative research
// Inspired by awesome-llm-apps deep_research_agent
// Uses Tavily for search, then follows up on interesting results

import { tool } from "ai";
import { z } from "zod";

export function createDeepResearchTool(tavilyApiKey: string) {
  return tool({
    description: "Perform deep multi-step web research on a topic. Searches multiple queries, follows leads, and compiles sources.",
    parameters: z.object({
      topic: z.string().describe("The research topic or question"),
      depth: z.number().optional().default(2).describe("Research depth: 1=quick, 2=moderate, 3=thorough"),
    }),
    execute: async ({ topic, depth }) => {
      const allResults: Array<{ title: string; url: string; content: string }> = [];

      // Generate search queries from different angles
      const queries = [
        topic,
        `${topic} latest developments 2024 2025`,
        `${topic} analysis expert opinion`,
      ];
      if (depth >= 3) {
        queries.push(`${topic} research paper study`);
        queries.push(`${topic} criticism challenges problems`);
      }

      // Execute searches
      for (const query of queries.slice(0, depth + 1)) {
        try {
          const res = await fetch("https://api.tavily.com/search", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              api_key: tavilyApiKey,
              query,
              search_depth: depth >= 2 ? "advanced" : "basic",
              max_results: 5,
              include_answer: false,
              include_raw_content: false,
            }),
          });

          if (res.ok) {
            const data = await res.json();
            for (const r of data.results || []) {
              // Deduplicate by URL
              if (!allResults.find((existing) => existing.url === r.url)) {
                allResults.push({ title: r.title, url: r.url, content: r.content });
              }
            }
          }
        } catch {
          // Skip failed queries, continue with others
        }
      }

      return {
        topic,
        sources_found: allResults.length,
        sources: allResults.slice(0, 15), // Cap at 15 sources
      };
    },
  });
}
```

---

## 4. Pipeline System Upgrade

### Extend PipelineStep Interface

**File:** `src/lib/ai/pipelines.ts`

```typescript
export interface PipelineStep {
  description: string;
  duration: number;
  isCore?: boolean;
  isCore2?: boolean;
  core2Prompt?: string;

  // NEW: Tool-calling support
  tools?: string[];            // Tool IDs from registry: ["web-search", "finance-data"]
  maxToolSteps?: number;       // Max tool call rounds (default 3)
  toolContext?: string;        // Extra context for tool-using steps

  // NEW: Data handling
  requiresFileData?: boolean;  // Step needs parsed file data (for data-query tool)
  outputHint?: string;         // Hint for the output renderer: "table", "chart", "itinerary"
}
```

### New Pipelines for awesome-llm-apps Agents

Add these to `AGENT_PIPELINES`:

```typescript
// Deep Research (with real web search) — inspired by deep_research_openai.py
deep_research: [
  { description: "Understanding the research question", duration: 1200 },
  { description: "Searching the web for sources", duration: 0, isCore: true,
    tools: ["web-search", "deep-research"], maxToolSteps: 5,
    toolContext: "Search thoroughly. Use multiple queries from different angles. Find at least 8-10 relevant sources." },
  { description: "Cross-referencing and fact-checking", duration: 1500 },
  { description: "Synthesizing into comprehensive report", duration: 0, isCore2: true,
    core2Prompt: "You are an expert research synthesizer. Take the research data below (including all web sources found) and create a comprehensive, well-structured report with:\n1. Executive Summary (3-5 key findings)\n2. Detailed Analysis with sections\n3. Key Data Points and Statistics\n4. Sources and Citations (with URLs)\n5. Conclusion and Recommendations\n\nUse the source URLs as citation links. Format with clean markdown.\n\nResearch data:\n\n" },
  { description: "Adding citations and formatting", duration: 800 },
],

// Investment Analyst (with real stock data) — inspired by investment_agent.py
investment: [
  { description: "Identifying stocks and financial instruments", duration: 1000 },
  { description: "Fetching real-time market data", duration: 0, isCore: true,
    tools: ["finance-data"], maxToolSteps: 8,
    toolContext: "Fetch quote, fundamentals, and history for each stock mentioned. If comparing stocks, fetch data for all of them. Always get both quote and fundamentals." },
  { description: "Analyzing fundamentals and trends", duration: 1500 },
  { description: "Generating investment analysis with risk assessment", duration: 0, isCore2: true,
    core2Prompt: "You are an elite investment analyst. Using the real market data below, create a professional investment analysis with:\n1. Executive Summary\n2. Current Price & Performance (with real numbers from the data)\n3. Fundamental Analysis (P/E, market cap, margins from the data)\n4. Technical Overview (52-week range, trend direction)\n5. Analyst Consensus (if available in data)\n6. Risk Assessment (bull case vs bear case)\n7. Recommendation with price target range\n\nFormat numbers in tables where appropriate. Bold key metrics.\n\nMarket data:\n\n" },
  { description: "Compiling final report", duration: 800 },
],

// Data Analyst (with SQL queries) — inspired by ai_data_analyst.py
data_analyst: [
  { description: "Analyzing uploaded data structure", duration: 800 },
  { description: "Running data analysis queries", duration: 0, isCore: true,
    tools: ["data-query"], maxToolSteps: 10, requiresFileData: true,
    toolContext: "Analyze the uploaded data thoroughly. Run multiple SQL queries to understand distributions, trends, outliers, and key metrics. Calculate summary statistics, group-by analyses, and correlations." },
  { description: "Generating insights and visualizations", duration: 1200 },
  { description: "Creating detailed analysis report", duration: 0, isCore2: true,
    core2Prompt: "You are a senior data analyst. Using the query results below, create a comprehensive analysis report with:\n1. Data Overview (rows, columns, data types)\n2. Key Metrics Summary (in a table)\n3. Distribution Analysis\n4. Trends and Patterns\n5. Outliers and Anomalies\n6. Actionable Insights (top 5)\n7. Recommendations\n\nFormat all numbers clearly. Use markdown tables extensively.\n\nQuery results:\n\n" },
  { description: "Finalizing report", duration: 600 },
],

// Journalist (with web search) — inspired by ai_journalist_agent.py
journalist: [
  { description: "Researching the story angle", duration: 1000 },
  { description: "Gathering sources and quotes", duration: 0, isCore: true,
    tools: ["web-search"], maxToolSteps: 5,
    toolContext: "Search for recent news, expert opinions, and factual data related to this story. Find multiple perspectives and credible sources." },
  { description: "Structuring the narrative", duration: 1200 },
  { description: "Writing the article", duration: 0, isCore2: true,
    core2Prompt: "You are an award-winning journalist. Using the research sources below, write a compelling, well-sourced article with:\n1. Attention-grabbing headline\n2. Strong lede (opening paragraph)\n3. Context and background\n4. Multiple perspectives with attributed quotes/data\n5. Analysis of implications\n6. Conclusion\n\nCite sources inline with links. Write in a professional journalistic style.\n\nResearch:\n\n" },
  { description: "Final editorial review", duration: 600 },
],

// Web Scraper / Web Intel (with scraping) — inspired by web_scraping_ai_agent.py
web_intel: [
  { description: "Analyzing target URLs", duration: 800 },
  { description: "Scraping and extracting data", duration: 0, isCore: true,
    tools: ["web-scrape", "web-search"], maxToolSteps: 5,
    toolContext: "Scrape the provided URLs and extract the requested information. If URLs aren't provided, search the web first to find relevant pages, then scrape them." },
  { description: "Structuring extracted intelligence", duration: 1000 },
  { description: "Compiling intelligence report", duration: 0, isCore2: true,
    core2Prompt: "You are an intelligence analyst. Using the scraped data below, create a structured intelligence report with:\n1. Summary of Findings\n2. Extracted Data (in tables where appropriate)\n3. Key Patterns and Insights\n4. Source Reliability Assessment\n5. Recommendations for Follow-up\n\nFormat data in clean markdown tables.\n\nScraped data:\n\n" },
  { description: "Final formatting", duration: 600 },
],

// Competitor Intelligence (multi-search) — inspired by ai_competitor_intelligence_agent_team
competitor_intel: [
  { description: "Identifying competitors to analyze", duration: 1000 },
  { description: "Researching competitor data", duration: 0, isCore: true,
    tools: ["web-search", "web-scrape"], maxToolSteps: 8,
    toolContext: "For each competitor mentioned, search for: pricing, features, recent news, market position, employee count, funding, and user reviews. Search for industry reports comparing these companies." },
  { description: "Cross-referencing competitive data", duration: 1500 },
  { description: "Building competitive analysis", duration: 0, isCore2: true,
    core2Prompt: "You are a competitive intelligence strategist. Using the research below, create a comprehensive competitive analysis with:\n1. Market Landscape Overview\n2. Competitor Profiles (for each: strengths, weaknesses, pricing, key features)\n3. Feature Comparison Matrix (markdown table)\n4. Pricing Comparison Table\n5. SWOT Analysis for each competitor\n6. Strategic Recommendations\n7. Opportunities and Threats\n\nUse tables extensively for comparisons.\n\nResearch data:\n\n" },
  { description: "Finalizing competitive report", duration: 1000 },
],

// Travel Planner (with search) — inspired by ai_travel_agent.py
travel: [
  { description: "Researching destination", duration: 1200 },
  { description: "Finding attractions, restaurants, and hotels", duration: 0, isCore: true,
    tools: ["web-search"], maxToolSteps: 5,
    toolContext: "Search for: top attractions, best restaurants, hotel recommendations, local tips, weather info, and transportation options for the destination. Get specific, actionable information with names and locations." },
  { description: "Optimizing itinerary", duration: 1500 },
  { description: "Building detailed travel plan", duration: 0, isCore2: true,
    core2Prompt: "You are an expert travel planner. Using the destination research below, create a premium travel itinerary with:\n1. Trip Overview (dates, budget estimate, travel style)\n2. Day-by-Day Itinerary (morning/afternoon/evening for each day)\n3. Each activity: name, estimated time, estimated cost, brief description, pro tip\n4. Restaurant Recommendations (breakfast, lunch, dinner options per day)\n5. Accommodation Recommendations (3 options: budget, mid-range, luxury)\n6. Transportation Guide\n7. Packing Checklist\n8. Budget Breakdown (table)\n9. Emergency Contacts and Tips\n\nMake it feel like a premium travel guide.\n\nDestination research:\n\n" },
  { description: "Adding final tips and formatting", duration: 800 },
],

// Financial Coach — inspired by ai_financial_coach_agent.py
financial_coach: [
  { description: "Understanding your financial situation", duration: 1000 },
  { description: "Analyzing financial data", duration: 0, isCore: true,
    tools: ["calculator"], maxToolSteps: 5,
    toolContext: "Calculate key financial metrics: savings rate, debt-to-income ratio, emergency fund coverage, investment allocation percentages, projected growth. Show your work." },
  { description: "Building personalized plan", duration: 1500 },
  { description: "Creating financial roadmap", duration: 0, isCore2: true,
    core2Prompt: "You are a certified financial planner. Using the analysis below, create a personalized financial plan with:\n1. Financial Health Score (out of 100, with breakdown)\n2. Current Situation Summary\n3. 30-60-90 Day Action Plan (specific steps)\n4. Budget Recommendation (50/30/20 or customized, with exact dollar amounts if possible)\n5. Debt Payoff Strategy (avalanche vs snowball recommendation)\n6. Investment Strategy (based on risk tolerance and goals)\n7. Emergency Fund Plan\n8. Long-term Wealth Building Milestones (1yr, 5yr, 10yr)\n\nBe specific with numbers. Use tables.\n\nFinancial analysis:\n\n" },
  { description: "Finalizing recommendations", duration: 800 },
],

// Sales Intelligence — inspired by ai_sales_intelligence_agent_team
sales_intel: [
  { description: "Researching target company", duration: 1200 },
  { description: "Gathering prospect intelligence", duration: 0, isCore: true,
    tools: ["web-search"], maxToolSteps: 6,
    toolContext: "Research the target company/prospect: recent news, funding rounds, key executives, pain points, tech stack, job postings (indicate growth areas), social media presence, and competitive landscape. Find specific triggers for outreach timing." },
  { description: "Identifying pain points and opportunities", duration: 1500 },
  { description: "Creating sales playbook", duration: 0, isCore2: true,
    core2Prompt: "You are an elite B2B sales strategist. Using the prospect research below, create a comprehensive sales intelligence brief with:\n1. Company Snapshot (key facts table)\n2. Key Decision Makers (names, titles, LinkedIn if found)\n3. Pain Points Analysis (based on job postings, news, reviews)\n4. Buying Triggers (why now?)\n5. Competitive Landscape (who else they might be talking to)\n6. Personalized Outreach Strategy\n7. Cold Email Sequence (3 emails: initial, follow-up, breakup)\n8. Objection Handling Playbook (top 5 likely objections + responses)\n9. Recommended Approach and Timeline\n\nMake emails specific and personalized, not generic.\n\nProspect research:\n\n" },
  { description: "Polishing outreach materials", duration: 800 },
],

// Health & Fitness Coach — inspired by ai_health_fitness_agent.py
health_fitness: [
  { description: "Assessing goals and constraints", duration: 1000 },
  { description: "Designing personalized program", duration: 0, isCore: true },
  { description: "Calculating nutrition targets", duration: 1200 },
  { description: "Creating detailed plan with meals and workouts", duration: 0, isCore2: true,
    core2Prompt: "You are a certified personal trainer and nutritionist. Take the program outline below and make it extremely detailed and actionable:\n1. Weekly Workout Schedule (day by day)\n2. Each Workout: exercises, sets, reps, rest time, form tips\n3. Warm-up and Cool-down Routines\n4. 7-Day Meal Plan with exact portions\n5. 3 Recipes per Meal Category (breakfast/lunch/dinner)\n6. Shopping List\n7. Supplement Recommendations (if applicable)\n8. Progress Tracking Template (measurements to track weekly)\n9. Rest Day Activities\n10. Tips for Consistency\n\nBe specific — no vague advice.\n\nProgram outline:\n\n" },
  { description: "Finalizing your program", duration: 600 },
],

// Legal Advisor — inspired by ai_legal_agent_team
legal: [
  { description: "Analyzing the legal question", duration: 1200 },
  { description: "Researching applicable laws and precedents", duration: 0, isCore: true,
    tools: ["web-search"], maxToolSteps: 4,
    toolContext: "Search for relevant laws, regulations, legal precedents, and expert legal opinions related to this question. Focus on the specific jurisdiction if mentioned." },
  { description: "Evaluating legal implications", duration: 1500 },
  { description: "Drafting legal analysis", duration: 0, isCore2: true,
    core2Prompt: "You are a senior legal advisor. Using the research below, create a thorough legal analysis with:\n1. Issue Summary\n2. Applicable Laws and Regulations\n3. Key Legal Precedents\n4. Analysis of Arguments (for and against)\n5. Risk Assessment (low/medium/high for each risk)\n6. Recommended Course of Action\n7. Next Steps\n8. DISCLAIMER: 'This is AI-generated legal information, not legal advice. Consult a licensed attorney for your specific situation.'\n\nCite sources where possible.\n\nLegal research:\n\n" },
  { description: "Final review", duration: 800 },
],

// Recruitment Agent — inspired by ai_recruitment_agent_team
recruitment: [
  { description: "Analyzing the role requirements", duration: 1000 },
  { description: "Researching market data", duration: 0, isCore: true,
    tools: ["web-search"], maxToolSteps: 4,
    toolContext: "Search for: salary benchmarks for this role, common job requirements at similar companies, trending skills in this field, and effective interview questions for this position." },
  { description: "Building recruitment strategy", duration: 1500 },
  { description: "Creating recruitment package", duration: 0, isCore2: true,
    core2Prompt: "You are a senior technical recruiter. Using the research below, create a complete recruitment package with:\n1. Optimized Job Description (ready to post)\n2. Salary Benchmark Table (by experience level and location)\n3. Must-Have vs Nice-to-Have Skills Matrix\n4. Sourcing Strategy (where to find candidates)\n5. Screening Questions (10 phone screen questions)\n6. Technical Interview Questions (10 questions with expected answers)\n7. Interview Scorecard Template\n8. Offer Letter Template\n9. 30-60-90 Day Onboarding Plan\n\nMake everything ready to use, not generic.\n\nMarket research:\n\n" },
  { description: "Finalizing package", duration: 800 },
],

// Real Estate Analyst — inspired by ai_real_estate_agent_team
real_estate: [
  { description: "Analyzing property details", duration: 1000 },
  { description: "Researching market data", duration: 0, isCore: true,
    tools: ["web-search", "calculator"], maxToolSteps: 6,
    toolContext: "Search for: local real estate market trends, comparable property prices, neighborhood amenities, school ratings, crime statistics, and recent sales in the area. Calculate ROI, cap rate, cash-on-cash return if investment details are provided." },
  { description: "Comparing alternatives", duration: 1500 },
  { description: "Building real estate analysis", duration: 0, isCore2: true,
    core2Prompt: "You are a real estate investment analyst. Using the market research below, create a comprehensive property analysis with:\n1. Property Overview\n2. Market Analysis (trends, avg prices, days on market)\n3. Comparable Properties Table (at least 5 comps)\n4. Neighborhood Scorecard (schools, safety, amenities, transit — rated 1-10)\n5. Financial Analysis (if investment: ROI, cap rate, cash flow projection)\n6. Risk Factors\n7. Negotiation Strategy (suggested offer range with rationale)\n8. Recommendation: Buy / Pass / Negotiate\n\nUse tables for all comparisons.\n\nMarket research:\n\n" },
  { description: "Finalizing analysis", duration: 800 },
],

// Product Launch — inspired by product_launch_intelligence_agent
product_launch: [
  { description: "Analyzing the product concept", duration: 1000 },
  { description: "Researching market and competition", duration: 0, isCore: true,
    tools: ["web-search"], maxToolSteps: 6,
    toolContext: "Search for: similar products/competitors, market size data, target audience demographics, pricing strategies in this space, distribution channels used by competitors, and recent product launches in this category." },
  { description: "Building go-to-market strategy", duration: 1500 },
  { description: "Creating launch playbook", duration: 0, isCore2: true,
    core2Prompt: "You are a product launch strategist. Using the research below, create a complete product launch playbook with:\n1. Market Opportunity Assessment\n2. Target Audience Personas (2-3 detailed personas)\n3. Competitive Positioning Statement\n4. Pricing Strategy (with competitive comparison table)\n5. Go-to-Market Timeline (12-week launch plan, week by week)\n6. Marketing Channel Strategy (organic, paid, partnerships)\n7. Content Calendar (first 30 days)\n8. Launch Day Checklist\n9. KPIs and Success Metrics\n10. Post-Launch Review Framework\n\nBe specific and actionable.\n\nMarket research:\n\n" },
  { description: "Finalizing playbook", duration: 1000 },
],
```

### Updated SLUG_TO_PIPELINE Mapping

```typescript
const SLUG_TO_PIPELINE: Record<string, string> = {
  // Existing mappings...

  // NEW: Tool-enhanced pipeline mappings
  "deep-research": "deep_research",       // UPGRADED from "scout" → now uses web search
  "investment-analyst": "investment",      // UPGRADED from "pulse" → now uses finance data
  "data-analyst": "data_analyst",          // UPGRADED from "metric" → now uses SQL queries
  "journalist": "journalist",             // UPGRADED from "quill" → now uses web search
  "web-intel": "web_intel",               // UPGRADED from "sleuth" → now uses web scraping
  "travel-planner": "travel",             // UPGRADED from "voyager" → now uses web search
  "fitness-coach": "health_fitness",       // UPGRADED from "vitalis" → more detailed plan
  "sales-rep": "sales_intel",             // UPGRADED from "catalyst" → now uses web search
  "product-launch": "product_launch",     // UPGRADED from "catalyst" → now uses web search
  "personal-finance": "financial_coach",   // UPGRADED from "pulse" → calculator tools

  // NEW agents (not in current seed)
  "competitor-intel": "competitor_intel",
  "legal-advisor": "legal",
  "recruitment-agent": "recruitment",
  "real-estate-analyst": "real_estate",
};
```

---

## 5. Agent-Specific Input UI

### Architecture

Each agent can have a custom input form that replaces the default title+description fields. The form data gets serialized into the task's `description` field as structured text that the agent's system prompt knows how to parse.

**Create file:** `src/lib/agent-ui/input-registry.ts`

```typescript
// Maps agent slugs to their custom input component
// If an agent isn't listed here, it uses the default title+description form

export type AgentInputConfig = {
  fields: InputField[];
  previewLabel?: string;  // What to show in the task card (e.g., "AAPL vs GOOGL")
};

export type InputField = {
  id: string;
  type: "text" | "textarea" | "select" | "multi-select" | "number" | "slider"
        | "date-range" | "file" | "url" | "url-list" | "chips" | "toggle" | "radio";
  label: string;
  placeholder?: string;
  required?: boolean;
  options?: { value: string; label: string }[];  // For select/radio
  min?: number;
  max?: number;
  step?: number;
  defaultValue?: string | number | boolean;
  helpText?: string;
  fullWidth?: boolean;  // Takes full row vs half
};

export const AGENT_INPUT_CONFIGS: Record<string, AgentInputConfig> = {

  "investment-analyst": {
    fields: [
      { id: "tickers", type: "chips", label: "Stock Tickers", placeholder: "Type a ticker and press Enter (e.g., AAPL)", required: true, helpText: "Add 1-5 stock symbols to analyze" },
      { id: "analysis_type", type: "radio", label: "Analysis Type", options: [
        { value: "single", label: "Deep dive on one stock" },
        { value: "comparison", label: "Compare multiple stocks" },
        { value: "portfolio", label: "Portfolio review" },
      ], defaultValue: "single" },
      { id: "investment_horizon", type: "select", label: "Investment Horizon", options: [
        { value: "short", label: "Short-term (1-3 months)" },
        { value: "medium", label: "Medium-term (6-12 months)" },
        { value: "long", label: "Long-term (1-5 years)" },
      ], defaultValue: "medium" },
      { id: "risk_tolerance", type: "slider", label: "Risk Tolerance", min: 1, max: 10, step: 1, defaultValue: 5, helpText: "1 = Very conservative, 10 = Very aggressive" },
      { id: "notes", type: "textarea", label: "Additional Context", placeholder: "Any specific questions or concerns? (e.g., 'worried about upcoming earnings', 'looking for dividend stocks')", fullWidth: true },
    ],
  },

  "deep-research": {
    fields: [
      { id: "topic", type: "textarea", label: "Research Topic", placeholder: "What do you want to research? Be as specific as possible.", required: true, fullWidth: true },
      { id: "depth", type: "radio", label: "Research Depth", options: [
        { value: "quick", label: "Quick Overview (5-8 sources)" },
        { value: "moderate", label: "Moderate (10-15 sources)" },
        { value: "thorough", label: "Thorough (15-20+ sources)" },
      ], defaultValue: "moderate" },
      { id: "focus", type: "multi-select", label: "Focus Areas", options: [
        { value: "academic", label: "Academic / Papers" },
        { value: "news", label: "Recent News" },
        { value: "industry", label: "Industry Reports" },
        { value: "opinion", label: "Expert Opinions" },
        { value: "data", label: "Statistics & Data" },
      ] },
      { id: "output_format", type: "select", label: "Report Format", options: [
        { value: "report", label: "Full Research Report" },
        { value: "brief", label: "Executive Brief (1-2 pages)" },
        { value: "bullets", label: "Key Findings (Bullet Points)" },
      ], defaultValue: "report" },
    ],
  },

  "data-analyst": {
    fields: [
      { id: "file", type: "file", label: "Upload Your Data", required: true, helpText: "CSV, Excel, or JSON file (max 10MB)", fullWidth: true },
      { id: "question", type: "textarea", label: "What do you want to know?", placeholder: "e.g., 'What are the top 10 customers by revenue?' or 'Show me the monthly trend of sales'", required: true, fullWidth: true },
      { id: "analysis_type", type: "multi-select", label: "Analysis Types", options: [
        { value: "summary", label: "Summary Statistics" },
        { value: "trends", label: "Trends & Patterns" },
        { value: "outliers", label: "Outlier Detection" },
        { value: "correlation", label: "Correlations" },
        { value: "groupby", label: "Group-by Analysis" },
      ] },
    ],
  },

  "journalist": {
    fields: [
      { id: "story", type: "textarea", label: "Story Topic", placeholder: "What's the story? Include any specific angle or perspective you want.", required: true, fullWidth: true },
      { id: "style", type: "select", label: "Article Style", options: [
        { value: "news", label: "News Report" },
        { value: "feature", label: "Feature Story" },
        { value: "investigative", label: "Investigative Piece" },
        { value: "opinion", label: "Opinion / Editorial" },
        { value: "profile", label: "Profile / Interview" },
      ], defaultValue: "feature" },
      { id: "length", type: "select", label: "Target Length", options: [
        { value: "short", label: "Short (~500 words)" },
        { value: "medium", label: "Medium (~1000 words)" },
        { value: "long", label: "Long (~2000 words)" },
      ], defaultValue: "medium" },
      { id: "audience", type: "text", label: "Target Audience", placeholder: "e.g., Tech professionals, General public, Investors" },
    ],
  },

  "travel-planner": {
    fields: [
      { id: "destination", type: "text", label: "Destination", placeholder: "e.g., Tokyo, Japan", required: true },
      { id: "dates", type: "text", label: "Travel Dates", placeholder: "e.g., March 15-22, 2025 (or '7 days in April')" },
      { id: "travelers", type: "select", label: "Travelers", options: [
        { value: "solo", label: "Solo" },
        { value: "couple", label: "Couple" },
        { value: "family", label: "Family with kids" },
        { value: "group", label: "Group of friends" },
      ], defaultValue: "couple" },
      { id: "budget", type: "select", label: "Budget Level", options: [
        { value: "budget", label: "Budget-friendly" },
        { value: "moderate", label: "Moderate" },
        { value: "luxury", label: "Luxury" },
        { value: "no-limit", label: "No limit" },
      ], defaultValue: "moderate" },
      { id: "interests", type: "multi-select", label: "Interests", options: [
        { value: "food", label: "Food & Dining" },
        { value: "culture", label: "Culture & History" },
        { value: "adventure", label: "Adventure & Outdoors" },
        { value: "shopping", label: "Shopping" },
        { value: "nightlife", label: "Nightlife" },
        { value: "relaxation", label: "Relaxation & Spa" },
        { value: "photography", label: "Photography Spots" },
      ] },
      { id: "notes", type: "textarea", label: "Special Requirements", placeholder: "e.g., vegetarian food options, wheelchair accessible, avoid crowded places" },
    ],
  },

  "competitor-intel": {
    fields: [
      { id: "company", type: "text", label: "Your Company / Product", placeholder: "e.g., Notion", required: true },
      { id: "competitors", type: "chips", label: "Competitors to Analyze", placeholder: "Type company name and press Enter", required: true, helpText: "Add 2-5 competitors" },
      { id: "focus", type: "multi-select", label: "Analysis Focus", options: [
        { value: "pricing", label: "Pricing" },
        { value: "features", label: "Features" },
        { value: "market", label: "Market Position" },
        { value: "strategy", label: "Go-to-Market Strategy" },
        { value: "reviews", label: "User Reviews & Sentiment" },
        { value: "tech", label: "Tech Stack" },
      ] },
      { id: "context", type: "textarea", label: "Context", placeholder: "What's driving this analysis? Planning a feature? Adjusting pricing? Investor deck?", fullWidth: true },
    ],
  },

  "web-intel": {
    fields: [
      { id: "urls", type: "url-list", label: "URLs to Analyze", placeholder: "https://example.com", helpText: "Add 1-5 URLs to scrape and analyze" },
      { id: "extract", type: "textarea", label: "What to Extract", placeholder: "e.g., 'Extract all pricing plans and features' or 'Get contact information and company details'", required: true, fullWidth: true },
      { id: "format", type: "select", label: "Output Format", options: [
        { value: "table", label: "Structured Table" },
        { value: "report", label: "Analysis Report" },
        { value: "json", label: "JSON Data" },
      ], defaultValue: "table" },
    ],
  },

  "sales-rep": {
    fields: [
      { id: "company", type: "text", label: "Target Company", placeholder: "e.g., Stripe, Shopify", required: true },
      { id: "your_product", type: "text", label: "Your Product/Service", placeholder: "e.g., AI-powered customer support platform", required: true },
      { id: "contact", type: "text", label: "Target Contact (optional)", placeholder: "e.g., VP of Engineering, Jane Smith" },
      { id: "value_prop", type: "textarea", label: "Key Value Proposition", placeholder: "What's the main benefit you offer?", fullWidth: true },
      { id: "outreach_type", type: "select", label: "Outreach Type", options: [
        { value: "cold", label: "Cold Outreach" },
        { value: "warm", label: "Warm Introduction" },
        { value: "follow-up", label: "Follow-up" },
        { value: "re-engage", label: "Re-engagement" },
      ], defaultValue: "cold" },
    ],
  },

  "fitness-coach": {
    fields: [
      { id: "goal", type: "radio", label: "Primary Goal", required: true, options: [
        { value: "weight-loss", label: "Lose Weight" },
        { value: "muscle-gain", label: "Build Muscle" },
        { value: "endurance", label: "Improve Endurance" },
        { value: "flexibility", label: "Flexibility & Mobility" },
        { value: "general", label: "General Fitness" },
      ] },
      { id: "experience", type: "select", label: "Experience Level", options: [
        { value: "beginner", label: "Beginner (0-6 months)" },
        { value: "intermediate", label: "Intermediate (6mo-2yr)" },
        { value: "advanced", label: "Advanced (2+ years)" },
      ], defaultValue: "beginner" },
      { id: "days_per_week", type: "slider", label: "Workout Days Per Week", min: 2, max: 7, step: 1, defaultValue: 4 },
      { id: "equipment", type: "multi-select", label: "Available Equipment", options: [
        { value: "none", label: "No equipment (bodyweight)" },
        { value: "dumbbells", label: "Dumbbells" },
        { value: "barbell", label: "Barbell & Rack" },
        { value: "machines", label: "Gym Machines" },
        { value: "bands", label: "Resistance Bands" },
        { value: "cardio", label: "Cardio Machines" },
      ] },
      { id: "constraints", type: "textarea", label: "Injuries / Dietary Restrictions", placeholder: "e.g., bad knees, vegetarian, lactose intolerant" },
    ],
  },

  "personal-finance": {
    fields: [
      { id: "situation", type: "textarea", label: "Financial Situation", placeholder: "Describe your income, expenses, debts, savings, investments. The more detail, the better the advice.", required: true, fullWidth: true },
      { id: "goal", type: "radio", label: "Primary Goal", required: true, options: [
        { value: "debt-free", label: "Get out of debt" },
        { value: "save", label: "Build savings / emergency fund" },
        { value: "invest", label: "Start investing" },
        { value: "retire", label: "Plan for retirement" },
        { value: "budget", label: "Create a budget" },
        { value: "general", label: "General financial review" },
      ] },
      { id: "age_range", type: "select", label: "Age Range", options: [
        { value: "18-25", label: "18-25" },
        { value: "26-35", label: "26-35" },
        { value: "36-45", label: "36-45" },
        { value: "46-55", label: "46-55" },
        { value: "56+", label: "56+" },
      ] },
      { id: "risk_tolerance", type: "slider", label: "Investment Risk Tolerance", min: 1, max: 10, step: 1, defaultValue: 5, helpText: "1 = Very conservative, 10 = Aggressive" },
    ],
  },

  "legal-advisor": {
    fields: [
      { id: "question", type: "textarea", label: "Legal Question", placeholder: "Describe your legal question or situation in detail.", required: true, fullWidth: true },
      { id: "area", type: "select", label: "Legal Area", options: [
        { value: "contract", label: "Contract Law" },
        { value: "employment", label: "Employment Law" },
        { value: "ip", label: "Intellectual Property" },
        { value: "business", label: "Business / Corporate" },
        { value: "real-estate", label: "Real Estate" },
        { value: "privacy", label: "Privacy / Data Protection" },
        { value: "other", label: "Other" },
      ] },
      { id: "jurisdiction", type: "text", label: "Jurisdiction", placeholder: "e.g., California, USA or United Kingdom" },
      { id: "file", type: "file", label: "Attach Document (optional)", helpText: "Upload a contract or legal document for review" },
    ],
  },

  "recruitment-agent": {
    fields: [
      { id: "role", type: "text", label: "Role Title", placeholder: "e.g., Senior Full-Stack Engineer", required: true },
      { id: "company", type: "text", label: "Company Name", placeholder: "e.g., Acme Corp" },
      { id: "level", type: "select", label: "Seniority Level", options: [
        { value: "junior", label: "Junior (0-2 years)" },
        { value: "mid", label: "Mid-level (2-5 years)" },
        { value: "senior", label: "Senior (5-8 years)" },
        { value: "lead", label: "Lead / Staff (8+ years)" },
        { value: "director", label: "Director / VP" },
      ], defaultValue: "senior" },
      { id: "location", type: "text", label: "Location / Remote Policy", placeholder: "e.g., San Francisco (hybrid) or Fully Remote" },
      { id: "requirements", type: "textarea", label: "Key Requirements", placeholder: "List the must-have skills and qualifications", fullWidth: true },
      { id: "salary_range", type: "text", label: "Salary Range", placeholder: "e.g., $150K-$200K" },
    ],
  },

  "real-estate-analyst": {
    fields: [
      { id: "property", type: "textarea", label: "Property Details", placeholder: "Address or description of the property. Include price, sqft, bedrooms, etc.", required: true, fullWidth: true },
      { id: "purpose", type: "radio", label: "Purpose", required: true, options: [
        { value: "buy-primary", label: "Buy (Primary Residence)" },
        { value: "buy-investment", label: "Buy (Investment)" },
        { value: "sell", label: "Sell" },
        { value: "rent", label: "Evaluate Rental" },
      ] },
      { id: "budget", type: "text", label: "Budget / Asking Price", placeholder: "e.g., $500,000" },
      { id: "notes", type: "textarea", label: "Additional Context", placeholder: "e.g., first-time buyer, looking at comparable properties in the area" },
    ],
  },

  "product-launch": {
    fields: [
      { id: "product", type: "textarea", label: "Product / Feature Description", placeholder: "Describe what you're launching. What problem does it solve?", required: true, fullWidth: true },
      { id: "audience", type: "text", label: "Target Audience", placeholder: "e.g., Small business owners, Developers, Parents" },
      { id: "stage", type: "select", label: "Launch Stage", options: [
        { value: "idea", label: "Idea / Validation" },
        { value: "mvp", label: "MVP Ready" },
        { value: "beta", label: "Beta / Soft Launch" },
        { value: "launch", label: "Full Launch" },
        { value: "growth", label: "Post-Launch Growth" },
      ], defaultValue: "mvp" },
      { id: "budget", type: "select", label: "Marketing Budget", options: [
        { value: "zero", label: "$0 (Organic only)" },
        { value: "small", label: "$100-$1K" },
        { value: "medium", label: "$1K-$10K" },
        { value: "large", label: "$10K+" },
      ], defaultValue: "small" },
      { id: "competitors", type: "chips", label: "Known Competitors", placeholder: "Type competitor name and press Enter" },
    ],
  },
};
```

### How Custom Inputs Render

**Create file:** `src/components/agents/agent-input-form.tsx`

This is a generic form renderer that takes an `AgentInputConfig` and renders the fields:

```typescript
// This component renders any agent's custom input form based on its config.
// It's mounted inside create-task-modal.tsx when an agent with custom inputs is selected.

// For each field type, it renders the appropriate component:
// - "text"         → styled <input type="text">
// - "textarea"     → styled <textarea> with auto-resize
// - "select"       → custom dropdown with gradient border on focus
// - "multi-select" → tag-style multi-select with checkboxes
// - "radio"        → pill-style radio buttons (horizontal)
// - "slider"       → range input with value display
// - "chips"        → text input that creates tags on Enter (for tickers, companies)
// - "url-list"     → list of URL inputs with add/remove buttons
// - "file"         → drag-and-drop file upload (reuses existing upload logic)
// - "number"       → number input with +/- buttons
// - "date-range"   → two date inputs (start/end)
// - "toggle"       → toggle switch

// All field values are collected into a Record<string, any>
// On submit, they are serialized into the task's description field:
//
// Example for Investment Analyst:
// "AGENT_INPUT_DATA:
// tickers: AAPL, GOOGL, MSFT
// analysis_type: comparison
// investment_horizon: long
// risk_tolerance: 7
// notes: Looking for AI-heavy portfolio allocation"
//
// The agent's system prompt knows to parse this structured input.
```

### Integration into Create Task Modal

**Modify:** `src/components/tasks/create-task-modal.tsx`

```typescript
import { AGENT_INPUT_CONFIGS } from "@/lib/agent-ui/input-registry";
import { AgentInputForm } from "@/components/agents/agent-input-form";

// Inside the modal, after the agent is selected:
const selectedAgent = agents.find(a => a.id === selectedAgentIds[0]);
const agentInputConfig = selectedAgent ? AGENT_INPUT_CONFIGS[selectedAgent.slug] : null;

// Replace the default title+description fields when a custom config exists:
{agentInputConfig ? (
  <AgentInputForm
    config={agentInputConfig}
    agentName={selectedAgent.name}
    agentColor={selectedAgent.color}
    onSubmit={(values) => {
      // Serialize values into title + description
      const title = generateTaskTitle(selectedAgent.slug, values);
      const description = serializeAgentInput(values);
      handleCreateTask(title, description);
    }}
  />
) : (
  // Default title + description inputs (existing code)
  <>
    <input placeholder="Task title..." ... />
    <textarea placeholder="Description..." ... />
  </>
)}
```

### Title Generation from Agent-Specific Inputs

```typescript
function generateTaskTitle(slug: string, values: Record<string, any>): string {
  switch (slug) {
    case "investment-analyst":
      return `Analyze ${values.tickers?.join(", ")} — ${values.analysis_type} analysis`;
    case "deep-research":
      return values.topic?.slice(0, 80) || "Research task";
    case "travel-planner":
      return `Plan trip to ${values.destination}`;
    case "competitor-intel":
      return `Competitive analysis: ${values.company} vs ${values.competitors?.join(", ")}`;
    case "fitness-coach":
      return `${values.goal} fitness plan — ${values.days_per_week}x/week`;
    case "data-analyst":
      return values.question?.slice(0, 80) || "Data analysis";
    // ... etc
    default:
      return values.topic || values.question || values.story || "New task";
  }
}
```

---

## 6. Agent-Specific Output UI

### Architecture

Each agent can have a custom output renderer that replaces the default markdown display. The renderer parses the agent's output (which is structured markdown) and displays it with rich UI components.

**Create file:** `src/lib/agent-ui/output-registry.ts`

```typescript
// Maps agent slugs to their custom output component name
// If an agent isn't listed here, it uses the default markdown renderer

export const AGENT_OUTPUT_RENDERERS: Record<string, string> = {
  "investment-analyst": "FinanceOutput",
  "data-analyst": "DataOutput",
  "deep-research": "ResearchOutput",
  "travel-planner": "TravelOutput",
  "competitor-intel": "ComparisonOutput",
  "fitness-coach": "FitnessOutput",
  "personal-finance": "FinanceCoachOutput",
  "journalist": "ArticleOutput",
  "sales-rep": "SalesOutput",
  "recruitment-agent": "RecruitmentOutput",
  // All others use default markdown renderer
};
```

### Output Component Specs

**Create directory:** `src/components/agents/outputs/`

Each output component receives `{ output: string; agentColor: string; agentName: string }` and renders the markdown output with enhanced visual components.

#### `FinanceOutput.tsx` — For Investment Analyst
What it does:
- Parses the markdown output for stock data tables
- Renders price data as **line charts** (using recharts)
- Renders comparison tables with **colored cells** (green/red for up/down)
- Renders risk meters as **visual gauge** components
- Renders recommendation as a **badge** (Strong Buy → Buy → Hold → Sell)
- Keeps all other text as styled markdown

Key UI elements:
- `<StockCard>` — shows ticker, price, change with color coding
- `<PriceChart>` — recharts LineChart with gradient fill
- `<MetricsTable>` — table with colored cells for key metrics
- `<RiskGauge>` — semicircle gauge showing risk level
- `<RecommendationBadge>` — colored pill with buy/hold/sell

#### `DataOutput.tsx` — For Data Analyst
What it does:
- Parses tables from markdown into **interactive sortable tables**
- Renders summary statistics as **metric cards**
- Renders distributions as **bar charts** (recharts)
- Renders trends as **area charts** (recharts)
- Shows SQL queries in **syntax-highlighted code blocks**

Key UI elements:
- `<MetricCard>` — large number + label + trend arrow
- `<DataTable>` — sortable, searchable table with pagination
- `<BarChart>` / `<AreaChart>` — recharts visualizations
- `<SQLBlock>` — code block with syntax highlighting

#### `ResearchOutput.tsx` — For Deep Research
What it does:
- Parses the report into sections
- Renders a **floating table of contents** sidebar
- Renders source citations as **clickable source cards** with favicon + domain
- Renders key takeaways as **highlighted callout boxes**
- Renders the report with **smooth scroll-to-section**

Key UI elements:
- `<TableOfContents>` — sticky sidebar with section links
- `<SourceCard>` — URL card with favicon, title, domain, relevance score
- `<CalloutBox>` — highlighted box for key findings (yellow/blue/green)
- `<CitationLink>` — inline superscript links to sources

#### `TravelOutput.tsx` — For Travel Planner
What it does:
- Parses the itinerary into day-by-day sections
- Renders each day as a **timeline card** with morning/afternoon/evening
- Renders restaurants as **recommendation cards** with cuisine tags
- Renders the budget as a **breakdown table** with totals
- Renders the packing list as a **checklist** with checkboxes

Key UI elements:
- `<DayCard>` — expandable day card with timeline view
- `<ActivityItem>` — time + name + cost + description + tip
- `<RestaurantCard>` — name + cuisine tag + price indicator ($-$$$$)
- `<BudgetTable>` — table with category totals and grand total
- `<PackingChecklist>` — interactive checklist

#### `ComparisonOutput.tsx` — For Competitor Intelligence
What it does:
- Parses comparison tables into **interactive comparison matrix**
- Renders SWOT analyses as **2x2 grid cards** (color-coded)
- Renders pricing comparison as a **styled table**
- Renders feature comparison with **check/cross icons**

Key UI elements:
- `<ComparisonMatrix>` — table with color-coded cells
- `<SWOTGrid>` — 2x2 grid: green(S), blue(O), yellow(W), red(T)
- `<FeatureTable>` — table with check/cross/partial icons per competitor
- `<PricingTable>` — table with plan names, prices, highlighted best value

#### `FitnessOutput.tsx` — For Fitness Coach
What it does:
- Parses the plan into weekly schedule
- Renders workout schedule as a **week grid calendar**
- Renders each workout as **exercise cards** with sets/reps
- Renders meal plan as **meal cards** with macros
- Renders the shopping list as a **categorized checklist**

Key UI elements:
- `<WeekGrid>` — 7-column grid showing workout types per day
- `<ExerciseCard>` — name + sets + reps + rest + form tip
- `<MealCard>` — meal name + calories + protein/carbs/fat
- `<ShoppingList>` — categorized checklist (produce, protein, dairy, etc.)

#### `ArticleOutput.tsx` — For Journalist
What it does:
- Renders the article with **newspaper-style typography**
- Large bold headline, italic byline
- Drop-cap first letter
- Pull quotes styled as **highlighted callout boxes**
- Source attributions as **footnotes**

#### `SalesOutput.tsx` — For Sales Rep
What it does:
- Renders company snapshot as a **profile card**
- Renders email sequences as **tabbed email preview** (Email 1, 2, 3)
- Each email has a **copy button**
- Renders objection handling as **accordion cards**
- Renders timeline as a **visual timeline**

#### Other Agents (Default Enhanced Markdown)
All agents not listed above use the existing markdown renderer, which already handles:
- Headers, bold, italic
- Code blocks
- Images
- Tables
- Lists

### Integration into Task Detail Modal

**Modify:** `src/components/tasks/task-detail-modal.tsx`

```typescript
import { AGENT_OUTPUT_RENDERERS } from "@/lib/agent-ui/output-registry";
// Dynamic imports for output components
const OUTPUT_COMPONENTS: Record<string, React.ComponentType<OutputProps>> = {
  FinanceOutput: dynamic(() => import("@/components/agents/outputs/FinanceOutput")),
  DataOutput: dynamic(() => import("@/components/agents/outputs/DataOutput")),
  ResearchOutput: dynamic(() => import("@/components/agents/outputs/ResearchOutput")),
  // ... etc
};

// In the review state rendering:
const rendererName = task.agent?.slug
  ? AGENT_OUTPUT_RENDERERS[task.agent.slug]
  : undefined;
const OutputComponent = rendererName
  ? OUTPUT_COMPONENTS[rendererName]
  : DefaultMarkdownOutput;

<OutputComponent
  output={task.output}
  agentColor={task.agent?.color || "#6366F1"}
  agentName={task.agent?.name || "Agent"}
/>
```

---

## 7. Execution Engine Upgrade

### Changes to `src/app/api/tasks/[id]/run/route.ts`

The run route needs to support tool-calling. Here's what changes:

#### 1. Fetch tool keys alongside AI config

```typescript
// After getting aiConfig:
const toolKeys = await getUserToolKeys(user.id);
```

#### 2. Check required tool keys

```typescript
// New: check if agent requires tool keys that aren't configured
const agentConfig = AGENT_INPUT_CONFIGS[agentSlug];
// (Or read from the agent's required_tool_keys field)
const requiredTools = getRequiredToolKeys(agentSlug);
for (const toolKey of requiredTools) {
  if (!toolKeys[toolKey]) {
    await persistTaskUpdate(user.id, id, { status: "todo", progress: 0, current_step: null });
    return NextResponse.json({
      error: `This agent needs a ${toolKey} API key. Add it in Settings → Tool API Keys.`,
      needsKey: true,
      keyType: toolKey,
    }, { status: 402 });
  }
}
```

#### 3. Build tools for each pipeline step

```typescript
// Inside runPipeline, before the step loop:
function buildToolsForStep(step: PipelineStep): Record<string, any> {
  const tools: Record<string, any> = {};

  for (const toolId of step.tools || []) {
    switch (toolId) {
      case "web-search":
        if (toolKeys.tavily) tools.web_search = createWebSearchTool(toolKeys.tavily);
        break;
      case "web-scrape":
        tools.web_scrape = createWebScrapeTool(toolKeys.firecrawl);
        break;
      case "finance-data":
        tools.get_stock_data = createFinanceDataTool(); // No key needed
        break;
      case "data-query":
        if (parsedFileData) tools.query_data = createDataQueryTool(parsedFileData.rows, parsedFileData.columns);
        break;
      case "deep-research":
        if (toolKeys.tavily) tools.deep_research = createDeepResearchTool(toolKeys.tavily);
        break;
      case "calculator":
        tools.calculate = createCalculatorTool();
        break;
    }
  }

  return tools;
}
```

#### 4. Use tool-calling in generateText

```typescript
if (step.isCore) {
  const stepTools = buildToolsForStep(step);
  const hasTools = Object.keys(stepTools).length > 0;

  const result = await generateText({
    model: aiModel,
    system: systemPrompt + (step.toolContext ? `\n\n${step.toolContext}` : ""),
    prompt: userMessage,
    ...(hasTools ? {
      tools: stepTools,
      maxSteps: step.maxToolSteps || 3,  // Allow multi-step tool use
    } : {}),
  });

  draftOutput = result.text;
  finalOutput = result.text;

  // Aggregate tokens from all steps (tool calls generate multiple steps)
  const usage = result.usage;
  totalTokensIn += usage?.inputTokens || usage?.promptTokens || 0;
  totalTokensOut += usage?.outputTokens || usage?.completionTokens || 0;

  // Log tool calls for the UI
  const toolCalls = result.steps?.flatMap(s => s.toolCalls || []) || [];
  if (toolCalls.length > 0) {
    await persistTaskUpdate(userId, taskId, {
      current_step: `${step.description} (${toolCalls.length} tool calls)`,
    });
  }
}
```

#### 5. Handle file data for data-query tool

```typescript
// Before pipeline execution, if any step needs file data:
let parsedFileData: { rows: Record<string, unknown>[]; columns: string[] } | null = null;

if (pipeline.some(s => s.requiresFileData) && description) {
  // Parse the file content from description (already uploaded and parsed)
  parsedFileData = parseFileDataFromDescription(description);
}
```

---

## 8. Agent Catalog (All Agents)

### New Agents to Add to `src/seed/agents.ts`

These agents don't exist in the current seed and need to be added:

```typescript
// Add these to PRESET_AGENTS array:

{
  name: "Competitor Intelligence",
  slug: "competitor-intel",
  description: "Competitive Analysis",
  long_description: "Analyze your competitors — pricing, features, market position, strengths, and weaknesses. Get a comprehensive competitive landscape report.",
  icon: "🎯",
  color: "#7C3AED",
  gradient: "linear-gradient(135deg, #7C3AED, #6D28D9)",
  system_prompt: `You are Competitor Intelligence Agent, an expert competitive analyst...`,
  model: "claude-sonnet-4-20250514",
  required_tool_keys: ["tavily"],
},

{
  name: "Legal Advisor",
  slug: "legal-advisor",
  description: "Legal Analysis",
  long_description: "Get AI-powered legal analysis on contracts, employment law, IP, business law, and more. Always consult a real attorney for binding decisions.",
  icon: "⚖️",
  color: "#1E40AF",
  gradient: "linear-gradient(135deg, #1E40AF, #3B82F6)",
  system_prompt: `You are Legal Advisor Agent...`,
  model: "claude-sonnet-4-20250514",
  required_tool_keys: ["tavily"],
},

{
  name: "Recruitment Agent",
  slug: "recruitment-agent",
  description: "Hiring & Recruitment",
  long_description: "Create complete recruitment packages — job descriptions, interview questions, salary benchmarks, and onboarding plans.",
  icon: "👥",
  color: "#0891B2",
  gradient: "linear-gradient(135deg, #0891B2, #06B6D4)",
  system_prompt: `You are Recruitment Agent...`,
  model: "claude-sonnet-4-20250514",
  required_tool_keys: ["tavily"],
},

{
  name: "Real Estate Analyst",
  slug: "real-estate-analyst",
  description: "Property Analysis",
  long_description: "Analyze properties, compare markets, calculate ROI, and get buy/sell/hold recommendations backed by market data.",
  icon: "🏠",
  color: "#059669",
  gradient: "linear-gradient(135deg, #059669, #10B981)",
  system_prompt: `You are Real Estate Analyst...`,
  model: "claude-sonnet-4-20250514",
  required_tool_keys: ["tavily"],
},
```

### Complete Agent → Pipeline → Input → Output Mapping

| Agent (slug) | Pipeline | Tools | Custom Input | Custom Output | Required Keys |
|-------------|----------|-------|-------------|---------------|--------------|
| `deep-research` | deep_research | web-search, deep-research | ResearchInput (topic, depth, focus, format) | ResearchOutput (TOC, source cards, callouts) | tavily |
| `investment-analyst` | investment | finance-data | FinanceInput (tickers, horizon, risk) | FinanceOutput (charts, metrics, gauge) | none |
| `data-analyst` | data_analyst | data-query | DataInput (file upload, question, analysis type) | DataOutput (tables, charts, metrics) | none |
| `journalist` | journalist | web-search | JournalistInput (topic, style, length, audience) | ArticleOutput (newspaper typography) | tavily |
| `travel-planner` | travel | web-search | TravelInput (destination, dates, budget, interests) | TravelOutput (day cards, budget table) | tavily |
| `web-intel` | web_intel | web-scrape, web-search | WebIntelInput (URLs, extract goal, format) | default markdown | firecrawl or tavily |
| `competitor-intel` | competitor_intel | web-search, web-scrape | CompetitorInput (company, competitors, focus) | ComparisonOutput (SWOT, feature table) | tavily |
| `sales-rep` | sales_intel | web-search | SalesInput (company, product, contact, type) | SalesOutput (email tabs, timeline) | tavily |
| `product-launch` | product_launch | web-search | ProductLaunchInput (product, audience, stage, budget) | default markdown | tavily |
| `fitness-coach` | health_fitness | none | FitnessInput (goal, experience, days, equipment) | FitnessOutput (week grid, exercise cards) | none |
| `personal-finance` | financial_coach | calculator | FinanceCoachInput (situation, goal, age, risk) | FinanceCoachOutput (score, budget, milestones) | none |
| `legal-advisor` | legal | web-search | LegalInput (question, area, jurisdiction, file) | default markdown | tavily |
| `recruitment-agent` | recruitment | web-search | RecruitmentInput (role, level, location, requirements) | RecruitmentOutput (JD, scorecard) | tavily |
| `real-estate-analyst` | real_estate | web-search, calculator | RealEstateInput (property, purpose, budget) | default markdown | tavily |
| `content-creator` | quill | none | default | default markdown | none |
| `strategy-advisor` | strategist | none | default | default markdown | none |
| `system-architect` | architect | none | default | default markdown | none |
| All 42 other agents | existing pipelines | none | default | default markdown | none |

---

## 9. File-by-File Implementation Order

### Phase 1: Tool System Backend (do first, no UI changes)

```
Step 1:  CREATE  src/lib/ai/tools/registry.ts        — Tool type definitions and registry
Step 2:  CREATE  src/lib/ai/tools/web-search.ts       — Tavily web search implementation
Step 3:  CREATE  src/lib/ai/tools/web-scrape.ts       — Firecrawl/fetch scraping implementation
Step 4:  CREATE  src/lib/ai/tools/finance-data.ts     — Yahoo Finance data (no key needed)
Step 5:  CREATE  src/lib/ai/tools/data-query.ts       — SQL on uploaded data via alasql
Step 6:  CREATE  src/lib/ai/tools/deep-research.ts    — Multi-query research via Tavily
Step 7:  CREATE  src/lib/ai/tools/calculator.ts       — Math expression evaluator
```

### Phase 2: Settings & Key Management

```
Step 8:  EDIT    src/app/api/user/api-key/route.ts    — Accept tavily/firecrawl/serp providers
Step 9:  CREATE  src/lib/ai/get-tool-keys.ts          — getUserToolKeys() function
Step 10: EDIT    src/app/(app)/settings/page.tsx       — Add "Tool API Keys" section
         — Supabase migration: ALTER TABLE users ADD COLUMN tavily_api_key, firecrawl_api_key, serp_api_key
```

### Phase 3: Pipeline & Execution Upgrade

```
Step 11: EDIT    src/lib/ai/pipelines.ts               — Add tools/maxToolSteps to PipelineStep
                                                        — Add all new pipeline definitions
                                                        — Update SLUG_TO_PIPELINE mappings
Step 12: EDIT    src/app/api/tasks/[id]/run/route.ts   — Import tools, build per-step, use in generateText
                                                        — Check required tool keys
                                                        — Handle file data for data-query
```

### Phase 4: New Agent Definitions

```
Step 13: EDIT    src/seed/agents.ts                    — Add new agents (competitor-intel, legal-advisor,
                                                         recruitment-agent, real-estate-analyst)
                                                        — Add required_tool_keys field to existing agents
Step 14: EDIT    src/lib/types/agent.ts                — Add required_tool_keys to Agent interface
Step 15: EDIT    src/lib/mock-data.ts                  — Update mock agent count and IDs
Step 16: EDIT    src/app/(app)/today/page.tsx           — Add AGENT_THUMBNAILS for new agents
```

### Phase 5: Agent-Specific Input Forms

```
Step 17: CREATE  src/lib/agent-ui/input-registry.ts    — All AgentInputConfig definitions
Step 18: CREATE  src/components/agents/agent-input-form.tsx — Generic form renderer component
         — Includes: ChipsInput, MultiSelect, RadioPills, RangeSlider, UrlListInput subcomponents
Step 19: EDIT    src/components/tasks/create-task-modal.tsx — Mount AgentInputForm when config exists
                                                            — Add generateTaskTitle() function
                                                            — Add serializeAgentInput() function
```

### Phase 6: Agent-Specific Output Renderers

```
Step 20: CREATE  src/lib/agent-ui/output-registry.ts           — Output renderer mapping
Step 21: CREATE  src/components/agents/outputs/FinanceOutput.tsx  — Stock charts, metrics, risk gauge
Step 22: CREATE  src/components/agents/outputs/DataOutput.tsx     — Sortable tables, bar/area charts
Step 23: CREATE  src/components/agents/outputs/ResearchOutput.tsx — TOC sidebar, source cards
Step 24: CREATE  src/components/agents/outputs/TravelOutput.tsx   — Day cards, budget table, checklist
Step 25: CREATE  src/components/agents/outputs/ComparisonOutput.tsx — SWOT grid, feature table
Step 26: CREATE  src/components/agents/outputs/FitnessOutput.tsx  — Week grid, exercise cards
Step 27: CREATE  src/components/agents/outputs/SalesOutput.tsx    — Email tabs, copy buttons
Step 28: CREATE  src/components/agents/outputs/ArticleOutput.tsx  — Newspaper typography
Step 29: EDIT    src/components/tasks/task-detail-modal.tsx       — Dynamic import + mount output renderers
```

### Phase 7: Polish & Testing

```
Step 30: Test each agent end-to-end:
         — Investment: enter tickers → get real stock data → charts render
         — Research: enter topic → web search runs → structured report
         — Data: upload CSV → SQL queries run → tables render
         — Travel: enter destination → search results → itinerary cards
         — etc.
Step 31: Handle edge cases:
         — Tool key missing → beautiful 402 overlay
         — Tool API error → graceful fallback to text-only
         — Empty/invalid file upload → clear error message
         — Rate limiting on tool APIs
Step 32: Create agent thumbnail images for new agents in public/agents/
```

---

## 10. Dependencies

### New npm packages needed:

```bash
npm install recharts           # Charts for finance/data output renderers
npm install alasql             # In-memory SQL for data-query tool
npm install @tavily/core       # (Optional) Tavily SDK — or use raw fetch
```

### Packages already available (no install needed):
- `ai` (Vercel AI SDK) — already has `tool()` and `generateText()` with tool support
- `zod` — already installed, used for tool parameter schemas
- Tailwind CSS v4 — already configured
- Framer Motion — already configured

### No additional services needed:
- Yahoo Finance — free API, no key
- Calculator — pure JS math evaluation
- File parsing — already implemented in `src/lib/upload/parse-file.ts`
- Web scraping fallback — basic fetch, no external service

### API keys users need:
- **Required for 8 agents:** Tavily (free tier: 1000 searches/month)
- **Optional for 2 agents:** Firecrawl (free tier: 500 credits)
- **Everything else:** Works with just the existing OpenAI/Gemini/Anthropic key

---

## Summary

This plan transforms AgentStudio from a "text-in, markdown-out" platform into a **tool-using, visually-rich agent platform** where:

1. **8 agents get real tools** (web search, stock data, SQL queries, web scraping)
2. **14 agents get custom input forms** (tickers, destinations, URLs, file uploads, sliders)
3. **8 agents get custom output renderers** (charts, interactive tables, itinerary cards, comparison matrices)
4. **Settings page** gets a new "Tool API Keys" section for Tavily/Firecrawl
5. **The execution engine** supports Vercel AI SDK tool calling with multi-step tool use
6. **4 brand-new agents** are added (Competitor Intel, Legal, Recruitment, Real Estate)

The existing 42 agents that don't need tools continue to work exactly as before — nothing breaks. The upgrade is purely additive.
