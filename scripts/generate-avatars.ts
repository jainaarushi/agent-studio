/**
 * Generate Pixar-style 3D chibi avatar character sheets for all agents.
 *
 * Usage:
 *   npx tsx scripts/generate-avatars.ts
 *
 * Requires:
 *   GEMINI_API_KEY in .env (or pass as env var)
 *   npm install @google/generative-ai (one-time)
 *
 * Output:
 *   public/avatars/batch-01.png, batch-02.png, ... (6 agents each)
 *   public/avatars/manifest.json (slug -> batch + position mapping)
 */

import fs from "fs";
import path from "path";
import dotenv from "dotenv";

dotenv.config();

const API_KEY = process.env.GEMINI_API_KEY;
if (!API_KEY) {
  console.error("Set GEMINI_API_KEY in .env or as environment variable");
  process.exit(1);
}

// ── All 76 agents with unique appearance descriptions ──────────────

interface AgentAvatar {
  slug: string;
  name: string;
  role: string;
  look: string; // ethnicity, hair, outfit, expression
}

const AGENTS: AgentAvatar[] = [
  // ── Product & Engineering (14) ──
  { slug: "startup-idea-gen", name: "Arjun", role: "Startup Ideation", look: "South Asian male, wavy dark hair, navy bomber jacket, excited grin, holding a glowing lightbulb" },
  { slug: "product-launch", name: "Sofia", role: "Product Launch", look: "Latina female, long brown hair in ponytail, red blazer over white tee, determined smile, tiny rocket in hand" },
  { slug: "system-architect", name: "Hiroshi", role: "Systems Architect", look: "Japanese male, neat short black hair, steel-gray turtleneck, calm focused look, blueprint scroll under arm" },
  { slug: "ux-designer", name: "Amara", role: "UX Designer", look: "West African female, short natural hair with gold clips, coral sweater, warm smile, holding a stylus pen" },
  { slug: "fullstack-developer", name: "Liam", role: "Full-Stack Dev", look: "Chinese male, messy dark quiff, round glasses, cream chunky hoodie, curious wide eyes, tiny laptop" },
  { slug: "python-expert", name: "Fatima", role: "Python Expert", look: "Arab female, dark hijab with teal accent, olive cardigan, thoughtful smile, small python snake plushie on shoulder" },
  { slug: "code-reviewer", name: "Marcus", role: "Code Reviewer", look: "Black male, short beard, thick-rimmed glasses, charcoal henley, scrutinizing look with one raised eyebrow, magnifying glass" },
  { slug: "debugger", name: "Yuki", role: "Debugger", look: "Japanese female, shoulder-length hair with bangs, oversized purple hoodie, intense focused squint, holding a tiny bug net" },
  { slug: "sprint-planner", name: "Elena", role: "Sprint Planner", look: "Eastern European female, blonde bob, sage green blouse, organized confident smile, clipboard in hand" },
  { slug: "project-planner", name: "David", role: "Project Manager", look: "Nigerian male, clean fade haircut, navy polo shirt, reassuring smile, tiny Gantt chart floating beside him" },
  { slug: "home-renovation", name: "Isabella", role: "Home Renovation", look: "Italian female, wavy brown hair in messy bun, denim apron over striped tee, cheerful grin, paint roller in hand" },
  { slug: "game-design", name: "Kai", role: "Game Designer", look: "Swedish male, sandy blonde messy hair, graphic tee with pixel art, playful smirk, holding a tiny game controller" },
  { slug: "ui-ux-feedback", name: "Priya", role: "UI/UX Feedback", look: "Indian female, long dark braid, mustard yellow cardigan, analytical smile, holding phone showing an app" },
  { slug: "devops-agent", name: "Omar", role: "DevOps Engineer", look: "Egyptian male, short curly dark hair, black zip-up jacket, focused calm expression, tiny server rack beside him" },

  // ── Research & Intelligence (12) ──
  { slug: "deep-research", name: "Mei Lin", role: "Deep Researcher", look: "Chinese female, sleek black hair in low bun, tortoise-shell glasses, white lab coat, thoughtful gaze, stack of papers" },
  { slug: "academic-researcher", name: "Adaeze", role: "Academic Research", look: "Nigerian female, natural afro with reading glasses on head, burgundy turtleneck, warm scholarly smile, open book" },
  { slug: "fact-checker", name: "Jonas", role: "Fact Checker", look: "Scandinavian male, light brown hair, steel-blue vest over white shirt, skeptical raised eyebrow, checkmark stamp" },
  { slug: "startup-trends", name: "Zara", role: "Trends Analyst", look: "Somali female, long dark hair with gold headband, teal blazer, knowing smile, holographic trend chart floating" },
  { slug: "competitor-intel", name: "Nikolai", role: "Competitive Intel", look: "Russian male, sharp jawline, dark swept-back hair, black turtleneck, sly confident look, binoculars around neck" },
  { slug: "web-intel", name: "Anika", role: "Web Intelligence", look: "Indian female, dark hair in high ponytail, denim jacket, alert curious eyes, tiny spider web design on shoulder" },
  { slug: "data-analyst", name: "Rafael", role: "Data Analyst", look: "Brazilian male, short dark curly hair, round glasses, lavender blazer, thoughtful smile, bar chart floating" },
  { slug: "visualization-expert", name: "Ingrid", role: "Data Viz Designer", look: "Swedish female, strawberry blonde wavy hair, rainbow-striped scarf, creative bright smile, paint palette" },
  { slug: "strategy-advisor", name: "James", role: "Strategy Advisor", look: "Ghanaian male, short hair with graying temples, charcoal suit jacket, wise calm expression, chess piece in hand" },
  { slug: "decision-helper", name: "Clara", role: "Decision Scientist", look: "Danish female, light brown hair in loose waves, soft pink blouse, gentle reassuring smile, balance scale" },
  { slug: "vc-due-diligence", name: "Alexander", role: "Due Diligence", look: "Taiwanese male, neat side-parted hair, navy suit with pocket square, sharp analytical look, magnifying glass over document" },
  { slug: "market-sizing", name: "Nadia", role: "Market Sizing", look: "Russian female, platinum blonde bob, emerald green blazer, confident look, pie chart floating beside her" },

  // ── Sales & Revenue (6) ──
  { slug: "sales-rep", name: "Carlos", role: "Sales Rep", look: "Mexican male, slicked-back dark hair, white dress shirt rolled sleeves, charming big smile, handshake gesture" },
  { slug: "investment-analyst", name: "Grace", role: "Investment Analyst", look: "Japanese female, straight black hair with side part, pearl earrings, cream blazer, composed look, stock ticker" },
  { slug: "personal-finance", name: "Kwame", role: "Personal Finance", look: "Ghanaian male, short hair, warm brown cardigan, friendly approachable smile, piggy bank in hand" },
  { slug: "real-estate-analyst", name: "Leila", role: "Real Estate", look: "Iranian female, dark wavy hair, olive trench coat, professional smile, tiny house model in palm" },
  { slug: "pricing-strategist", name: "Henrik", role: "Pricing Strategy", look: "Norwegian male, light beard, navy knit sweater, thoughtful calculating look, price tag floating" },
  { slug: "proposal-writer", name: "Thandiwe", role: "Proposal Writer", look: "South African female, braided updo with beads, plum blazer, persuasive warm smile, scroll document" },

  // ── Marketing & Content (13) ──
  { slug: "content-creator", name: "Maya", role: "Content Creator", look: "Puerto Rican female, long wavy dark hair, colorful oversized jacket, bright creative smile, paintbrush and pen" },
  { slug: "linkedin-post", name: "Daniel", role: "LinkedIn Strategist", look: "Nigerian male, neat haircut, tailored blue suit, professional confident smile, LinkedIn logo floating tiny" },
  { slug: "blog-to-podcast", name: "Sana", role: "Podcast Producer", look: "Pakistani female, dark hair in loose bun, orange headphones around neck, warm laugh, tiny microphone" },
  { slug: "journalist", name: "Thomas", role: "Journalist", look: "French male, messy brown hair, tan trench coat, inquisitive sharp eyes, notepad and pen" },
  { slug: "technical-writer", name: "Yuna", role: "Technical Writer", look: "Korean female, straight black hair with bangs, minimalist white blouse, focused gentle expression, documentation book" },
  { slug: "editor", name: "Charlotte", role: "Senior Editor", look: "French female, chestnut hair in elegant chignon, reading glasses, burgundy scarf, discerning half-smile, red pen" },
  { slug: "email-drafter", name: "Ahmed", role: "Email Specialist", look: "Algerian male, short dark hair, light blue button-up, friendly approachable grin, floating envelope" },
  { slug: "meme-caption", name: "Zoe", role: "Meme Creator", look: "Chinese-American female, dyed purple streaks in black hair, oversized graphic hoodie, laughing expression, phone" },
  { slug: "seo-agent", name: "Viktor", role: "SEO Expert", look: "Czech male, slicked dark hair, smart black glasses, olive polo shirt, analytical look, search magnifying glass" },
  { slug: "social-media", name: "Amira", role: "Social Media", look: "Senegalese female, long braids with gold cuffs, vibrant yellow top, energetic smile, phone with hearts floating" },
  { slug: "ad-copy", name: "Lucas", role: "Ad Copywriter", look: "French male, tousled brown hair, denim jacket, creative smirk, megaphone in hand" },
  { slug: "newsletter-agent", name: "Rina", role: "Newsletter Curator", look: "Japanese female, short bob with side sweep, soft pink cardigan, gentle organized smile, newspaper roll" },
  { slug: "video-script", name: "Mateo", role: "Video Scriptwriter", look: "Colombian male, dark curly hair, maroon bomber jacket, animated storytelling expression, clapperboard" },

  // ── Operations & Productivity (9) ──
  { slug: "general-assistant", name: "Emma", role: "Executive Assistant", look: "Swedish female, light blonde hair in neat low bun, cream turtleneck, warm reliable smile, clipboard and coffee cup" },
  { slug: "meeting-notes", name: "Samuel", role: "Meeting Notes", look: "Ghanaian male, short hair, olive green sweater, attentive listening expression, tiny notebook with pen" },
  { slug: "customer-support", name: "Aisha", role: "Customer Support", look: "Bangladeshi female, dark hair with headset on, soft blue top, empathetic kind smile, heart floating" },
  { slug: "recruitment-agent", name: "Benjamin", role: "Recruiter", look: "Nigerian male, clean-cut hair, gray blazer over black tee, welcoming open smile, handshake gesture" },
  { slug: "legal-advisor", name: "Helena", role: "Legal Advisor", look: "Greek female, dark hair pulled back, tortoise-shell glasses, navy blazer, serious but warm expression, gavel" },
  { slug: "cover-letter", name: "Olivia", role: "Career Documents", look: "Kenyan female, natural hair with colorful headwrap, mustard blouse, encouraging bright smile, resume paper" },
  { slug: "speech-trainer", name: "Francois", role: "Speech Coach", look: "French male, salt-and-pepper short hair, charcoal blazer with pocket square, charismatic smile, tiny microphone" },
  { slug: "ecommerce-agent", name: "Jia", role: "E-Commerce", look: "Chinese female, straight hair with blunt bangs, pastel pink blazer, savvy determined look, shopping bag" },
  { slug: "teaching-agent", name: "Kofi", role: "Education", look: "Ghanaian male, short hair with reading glasses, warm brown vest over white shirt, patient kind smile, chalkboard" },

  // ── Health & Lifestyle (6) ──
  { slug: "fitness-coach", name: "Andre", role: "Fitness Coach", look: "Brazilian male, athletic build, short dark hair, teal athletic jacket, towel on shoulder, energetic grin, dumbbell" },
  { slug: "mental-wellbeing", name: "Lina", role: "Mental Wellness", look: "Swedish female, soft wavy blonde hair, cozy sage cardigan, serene peaceful smile, tiny lotus flower" },
  { slug: "recipe-planner", name: "Carmen", role: "Recipe Planner", look: "Spanish female, dark curly hair with flour dusting, white apron over red top, joyful smile, wooden spoon" },
  { slug: "travel-planner", name: "Tariq", role: "Travel Planner", look: "Omani male, neat dark hair, linen shirt with rolled sleeves, adventurous smile, tiny globe in hand" },
  { slug: "life-coach", name: "Nkechi", role: "Life Coach", look: "Nigerian female, short natural hair with gold earrings, warm orange blazer, inspiring confident smile, compass" },
  { slug: "baby-name", name: "Elise", role: "Baby Name Expert", look: "French female, light brown wavy hair, soft lavender sweater, gentle sweet smile, baby rattle" },

  // ── Creative & Fun (16) ──
  { slug: "roast-master", name: "Maya C", role: "Comedy Roast", look: "Chinese-American female, edgy short black hair with red tips, leather jacket, mischievous smirk, tiny flame" },
  { slug: "dream-interpreter", name: "Surya", role: "Dream Analyst", look: "Indian male, dark wavy hair, purple velvet jacket, mystical dreamy gaze, crescent moon floating" },
  { slug: "villain-origin", name: "Raven", role: "Dark Storyteller", look: "Mixed-race female, long dark hair with silver streak, black cape collar, dramatic mysterious smile, quill pen" },
  { slug: "fortune-teller", name: "Celeste", role: "Fortune Teller", look: "Mexican female, long dark hair with celestial hair pins, deep purple shawl, enigmatic smile, crystal ball" },
  { slug: "rap-battle", name: "Darius", role: "Rap Battle", look: "Black male, fresh fade with designs, gold chain, black bomber jacket, fierce confident expression, microphone" },
  { slug: "alien-anthropologist", name: "Xara", role: "Alien Anthropologist", look: "Ambiguous ethnicity female, silver-blue short hair, futuristic white jacket, curious amused look, tiny UFO" },
  { slug: "toxic-trait", name: "Jade", role: "Toxic Trait Analyst", look: "Filipino female, dark hair with green highlights, black crop hoodie, playful wink, tiny skull charm" },
  { slug: "dating-profile", name: "Leo", role: "Dating Profile", look: "Danish male, sandy blonde wavy hair, pastel pink button-up, charming warm smile, tiny heart arrow" },
  { slug: "movie-plot", name: "Anya", role: "Movie Plot Creator", look: "Russian female, auburn hair in messy bun, vintage round glasses, storytelling animated expression, film reel" },
  { slug: "song-lyrics", name: "Rio", role: "Songwriter", look: "Japanese-Brazilian male, long dark hair tied back, acoustic guitar strap on shoulder, soulful gentle look, music notes" },
  { slug: "bedtime-story", name: "Luna", role: "Story Writer", look: "Norwegian female, long platinum blonde hair, cozy blue knit sweater, soft dreamy smile, tiny teddy bear" },
  { slug: "excuse-generator", name: "Felix", role: "Excuse Generator", look: "German male, sandy messy hair, mischievous raised eyebrows, green hoodie, shifty playful grin, speech bubble" },
  { slug: "apology-writer", name: "Sophie", role: "Apology Expert", look: "French female, soft brown waves, white lace blouse, sincere gentle expression, olive branch in hand" },
  { slug: "future-coach", name: "Dante", role: "Future Self Coach", look: "Italian male, dark curly hair, futuristic silver jacket, visionary hopeful gaze, tiny telescope" },
  { slug: "debate-champion", name: "Farah", role: "Debate Champion", look: "Iranian female, dark hair in sleek ponytail, sharp red blazer, fierce articulate expression, trophy" },
  { slug: "music-generator", name: "Soren", role: "Music Composer", look: "Swedish male, platinum blonde undercut, black turtleneck, contemplative creative look, headphones on, floating notes" },
];

// ── Batch agents into groups of 6 ──────────────────────────────────

function chunkArray<T>(arr: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < arr.length; i += size) {
    chunks.push(arr.slice(i, i + size));
  }
  return chunks;
}

function buildPrompt(batch: AgentAvatar[]): string {
  const characterLines = batch
    .map((a, i) => `${i + 1}. ${a.look} — ${a.role}`)
    .join("\n");

  return `Character sheet of ${batch.length} cute Pixar-style 3D chibi avatars arranged in a ${batch.length <= 3 ? batch.length + "x1" : "3x2"} grid on a pure white background.

Each character has super-deformed proportions: oversized round head, tiny body, big expressive eyes with light reflections, flawless smooth 3D skin, soft cinematic studio lighting.

The ${batch.length} characters:
${characterLines}

All characters same art style, same chibi proportions, same white background. Clean minimalist render, no text, no labels, no watermarks.`;
}

// ── Gemini API call (Imagen via Gemini 2.0 Flash) ──────────────────

async function generateImage(prompt: string, batchNum: number, outDir: string): Promise<string | null> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${API_KEY}`;

  const body = {
    contents: [
      {
        parts: [{ text: prompt }],
      },
    ],
    generationConfig: {
      responseModalities: ["TEXT", "IMAGE"],
    },
  };

  console.log(`  Calling Gemini API for batch ${batchNum}...`);

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errText = await res.text();
    console.error(`  ERROR batch ${batchNum}: ${res.status} ${errText.slice(0, 200)}`);
    return null;
  }

  const data = await res.json();

  // Extract image from response
  const parts = data.candidates?.[0]?.content?.parts || [];
  for (const part of parts) {
    if (part.inlineData?.mimeType?.startsWith("image/")) {
      const ext = part.inlineData.mimeType === "image/png" ? "png" : "jpg";
      const filename = `batch-${String(batchNum).padStart(2, "0")}.${ext}`;
      const filepath = path.join(outDir, filename);
      const buffer = Buffer.from(part.inlineData.data, "base64");
      fs.writeFileSync(filepath, buffer);
      console.log(`  Saved: ${filepath} (${(buffer.length / 1024).toFixed(0)}KB)`);
      return filename;
    }
  }

  // If no image, check for text response (might be a refusal)
  for (const part of parts) {
    if (part.text) {
      console.error(`  No image in batch ${batchNum}. Model said: ${part.text.slice(0, 200)}`);
    }
  }
  return null;
}

// ── Main ────────────────────────────────────────────────────────────

async function main() {
  const outDir = path.join(process.cwd(), "public", "avatars");
  fs.mkdirSync(outDir, { recursive: true });

  const batches = chunkArray(AGENTS, 6);
  console.log(`\nGenerating ${AGENTS.length} agent avatars in ${batches.length} batches of 6\n`);
  console.log(`Output: ${outDir}\n`);

  const manifest: Record<string, { batch: string; position: number; name: string; role: string }> = {};
  let successCount = 0;

  for (let i = 0; i < batches.length; i++) {
    const batch = batches[i];
    const batchNum = i + 1;

    console.log(`\n── Batch ${batchNum}/${batches.length} (${batch.map(a => a.slug).join(", ")}) ──`);

    const prompt = buildPrompt(batch);
    const filename = await generateImage(prompt, batchNum, outDir);

    if (filename) {
      successCount++;
      for (let j = 0; j < batch.length; j++) {
        manifest[batch[j].slug] = {
          batch: filename,
          position: j + 1,
          name: batch[j].name,
          role: batch[j].role,
        };
      }
    }

    // Rate limit: wait 5s between calls to avoid hitting Gemini limits
    if (i < batches.length - 1) {
      console.log("  Waiting 5s for rate limit...");
      await new Promise((r) => setTimeout(r, 5000));
    }
  }

  // Save manifest
  const manifestPath = path.join(outDir, "manifest.json");
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
  console.log(`\n\nDone! ${successCount}/${batches.length} batches generated.`);
  console.log(`Manifest: ${manifestPath}`);
  console.log(`Images: ${outDir}/batch-*.png\n`);
}

main().catch(console.error);
