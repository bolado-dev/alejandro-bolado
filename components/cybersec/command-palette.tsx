"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { createPortal } from "react-dom"
import { Search, FileText, BookOpen, CornerDownLeft } from "lucide-react"
import { cn } from "@/lib/utils"

export interface PaletteItem {
  title: string
  href: string
  kind: "writeup" | "manual"
  sub: string
  keywords: string
}

export function CommandPalette({ items }: { items: PaletteItem[] }) {
  const router = useRouter()
  const [open, setOpen] = React.useState(false)
  const [query, setQuery] = React.useState("")
  const [active, setActive] = React.useState(0)
  const inputRef = React.useRef<HTMLInputElement>(null)
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => setMounted(true), [])

  const close = React.useCallback(() => {
    setOpen(false)
    setQuery("")
    setActive(0)
  }, [])

  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault()
        setOpen((v) => !v)
      }
    }
    const onOpen = () => setOpen(true)
    window.addEventListener("keydown", onKey)
    window.addEventListener("open-command-palette", onOpen)
    return () => {
      window.removeEventListener("keydown", onKey)
      window.removeEventListener("open-command-palette", onOpen)
    }
  }, [])

  React.useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 20)
  }, [open])

  const results = React.useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return items.slice(0, 8)
    return items
      .filter((it) => `${it.title} ${it.keywords}`.toLowerCase().includes(q))
      .slice(0, 12)
  }, [items, query])

  React.useEffect(() => {
    setActive(0)
  }, [query])

  const go = React.useCallback(
    (href: string) => {
      close()
      router.push(href)
    },
    [close, router]
  )

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault()
      setActive((a) => Math.min(a + 1, results.length - 1))
    } else if (e.key === "ArrowUp") {
      e.preventDefault()
      setActive((a) => Math.max(a - 1, 0))
    } else if (e.key === "Enter") {
      e.preventDefault()
      const item = results[active]
      if (item) go(item.href)
    } else if (e.key === "Escape") {
      close()
    }
  }

  if (!mounted || !open) return null

  return createPortal(
    <div
      className="fixed inset-0 z-[400] flex items-start justify-center bg-black/50 p-4 pt-[12vh] backdrop-blur-sm"
      onClick={close}
    >
      <div
        className="w-full max-w-lg overflow-hidden rounded-xl border bg-popover shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 border-b px-4">
          <Search className="h-4 w-4 text-muted-foreground" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Buscar writeups y manual…"
            className="h-12 w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
          <kbd className="rounded border px-1.5 py-0.5 text-[10px] text-muted-foreground">
            ESC
          </kbd>
        </div>

        <div className="max-h-[50vh] overflow-y-auto p-2">
          {results.length === 0 && (
            <p className="px-3 py-6 text-center text-sm text-muted-foreground">
              Sin resultados
            </p>
          )}
          {results.map((it, i) => (
            <button
              key={it.href}
              onMouseEnter={() => setActive(i)}
              onClick={() => go(it.href)}
              className={cn(
                "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors",
                i === active ? "bg-secondary" : "hover:bg-secondary/60"
              )}
            >
              <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-md border bg-background text-muted-foreground">
                {it.kind === "writeup" ? (
                  <FileText className="h-3.5 w-3.5" />
                ) : (
                  <BookOpen className="h-3.5 w-3.5" />
                )}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-medium">
                  {it.title}
                </span>
                <span className="block truncate text-[11px] text-muted-foreground">
                  {it.sub}
                </span>
              </span>
              {i === active && (
                <CornerDownLeft className="h-3.5 w-3.5 flex-shrink-0 text-muted-foreground" />
              )}
            </button>
          ))}
        </div>
      </div>
    </div>,
    document.body
  )
}
