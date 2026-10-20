"use client"

import { useState } from "react"

import { InkSection } from "@/components/ink"
import { ChevronDown } from "@/components/icons/solar"
import { cn } from "@/lib/utils"

export type Thought = { title: string; body: string }

/**
 * Acordeón de notas cortas. La sección se oculta entera si no hay entradas: no
 * tiene sentido enseñar un bloque vacío, y las opiniones las tienes que
 * escribir tú (ver THOUGHTS en lib/home-data.ts).
 */
export function Thoughts({ items }: { items: Thought[] }) {
  const [open, setOpen] = useState<number | null>(null)
  if (items.length === 0) return null

  return (
    <InkSection title="Notas">
      <ul className="divide-y divide-[var(--ink-line)]">
        {items.map((t, i) => {
          const isOpen = open === i
          return (
            <li key={t.title}>
              <button
                type="button"
                onClick={() => setOpen(isOpen ? null : i)}
                aria-expanded={isOpen}
                className="flex w-full items-center justify-between gap-6 py-4 text-left"
              >
                <span className="text-[15px] font-medium text-[var(--ink-fg-strong)]">
                  {t.title}
                </span>
                <ChevronDown
                  aria-hidden
                  className={cn(
                    "size-4 shrink-0 text-[var(--ink-fg-dim)] transition-transform duration-200",
                    isOpen && "rotate-180",
                  )}
                />
              </button>
              <div
                className={cn(
                  "grid transition-all duration-300 ease-out",
                  isOpen
                    ? "grid-rows-[1fr] opacity-100"
                    : "grid-rows-[0fr] opacity-0",
                )}
              >
                <div className="overflow-hidden">
                  <p className="pb-4 text-[14px] leading-[1.65] text-[var(--ink-fg-dim)]">
                    {t.body}
                  </p>
                </div>
              </div>
            </li>
          )
        })}
      </ul>
    </InkSection>
  )
}
