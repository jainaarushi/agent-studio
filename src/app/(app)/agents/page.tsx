"use client";

import { useState } from "react";
import { useAgents } from "@/lib/hooks/use-agents";
import { useTasks } from "@/lib/hooks/use-tasks";
import { AgentAvatar } from "@/components/agents/agent-avatar";
import { AgentCreateModal } from "@/components/agents/agent-create-modal";
import { P } from "@/lib/palette";

export default function AgentsPage() {
  const { agents, mutate } = useAgents();
  const { tasks } = useTasks();
  const [showCreate, setShowCreate] = useState(false);
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
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 28 }}>
        <div>
          <h1 style={{
            fontSize: 32, fontWeight: 800, color: P.text, margin: "0 0 6px",
            letterSpacing: "-0.04em", animation: "slideUp 0.5s ease",
          }}>
            Your agents
          </h1>
          <p style={{ fontSize: 15, color: P.textSec }}>
            Plug and play. Assign them tasks and watch them work.
          </p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          style={{
            padding: "10px 20px", borderRadius: 12, border: "none",
            background: P.coralGrad, color: "#fff",
            fontSize: 14, fontWeight: 700, cursor: "pointer",
            fontFamily: "inherit",
            boxShadow: "0 3px 12px rgba(249,112,102,0.3)",
            transition: "all 0.2s",
            whiteSpace: "nowrap",
          }}
          onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 6px 20px rgba(249,112,102,0.4)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 3px 12px rgba(249,112,102,0.3)"; }}
        >
          + Create Agent
        </button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        {agents.map((agent, i) => {
          const done = tasks.filter((t) => t.agent_id === agent.id && t.status === "done").length;

          return (
            <div
              key={agent.id}
              style={{
                padding: "22px", backgroundColor: P.card, borderRadius: 16,
                border: `1.5px solid ${P.border}`,
                boxShadow: P.shadow,
                animation: `popIn 0.5s cubic-bezier(0.16,1,0.3,1) ${i * 0.08}s both`,
                transition: "all 0.25s cubic-bezier(0.16,1,0.3,1)",
                position: "relative",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-3px)";
                e.currentTarget.style.boxShadow = `0 10px 30px ${agent.color}12`;
                e.currentTarget.style.borderColor = agent.color + "30";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = P.shadow;
                e.currentTarget.style.borderColor = P.border;
              }}
            >
              {/* Delete button for custom agents */}
              {!agent.is_preset && (
                <button
                  onClick={(e) => { e.stopPropagation(); handleDelete(agent.id); }}
                  style={{
                    position: "absolute", top: 12, right: 12,
                    width: 26, height: 26, borderRadius: 7,
                    border: `1px solid ${P.border}`, backgroundColor: P.card,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    cursor: "pointer", fontSize: 12, color: P.textTer,
                    opacity: deletingId === agent.id ? 0.5 : 0.6,
                    transition: "all 0.15s",
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.opacity = "1"; e.currentTarget.style.color = "#DC2626"; e.currentTarget.style.borderColor = "#FECACA"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.opacity = "0.6"; e.currentTarget.style.color = P.textTer; e.currentTarget.style.borderColor = P.border; }}
                  title="Delete agent"
                >
                  ✕
                </button>
              )}

              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
                <AgentAvatar icon={agent.icon} color={agent.color} gradient={agent.gradient} size="lg" />
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <span style={{ fontSize: 18, fontWeight: 800, color: P.text, letterSpacing: "-0.02em" }}>
                      {agent.name}
                    </span>
                    {agent.is_preset && (
                      <span style={{
                        fontSize: 9, fontWeight: 700, color: P.indigo,
                        backgroundColor: P.indigoLight, padding: "1px 6px",
                        borderRadius: 5,
                      }}>
                        preset
                      </span>
                    )}
                    {!agent.is_preset && (
                      <span style={{
                        fontSize: 9, fontWeight: 700, color: P.emerald,
                        backgroundColor: P.emeraldSoft, padding: "1px 6px",
                        borderRadius: 5,
                      }}>
                        custom
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: 12.5, color: P.textTer }}>
                    {agent.description}
                  </div>
                </div>
              </div>
              <div style={{ fontSize: 13, color: P.textSec, lineHeight: 1.6, marginBottom: 12 }}>
                {agent.long_description}
              </div>
              <div style={{
                display: "flex", gap: 10, fontSize: 11, color: P.textTer,
                fontFamily: "'JetBrains Mono', var(--font-mono), monospace",
              }}>
                <span>{agent.tasks_completed + done} completed</span>
                <span>·</span>
                <span>{agent.model.includes("haiku") ? "Haiku 4.5" : "Sonnet 4"}</span>
              </div>
            </div>
          );
        })}
      </div>

      <AgentCreateModal
        open={showCreate}
        onClose={() => setShowCreate(false)}
        onCreated={() => mutate()}
      />
    </>
  );
}
