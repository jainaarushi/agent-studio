// Each agent has a fixed pipeline of steps
// Steps marked isCore are REAL API calls
// Steps marked isCore2 are a SECOND real API call (refine/synthesize)
// Other steps are visual delays for UX

export interface PipelineStep {
  description: string;
  duration: number; // ms delay for visual steps
  isCore?: boolean; // first real API call — generates initial output
  isCore2?: boolean; // second real API call — refines/synthesizes
  core2Prompt?: string; // instruction for the second call
  tools?: string[]; // Tool IDs: "web-search", "finance-data", "data-query", "web-scrape", "deep-research", "calculator"
  maxToolSteps?: number; // Max tool call rounds (default 3)
  toolContext?: string; // Extra context for tool-using steps
  requiresFileData?: boolean; // Step needs parsed file data (for data-query tool)
}

export const AGENT_PIPELINES: Record<string, PipelineStep[]> = {
  // Researcher — 2 real calls: research then synthesize
  scout: [
    { description: "Understanding the research question", duration: 1200 },
    { description: "Searching across multiple sources", duration: 1800 },
    { description: "Gathering and cross-referencing data", duration: 0, isCore: true },
    { description: "Fact-checking key claims", duration: 1500 },
    { description: "Synthesizing into final report", duration: 0, isCore2: true, core2Prompt: "You are an expert editor. Take the research below and improve it: make it more structured with clear headers, add a Key Takeaways section at the top, ensure all claims are clearly stated, add a Recommendations section, and format with clean markdown. Keep all the substance, just make it sharper and more actionable.\n\nDraft research:\n\n" },
    { description: "Adding citations and formatting", duration: 800 },
  ],

  // Writer — 2 real calls: draft then polish
  quill: [
    { description: "Analyzing audience and tone", duration: 1000 },
    { description: "Creating outline structure", duration: 1200 },
    { description: "Writing first draft", duration: 0, isCore: true },
    { description: "Self-editing for clarity and flow", duration: 0, isCore2: true, core2Prompt: "You are a professional editor. Polish and improve this draft: fix any awkward phrasing, improve transitions, make it more engaging, tighten the language, and ensure it reads professionally. Keep the same structure and key points.\n\nDraft:\n\n" },
    { description: "Final formatting", duration: 600 },
  ],

  // Analyst — 2 real calls: analyze then summarize
  metric: [
    { description: "Identifying key metrics and data points", duration: 1200 },
    { description: "Running analysis and calculations", duration: 1800 },
    { description: "Generating detailed analysis", duration: 0, isCore: true },
    { description: "Building summary tables", duration: 0, isCore2: true, core2Prompt: "You are a data presentation expert. Take this analysis and make it more visual and scannable: add comparison tables where appropriate, highlight the most important numbers in bold, add a clear Executive Summary at the top with the 3 most important findings, and ensure every insight has a specific actionable recommendation.\n\nAnalysis:\n\n" },
    { description: "Finalizing report", duration: 800 },
  ],

  // Assistant — single call, quick
  atlas: [
    { description: "Understanding your request", duration: 800 },
    { description: "Working on it", duration: 0, isCore: true },
    { description: "Reviewing output", duration: 600 },
  ],

  // Travel Planner — 2 real calls: research then itinerary
  voyager: [
    { description: "Researching destination highlights", duration: 1500 },
    { description: "Checking accommodations and dining options", duration: 1200 },
    { description: "Planning day-by-day itinerary", duration: 0, isCore: true },
    { description: "Optimizing schedule and adding tips", duration: 0, isCore2: true, core2Prompt: "You are a travel optimization expert. Take this itinerary and enhance it: add estimated costs for each activity, suggest the best times of day for each activity, add practical transport tips between locations, include backup options for rainy days, and add a packing checklist. Make it feel like a premium travel guide.\n\nDraft itinerary:\n\n" },
    { description: "Finalizing travel plan", duration: 800 },
  ],

  // Finance — 2 real calls: analyze then risk assessment
  pulse: [
    { description: "Gathering financial data", duration: 1500 },
    { description: "Analyzing market metrics", duration: 1800 },
    { description: "Generating financial analysis", duration: 0, isCore: true },
    { description: "Running risk assessment", duration: 0, isCore2: true, core2Prompt: "You are a risk analyst. Review this financial analysis and add: a Risk Assessment section highlighting key risks and their likelihood, a Bull vs Bear case comparison, specific price targets or range if applicable, and a clear Bottom Line recommendation. Be balanced and flag uncertainties.\n\nFinancial analysis:\n\n" },
    { description: "Compiling final report", duration: 800 },
  ],

  // Web Intel — single call (extraction focused)
  sleuth: [
    { description: "Scanning target sources", duration: 1200 },
    { description: "Extracting structured data", duration: 1500 },
    { description: "Analyzing patterns and intelligence", duration: 0, isCore: true },
    { description: "Compiling intelligence report", duration: 1000 },
  ],

  // Converter — 2 real calls: understand then transform
  caster: [
    { description: "Analyzing source content structure", duration: 1000 },
    { description: "Identifying key messages and themes", duration: 1200 },
    { description: "Transforming to target format", duration: 0, isCore: true },
    { description: "Optimizing for the medium", duration: 0, isCore2: true, core2Prompt: "You are a content optimization expert. Take this converted content and polish it for the target medium: improve hooks and transitions, ensure the tone matches the target format perfectly, add engagement elements (questions, calls-to-action), and make it publication-ready.\n\nDraft conversion:\n\n" },
    { description: "Final quality check", duration: 600 },
  ],

  // Tech Lead — 2 real calls: design then roadmap
  architect: [
    { description: "Analyzing requirements and constraints", duration: 1500 },
    { description: "Evaluating architectural patterns", duration: 1800 },
    { description: "Designing system architecture", duration: 0, isCore: true },
    { description: "Creating implementation roadmap", duration: 0, isCore2: true, core2Prompt: "You are a technical project manager. Take this architecture design and add: a phased implementation roadmap with clear milestones, estimated timelines for each phase, key technical risks with mitigation strategies, and a technology decision matrix comparing the alternatives mentioned. Make it actionable for an engineering team.\n\nArchitecture design:\n\n" },
    { description: "Finalizing technical spec", duration: 1000 },
  ],

  // Sales Rep — 2 real calls: research then outreach
  catalyst: [
    { description: "Analyzing target profile", duration: 1200 },
    { description: "Researching prospect signals", duration: 1500 },
    { description: "Generating prospect research and approach", duration: 0, isCore: true },
    { description: "Crafting personalized outreach", duration: 0, isCore2: true, core2Prompt: "You are an elite cold email copywriter. Using the research below, write: 1) A personalized cold email (max 5 sentences) with a compelling subject line, 2) Two alternative subject lines, 3) A 3-email follow-up sequence with different angles. Each email should reference specific details from the research. Use the Problem → Agitation → Solution framework.\n\nProspect research:\n\n" },
    { description: "Creating follow-up sequence", duration: 800 },
  ],

  // Fitness Coach — 2 real calls: plan then detail
  vitalis: [
    { description: "Assessing goals and constraints", duration: 1000 },
    { description: "Calculating nutritional targets", duration: 1200 },
    { description: "Designing personalized plan", duration: 0, isCore: true },
    { description: "Adding detailed schedules and meals", duration: 0, isCore2: true, core2Prompt: "You are a nutrition and fitness detailing expert. Take this plan and make it extremely specific and actionable: add exact meal recipes with portions for at least 3 days, add specific warm-up and cool-down routines, include rest day activities, add a simple tracking template, and include tips for staying consistent.\n\nFitness plan:\n\n" },
    { description: "Finalizing recommendations", duration: 600 },
  ],

  // Consultant — 2 real calls: analyze then strategy
  strategist: [
    { description: "Framing the strategic question", duration: 1200 },
    { description: "Analyzing market landscape", duration: 1800 },
    { description: "Developing strategic analysis", duration: 0, isCore: true },
    { description: "Assessing competitive positioning", duration: 1500 },
    { description: "Building implementation strategy", duration: 0, isCore2: true, core2Prompt: "You are a McKinsey-level strategy consultant. Take this analysis and add: an Executive Summary (3 bullet points), a strategic options comparison matrix (effort/impact/risk/timeline), a 90-day action plan with specific KPIs and owners, and a clear final recommendation with supporting rationale. Format it like a professional consulting deliverable.\n\nStrategic analysis:\n\n" },
    { description: "Preparing executive summary", duration: 1000 },
  ],
  // ── Tool-Enhanced Pipelines ──────────────────────────────────

  // Deep Research with real web search
  deep_research: [
    { description: "Understanding the research question", duration: 1200 },
    { description: "Searching the web for sources", duration: 0, isCore: true, tools: ["web-search", "deep-research"], maxToolSteps: 5, toolContext: "Search thoroughly. Use multiple queries from different angles. Find at least 8-10 relevant sources." },
    { description: "Cross-referencing and fact-checking", duration: 1500 },
    { description: "Synthesizing into comprehensive report", duration: 0, isCore2: true, core2Prompt: "You are an expert research synthesizer. Take the research data below (including all web sources found) and create a comprehensive, well-structured report with:\n1. Executive Summary (3-5 key findings)\n2. Detailed Analysis with sections\n3. Key Data Points and Statistics\n4. Sources and Citations (with URLs)\n5. Conclusion and Recommendations\n\nUse the source URLs as citation links. Format with clean markdown.\n\nResearch data:\n\n" },
    { description: "Adding citations and formatting", duration: 800 },
  ],

  // Investment Analyst with real stock data
  investment: [
    { description: "Identifying stocks and financial instruments", duration: 1000 },
    { description: "Fetching real-time market data", duration: 0, isCore: true, tools: ["finance-data"], maxToolSteps: 8, toolContext: "Fetch quote, fundamentals, and history for each stock mentioned. If comparing stocks, fetch data for all of them. Always get both quote and fundamentals." },
    { description: "Analyzing fundamentals and trends", duration: 1500 },
    { description: "Generating investment analysis with risk assessment", duration: 0, isCore2: true, core2Prompt: "You are an elite investment analyst. Using the real market data below, create a professional investment analysis with:\n1. Executive Summary\n2. Current Price & Performance (with real numbers)\n3. Fundamental Analysis (P/E, market cap, margins)\n4. Technical Overview (52-week range, trend)\n5. Analyst Consensus (if available)\n6. Risk Assessment (bull vs bear case)\n7. Recommendation with price target range\n\nFormat numbers in tables. Bold key metrics.\n\nMarket data:\n\n" },
    { description: "Compiling final report", duration: 800 },
  ],

  // Data Analyst with SQL queries on uploaded data
  data_analyst: [
    { description: "Analyzing uploaded data structure", duration: 800 },
    { description: "Running data analysis queries", duration: 0, isCore: true, tools: ["data-query"], maxToolSteps: 10, requiresFileData: true, toolContext: "Analyze the uploaded data thoroughly. Run multiple SQL queries to understand distributions, trends, outliers, and key metrics. Calculate summary statistics, group-by analyses, and correlations." },
    { description: "Generating insights and visualizations", duration: 1200 },
    { description: "Creating detailed analysis report", duration: 0, isCore2: true, core2Prompt: "You are a senior data analyst. Using the query results below, create a comprehensive analysis report with:\n1. Data Overview (rows, columns, data types)\n2. Key Metrics Summary (in a table)\n3. Distribution Analysis\n4. Trends and Patterns\n5. Outliers and Anomalies\n6. Actionable Insights (top 5)\n7. Recommendations\n\nFormat all numbers clearly. Use markdown tables extensively.\n\nQuery results:\n\n" },
    { description: "Finalizing report", duration: 600 },
  ],

  // Journalist with web search for sources
  journalist: [
    { description: "Researching the story angle", duration: 1000 },
    { description: "Gathering sources and quotes", duration: 0, isCore: true, tools: ["web-search"], maxToolSteps: 5, toolContext: "Search for recent news, expert opinions, and factual data related to this story. Find multiple perspectives and credible sources." },
    { description: "Structuring the narrative", duration: 1200 },
    { description: "Writing the article", duration: 0, isCore2: true, core2Prompt: "You are an award-winning journalist. Using the research sources below, write a compelling, well-sourced article with:\n1. Attention-grabbing headline\n2. Strong lede\n3. Context and background\n4. Multiple perspectives with attributed quotes/data\n5. Analysis of implications\n6. Conclusion\n\nCite sources inline with links.\n\nResearch:\n\n" },
    { description: "Final editorial review", duration: 600 },
  ],

  // Web Intel with scraping
  web_intel: [
    { description: "Analyzing target URLs", duration: 800 },
    { description: "Scraping and extracting data", duration: 0, isCore: true, tools: ["web-scrape", "web-search"], maxToolSteps: 5, toolContext: "Scrape the provided URLs and extract the requested information. If URLs aren't provided, search the web first to find relevant pages, then scrape them." },
    { description: "Structuring extracted intelligence", duration: 1000 },
    { description: "Compiling intelligence report", duration: 0, isCore2: true, core2Prompt: "You are an intelligence analyst. Using the scraped data below, create a structured intelligence report with:\n1. Summary of Findings\n2. Extracted Data (in tables)\n3. Key Patterns and Insights\n4. Source Reliability Assessment\n5. Recommendations for Follow-up\n\nFormat data in clean markdown tables.\n\nScraped data:\n\n" },
    { description: "Final formatting", duration: 600 },
  ],

  // Competitor Intelligence
  competitor_intel: [
    { description: "Identifying competitors to analyze", duration: 1000 },
    { description: "Researching competitor data", duration: 0, isCore: true, tools: ["web-search", "web-scrape"], maxToolSteps: 8, toolContext: "For each competitor mentioned, search for: pricing, features, recent news, market position, funding, and user reviews." },
    { description: "Cross-referencing competitive data", duration: 1500 },
    { description: "Building competitive analysis", duration: 0, isCore2: true, core2Prompt: "You are a competitive intelligence strategist. Using the research below, create a comprehensive competitive analysis with:\n1. Market Landscape Overview\n2. Competitor Profiles (strengths, weaknesses, pricing, features)\n3. Feature Comparison Matrix (markdown table)\n4. Pricing Comparison Table\n5. SWOT Analysis for each competitor\n6. Strategic Recommendations\n7. Opportunities and Threats\n\nUse tables extensively.\n\nResearch data:\n\n" },
    { description: "Finalizing competitive report", duration: 1000 },
  ],

  // Travel Planner with search
  travel: [
    { description: "Researching destination", duration: 1200 },
    { description: "Finding attractions, restaurants, and hotels", duration: 0, isCore: true, tools: ["web-search"], maxToolSteps: 5, toolContext: "Search for: top attractions, best restaurants, hotel recommendations, local tips, weather info, and transportation options. Get specific names and locations." },
    { description: "Optimizing itinerary", duration: 1500 },
    { description: "Building detailed travel plan", duration: 0, isCore2: true, core2Prompt: "You are an expert travel planner. Using the destination research below, create a premium travel itinerary with:\n1. Trip Overview\n2. Day-by-Day Itinerary (morning/afternoon/evening)\n3. Restaurant Recommendations per day\n4. Accommodation Options (budget, mid-range, luxury)\n5. Transportation Guide\n6. Packing Checklist\n7. Budget Breakdown (table)\n\nMake it feel like a premium travel guide.\n\nDestination research:\n\n" },
    { description: "Adding final tips and formatting", duration: 800 },
  ],

  // Financial Coach with calculator
  financial_coach: [
    { description: "Understanding your financial situation", duration: 1000 },
    { description: "Analyzing financial data", duration: 0, isCore: true, tools: ["calculator"], maxToolSteps: 5, toolContext: "Calculate key financial metrics: savings rate, debt-to-income ratio, emergency fund coverage, projected growth." },
    { description: "Building personalized plan", duration: 1500 },
    { description: "Creating financial roadmap", duration: 0, isCore2: true, core2Prompt: "You are a certified financial planner. Using the analysis below, create a personalized financial plan with:\n1. Financial Health Score (out of 100)\n2. Current Situation Summary\n3. 30-60-90 Day Action Plan\n4. Budget Recommendation with exact amounts\n5. Debt Payoff Strategy\n6. Investment Strategy\n7. Emergency Fund Plan\n8. Long-term Milestones (1yr, 5yr, 10yr)\n\nBe specific with numbers. Use tables.\n\nFinancial analysis:\n\n" },
    { description: "Finalizing recommendations", duration: 800 },
  ],

  // Sales Intelligence with prospect research
  sales_intel: [
    { description: "Researching target company", duration: 1200 },
    { description: "Gathering prospect intelligence", duration: 0, isCore: true, tools: ["web-search"], maxToolSteps: 6, toolContext: "Research the target company: recent news, funding, key executives, pain points, tech stack, job postings, and competitive landscape." },
    { description: "Identifying pain points and opportunities", duration: 1500 },
    { description: "Creating sales playbook", duration: 0, isCore2: true, core2Prompt: "You are an elite B2B sales strategist. Using the prospect research below, create a sales intelligence brief with:\n1. Company Snapshot (key facts table)\n2. Key Decision Makers\n3. Pain Points Analysis\n4. Buying Triggers (why now?)\n5. Competitive Landscape\n6. Personalized Outreach Strategy\n7. Cold Email Sequence (3 emails)\n8. Objection Handling (top 5)\n9. Recommended Approach\n\nMake emails specific and personalized.\n\nProspect research:\n\n" },
    { description: "Polishing outreach materials", duration: 800 },
  ],

  // Health & Fitness Coach
  health_fitness: [
    { description: "Assessing goals and constraints", duration: 1000 },
    { description: "Designing personalized program", duration: 0, isCore: true },
    { description: "Calculating nutrition targets", duration: 1200 },
    { description: "Creating detailed plan with meals and workouts", duration: 0, isCore2: true, core2Prompt: "You are a certified personal trainer and nutritionist. Take the program below and make it extremely detailed:\n1. Weekly Workout Schedule (day by day)\n2. Each Workout: exercises, sets, reps, rest time, form tips\n3. Warm-up and Cool-down Routines\n4. 7-Day Meal Plan with exact portions\n5. 3 Recipes per Meal Category\n6. Shopping List\n7. Progress Tracking Template\n8. Rest Day Activities\n9. Tips for Consistency\n\nBe specific — no vague advice.\n\nProgram outline:\n\n" },
    { description: "Finalizing your program", duration: 600 },
  ],

  // Legal Advisor with research
  legal: [
    { description: "Analyzing the legal question", duration: 1200 },
    { description: "Researching applicable laws and precedents", duration: 0, isCore: true, tools: ["web-search"], maxToolSteps: 4, toolContext: "Search for relevant laws, regulations, legal precedents, and expert opinions. Focus on the specific jurisdiction if mentioned." },
    { description: "Evaluating legal implications", duration: 1500 },
    { description: "Drafting legal analysis", duration: 0, isCore2: true, core2Prompt: "You are a senior legal advisor. Using the research below, create a thorough legal analysis with:\n1. Issue Summary\n2. Applicable Laws and Regulations\n3. Key Legal Precedents\n4. Analysis of Arguments (for and against)\n5. Risk Assessment (low/medium/high)\n6. Recommended Course of Action\n7. Next Steps\n8. DISCLAIMER: This is AI-generated legal information, not legal advice. Consult a licensed attorney.\n\nLegal research:\n\n" },
    { description: "Final review", duration: 800 },
  ],

  // Recruitment Agent
  recruitment: [
    { description: "Analyzing the role requirements", duration: 1000 },
    { description: "Researching market data", duration: 0, isCore: true, tools: ["web-search"], maxToolSteps: 4, toolContext: "Search for: salary benchmarks, common requirements at similar companies, trending skills, and effective interview questions." },
    { description: "Building recruitment strategy", duration: 1500 },
    { description: "Creating recruitment package", duration: 0, isCore2: true, core2Prompt: "You are a senior technical recruiter. Using the research below, create a complete recruitment package with:\n1. Optimized Job Description\n2. Salary Benchmark Table\n3. Must-Have vs Nice-to-Have Skills Matrix\n4. Sourcing Strategy\n5. 10 Screening Questions\n6. 10 Technical Interview Questions with answers\n7. Interview Scorecard Template\n8. 30-60-90 Day Onboarding Plan\n\nMake everything ready to use.\n\nMarket research:\n\n" },
    { description: "Finalizing package", duration: 800 },
  ],

  // Real Estate Analyst
  real_estate: [
    { description: "Analyzing property details", duration: 1000 },
    { description: "Researching market data", duration: 0, isCore: true, tools: ["web-search", "calculator"], maxToolSteps: 6, toolContext: "Search for: local market trends, comparable prices, neighborhood amenities, school ratings, and recent sales. Calculate ROI and cap rate if investment details provided." },
    { description: "Comparing alternatives", duration: 1500 },
    { description: "Building real estate analysis", duration: 0, isCore2: true, core2Prompt: "You are a real estate investment analyst. Using the research below, create a property analysis with:\n1. Property Overview\n2. Market Analysis (trends, avg prices)\n3. Comparable Properties Table\n4. Neighborhood Scorecard (schools, safety, amenities — rated 1-10)\n5. Financial Analysis (ROI, cap rate, cash flow)\n6. Risk Factors\n7. Negotiation Strategy\n8. Recommendation: Buy / Pass / Negotiate\n\nUse tables for comparisons.\n\nMarket research:\n\n" },
    { description: "Finalizing analysis", duration: 800 },
  ],

  // Product Launch Intelligence
  product_launch: [
    { description: "Analyzing the product concept", duration: 1000 },
    { description: "Researching market and competition", duration: 0, isCore: true, tools: ["web-search"], maxToolSteps: 6, toolContext: "Search for: similar products, market size, target demographics, pricing strategies, distribution channels, and recent launches in this category." },
    { description: "Building go-to-market strategy", duration: 1500 },
    { description: "Creating launch playbook", duration: 0, isCore2: true, core2Prompt: "You are a product launch strategist. Using the research below, create a launch playbook with:\n1. Market Opportunity Assessment\n2. Target Audience Personas (2-3)\n3. Competitive Positioning\n4. Pricing Strategy with comparison table\n5. 12-Week Go-to-Market Timeline\n6. Marketing Channel Strategy\n7. Content Calendar (first 30 days)\n8. Launch Day Checklist\n9. KPIs and Success Metrics\n\nBe specific and actionable.\n\nMarket research:\n\n" },
    { description: "Finalizing playbook", duration: 1000 },
  ],
};

export const DEFAULT_PIPELINE: PipelineStep[] = [
  { description: "Analyzing the task", duration: 1000 },
  { description: "Generating output", duration: 0, isCore: true },
  { description: "Reviewing and finalizing", duration: 800 },
];

// Map seed slugs to pipeline keys
const SLUG_TO_PIPELINE: Record<string, string> = {
  // Tool-enhanced agents → new pipelines
  "deep-research": "deep_research",
  "investment-analyst": "investment",
  "data-analyst": "data_analyst",
  "journalist": "journalist",
  "web-intel": "web_intel",
  "travel-planner": "travel",
  "fitness-coach": "health_fitness",
  "sales-rep": "sales_intel",
  "product-launch": "product_launch",
  "personal-finance": "financial_coach",
  // New agents
  "competitor-intel": "competitor_intel",
  "legal-advisor": "legal",
  "recruitment-agent": "recruitment",
  "real-estate-analyst": "real_estate",
  // Existing agents → legacy pipelines
  "academic-researcher": "scout",
  "fact-checker": "scout",
  "startup-trends": "scout",
  "content-creator": "quill",
  "technical-writer": "quill",
  "editor": "quill",
  "email-drafter": "quill",
  "linkedin-post": "quill",
  "cover-letter": "quill",
  "blog-to-podcast": "caster",
  "visualization-expert": "metric",
  "general-assistant": "atlas",
  "decision-helper": "atlas",
  "meeting-notes": "atlas",
  "system-architect": "architect",
  "fullstack-developer": "architect",
  "python-expert": "architect",
  "code-reviewer": "architect",
  "debugger": "architect",
  "customer-support": "catalyst",
  "recipe-planner": "vitalis",
  "mental-wellbeing": "vitalis",
  "strategy-advisor": "strategist",
  "project-planner": "strategist",
  "sprint-planner": "strategist",
};

export function getPipeline(agentSlug: string): PipelineStep[] {
  // Direct match first, then mapped slug, then default
  return AGENT_PIPELINES[agentSlug]
    || AGENT_PIPELINES[SLUG_TO_PIPELINE[agentSlug]]
    || DEFAULT_PIPELINE;
}
