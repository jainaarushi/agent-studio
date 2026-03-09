"use client";

import { TaskCard } from "./task-card";
import { P } from "@/lib/palette";
import type { TaskWithAgent } from "@/lib/types/task";

interface TaskSectionProps {
  label: string;
  tasks: TaskWithAgent[];
  onTaskClick: (task: TaskWithAgent) => void;
  onRunTask?: (taskId: string) => void;
  accentColor?: string;
  dot?: boolean;
  selectable?: boolean;
  selectedIds?: Set<string>;
  onSelect?: (taskId: string) => void;
  draggable?: boolean;
  onReorder?: (dragId: string, dropId: string) => void;
}

export function TaskSection({
  label, tasks, onTaskClick, onRunTask, accentColor, dot,
  selectable, selectedIds, onSelect,
  draggable, onReorder,
}: TaskSectionProps) {
  if (tasks.length === 0) return null;

  const color = accentColor || P.textGhost;
  let draggedId: string | null = null;

  return (
    <div style={{ marginBottom: 28 }}>
      <div style={{
        display: "flex", alignItems: "center", gap: 8, marginBottom: 12, paddingLeft: 2,
      }}>
        <div style={{
          width: 8, height: 8, borderRadius: "50%", backgroundColor: color,
          ...(dot ? { animation: "pulseGlow 2s infinite", boxShadow: `0 0 6px ${color}60` } : {}),
        }} />
        <span style={{
          fontSize: 12, fontWeight: 700, letterSpacing: "0.06em",
          color: color === P.textGhost ? P.textTer : color,
        }}>{label}</span>
        <span style={{
          fontSize: 11, fontWeight: 600, color: P.textGhost,
          marginLeft: 2,
        }}>
          {tasks.length}
        </span>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {tasks.map((task, i) => (
          <TaskCard
            key={task.id}
            task={task}
            onClick={() => onTaskClick(task)}
            onRun={onRunTask}
            delay={i * 0.05}
            selectable={selectable}
            selected={selectedIds?.has(task.id)}
            onSelect={onSelect}
            draggable={draggable}
            onDragStart={(id) => { draggedId = id; }}
            onDragOver={(id) => {
              if (draggedId && draggedId !== id) {
                onReorder?.(draggedId, id);
              }
            }}
            onDragEnd={() => { draggedId = null; }}
          />
        ))}
      </div>
    </div>
  );
}
