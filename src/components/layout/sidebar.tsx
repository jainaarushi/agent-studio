"use client";

import { SidebarNav } from "./sidebar-nav";
import { SidebarFooter } from "./sidebar-footer";
import { P } from "@/lib/palette";
import type { TaskWithAgent } from "@/lib/types/task";

interface SidebarProps {
  stats: {
    working: number;
    review: number;
    spent: number;
  };
  reviewCount: number;
  tasks: TaskWithAgent[];
}

export function Sidebar({ stats, reviewCount, tasks }: SidebarProps) {
  return (
    <div style={{
      width: 72,
      backgroundColor: P.sidebar,
      borderRight: `1px solid ${P.border}`,
      padding: "16px 6px",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      position: "sticky",
      top: 0,
      height: "100vh",
    }}>
      {/* Logo */}
      <div style={{
        width: 38, height: 38, borderRadius: 12,
        background: "linear-gradient(135deg, #4F46E5, #7C3AED)",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 17, fontWeight: 900, color: "#fff",
        boxShadow: "0 2px 10px rgba(99,102,241,0.3)",
        marginBottom: 24,
        cursor: "pointer",
      }}>
        A
      </div>

      {/* Navigation */}
      <SidebarNav reviewCount={reviewCount} doneTasks={stats.working + stats.review} />

      {/* Spacer */}
      <div style={{ flex: 1 }} />

      {/* Footer */}
      <SidebarFooter />
    </div>
  );
}
