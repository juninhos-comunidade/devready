"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CircleDotDashed } from "lucide-react";
import { MOCK_SESSION_KEY, parseMockSession, type MockSession } from "@/lib/mock-session";
import { SESSION_LIST_KEY } from "@/lib/job-training";
import type { TechnologyScore } from "@/lib/dashboard-data";

function findSession(jobSessionId: string): MockSession | null {
  try {
    const stored = window.localStorage.getItem(SESSION_LIST_KEY);
    const parsed: unknown = stored ? JSON.parse(stored) : [];
    if (!Array.isArray(parsed)) return null;
    const match = parsed.find((item: { id?: string }) => item?.id === jobSessionId);
    return match ? parseMockSession(JSON.stringify(match)) : null;
  } catch {
    return null;
  }
}

export function TechnologyRow({ technology }: { technology: TechnologyScore }) {
  const [session, setSession] = useState<MockSession | null | undefined>(undefined);
  const tested = technology.score !== null;
  const delta =
    tested && technology.previousScore !== null
      ? technology.score! - technology.previousScore
      : null;

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setSession(technology.jobSessionId ? findSession(technology.jobSessionId) : null);
    }, 0);
    return () => window.clearTimeout(timer);
  }, [technology.jobSessionId]);

  function resume() {
    if (session) window.sessionStorage.setItem(MOCK_SESSION_KEY, JSON.stringify(session));
  }

  const content = (
    <>
      <div className="flex items-center justify-between gap-4">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-extrabold text-[#1d1b33]">{technology.name}</h3>
            {!tested && (
              <span className="inline-flex items-center gap-1 rounded-full bg-[#f0eef4] px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wide text-[#777286]">
                <CircleDotDashed className="h-3 w-3" />
                Não testado ainda
              </span>
            )}
          </div>
          <p className="mt-1 text-xs font-semibold text-[#8b8593]">
            {tested
              ? `Última sessão em ${technology.lastTestedAt}`
              : "Está no seu perfil, mas ainda não possui resultado"}
          </p>
        </div>

        <div className="shrink-0 text-right">
          <p className={`text-2xl font-extrabold ${tested ? "text-[#1d1b33]" : "text-[#aaa6b4]"}`}>
            {tested ? `${technology.score}%` : "—"}
          </p>
          {delta !== null && (
            <p className={`text-[11px] font-extrabold ${delta >= 0 ? "text-[#1f9d73]" : "text-[#c23b3b]"}`}>
              {delta >= 0 ? "+" : ""}{delta} pts
            </p>
          )}
        </div>
      </div>

      <div className="mt-3 h-2 overflow-hidden rounded-full bg-[#eeebf2]">
        {tested && (
          <div
            className="h-full rounded-full bg-gradient-to-r from-[#7755e8] to-[#e8641d]"
            style={{ width: `${technology.score}%` }}
            role="progressbar"
            aria-label={`Nota de ${technology.name}`}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={technology.score!}
          />
        )}
      </div>
    </>
  );

  return (
    <li className="rounded-2xl border border-[#ece9f1] transition hover:border-[#d7d0e8] hover:shadow-[0_14px_35px_-30px_rgba(29,27,51,0.55)]">
      {session ? (
        <Link href="/dashboard/resultado" onClick={resume} className="block rounded-2xl p-4 hover:border-[#7755e8] hover:bg-[#faf8ff]">
          {content}
        </Link>
      ) : (
        <div className="p-4">{content}</div>
      )}
    </li>
  );
}
