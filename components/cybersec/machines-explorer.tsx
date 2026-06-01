"use client"

import * as React from "react"
import { Check, Circle, ExternalLink, ArrowUpRight } from "lucide-react"
import {
  Explorer,
  ExplorerCard,
  TagButton,
  type ExplorerFilter,
} from "@/components/cybersec/explorer"
import { OsIcon } from "@/components/cybersec/os-icon"
import { cn } from "@/lib/utils"
import type { Machine, MachineStats } from "@/lib/machines"

function diffColor(d: string) {
  switch (d) {
    case "Fácil":
      return "text-emerald-600 dark:text-emerald-400"
    case "Media":
      return "text-amber-600 dark:text-amber-400"
    case "Difícil":
      return "text-red-600 dark:text-red-400"
    case "Insane":
      return "text-fuchsia-600 dark:text-fuchsia-400"
    default:
      return "text-muted-foreground"
  }
}

export function MachinesExplorer({
  machines,
  stats,
}: {
  machines: Machine[]
  stats: MachineStats
}) {
  const filters = React.useMemo<ExplorerFilter<Machine>[]>(
    () => [
      {
        key: "estado",
        label: "Estado",
        options: ["Todas", "Hechas", "Pendientes"],
        predicate: (m, v) => (v === "Hechas" ? m.done : !m.done),
      },
      {
        key: "os",
        label: "OS",
        options: ["Todos", ...Object.keys(stats.byOs).sort()],
        predicate: (m, v) => m.os === v,
      },
      {
        key: "difficulty",
        label: "Dificultad",
        options: ["Todas", ...stats.byDifficulty.map((d) => d.label)],
        predicate: (m, v) => m.difficulty === v,
      },
      {
        key: "cert",
        label: "Cert",
        options: ["Todas", ...stats.certs],
        predicate: (m, v) => m.certs.includes(v),
      },
    ],
    [stats]
  )

  const pct = Math.round((stats.done / stats.total) * 100)

  return (
    <Explorer
      items={machines}
      itemKey={(m) => m.slug}
      noun={{ one: "máquina", many: "máquinas" }}
      searchPlaceholder="Buscar por máquina, IP, técnica, OS o certificación…"
      emptyText="Ninguna máquina coincide con la búsqueda."
      filters={filters}
      searchText={(m) =>
        [
          m.name,
          m.ip,
          m.os,
          m.difficulty,
          m.done ? "hecha resuelta completada done" : "pendiente sin resolver",
          ...m.techniques,
          ...m.certs,
        ].join(" ")
      }
      summary={(items) => {
        const done = items.reduce((n, m) => n + (m.done ? 1 : 0), 0)
        return `· ${done} hechas · ${items.length - done} pendientes`
      }}
      header={
        <div className="mb-10 rounded-xl border bg-card p-5">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-[11px] tracking-widest text-muted-foreground uppercase">
                Progreso
              </p>
              <p className="mt-1 text-2xl font-medium">
                {stats.done}
                <span className="text-muted-foreground"> / {stats.total}</span>
                <span className="ml-2 text-sm text-muted-foreground">
                  máquinas resueltas
                </span>
              </p>
            </div>
            <span className="text-3xl font-semibold tabular-nums">{pct}%</span>
          </div>
          <div className="mt-4 h-2 overflow-hidden rounded-full bg-secondary">
            <div
              className="h-full rounded-full bg-foreground transition-[width] duration-700"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>
      }
      renderCard={(m, { search }) => <MachineCard m={m} onSearch={search} />}
    />
  )
}

function MachineCard({
  m,
  onSearch,
}: {
  m: Machine
  onSearch: (q: string) => void
}) {
  return (
    <ExplorerCard
      href={m.writeup}
      linkLabel={`Ver writeup de ${m.name}`}
      image={m.image}
      fallbackChar={m.name.charAt(0)}
      title={m.name}
      dimmed={!m.done}
      subtitle={
        <p className="font-mono text-[11px] text-muted-foreground">{m.ip || "—"}</p>
      }
      topRight={<StatusPill done={m.done} />}
      meta={
        <>
          <span className="inline-flex items-center gap-1.5 text-muted-foreground">
            <OsIcon os={m.os} className="h-3.5 w-3.5" />
            {m.os}
          </span>
          <span className={cn("font-medium", diffColor(m.difficulty))}>
            {m.difficulty}
          </span>
          {m.techniques.length > 0 && (
            <span className="text-muted-foreground">
              {m.techniques.length}{" "}
              {m.techniques.length === 1 ? "técnica" : "técnicas"}
            </span>
          )}
        </>
      }
      tags={
        m.certs.length > 0 ? (
          <>
            {m.certs.slice(0, 3).map((c) => (
              <TagButton key={c} onClick={() => onSearch(c)}>
                {c}
              </TagButton>
            ))}
            {m.certs.length > 3 && (
              <span className="self-center text-[10px] text-muted-foreground">
                +{m.certs.length - 3}
              </span>
            )}
          </>
        ) : undefined
      }
      footer={
        <>
          {m.done ? (
            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-foreground">
              Ver writeup
              <ArrowUpRight className="h-3.5 w-3.5 opacity-0 transition-opacity group-hover:opacity-100" />
            </span>
          ) : (
            <span className="text-[11px] text-muted-foreground">Sin writeup aún</span>
          )}
          {m.video && (
            <a
              href={m.video}
              target="_blank"
              rel="noopener noreferrer"
              className="relative z-10 inline-flex items-center gap-1 text-[11px] text-muted-foreground transition-colors hover:text-foreground"
              aria-label={`Vídeo de referencia de ${m.name}`}
            >
              <ExternalLink className="h-3 w-3" />
              Referencia
            </a>
          )}
        </>
      }
    />
  )
}

function StatusPill({ done }: { done: boolean }) {
  return done ? (
    <span className="inline-flex flex-shrink-0 items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium text-emerald-600 dark:text-emerald-400">
      <Check className="h-3 w-3" />
      Hecha
    </span>
  ) : (
    <span className="inline-flex flex-shrink-0 items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
      <Circle className="h-2.5 w-2.5" />
      Pendiente
    </span>
  )
}
