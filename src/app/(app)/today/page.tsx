"use client";

import { useState, useCallback } from "react";
import { NewTaskInput } from "@/components/tasks/new-task-input";
import { TaskSection } from "@/components/tasks/task-section";
import { TaskDetailModal } from "@/components/tasks/task-detail-modal";
import { BulkActionsBar } from "@/components/tasks/bulk-actions-bar";
import { Confetti } from "@/components/shared/confetti";
import { useTasks } from "@/lib/hooks/use-tasks";
import { useRealtimeTasks } from "@/lib/hooks/use-realtime";
import { P } from "@/lib/palette";
import type { TaskWithAgent, TaskPriority } from "@/lib/types/task";

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning \u2600\uFE0F";
  if (hour < 17) return "Good afternoon";
  return "Good evening \uD83C\uDF19";
}

export default function TodayPage() {
  const { tasks, mutate } = useTasks("today");
  const [selectedTask, setSelectedTask] = useState<TaskWithAgent | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [bulkMode, setBulkMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkLoading, setBulkLoading] = useState(false);

  useRealtimeTasks(mutate);

  const reviewTasks = tasks.filter((t) => t.status === "review");
  const workingTasks = tasks.filter((t) => t.status === "working");
  const todoTasks = tasks.filter((t) => t.status === "todo" || t.status === "failed");
  const totalCost = tasks.reduce((s, t) => s + (Number(t.cost_usd) || 0), 0);

  const handleConfetti = useCallback(() => {
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 1500);
  }, []);

  function handleToggleSelect(taskId: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(taskId)) next.delete(taskId);
      else next.add(taskId);
      return next;
    });
  }

  function clearSelection() {
    setSelectedIds(new Set());
    setBulkMode(false);
  }

  async function handleBulkDelete() {
    setBulkLoading(true);
    await Promise.all(
      Array.from(selectedIds).map((id) =>
        fetch(`/api/tasks/${id}`, { method: "DELETE" })
      )
    );
    clearSelection();
    mutate();
    setBulkLoading(false);
  }

  async function handleBulkPriority(priority: TaskPriority) {
    setBulkLoading(true);
    await Promise.all(
      Array.from(selectedIds).map((id) =>
        fetch(`/api/tasks/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ priority }),
        })
      )
    );
    clearSelection();
    mutate();
    setBulkLoading(false);
  }

  async function handleBulkMove(section: "today" | "week" | "later") {
    setBulkLoading(true);
    await Promise.all(
      Array.from(selectedIds).map((id) =>
        fetch(`/api/tasks/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ section }),
        })
      )
    );
    clearSelection();
    mutate();
    setBulkLoading(false);
  }

  async function handleCreateTask(title: string) {
    const optimisticTask: TaskWithAgent = {
      id: `temp-${Date.now()}`,
      user_id: "",
      agent_id: null,
      title,
      description: null,
      status: "todo",
      progress: 0,
      current_step: null,
      output: null,
      output_format: "markdown",
      cost_usd: 0,
      tokens_in: 0,
      tokens_out: 0,
      duration_seconds: 0,
      created_at: new Date().toISOString(),
      started_at: null,
      completed_at: null,
      section: "today",
      sort_order: 0,
      priority: "normal",
      agent: null,
    };

    mutate([optimisticTask, ...tasks], false);

    await fetch("/api/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, section: "today" }),
    });

    mutate();
  }

  return (
    <>
      <Confetti show={showConfetti} />

      {/* Greeting */}
      <div style={{ marginBottom: 28, animation: "slideUp 0.5s cubic-bezier(0.16,1,0.3,1)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <h1 style={{
              fontSize: 32, fontWeight: 800, color: P.text, margin: 0,
              letterSpacing: "-0.04em",
            }}>
              {getGreeting()}
            </h1>
            <p style={{ fontSize: 15, color: P.textSec, marginTop: 5, lineHeight: 1.5 }}>
              {reviewTasks.length > 0 && (
                <>
                  <span style={{ color: P.coral, fontWeight: 700 }}>
                    {reviewTasks.length} task{reviewTasks.length > 1 ? "s" : ""} ready for review
                  </span>
                  {" \u00B7 "}
                </>
              )}
              {workingTasks.length > 0 && (
                <>
                  {workingTasks.length} agent{workingTasks.length !== 1 ? "s" : ""} working
                  {" \u00B7 "}
                </>
              )}
              ${totalCost.toFixed(2)} spent today
            </p>
          </div>
          {/* Bulk select toggle */}
          <button
            onClick={() => { setBulkMode(!bulkMode); if (bulkMode) clearSelection(); }}
            style={{
              padding: "7px 14px", borderRadius: 9,
              border: `1.5px solid ${bulkMode ? P.indigo + "50" : P.border}`,
              backgroundColor: bulkMode ? P.indigoLight : P.card,
              color: bulkMode ? P.indigo : P.textSec,
              fontSize: 12.5, fontWeight: 600, cursor: "pointer",
              fontFamily: "inherit", transition: "all 0.15s",
            }}
          >
            {bulkMode ? "Cancel" : "Select"}
          </button>
        </div>
      </div>

      {/* New task input */}
      <NewTaskInput onSubmit={handleCreateTask} />

      {/* Review section */}
      <TaskSection
        label="READY FOR REVIEW"
        tasks={reviewTasks}
        onTaskClick={bulkMode ? () => {} : setSelectedTask}
        accentColor={P.coral}
        dot
        selectable={bulkMode}
        selectedIds={selectedIds}
        onSelect={handleToggleSelect}
      />

      {/* Working section */}
      <TaskSection
        label="AGENTS WORKING"
        tasks={workingTasks}
        onTaskClick={bulkMode ? () => {} : setSelectedTask}
        accentColor={P.amber}
        selectable={bulkMode}
        selectedIds={selectedIds}
        onSelect={handleToggleSelect}
      />

      {/* To do section */}
      <TaskSection
        label="TO DO"
        tasks={todoTasks}
        onTaskClick={bulkMode ? () => {} : setSelectedTask}
        accentColor={P.textGhost}
        selectable={bulkMode}
        selectedIds={selectedIds}
        onSelect={handleToggleSelect}
      />

      {/* Bulk actions */}
      <BulkActionsBar
        selectedCount={selectedIds.size}
        onClearSelection={clearSelection}
        onBulkDelete={handleBulkDelete}
        onBulkPriority={handleBulkPriority}
        onBulkMove={handleBulkMove}
        loading={bulkLoading}
      />

      {/* Task detail modal */}
      <TaskDetailModal
        task={selectedTask}
        open={!!selectedTask}
        onClose={() => setSelectedTask(null)}
        onUpdate={() => mutate()}
        onConfetti={handleConfetti}
      />
    </>
  );
}
