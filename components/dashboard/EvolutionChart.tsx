"use client";

import { useMemo, useState } from "react";
import type { TechnologyHistory } from "@/lib/dashboard-data";

const chart = {
  width: 640,
  height: 230,
  left: 42,
  right: 18,
  top: 18,
  bottom: 38,
};

export function EvolutionChart({ series }: { series: TechnologyHistory[] }) {
  const [selectedName, setSelectedName] = useState(series[0]?.name ?? "");
  const selected = series.find((item) => item.name === selectedName) ?? series[0];

  const points = useMemo(() => {
    if (!selected || selected.points.length === 0) return [];
    const innerWidth = chart.width - chart.left - chart.right;
    const innerHeight = chart.height - chart.top - chart.bottom;

    return selected.points.map((point, index) => ({
      ...point,
      x:
        chart.left +
        (index / Math.max(selected.points.length - 1, 1)) * innerWidth,
      y: chart.top + ((100 - point.score) / 100) * innerHeight,
    }));
  }, [selected]);

  if (!selected) return null;

  const latest = selected.points.at(-1);
  const previous = selected.points.at(-2);
  const delta = latest && previous ? latest.score - previous.score : null;
  const polyline = points.map(({ x, y }) => `${x},${y}`).join(" ");

  return (
    <section className="rounded-3xl border border-[#e7e3ee] bg-white p-5 shadow-[0_18px_55px_-42px_rgba(29,27,51,0.45)] sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-[#8b8593]">
            Histórico de evolução
          </p>
          <h2 className="mt-1 font-[family-name:var(--font-display)] text-2xl font-bold text-[#1d1b33]">
            Seu progresso ao longo dos treinos
          </h2>
        </div>

        {latest && (
          <div className="text-right">
            <p className="text-2xl font-extrabold text-[#1d1b33]">{latest.score}%</p>
            <p className={`text-xs font-bold ${delta !== null && delta < 0 ? "text-[#c23b3b]" : "text-[#1f9d73]"}`}>
              {delta === null
                ? "Primeiro resultado"
                : `${delta >= 0 ? "+" : ""}${delta} pts desde o anterior`}
            </p>
          </div>
        )}
      </div>

      <div className="mt-5 flex flex-wrap gap-2" aria-label="Escolher tecnologia">
        {series.map((item) => {
          const active = item.name === selected.name;
          return (
            <button
              key={item.name}
              type="button"
              onClick={() => setSelectedName(item.name)}
              aria-pressed={active}
              className={`rounded-full px-3.5 py-2 text-xs font-extrabold transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#7755e8] ${
                active
                  ? "bg-[#1d1b33] text-white"
                  : "bg-[#f3f1f7] text-[#6d698a] hover:bg-[#eae6f2]"
              }`}
            >
              <span
                className="mr-2 inline-block h-2 w-2 rounded-full"
                style={{ backgroundColor: item.color }}
              />
              {item.name}
            </button>
          );
        })}
      </div>

      <div className="mt-4 overflow-x-auto">
        <svg
          className="h-auto min-w-[540px] w-full"
          viewBox={`0 0 ${chart.width} ${chart.height}`}
          role="img"
          aria-label={`Evolução da nota de ${selected.name}`}
        >
          {[0, 25, 50, 75, 100].map((value) => {
            const y =
              chart.top +
              ((100 - value) / 100) *
                (chart.height - chart.top - chart.bottom);
            return (
              <g key={value}>
                <line
                  x1={chart.left}
                  x2={chart.width - chart.right}
                  y1={y}
                  y2={y}
                  stroke="#ece9f1"
                  strokeDasharray="4 6"
                />
                <text x="6" y={y + 4} fill="#9792a7" fontSize="11">
                  {value}
                </text>
              </g>
            );
          })}

          <polyline
            points={polyline}
            fill="none"
            stroke={selected.color}
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {points.map((point) => (
            <g key={point.label}>
              <circle
                cx={point.x}
                cy={point.y}
                r="6"
                fill="white"
                stroke={selected.color}
                strokeWidth="4"
              />
              <text
                x={point.x}
                y={chart.height - 12}
                textAnchor="middle"
                fill="#6d698a"
                fontSize="11"
                fontWeight="700"
              >
                {point.label}
              </text>
            </g>
          ))}
        </svg>
      </div>
    </section>
  );
}
