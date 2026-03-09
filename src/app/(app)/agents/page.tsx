"use client";

import { useState } from "react";
import { useAgents } from "@/lib/hooks/use-agents";
import { useTasks } from "@/lib/hooks/use-tasks";
import { AgentCreateModal } from "@/components/agents/agent-create-modal";
import { P } from "@/lib/palette";

// Soft pastel backgrounds mapped to agent colors — Canva-style warmth
const PASTEL_MAP: Record<string, { bg: string; bgHover: string; shape1: string; shape2: string; shape3: string }> = {
  "#6366F1": { bg: "#EDE9FE", bgHover: "#E4DEFF", shape1: "#DDD6FE", shape2: "#C4B5FD80", shape3: "#A78BFA50" }, // lavender
  "#EC4899": { bg: "#FCE7F3", bgHover: "#FBCFE8", shape1: "#F9A8D4", shape2: "#F472B680", shape3: "#EC489950" }, // rose
  "#10B981": { bg: "#ECFDF5", bgHover: "#D1FAE5", shape1: "#A7F3D0", shape2: "#6EE7B780", shape3: "#34D39950" }, // mint
  "#F59E0B": { bg: "#FEF3C7", bgHover: "#FDE68A", shape1: "#FCD34D", shape2: "#FBBF2480", shape3: "#F59E0B50" }, // butter
  "#8B5CF6": { bg: "#F3E8FF", bgHover: "#E9D5FF", shape1: "#D8B4FE", shape2: "#C084FC80", shape3: "#A855F750" }, // violet
  "#EF4444": { bg: "#FEF2F2", bgHover: "#FEE2E2", shape1: "#FECACA", shape2: "#FCA5A580", shape3: "#F8717150" }, // blush
  "#06B6D4": { bg: "#ECFEFF", bgHover: "#CFFAFE", shape1: "#A5F3FC", shape2: "#67E8F980", shape3: "#22D3EE50" }, // sky
  "#F97316": { bg: "#FFF7ED", bgHover: "#FFEDD5", shape1: "#FED7AA", shape2: "#FDBA7480", shape3: "#FB923C50" }, // peach
  "#0EA5E9": { bg: "#E0F2FE", bgHover: "#BAE6FD", shape1: "#7DD3FC", shape2: "#38BDF880", shape3: "#0EA5E950" }, // ocean
  "#059669": { bg: "#ECFDF5", bgHover: "#D1FAE5", shape1: "#6EE7B7", shape2: "#34D39980", shape3: "#05966950" }, // forest
  "#7C3AED": { bg: "#EDE9FE", bgHover: "#DDD6FE", shape1: "#C4B5FD", shape2: "#A78BFA80", shape3: "#7C3AED50" }, // grape
  "#D946EF": { bg: "#FAE8FF", bgHover: "#F5D0FE", shape1: "#E879F9", shape2: "#D946EF80", shape3: "#C026D350" }, // fuchsia
  "#DC2626": { bg: "#FEF2F2", bgHover: "#FEE2E2", shape1: "#FECACA", shape2: "#F8717180", shape3: "#DC262650" }, // crimson
  "#14B8A6": { bg: "#F0FDFA", bgHover: "#CCFBF1", shape1: "#99F6E4", shape2: "#5EEAD480", shape3: "#14B8A650" }, // teal
  "#1D4ED8": { bg: "#EFF6FF", bgHover: "#DBEAFE", shape1: "#93C5FD", shape2: "#60A5FA80", shape3: "#3B82F650" }, // royal
};

function getPastel(color: string) {
  return PASTEL_MAP[color] || { bg: "#F5F3FF", bgHover: "#EDE9FE", shape1: "#DDD6FE", shape2: "#C4B5FD80", shape3: "#A78BFA50" };
}

export default function AgentsPage() {
  const { agents, mutate } = useAgents();
  const { tasks } = useTasks();
  const [showCreate, setShowCreate] = useState(false);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function handleDelete(agentId: string) {
    if (deletingId) return;
    setDeletingId(agentId);
    try {
      const res = await fetch(`/api/agents/${agentId}`, { method: "DELETE" });
      if (res.ok) mutate();
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <>
      <style>{`
        @keyframes floatIcon { 0%,100%{transform:translateY(0px)}50%{transform:translateY(-6px)} }
        @keyframes shapeFloat1 { 0%,100%{transform:translate(0,0) rotate(0deg)}50%{transform:translate(4px,-6px) rotate(8deg)} }
        @keyframes shapeFloat2 { 0%,100%{transform:translate(0,0) rotate(0deg)}50%{transform:translate(-5px,4px) rotate(-6deg)} }
        @keyframes shapeFloat3 { 0%,100%{transform:translate(0,0) scale(1)}50%{transform:translate(3px,-3px) scale(1.08)} }
        @keyframes createPulse { 0%,100%{box-shadow:0 0 0 0 rgba(249,112,102,0.15)}50%{box-shadow:0 0 0 12px rgba(249,112,102,0)} }
      `}</style>

      <div style={{ marginBottom: 32, animation: "slideUp 0.5s cubic-bezier(0.16,1,0.3,1)" }}>
        <h1 style={{
          fontSize: 34, fontWeight: 800, color: P.text, margin: "0 0 8px",
          letterSpacing: "-0.04em",
        }}>
          Explore agents
        </h1>
        <p style={{ fontSize: 15, color: P.textSec, lineHeight: 1.5 }}>
          Each agent is a specialist. Pick one, assign a task, and let it work.
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        {agents.map((agent, i) => {
          const done = tasks.filter((t) => t.agent_id === agent.id && t.status === "done").length;
          const pastel = getPastel(agent.color);
          const isHovered = hoveredId === agent.id;
          const totalDone = agent.tasks_completed + done;

          return (
            <div
              key={agent.id}
              onMouseEnter={() => setHoveredId(agent.id)}
              onMouseLeave={() => setHoveredId(null)}
              style={{
                position: "relative",
                padding: "24px 22px 20px",
                backgroundColor: pastel.bg,
                borderRadius: 20,
                cursor: "pointer",
                overflow: "hidden",
                minHeight: 180,
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                animation: `popIn 0.5s cubic-bezier(0.16,1,0.3,1) ${i * 0.08}s both`,
                transition: "all 0.35s cubic-bezier(0.16,1,0.3,1)",
                transform: isHovered ? "translateY(-6px) scale(1.015)" : "translateY(0) scale(1)",
                boxShadow: isHovered
                  ? `0 20px 50px ${agent.color}20, 0 8px 20px ${agent.color}12`
                  : `0 2px 8px ${agent.color}08`,
              }}
            >
              {/* Decorative floating shapes — creates Canva-style depth */}
              <div style={{
                position: "absolute", top: -12, right: -12,
                width: 80, height: 80, borderRadius: 20,
                backgroundColor: pastel.shape1,
                transform: "rotate(15deg)",
                animation: "shapeFloat1 6s ease-in-out infinite",
                opacity: 0.7,
              }} />
              <div style={{
                position: "absolute", bottom: 10, right: 30,
                width: 50, height: 50, borderRadius: "50%",
                backgroundColor: pastel.shape2,
                animation: "shapeFloat2 5s ease-in-out infinite",
              }} />
              <div style={{
                position: "absolute", top: "40%", right: 8,
                width: 35, height: 35, borderRadius: 10,
                backgroundColor: pastel.shape3,
                transform: "rotate(-10deg)",
                animation: "shapeFloat3 7s ease-in-out infinite",
              }} />

              {/* Delete button for custom agents */}
              {!agent.is_preset && (
                <button
                  onClick={(e) => { e.stopPropagation(); handleDelete(agent.id); }}
                  style={{
                    position: "absolute", top: 10, right: 10, zIndex: 10,
                    width: 26, height: 26, borderRadius: 8,
                    border: "none",
                    backgroundColor: isHovered ? "rgba(255,255,255,0.85)" : "rgba(255,255,255,0.5)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    cursor: "pointer", fontSize: 11, color: P.textTer,
                    transition: "all 0.2s",
                    backdropFilter: "blur(4px)",
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.color = "#DC2626"; e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.95)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.color = P.textTer; e.currentTarget.style.backgroundColor = isHovered ? "rgba(255,255,255,0.85)" : "rgba(255,255,255,0.5)"; }}
                >
                  ✕
                </button>
              )}

              {/* Content — positioned above shapes */}
              <div style={{ position: "relative", zIndex: 2 }}>
                {/* Agent name — bold, prominent, Canva-style */}
                <div style={{
                  fontSize: 17, fontWeight: 800, color: P.text,
                  letterSpacing: "-0.02em", marginBottom: 4,
                  lineHeight: 1.3,
                }}>
                  {agent.name}
                </div>
                <div style={{
                  fontSize: 12.5, color: agent.color, fontWeight: 600,
                  opacity: 0.9, marginBottom: 8,
                }}>
                  {agent.description}
                </div>
                <div style={{
                  fontSize: 12, color: P.textSec, lineHeight: 1.5,
                  maxWidth: "75%",
                  opacity: isHovered ? 1 : 0.8,
                  transition: "opacity 0.3s",
                }}>
                  {agent.long_description}
                </div>
              </div>

              {/* Bottom row — stats + floating icon */}
              <div style={{ position: "relative", zIndex: 2, display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginTop: 12 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  {agent.is_preset ? (
                    <span style={{
                      fontSize: 10, fontWeight: 700, color: agent.color,
                      backgroundColor: "rgba(255,255,255,0.7)",
                      backdropFilter: "blur(4px)",
                      padding: "3px 8px", borderRadius: 6,
                    }}>
                      Built-in
                    </span>
                  ) : (
                    <span style={{
                      fontSize: 10, fontWeight: 700, color: agent.color,
                      backgroundColor: "rgba(255,255,255,0.7)",
                      backdropFilter: "blur(4px)",
                      padding: "3px 8px", borderRadius: 6,
                    }}>
                      Custom
                    </span>
                  )}
                  {totalDone > 0 && (
                    <span style={{
                      fontSize: 10, fontWeight: 600, color: P.textSec,
                      backgroundColor: "rgba(255,255,255,0.6)",
                      padding: "3px 8px", borderRadius: 6,
                    }}>
                      {totalDone} done
                    </span>
                  )}
                </div>
              </div>

              {/* Large floating icon — Canva-style visual preview */}
              <div style={{
                position: "absolute",
                bottom: isHovered ? 16 : 12,
                right: isHovered ? 16 : 14,
                width: 64, height: 64,
                borderRadius: 18,
                background: agent.gradient,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 30,
                boxShadow: isHovered
                  ? `0 12px 32px ${agent.color}40, 0 4px 12px ${agent.color}25`
                  : `0 6px 20px ${agent.color}25`,
                transition: "all 0.4s cubic-bezier(0.16,1,0.3,1)",
                animation: isHovered ? "floatIcon 3s ease-in-out infinite" : "none",
                zIndex: 3,
                transform: isHovered ? "rotate(-5deg)" : "rotate(0deg)",
              }}>
                {agent.icon}
              </div>

              {/* Hover CTA — appears on hover, triggers action impulse */}
              <div style={{
                position: "absolute",
                bottom: 0, left: 0, right: 0,
                padding: "10px 22px",
                background: `linear-gradient(to top, ${pastel.bg}, transparent)`,
                opacity: isHovered ? 1 : 0,
                transform: isHovered ? "translateY(0)" : "translateY(8px)",
                transition: "all 0.3s cubic-bezier(0.16,1,0.3,1)",
                zIndex: 4,
                display: "flex", justifyContent: "flex-start",
              }}>
                <span style={{
                  fontSize: 11.5, fontWeight: 700, color: agent.color,
                  backgroundColor: "rgba(255,255,255,0.9)",
                  backdropFilter: "blur(6px)",
                  padding: "5px 14px", borderRadius: 8,
                  boxShadow: `0 2px 8px ${agent.color}15`,
                }}>
                  Use {agent.name} →
                </span>
              </div>
            </div>
          );
        })}

        {/* Create Agent card — special "+" card like Canva's blank template */}
        <div
          onClick={() => setShowCreate(true)}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "translateY(-6px) scale(1.015)";
            e.currentTarget.style.boxShadow = "0 20px 50px rgba(249,112,102,0.15), 0 8px 20px rgba(249,112,102,0.08)";
            e.currentTarget.style.borderColor = "rgba(249,112,102,0.4)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "translateY(0) scale(1)";
            e.currentTarget.style.boxShadow = "none";
            e.currentTarget.style.borderColor = "rgba(249,112,102,0.2)";
          }}
          style={{
            position: "relative",
            padding: "24px 22px 20px",
            borderRadius: 20,
            cursor: "pointer",
            overflow: "hidden",
            minHeight: 180,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 12,
            border: "2.5px dashed rgba(249,112,102,0.2)",
            backgroundColor: "#FFFBFA",
            animation: `popIn 0.5s cubic-bezier(0.16,1,0.3,1) ${agents.length * 0.08}s both`,
            transition: "all 0.35s cubic-bezier(0.16,1,0.3,1)",
          }}
        >
          {/* Plus icon */}
          <div style={{
            width: 56, height: 56, borderRadius: 16,
            background: P.coralGrad,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 28, color: "#fff", fontWeight: 300,
            boxShadow: "0 6px 20px rgba(249,112,102,0.25)",
            animation: "createPulse 3s ease-in-out infinite",
          }}>
            +
          </div>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: P.text, marginBottom: 2 }}>
              Create your own
            </div>
            <div style={{ fontSize: 12, color: P.textTer }}>
              Build a custom AI agent
            </div>
          </div>
        </div>
      </div>

      <AgentCreateModal
        open={showCreate}
        onClose={() => setShowCreate(false)}
        onCreated={() => mutate()}
      />
    </>
  );
}
