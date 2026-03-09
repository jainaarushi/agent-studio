"use client";

import { useEffect } from "react";
import { createClient, isSupabaseEnabled } from "@/lib/supabase/client";
import type { TaskWithAgent } from "@/lib/types/task";
import type { KeyedMutator } from "swr";

export function useRealtimeTasks(mutate: KeyedMutator<TaskWithAgent[]>) {
  useEffect(() => {
    if (!isSupabaseEnabled()) {
      // Demo mode: poll for updates every 2 seconds
      const interval = setInterval(() => {
        mutate();
      }, 2000);
      return () => clearInterval(interval);
    }

    // Supabase mode: subscribe to realtime changes on tasks table
    const supabase = createClient();
    if (!supabase) {
      // Fallback to polling if client unavailable
      const interval = setInterval(() => {
        mutate();
      }, 2000);
      return () => clearInterval(interval);
    }

    const channel = supabase
      .channel("tasks-realtime")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "tasks",
        },
        () => {
          mutate();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [mutate]);
}
