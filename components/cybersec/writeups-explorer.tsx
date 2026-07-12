"use client"

import * as React from "react"
import { ArrowUpRight, Clock } from "@/components/icons/solar"
import {
  Explorer,
  ExplorerCard,
  TagButton,
  type ExplorerFilter,
} from "@/components/cybersec/explorer"
import { OsIcon } from "@/components/cybersec/os-icon"
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
  const filters = React.useMemo<ExplorerFilter<WriteupMeta>[]>(() => {
    const categories = Array.from(new Set(writeups.map((w) => w.category)))
    const difficulties = Array.from(
      new Set(writeups.map((w) => w.difficulty).filter(Boolean) as string[])
    ).sort((a, b) => DIFF_ORDER.indexOf(a) - DIFF_ORDER.indexOf(b))
    return [
      {
        key: "category",
        label: "Categoría",
        options: ["Todas", ...categories],
        predicate: (w, v) => w.category === v,
      },
      {
        key: "difficulty",
        label: "Dificultad",
        options: ["Todas", ...difficulties],
        predicate: (w, v) => w.difficulty === v,
      },
    ]
  }, [writeups])

  return (
    <Explorer
      items={writeups}
      itemKey={(w) => w.slug}
      noun={{ one: "writeup", many: "writeups" }}
      searchPlaceholder="Buscar máquina, técnica o tag…"
      emptyText="No hay writeups que coincidan con la búsqueda."
      initialQuery={initialQuery}
      filters={filters}
      searchText={(w) =>
        [w.title, w.category, w.difficulty ?? "", ...w.tags].join(" ")
      }
      renderCard={(w, { search }) => <WriteupCard w={w} onSearch={search} />}
    />
  )
}

function WriteupCard({
  w,
  onSearch,
}: {
  w: WriteupMeta
  onSearch: (q: string) => void
}) {
  const tags = w.tags.filter((t) => !DIFF_ORDER.includes(t)).slice(0, 3)
  return (
    <ExplorerCard
      href={`/cybersec/writeups/${w.slug}`}
      image={w.image}
      fallbackChar={w.title.charAt(0)}
      eyebrow={w.category}
      title={w.title}
      topRight={
        <ArrowUpRight className="h-3.5 w-3.5 flex-shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
      }
      meta={
        <>
          {w.os && (
            <span className="inline-flex items-center gap-1.5 text-muted-foreground">
              <OsIcon os={w.os} className="h-3.5 w-3.5" />
              {w.os}
            </span>
          )}
          {w.difficulty && (
            <span className={cn("font-medium", diffColor(w.difficulty))}>
              {w.difficulty}
            </span>
          )}
          <span className="inline-flex items-center gap-1 text-muted-foreground">
            <Clock className="h-3 w-3" />
            {w.readingMinutes} min
          </span>
          <span className="text-muted-foreground">{formatDate(w.published)}</span>
        </>
      }
      tags={
        tags.length > 0
          ? tags.map((tag) => (
              <TagButton key={tag} onClick={() => onSearch(tag)}>
                {tag}
              </TagButton>
            ))
          : undefined
      }
    />
  )
}
