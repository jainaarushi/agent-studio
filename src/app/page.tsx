"use client";

import { motion } from "framer-motion";
import {
  Bot, Sparkles, Zap, BarChart3, Command, Users, Palette, ArrowRight,
  ChevronRight, Star, Shield, Layers, MousePointerClick, BrainCircuit,
  Search, ListChecks, PaintBucket
} from "lucide-react";

const agents = [
  { name: "Scout", role: "Research & Discovery", color: "bg-emerald-400/15 text-emerald-400" },
  { name: "Quill", role: "Writing & Content", color: "bg-sky-400/15 text-sky-400" },
  { name: "Metric", role: "Data & Analytics", color: "bg-violet-400/15 text-violet-400" },
  { name: "Atlas", role: "Planning & Strategy", color: "bg-amber-400/15 text-amber-400" },
  { name: "Voyager", role: "Exploration & Trends", color: "bg-rose-400/15 text-rose-400" },
  { name: "Pulse", role: "Monitoring & Alerts", color: "bg-cyan-400/15 text-cyan-400" },
  { name: "Sleuth", role: "Debugging & QA", color: "bg-orange-400/15 text-orange-400" },
  { name: "Caster", role: "Forecasting", color: "bg-indigo-400/15 text-indigo-400" },
  { name: "Architect", role: "System Design", color: "bg-teal-400/15 text-teal-400" },
  { name: "Catalyst", role: "Automation", color: "bg-pink-400/15 text-pink-400" },
  { name: "Vitalis", role: "Health & Wellness", color: "bg-lime-400/15 text-lime-400" },
  { name: "Strategist", role: "Decision Making", color: "bg-fuchsia-400/15 text-fuchsia-400" },
];

const features = [
  {
    icon: BrainCircuit,
    title: "Smart Agent Suggestions",
    description: "As you type a task, AgentStudio recommends the best agents based on keywords and context.",
  },
  {
    icon: Layers,
    title: "Multi-Agent Pipelines",
    description: "Select multiple agents and drag-and-drop to reorder their execution sequence for complex workflows.",
  },
  {
    icon: Command,
    title: "Command Palette (\u2318K)",
    description: "Search tasks, agents, and navigate instantly. Power-user shortcuts for everything.",
  },
  {
    icon: BarChart3,
    title: "Analytics Dashboard",
    description: "Status distribution, agent performance, priority breakdown, and token usage at a glance.",
  },
  {
    icon: ListChecks,
    title: "Bulk Operations",
    description: "Select multiple tasks to delete, change priority, or move sections in one click.",
  },
  {
    icon: PaintBucket,
    title: "Custom Agent Builder",
    description: "Build your own agents with custom icons, colors, AI models, and system prompts.",
  },
];

const steps = [
  { step: "01", title: "Create a Task", description: "Describe what you need done \u2014 write copy, analyze data, build a plan." },
  { step: "02", title: "Agents Suggest Themselves", description: "AI recommends the best agents for your task. Pick one or chain multiple." },
  { step: "03", title: "Execute & Collaborate", description: "Agents work in sequence. Review, iterate, and ship \u2014 together." },
];

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};
const stagger = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
};
const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0 },
};

export default function LandingPage() {
  return (
    <div className="landing-dark min-h-screen overflow-x-hidden">
      {/* Nav */}
      <nav className="fixed top-0 inset-x-0 z-50 landing-glass border-b border-white/[0.06]">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-[#38bdf8]/20 flex items-center justify-center landing-glow">
              <Bot className="h-4 w-4 text-[#38bdf8]" />
            </div>
            <span className="font-bold text-lg tracking-tight text-white">AgentStudio</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm text-[#7a8ba0]">
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#agents" className="hover:text-white transition-colors">Agents</a>
            <a href="#how-it-works" className="hover:text-white transition-colors">How It Works</a>
          </div>
          <a
            href="/today"
            className="px-4 py-2 rounded-lg bg-[#38bdf8] text-[#0a0e14] text-sm font-medium hover:bg-[#38bdf8]/90 transition-colors landing-glow"
          >
            Get Started
          </a>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative pt-32 pb-20 px-6">
        <div className="landing-grid absolute inset-0 opacity-20" />
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-[#38bdf8]/[0.08] rounded-full blur-[120px]" />
        <div className="relative z-10 max-w-6xl mx-auto text-center">
          <motion.div initial={fadeUp.hidden} animate={fadeUp.show} className="mb-6">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full landing-glass text-xs font-mono text-[#38bdf8] uppercase tracking-widest">
              <Sparkles className="h-3 w-3 animate-pulse" />
              1000s of AI Agents
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.1] mb-6 text-white"
          >
            Your Daily Workspace for
            <br />
            <span className="landing-text-gradient">Human–AI Collaboration</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.25 }}
            className="text-lg sm:text-xl text-[#7a8ba0] max-w-2xl mx-auto mb-10"
          >
            Create tasks, let AI agents suggest themselves, chain them into pipelines,
            and ship work faster — all in a Canva-inspired interface.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.35 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <a
              href="/today"
              className="flex items-center gap-2 px-8 py-3 rounded-xl bg-[#38bdf8] text-[#0a0e14] font-semibold hover:bg-[#38bdf8]/90 transition-colors landing-glow text-base"
            >
              Get Started
              <ArrowRight className="h-4 w-4" />
            </a>
            <a
              href="#features"
              className="flex items-center gap-2 px-8 py-3 rounded-xl bg-white/[0.06] text-white/80 font-semibold hover:bg-white/[0.1] transition-colors text-base"
            >
              See Features
              <ArrowRight className="h-4 w-4" />
            </a>
          </motion.div>

          {/* Hero Image */}
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.5 }}
            className="mt-16 relative"
          >
            <div className="absolute -inset-4 bg-[#38bdf8]/5 rounded-3xl blur-2xl" />
            <div className="relative rounded-2xl overflow-hidden border border-white/[0.08] shadow-2xl shadow-[#38bdf8]/5">
              <img
                src="/hero-dashboard.png"
                alt="AgentStudio workspace showing AI agent cards, task management, command palette, and analytics dashboard"
                className="w-full"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0a0e14]/60 via-transparent to-transparent" />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeUp}
            className="text-center mb-16"
          >
            <span className="text-xs font-mono text-[#38bdf8] uppercase tracking-widest">Features</span>
            <h2 className="text-3xl sm:text-4xl font-bold mt-3 mb-4 text-white">Everything you need to orchestrate AI</h2>
            <p className="text-[#7a8ba0] max-w-lg mx-auto">
              From smart suggestions to multi-agent pipelines — designed to make you unstoppable.
            </p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-50px" }}
            variants={stagger}
            className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5"
          >
            {features.map((f) => (
              <motion.div
                key={f.title}
                variants={item}
                className="landing-glass rounded-2xl p-6 group hover:border-[#38bdf8]/20 transition-all"
              >
                <div className="h-11 w-11 rounded-xl bg-[#38bdf8]/10 flex items-center justify-center mb-4 group-hover:landing-glow transition-all">
                  <f.icon className="h-5 w-5 text-[#38bdf8]" />
                </div>
                <h3 className="font-semibold text-lg mb-2 text-white">{f.title}</h3>
                <p className="text-sm text-[#7a8ba0] leading-relaxed">{f.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Agents */}
      <section id="agents" className="py-24 px-6 relative">
        <div className="absolute inset-0 bg-white/[0.02]" />
        <div className="relative max-w-6xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeUp}
            className="text-center mb-16"
          >
            <span className="text-xs font-mono text-[#38bdf8] uppercase tracking-widest">Meet Your Crew</span>
            <h2 className="text-3xl sm:text-4xl font-bold mt-3 mb-4 text-white">1000s of Specialized AI Agents</h2>
            <p className="text-[#7a8ba0] max-w-lg mx-auto">
              Each agent is purpose-built for a domain. Mix and match them into pipelines for complex workflows. Here are just a few.
            </p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-50px" }}
            variants={stagger}
            className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4"
          >
            {agents.map((agent) => (
              <motion.div
                key={agent.name}
                variants={item}
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
                className="landing-glass rounded-xl p-4 cursor-default group hover:border-[#38bdf8]/20 transition-all text-center"
              >
                <div className={`h-12 w-12 rounded-xl ${agent.color} flex items-center justify-center mx-auto mb-3`}>
                  <Bot className="h-5 w-5" />
                </div>
                <h3 className="font-semibold text-white">{agent.name}</h3>
                <p className="text-xs text-[#7a8ba0] mt-1">{agent.role}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* How it Works */}
      <section id="how-it-works" className="py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeUp}
            className="text-center mb-16"
          >
            <span className="text-xs font-mono text-[#38bdf8] uppercase tracking-widest">How It Works</span>
            <h2 className="text-3xl sm:text-4xl font-bold mt-3 mb-4 text-white">Three Steps to Ship</h2>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-50px" }}
            variants={stagger}
            className="space-y-6"
          >
            {steps.map((s) => (
              <motion.div
                key={s.step}
                variants={item}
                className="landing-glass rounded-2xl p-6 sm:p-8 flex items-start gap-6 group hover:border-[#38bdf8]/20 transition-all"
              >
                <span className="text-3xl font-bold text-[#38bdf8]/30 font-mono shrink-0">{s.step}</span>
                <div>
                  <h3 className="text-xl font-semibold mb-2 text-white">{s.title}</h3>
                  <p className="text-[#7a8ba0]">{s.description}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6">
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          variants={fadeUp}
          className="max-w-3xl mx-auto text-center landing-glass rounded-3xl p-12 landing-glow relative overflow-hidden"
        >
          <div className="landing-grid absolute inset-0 opacity-20" />
          <div className="relative z-10">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-white">
              Ready to work with <span className="landing-text-gradient">AI agents</span>?
            </h2>
            <p className="text-[#7a8ba0] mb-8 max-w-md mx-auto">
              Self-hostable. Start collaborating with 1000s of specialized agents today.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <a
                href="/today"
                className="flex items-center gap-2 px-8 py-3 rounded-xl bg-[#38bdf8] text-[#0a0e14] font-semibold hover:bg-[#38bdf8]/90 transition-colors landing-glow"
              >
                Get Started Free
                <ChevronRight className="h-4 w-4" />
              </a>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/[0.06] py-8 px-6">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-[#7a8ba0]">
          <div className="flex items-center gap-2">
            <Bot className="h-4 w-4 text-[#38bdf8]" />
            <span className="font-semibold text-white">AgentStudio</span>
          </div>
          <p>&copy; {new Date().getFullYear()} AgentStudio</p>
          <a
            href="/login"
            className="hover:text-white transition-colors"
          >
            Sign Up &rarr;
          </a>
        </div>
      </footer>
    </div>
  );
}
