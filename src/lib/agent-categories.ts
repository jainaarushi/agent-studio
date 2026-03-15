// Agent category definitions for the gallery and navigation
// Covers the full business lifecycle: Idea → Build → Launch → Grow → Scale

export interface AgentCategory {
  id: string;
  name: string;
  tagline: string;
  icon: string;
  color: string;
  gradient: string;
  order: number;
}

export const AGENT_CATEGORIES: AgentCategory[] = [
  {
    id: "product",
    name: "Product & Engineering",
    tagline: "From idea to shipped product",
    icon: "rocket",
    color: "#6366F1",
    gradient: "linear-gradient(135deg, #6366F1, #818CF8)",
    order: 1,
  },
  {
    id: "research",
    name: "Research & Intelligence",
    tagline: "Real data, not guesswork",
    icon: "search",
    color: "#0EA5E9",
    gradient: "linear-gradient(135deg, #0EA5E9, #38BDF8)",
    order: 2,
  },
  {
    id: "sales",
    name: "Sales & Revenue",
    tagline: "From cold lead to signed deal",
    icon: "chart",
    color: "#10B981",
    gradient: "linear-gradient(135deg, #10B981, #34D399)",
    order: 3,
  },
  {
    id: "marketing",
    name: "Marketing & Content",
    tagline: "Content that converts",
    icon: "megaphone",
    color: "#F43F5E",
    gradient: "linear-gradient(135deg, #F43F5E, #FB7185)",
    order: 4,
  },
  {
    id: "operations",
    name: "Operations & Productivity",
    tagline: "Run your business on autopilot",
    icon: "gear",
    color: "#F59E0B",
    gradient: "linear-gradient(135deg, #F59E0B, #FBBF24)",
    order: 5,
  },
  {
    id: "lifestyle",
    name: "Health & Lifestyle",
    tagline: "Your AI life coach",
    icon: "heart",
    color: "#EC4899",
    gradient: "linear-gradient(135deg, #EC4899, #F472B6)",
    order: 6,
  },
  {
    id: "creative",
    name: "Creative & Fun",
    tagline: "Go viral, have fun",
    icon: "sparkle",
    color: "#8B5CF6",
    gradient: "linear-gradient(135deg, #8B5CF6, #A78BFA)",
    order: 7,
  },
  {
    id: "career",
    name: "Career & Job Search",
    tagline: "Land your dream job",
    icon: "briefcase",
    color: "#2563EB",
    gradient: "linear-gradient(135deg, #2563EB, #3B82F6)",
    order: 8,
  },
  {
    id: "finance_personal",
    name: "Money & Bills",
    tagline: "Save more, spend smarter",
    icon: "wallet",
    color: "#059669",
    gradient: "linear-gradient(135deg, #059669, #34D399)",
    order: 9,
  },
  {
    id: "legal_personal",
    name: "Legal & Rights",
    tagline: "Know your rights",
    icon: "shield",
    color: "#7C3AED",
    gradient: "linear-gradient(135deg, #7C3AED, #A78BFA)",
    order: 10,
  },
  {
    id: "housing",
    name: "Housing & Moving",
    tagline: "Find your perfect home",
    icon: "home",
    color: "#D97706",
    gradient: "linear-gradient(135deg, #D97706, #FBBF24)",
    order: 11,
  },
  {
    id: "health_personal",
    name: "Health & Medical",
    tagline: "Navigate healthcare smarter",
    icon: "stethoscope",
    color: "#DC2626",
    gradient: "linear-gradient(135deg, #DC2626, #F87171)",
    order: 12,
  },
  {
    id: "education",
    name: "Education & Learning",
    tagline: "Your academic advantage",
    icon: "graduation",
    color: "#0891B2",
    gradient: "linear-gradient(135deg, #0891B2, #22D3EE)",
    order: 13,
  },
  {
    id: "shopping",
    name: "Smart Shopping",
    tagline: "Shop smarter, save more",
    icon: "tag",
    color: "#C026D3",
    gradient: "linear-gradient(135deg, #C026D3, #E879F9)",
    order: 14,
  },
  {
    id: "freelance",
    name: "Freelance & Side Income",
    tagline: "Earn on your own terms",
    icon: "zap",
    color: "#EA580C",
    gradient: "linear-gradient(135deg, #EA580C, #FB923C)",
    order: 15,
  },
];

// Map every agent slug to its category
export const AGENT_CATEGORY_MAP: Record<string, string> = {
  // Product & Engineering
  "startup-idea-gen": "product",
  "product-launch": "product",
  "system-architect": "product",
  "ux-designer": "product",
  "fullstack-developer": "product",
  "python-expert": "product",
  "code-reviewer": "product",
  "debugger": "product",
  "sprint-planner": "product",
  "project-planner": "product",
  "devops-agent": "product",

  // Research & Intelligence
  "deep-research": "research",
  "academic-researcher": "research",
  "fact-checker": "research",
  "startup-trends": "research",
  "competitor-intel": "research",
  "web-intel": "research",
  "data-analyst": "research",
  "visualization-expert": "research",
  "strategy-advisor": "research",
  "decision-helper": "research",
  "vc-due-diligence": "research",
  "market-sizing": "research",

  // Sales & Revenue
  "sales-rep": "sales",
  "investment-analyst": "sales",
  "personal-finance": "sales",
  "pricing-strategist": "sales",
  "proposal-writer": "sales",

  // Marketing & Content
  "content-creator": "marketing",
  "linkedin-post": "marketing",
  "blog-to-podcast": "marketing",
  "journalist": "marketing",
  "technical-writer": "marketing",
  "editor": "marketing",
  "email-drafter": "marketing",
  "seo-agent": "marketing",
  "social-media": "marketing",
  "ad-copy": "marketing",
  "newsletter-agent": "marketing",
  "video-script": "marketing",

  // Operations & Productivity
  "general-assistant": "operations",
  "meeting-notes": "operations",
  "customer-support": "operations",
  "recruitment-agent": "operations",
  "legal-advisor": "operations",
  "cover-letter": "operations",

  // Health & Lifestyle
  "fitness-coach": "lifestyle",
  "mental-wellbeing": "lifestyle",
  "recipe-planner": "lifestyle",
  "travel-planner": "lifestyle",

  // Creative & Fun
  "roast-master": "creative",
  "song-lyrics": "creative",

  // Career & Job Search
  "job-hunter": "career",
  "auto-applier": "career",
  "resume-optimizer": "career",
  "interview-coach": "career",
  "salary-negotiator": "career",

  // Money & Bills
  "subscription-killer": "finance_personal",
  "bill-negotiator": "finance_personal",
  "tax-deduction-finder": "finance_personal",
  "credit-score-coach": "finance_personal",
  "deal-spotter": "finance_personal",

  // Legal & Rights
  "dispute-fighter": "legal_personal",
  "benefits-finder": "legal_personal",
  "lease-reviewer": "legal_personal",
  "immigration-helper": "legal_personal",
  "small-claims-advisor": "legal_personal",

  // Housing & Moving
  "apartment-scout": "housing",
  "moving-coordinator": "housing",
  "utility-optimizer": "housing",
  "roommate-matcher": "housing",

  // Health & Medical
  "medical-bill-auditor": "health_personal",
  "insurance-comparer": "health_personal",
  "symptom-researcher": "health_personal",
  "prescription-saver": "health_personal",

  // Education
  "scholarship-hunter": "education",
  "college-advisor": "education",

  // Smart Shopping
  "return-assistant": "shopping",
  "car-buy-negotiator": "shopping",

  // Freelance & Side Income
  "freelance-bid-writer": "freelance",
  "side-hustle-matcher": "freelance",
  "contract-reviewer": "freelance",
};

export function getAgentCategory(slug: string): AgentCategory {
  const categoryId = AGENT_CATEGORY_MAP[slug] || "creative";
  return AGENT_CATEGORIES.find(c => c.id === categoryId) || AGENT_CATEGORIES[6];
}
