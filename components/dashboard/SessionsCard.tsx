"use client";

import { useEffect, useState } from "react";
import { CalendarDays } from "lucide-react";
import { readSessionList, type MockSession } from "@/lib/mock-session";

export function SessionsCard() {
  const [sessions, setSessions] = useState<MockSession[] | null>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => setSessions(readSessionList()), 0);
    return () => window.clearTimeout(timer);
  }, []);

  const jobsCount = sessions ? new Set(sessions.map((session) => session.company)).size : null;

  return (
    <article className="rounded-2xl border border-[#e7e3ee] bg-white p-5">
      <div className="flex items-center justify-between">
        <span className="grid h-9 w-9 place-items-center rounded-xl bg-[#efeaff] text-[#7755e8]">
          <CalendarDays className="h-4.5 w-4.5" />
        </span>
        <span className="text-xs font-bold text-[#8b8593]">
          {jobsCount === null ? "…" : `${jobsCount} vaga${jobsCount === 1 ? "" : "s"}`}
        </span>
      </div>
      <p className="mt-4 text-3xl font-extrabold text-[#1d1b33]">
        {sessions === null ? "…" : sessions.length}
      </p>
      <p className="text-sm font-semibold text-[#6d698a]">Sessões realizadas</p>
    </article>
  );
}
