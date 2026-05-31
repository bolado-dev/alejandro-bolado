"use client"

import * as React from "react"
import Link from "next/link"
import Image from "next/image"
import {
  Search,
  Check,
  Circle,
  ExternalLink,
  ArrowUpRight,
  X,
  SlidersHorizontal,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import type { Machine, MachineStats } from "@/lib/machines"

const PAGE = 48

function normalize(s: string) {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
}

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

function osDot(os: string) {
  switch (os) {
    case "Linux":
      return "bg-amber-500"
    case "Windows":
      return "bg-sky-500"
    default:
      return "bg-muted-foreground"
  }
}

type Estado = "Todas" | "Hechas" | "Pendientes"

// Índice de búsqueda pre-construido una sola vez por máquina.
interface Indexed {
  m: Machine
  blob: string
}

export function MachinesExplorer({
  machines,
  stats,
}: {
  machines: Machine[]
  stats: MachineStats
}) {
  const [query, setQuery] = React.useState("")
  const [estado, setEstado] = React.useState<Estado>("Todas")
  const [os, setOs] = React.useState("Todos")
  const [difficulty, setDifficulty] = React.useState("Todas")
  const [cert, setCert] = React.useState("Todas")
  const [limit, setLimit] = React.useState(PAGE)

  // El query difiere para que escribir no bloquee el render de la lista.
  const deferredQuery = React.useDeferredValue(query)

  const indexed = React.useMemo<Indexed[]>(
    () =>
      machines.map((m) => ({
        m,
        blob: normalize(
          [
            m.name,
            m.ip,
            m.os,
            m.difficulty,
            m.done ? "hecha resuelta completada done" : "pendiente sin resolver",
            ...m.techniques,
            ...m.certs,
          ].join(" ")
        ),
      })),
    [machines]
  )

  const osOptions = React.useMemo(
    () => ["Todos", ...Object.keys(stats.byOs).sort()],
    [stats.byOs]
  )
  const diffOptions = React.useMemo(
    () => ["Todas", ...stats.byDifficulty.map((d) => d.label)],
    [stats.byDifficulty]
  )

  const filtered = React.useMemo(() => {
    const terms = normalize(deferredQuery.trim()).split(/\s+/).filter(Boolean)
    return indexed.filter(({ m, blob }) => {
      if (estado === "Hechas" && !m.done) return false
      if (estado === "Pendientes" && m.done) return false
      if (os !== "Todos" && m.os !== os) return false
      if (difficulty !== "Todas" && m.difficulty !== difficulty) return false
      if (cert !== "Todas" && !m.certs.includes(cert)) return false
      if (terms.length && !terms.every((t) => blob.includes(t))) return false
      return true
    })
  }, [indexed, deferredQuery, estado, os, difficulty, cert])

  // Resetea el render incremental cuando cambia el resultado.
  React.useEffect(() => {
    setLimit(PAGE)
  }, [deferredQuery, estado, os, difficulty, cert])

  // Carga incremental: sólo monta PAGE tarjetas y va ampliando al hacer scroll.
  const sentinel = React.useRef<HTMLDivElement>(null)
  React.useEffect(() => {
    if (limit >= filtered.length) return
    const el = sentinel.current
    if (!el) return
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) setLimit((l) => l + PAGE)
      },
      { rootMargin: "600px" }
    )
    io.observe(el)
    return () => io.disconnect()
  }, [limit, filtered.length])

  const visible = filtered.slice(0, limit)
  const doneInView = filtered.reduce((n, { m }) => n + (m.done ? 1 : 0), 0)

  const hasFilters =
    query !== "" ||
    estado !== "Todas" ||
    os !== "Todos" ||
    difficulty !== "Todas" ||
    cert !== "Todas"

  const reset = () => {
    setQuery("")
    setEstado("Todas")
    setOs("Todos")
    setDifficulty("Todas")
    setCert("Todas")
  }

  const pct = Math.round((stats.done / stats.total) * 100)

  return (
    <div>
      {/* Progreso global */}
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

      {/* Buscador */}
      <div className="mb-6 flex flex-col gap-4">
        <div className="relative">
          <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar por máquina, IP, técnica, OS o certificación…"
            className="h-11 pl-9"
            autoComplete="off"
            spellCheck={false}
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="absolute top-1/2 right-3 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              aria-label="Limpiar"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
            <FilterGroup
              options={["Todas", "Hechas", "Pendientes"]}
              value={estado}
              onChange={(v) => setEstado(v as Estado)}
            />
            <FilterGroup options={osOptions} value={os} onChange={setOs} />
            <FilterGroup
              options={diffOptions}
              value={difficulty}
              onChange={setDifficulty}
            />
          </div>

          <div className="flex items-center gap-2">
            <SlidersHorizontal className="h-3.5 w-3.5 text-muted-foreground" />
            <select
              value={cert}
              onChange={(e) => setCert(e.target.value)}
              className="h-9 rounded-full border bg-background px-3 text-xs text-muted-foreground outline-none transition-colors hover:text-foreground focus:text-foreground"
            >
              <option value="Todas">Todas las certificaciones</option>
              {stats.certs.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="mb-6 flex items-center justify-between text-[11px] tracking-widest text-muted-foreground uppercase">
        <span>
          {filtered.length}{" "}
          {filtered.length === 1 ? "máquina" : "máquinas"}
          {filtered.length > 0 && (
            <span className="ml-2 normal-case tracking-normal text-muted-foreground/70">
              · {doneInView} hechas · {filtered.length - doneInView} pendientes
            </span>
          )}
        </span>
        {hasFilters && (
          <button
            onClick={reset}
            className="flex items-center gap-1 normal-case tracking-normal hover:text-foreground"
          >
            <X className="h-3 w-3" />
            Limpiar filtros
          </button>
        )}
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {visible.map(({ m }) => (
          <MachineCard key={m.slug} m={m} />
        ))}
      </div>

      {limit < filtered.length && (
        <div ref={sentinel} className="py-10 text-center text-sm text-muted-foreground">
          Cargando más…
        </div>
      )}

      {filtered.length === 0 && (
        <p className="py-20 text-center text-sm text-muted-foreground">
          Ninguna máquina coincide con la búsqueda.
        </p>
      )}
    </div>
  )
}

function MachineCard({ m }: { m: Machine }) {
  return (
    <div
      className={cn(
        "group relative flex h-full flex-col rounded-xl border bg-card p-4 transition-colors",
        m.done ? "hover:bg-secondary" : "opacity-90"
      )}
    >
      {/* Stretched link: cubre la tarjeta sin anidar <a> dentro de <a>. */}
      {m.done && (
        <Link
          href={m.writeup as string}
          className="absolute inset-0 z-0 rounded-xl"
          aria-label={`Ver writeup de ${m.name}`}
        />
      )}

      <div className="flex items-start justify-between gap-2">
        <div className="flex min-w-0 items-center gap-3">
          <span className="flex h-11 w-11 flex-shrink-0 items-center justify-center overflow-hidden rounded-full border bg-muted">
            {m.image ? (
              <Image
                src={m.image}
                alt={m.name}
                width={44}
                height={44}
                className="h-full w-full object-cover"
              />
            ) : (
              <span className="text-base font-semibold text-muted-foreground">
                {m.name.charAt(0)}
              </span>
            )}
          </span>
          <div className="min-w-0">
            <h3 className="truncate text-[15px] font-medium">{m.name}</h3>
            <p className="mt-0.5 font-mono text-[11px] text-muted-foreground">
              {m.ip || "—"}
            </p>
          </div>
        </div>
        <StatusPill done={m.done} />
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px]">
        <span className="inline-flex items-center gap-1.5 text-muted-foreground">
          <span className={cn("h-1.5 w-1.5 rounded-full", osDot(m.os))} />
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
      </div>

      {m.certs.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {m.certs.slice(0, 3).map((c) => (
            <Badge
              key={c}
              variant="outline"
              className="rounded-full text-[10px] font-normal"
            >
              {c}
            </Badge>
          ))}
          {m.certs.length > 3 && (
            <span className="self-center text-[10px] text-muted-foreground">
              +{m.certs.length - 3}
            </span>
          )}
        </div>
      )}

      <div className="mt-auto flex items-center justify-between gap-2 pt-4">
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
      </div>
    </div>
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

function FilterGroup({
  options,
  value,
  onChange,
}: {
  options: string[]
  value: string
  onChange: (v: string) => void
}) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {options.map((opt) => (
        <button
          key={opt}
          onClick={() => onChange(opt)}
          className={cn(
            "rounded-full border px-3 py-1 text-xs transition-colors",
            value === opt
              ? "border-foreground bg-foreground text-background"
              : "border-border text-muted-foreground hover:bg-secondary"
          )}
        >
          {opt}
        </button>
      ))}
    </div>
  )
}
