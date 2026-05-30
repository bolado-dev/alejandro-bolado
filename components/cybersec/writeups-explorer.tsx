"use client"

import * as React from "react"
import Link from "next/link"
import Image from "next/image"
import { motion } from "framer-motion"
import { Search, ArrowUpRight, Clock } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import type { WriteupMeta } from "@/lib/writeups"

const DIFF_ORDER = ["Easy", "Medium", "Hard", "Insane"]

function diffColor(d: string | null) {
  switch (d) {
    case "Easy":
      return "text-emerald-600 dark:text-emerald-400"
    case "Medium":
      return "text-amber-600 dark:text-amber-400"
    case "Hard":
      return "text-red-600 dark:text-red-400"
    case "Insane":
      return "text-fuchsia-600 dark:text-fuchsia-400"
    default:
      return "text-muted-foreground"
  }
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("es-ES", {
    year: "numeric",
    month: "short",
  })
}

export function WriteupsExplorer({
  writeups,
  initialQuery = "",
}: {
  writeups: WriteupMeta[]
  initialQuery?: string
}) {
  const [query, setQuery] = React.useState(initialQuery)
  const [category, setCategory] = React.useState<string>("Todos")
  const [difficulty, setDifficulty] = React.useState<string>("Todas")

  const categories = React.useMemo(
    () => ["Todos", ...Array.from(new Set(writeups.map((w) => w.category)))],
    [writeups]
  )
  const difficulties = React.useMemo(() => {
    const present = Array.from(
      new Set(writeups.map((w) => w.difficulty).filter(Boolean) as string[])
    ).sort((a, b) => DIFF_ORDER.indexOf(a) - DIFF_ORDER.indexOf(b))
    return ["Todas", ...present]
  }, [writeups])

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase()
    return writeups.filter((w) => {
      if (category !== "Todos" && w.category !== category) return false
      if (difficulty !== "Todas" && w.difficulty !== difficulty) return false
      if (!q) return true
      return (
        w.title.toLowerCase().includes(q) ||
        w.tags.some((t) => t.toLowerCase().includes(q))
      )
    })
  }, [writeups, query, category, difficulty])

  return (
    <div>
      <div className="mb-10 flex flex-col gap-6">
        <div className="relative">
          <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar máquina, técnica o tag…"
            className="h-11 pl-9"
          />
        </div>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <FilterGroup
            label="Categoría"
            options={categories}
            value={category}
            onChange={setCategory}
          />
          <FilterGroup
            label="Dificultad"
            options={difficulties}
            value={difficulty}
            onChange={setDifficulty}
          />
        </div>
      </div>

      <p className="mb-6 text-[11px] tracking-widest text-muted-foreground uppercase">
        {filtered.length} {filtered.length === 1 ? "writeup" : "writeups"}
      </p>

      <div className="grid gap-4 sm:grid-cols-2">
        {filtered.map((w, i) => (
          <motion.div
            key={w.slug}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: Math.min(i * 0.03, 0.3) }}
          >
            <Link
              href={`/cybersec/writeups/${w.slug}`}
              className="group flex h-full gap-4 rounded-xl border bg-card p-4 transition-colors hover:bg-secondary"
            >
              <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center overflow-hidden rounded-lg border bg-muted">
                {w.image ? (
                  <Image
                    src={w.image}
                    alt={w.title}
                    width={56}
                    height={56}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span className="text-lg font-semibold text-muted-foreground">
                    {w.title.charAt(0)}
                  </span>
                )}
              </div>

              <div className="min-w-0 flex-1">
                <div className="mb-1 flex items-center justify-between gap-2">
                  <span className="text-[10px] tracking-widest text-muted-foreground uppercase">
                    {w.category}
                  </span>
                  <ArrowUpRight className="h-3.5 w-3.5 flex-shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                </div>

                <h3 className="truncate text-[15px] font-medium">{w.title}</h3>

                <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-muted-foreground">
                  {w.difficulty && (
                    <span className={cn("font-medium", diffColor(w.difficulty))}>
                      {w.difficulty}
                    </span>
                  )}
                  <span className="inline-flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {w.readingMinutes} min
                  </span>
                  <span>{formatDate(w.published)}</span>
                </div>

                <div className="mt-3 flex flex-wrap gap-1.5">
                  {w.tags
                    .filter((t) => !DIFF_ORDER.includes(t))
                    .slice(0, 3)
                    .map((tag) => (
                      <Badge
                        key={tag}
                        variant="outline"
                        className="rounded-full text-[10px] font-normal"
                      >
                        {tag}
                      </Badge>
                    ))}
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>

      {filtered.length === 0 && (
        <p className="py-20 text-center text-sm text-muted-foreground">
          No hay writeups que coincidan con la búsqueda.
        </p>
      )}
    </div>
  )
}

function FilterGroup({
  label,
  options,
  value,
  onChange,
}: {
  label: string
  options: string[]
  value: string
  onChange: (v: string) => void
}) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-[10px] tracking-widest text-muted-foreground uppercase">
        {label}
      </span>
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
    </div>
  )
}
