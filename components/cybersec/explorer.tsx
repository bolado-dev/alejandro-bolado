"use client"

import * as React from "react"
import Link from "next/link"
import Image from "next/image"
import { Search, X } from "lucide-react"
import { Input } from "@/components/ui/input"
import { FilterDropdown } from "@/components/cybersec/filter-dropdown"
import { cn } from "@/lib/utils"

export function normalize(s: string) {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
}

export interface ExplorerFilter<T> {
  key: string
  label: string
  options: string[]
  /** Valor "sin filtrar" (primera opción por defecto). */
  all?: string
  /** Mantiene el item cuando el valor seleccionado no es "all". */
  predicate: (item: T, value: string) => boolean
}

interface ExplorerProps<T> {
  items: T[]
  /** Texto indexable de cada item para la búsqueda. */
  searchText: (item: T) => string
  filters: ExplorerFilter<T>[]
  renderCard: (item: T, api: { search: (q: string) => void }) => React.ReactNode
  itemKey: (item: T) => string
  noun: { one: string; many: string }
  searchPlaceholder?: string
  emptyText?: string
  initialQuery?: string
  /** Bloque sobre el buscador (p. ej. barra de progreso). */
  header?: React.ReactNode
  /** Texto extra junto al contador de resultados. */
  summary?: (items: T[]) => React.ReactNode
  pageSize?: number
  gridClassName?: string
}

export function Explorer<T>({
  items,
  searchText,
  filters,
  renderCard,
  itemKey,
  noun,
  searchPlaceholder = "Buscar…",
  emptyText = "Sin resultados.",
  initialQuery = "",
  header,
  summary,
  pageSize = 48,
  gridClassName = "grid gap-3 sm:grid-cols-2 lg:grid-cols-3",
}: ExplorerProps<T>) {
  const defaults = React.useMemo(
    () => Object.fromEntries(filters.map((f) => [f.key, f.all ?? f.options[0]])),
    [filters]
  )

  const [query, setQuery] = React.useState(initialQuery)
  const [values, setValues] = React.useState<Record<string, string>>(defaults)
  const [limit, setLimit] = React.useState(pageSize)

  const deferredQuery = React.useDeferredValue(query)

  // Índice de búsqueda pre-construido una sola vez.
  const indexed = React.useMemo(
    () => items.map((item) => ({ item, blob: normalize(searchText(item)) })),
    [items, searchText]
  )

  const filtered = React.useMemo(() => {
    const terms = normalize(deferredQuery.trim()).split(/\s+/).filter(Boolean)
    return indexed
      .filter(({ item, blob }) => {
        for (const f of filters) {
          const v = values[f.key]
          if (v !== defaults[f.key] && !f.predicate(item, v)) return false
        }
        if (terms.length && !terms.every((t) => blob.includes(t))) return false
        return true
      })
      .map((x) => x.item)
  }, [indexed, deferredQuery, filters, values, defaults])

  // Reinicia el render incremental al cambiar el resultado.
  React.useEffect(() => {
    setLimit(pageSize)
  }, [deferredQuery, values, pageSize])

  // Carga incremental: monta pageSize tarjetas y amplía al hacer scroll.
  const sentinel = React.useRef<HTMLDivElement>(null)
  React.useEffect(() => {
    if (limit >= filtered.length) return
    const el = sentinel.current
    if (!el) return
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) setLimit((l) => l + pageSize)
      },
      { rootMargin: "600px" }
    )
    io.observe(el)
    return () => io.disconnect()
  }, [limit, filtered.length, pageSize])

  const hasFilters =
    query !== "" || filters.some((f) => values[f.key] !== defaults[f.key])

  const reset = () => {
    setQuery("")
    setValues(defaults)
  }

  const visible = filtered.slice(0, limit)

  return (
    <div>
      {header}

      <div className="mb-6 flex flex-col gap-4">
        <div className="relative">
          <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={searchPlaceholder}
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

        {filters.length > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            {filters.map((f) => (
              <FilterDropdown
                key={f.key}
                label={f.label}
                options={f.options}
                value={values[f.key]}
                defaultValue={f.all ?? f.options[0]}
                onChange={(v) => setValues((prev) => ({ ...prev, [f.key]: v }))}
              />
            ))}
          </div>
        )}
      </div>

      <div className="mb-6 flex items-center justify-between text-[11px] tracking-widest text-muted-foreground uppercase">
        <span>
          {filtered.length} {filtered.length === 1 ? noun.one : noun.many}
          {filtered.length > 0 && summary && (
            <span className="ml-2 normal-case tracking-normal text-muted-foreground/70">
              {summary(filtered)}
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

      <div className={gridClassName}>
        {visible.map((item) => (
          <React.Fragment key={itemKey(item)}>
            {renderCard(item, { search: setQuery })}
          </React.Fragment>
        ))}
      </div>

      {limit < filtered.length && (
        <div ref={sentinel} className="py-10 text-center text-sm text-muted-foreground">
          Cargando más…
        </div>
      )}

      {filtered.length === 0 && (
        <p className="py-20 text-center text-sm text-muted-foreground">{emptyText}</p>
      )}
    </div>
  )
}

/** Chip de tag clicable: pone su texto en el buscador (sin navegar la tarjeta). */
export function TagButton({
  children,
  onClick,
}: {
  children: React.ReactNode
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault()
        e.stopPropagation()
        onClick()
      }}
      className="relative z-10 rounded-full border px-2 py-0.5 text-[10px] font-normal text-muted-foreground transition-colors hover:border-foreground hover:text-foreground"
    >
      {children}
    </button>
  )
}

interface ExplorerCardProps {
  /** Si se indica, toda la tarjeta enlaza aquí (stretched link). */
  href?: string | null
  linkLabel?: string
  image?: string | null
  fallbackChar: string
  eyebrow?: React.ReactNode
  title: string
  subtitle?: React.ReactNode
  topRight?: React.ReactNode
  meta?: React.ReactNode
  tags?: React.ReactNode
  footer?: React.ReactNode
  dimmed?: boolean
}

/** Carcasa visual común para writeups y máquinas. */
export function ExplorerCard({
  href,
  linkLabel,
  image,
  fallbackChar,
  eyebrow,
  title,
  subtitle,
  topRight,
  meta,
  tags,
  footer,
  dimmed,
}: ExplorerCardProps) {
  return (
    <div
      className={cn(
        "group relative flex h-full flex-col rounded-xl border bg-card p-4 transition-colors",
        href ? "hover:bg-secondary" : dimmed && "opacity-90"
      )}
    >
      {href && (
        <Link
          href={href}
          className="absolute inset-0 z-0 rounded-xl"
          aria-label={linkLabel ?? title}
        />
      )}

      <div className="flex items-start justify-between gap-2">
        <div className="flex min-w-0 items-center gap-3">
          <span className="flex h-11 w-11 flex-shrink-0 items-center justify-center overflow-hidden rounded-full border bg-muted">
            {image ? (
              <Image
                src={image}
                alt={title}
                width={44}
                height={44}
                className="h-full w-full object-cover"
              />
            ) : (
              <span className="text-base font-semibold text-muted-foreground">
                {fallbackChar}
              </span>
            )}
          </span>
          <div className="min-w-0">
            {eyebrow && (
              <div className="mb-0.5 text-[10px] tracking-widest text-muted-foreground uppercase">
                {eyebrow}
              </div>
            )}
            <h3 className="truncate text-[15px] font-medium">{title}</h3>
            {subtitle && <div className="mt-0.5">{subtitle}</div>}
          </div>
        </div>
        {topRight}
      </div>

      {meta && (
        <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px]">
          {meta}
        </div>
      )}

      {tags && <div className="mt-3 flex flex-wrap gap-1.5">{tags}</div>}

      {footer && (
        <div className="mt-auto flex items-center justify-between gap-2 pt-4">
          {footer}
        </div>
      )}
    </div>
  )
}
