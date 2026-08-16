"use client";

import { useEffect } from "react";
import { MOCK_SESSION_KEY, parseMockSession, readSessionList, type MockSession } from "@/lib/mock-session";
import { SESSION_LIST_KEY } from "@/lib/job-training";

export function DemoAccountBootstrap({ sessions }: { sessions: MockSession[] }) {
  useEffect(() => {
    if (!sessions.length) return;

    const stored = readSessionList();
    if (!stored.length) {
      window.localStorage.setItem(SESSION_LIST_KEY, JSON.stringify(sessions));
    }

    const active = parseMockSession(window.sessionStorage.getItem(MOCK_SESSION_KEY));
    if (!active) {
      window.sessionStorage.setItem(MOCK_SESSION_KEY, JSON.stringify(stored[0] ?? sessions[0]));
    }
  }, [sessions]);

  return null;
}
