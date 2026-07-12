"use client"

import * as React from "react"
import { AnimatePresence, motion } from "framer-motion"
import { Check, ChevronDown } from "@/components/icons/solar"
import { cn } from "@/lib/utils"

interface FilterDropdownProps {
  label: string
  value: string
  options: string[]
  onChange: (value: string) => void
  /** Valor que se considera "sin filtrar" (no resalta el trigger). */
  defaultValue?: string
  className?: string
}

export function FilterDropdown({
  label,
  value,
  options,
  onChange,
  defaultValue = options[0],
  className,
}: FilterDropdownProps) {
  const [open, setOpen] = React.useState(false)
  const [active, setActive] = React.useState(0)
  const ref = React.useRef<HTMLDivElement>(null)
  const listRef = React.useRef<HTMLDivElement>(null)

  const active2 = Math.max(0, options.indexOf(value))

  // Al abrir, sitúa el cursor en la opción seleccionada.
  React.useEffect(() => {
    if (open) setActive(active2)
  }, [open, active2])

  // Cerrar al clicar fuera o con Escape.
  React.useEffect(() => {
    if (!open) return
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener("mousedown", onDown)
    return () => document.removeEventListener("mousedown", onDown)
  }, [open])

  const commit = (opt: string) => {
    onChange(opt)
    setOpen(false)
  }

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown" || (!open && (e.key === "Enter" || e.key === " "))) {
      e.preventDefault()
      if (!open) setOpen(true)
      else setActive((a) => Math.min(a + 1, options.length - 1))
    } else if (e.key === "ArrowUp") {
      e.preventDefault()
      setActive((a) => Math.max(a - 1, 0))
    } else if (e.key === "Enter" && open) {
      e.preventDefault()
      commit(options[active])
    } else if (e.key === "Escape") {
      setOpen(false)
    } else if (e.key === "Tab") {
      setOpen(false)
    }
  }

  const isFiltered = value !== defaultValue

  return (
    <div ref={ref} className={cn("relative", className)}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        onKeyDown={onKeyDown}
        aria-haspopup="listbox"
        aria-expanded={open}
        className={cn(
          "flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs transition-colors",
          isFiltered
            ? "border-foreground bg-foreground text-background"
            : "border-border text-muted-foreground hover:bg-secondary hover:text-foreground"
        )}
      >
        <span
          className={cn(
            "tracking-wide",
            isFiltered ? "text-background/70" : "text-muted-foreground/80"
          )}
        >
          {label}
        </span>
        <span className="font-medium">{value}</span>
        <ChevronDown
          className={cn(
            "h-3.5 w-3.5 transition-transform duration-200",
            open && "rotate-180"
          )}
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            ref={listRef}
            role="listbox"
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.97 }}
            transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
            className="absolute left-0 z-50 mt-2 max-h-72 min-w-[10rem] origin-top overflow-y-auto rounded-xl border bg-popover p-1 shadow-lg shadow-black/5"
          >
            {options.map((opt, i) => {
              const selected = opt === value
              return (
                <button
                  key={opt}
                  type="button"
                  role="option"
                  aria-selected={selected}
                  onMouseEnter={() => setActive(i)}
                  onClick={() => commit(opt)}
                  className={cn(
                    "flex w-full items-center justify-between gap-3 rounded-lg px-3 py-1.5 text-left text-xs transition-colors",
                    i === active ? "bg-secondary text-foreground" : "text-muted-foreground"
                  )}
                >
                  <span className={cn("truncate", selected && "font-medium text-foreground")}>
                    {opt}
                  </span>
                  {selected && <Check className="h-3.5 w-3.5 flex-shrink-0" />}
                </button>
              )
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
