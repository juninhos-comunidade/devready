"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { GitBranch, Star } from "lucide-react";
import type { Prisma } from "@/app/generated/prisma/client";

type CurriculumWithGithub = Prisma.CurriculumGetPayload<{
  include: { githubProfile: { include: { repos: true } } };
}>;

type GithubAnalysisCardProps = {
  curriculum: CurriculumWithGithub | null;
};

export function GithubAnalysisCard({ curriculum }: GithubAnalysisCardProps) {
  const router = useRouter();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const githubProfile = curriculum?.githubProfile ?? null;

  const topLanguages = useMemo(() => {
    const languages = githubProfile?.topLanguages as Record<string, number> | null | undefined;
    if (!languages) return [];
    return Object.entries(languages)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([language]) => language);
  }, [githubProfile?.topLanguages]);

  const sortedRepos = useMemo(() => {
    if (!githubProfile?.repos) return [];
    return [...githubProfile.repos].sort((a, b) => b.stars - a.stars);
  }, [githubProfile]);

  const contributionsLastYear = (
    githubProfile?.contributionData as { totalContributions?: number } | null | undefined
  )?.totalContributions ?? null;

  async function handleAnalyze() {
    setErrorMessage("");
    setIsAnalyzing(true);
    try {
      const res = await fetch("/api/curriculum/github", { method: "POST" });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        setErrorMessage(data?.error ?? "Não foi possível analisar o GitHub. Tente novamente.");
        return;
      }

      router.refresh();
    } catch {
      setErrorMessage("Não foi possível conectar ao serviço. Tente novamente.");
    } finally {
      setIsAnalyzing(false);
    }
  }

  if (!curriculum?.githubUrl) {
    return (
      <section className="overflow-hidden rounded-3xl border border-[#e7e3ee] bg-white shadow-[0_18px_55px_-42px_rgba(29,27,51,0.45)]">
        <div className="bg-[#1d1b33] p-5 text-white sm:p-6">
          <span className="inline-flex items-center gap-2 text-[11px] font-extrabold uppercase tracking-[0.18em] text-[#aaa6d6]">
            <GitBranch className="h-4 w-4" /> Análise do GitHub
          </span>
        </div>
        <div className="p-5 sm:p-6">
          <p className="text-sm font-bold text-[#6d698a]">
            Adicione seu GitHub no perfil para desbloquear essa análise.
          </p>
        </div>
      </section>
    );
  }

  if (!githubProfile || githubProfile.status === "FAILED") {
    return (
      <section className="overflow-hidden rounded-3xl border border-[#e7e3ee] bg-white shadow-[0_18px_55px_-42px_rgba(29,27,51,0.45)]">
        <div className="bg-[#1d1b33] p-5 text-white sm:p-6">
          <span className="inline-flex items-center gap-2 text-[11px] font-extrabold uppercase tracking-[0.18em] text-[#aaa6d6]">
            <GitBranch className="h-4 w-4" /> Análise do GitHub
          </span>
          <p className="mt-3 text-sm leading-relaxed text-[#d0cde0]">
            Rode a análise para ver estatísticas reais do seu perfil no GitHub.
          </p>
        </div>
        <div className="p-5 sm:p-6">
          {githubProfile?.status === "FAILED" && (
            <p role="alert" className="mb-4 rounded-xl bg-[#fdf2f2] px-4 py-3 text-sm font-bold text-[#a83030]">
              A última tentativa de análise falhou. Tente novamente.
            </p>
          )}
          <button
            type="button"
            onClick={handleAnalyze}
            disabled={isAnalyzing}
            className="inline-flex min-h-11 items-center gap-2 rounded-full bg-gradient-to-r from-[#7755e8] to-[#e8641d] px-5 py-3 text-sm font-extrabold text-white shadow-[0_16px_34px_-18px_rgba(119,85,232,0.85)] transition hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#7755e8] disabled:cursor-wait disabled:opacity-60"
          >
            {isAnalyzing ? "Analisando..." : "Analisar GitHub"}
          </button>
          {errorMessage && (
            <p role="alert" className="mt-4 rounded-xl bg-[#fdf2f2] px-4 py-3 text-sm font-bold text-[#a83030]">
              {errorMessage}
            </p>
          )}
        </div>
      </section>
    );
  }

  return (
    <section className="overflow-hidden rounded-3xl border border-[#e7e3ee] bg-white shadow-[0_18px_55px_-42px_rgba(29,27,51,0.45)]">
      <div className="bg-[#1d1b33] p-5 text-white sm:p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <span className="inline-flex items-center gap-2 text-[11px] font-extrabold uppercase tracking-[0.18em] text-[#aaa6d6]">
              <GitBranch className="h-4 w-4" /> Análise do GitHub
            </span>
            <p className="mt-3 truncate font-[family-name:var(--font-display)] text-2xl font-extrabold">
              @{githubProfile.username}
            </p>
            {githubProfile.bio && (
              <p className="mt-1 text-xs font-semibold text-[#aaa6d6]">{githubProfile.bio}</p>
            )}
          </div>
          <button
            type="button"
            onClick={handleAnalyze}
            disabled={isAnalyzing}
            className="inline-flex shrink-0 items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-extrabold text-white transition hover:bg-white/20 disabled:cursor-wait disabled:opacity-60"
          >
            {isAnalyzing ? "Analisando..." : "Reanalisar"}
          </button>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
          <div className="rounded-xl border border-white/10 bg-white/[0.06] px-3 py-2">
            <p className="text-lg font-extrabold">{githubProfile.publicReposCount ?? "—"}</p>
            <p className="text-[11px] font-semibold text-[#aaa6d6]">Repositórios públicos</p>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/[0.06] px-3 py-2">
            <p className="text-lg font-extrabold">{githubProfile.followers ?? "—"}</p>
            <p className="text-[11px] font-semibold text-[#aaa6d6]">Seguidores</p>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/[0.06] px-3 py-2">
            <p className="text-lg font-extrabold">{contributionsLastYear ?? "—"}</p>
            <p className="text-[11px] font-semibold text-[#aaa6d6]">Contribuições no último ano</p>
          </div>
        </div>
      </div>

      <div className="p-5 sm:p-6">
        {errorMessage && (
          <p role="alert" className="mb-4 rounded-xl bg-[#fdf2f2] px-4 py-3 text-sm font-bold text-[#a83030]">
            {errorMessage}
          </p>
        )}

        {topLanguages.length > 0 && (
          <>
            <p className="text-xs font-extrabold uppercase tracking-wider text-[#8b8593]">
              Principais linguagens
            </p>
            <ul className="mt-3 flex flex-wrap gap-2">
              {topLanguages.map((language) => (
                <li
                  key={language}
                  className="rounded-full bg-[#ece8f8] px-3 py-1 text-xs font-extrabold text-[#654bc9]"
                >
                  {language}
                </li>
              ))}
            </ul>
          </>
        )}

        <p className="mt-5 text-xs font-extrabold uppercase tracking-wider text-[#8b8593]">
          Repositórios
        </p>
        <ul className="mt-3 grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
          {sortedRepos.map((repo) => (
            <li
              key={repo.id}
              className="rounded-2xl border border-[#ece9f1] p-4 transition hover:border-[#d7d0e8] hover:shadow-[0_14px_35px_-30px_rgba(29,27,51,0.55)]"
            >
              <div className="flex items-center justify-between gap-3">
                <a
                  href={repo.url}
                  target="_blank"
                  rel="noreferrer"
                  className="min-w-0 truncate font-extrabold text-[#1d1b33] hover:underline"
                >
                  {repo.name}
                </a>
                <span className="flex shrink-0 items-center gap-2 text-xs font-extrabold text-[#8b8593]">
                  <span className="inline-flex items-center gap-1"><Star className="h-3.5 w-3.5" /> {repo.stars}</span>
                  <span className="inline-flex items-center gap-1"><GitBranch className="h-3.5 w-3.5" /> {repo.forks}</span>
                </span>
              </div>
              {repo.description && (
                <p className="mt-1 line-clamp-2 text-xs font-semibold text-[#8b8593]">
                  {repo.description}
                </p>
              )}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
