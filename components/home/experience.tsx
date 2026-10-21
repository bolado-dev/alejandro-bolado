"use client"

import { useState } from "react"

import { InkSection } from "@/components/ink"
import { InkStagger } from "@/components/ink-reveal"
import { ChevronDown } from "@/components/icons/solar"
import { EXPERIENCE } from "@/lib/home-data"
import { cn } from "@/lib/utils"

/**
 * Filas de experiencia desplegables: logo o inicial, puesto, periodo a la
 * derecha y un chevron que abre los detalles. Las filas sin `bullets` no son
 * pulsables, para no ofrecer un desplegable vacío.
 */
export function Experience() {
  const [open, setOpen] = useState<number | null>(null)

  return (
    <InkSection title="Experiencia" revealContent={false}>
      <InkStagger as="ul" className="divide-y divide-[var(--ink-line)]">
        {EXPERIENCE.map((e, i) => {
          const expandable = Boolean(e.bullets?.length)
          const isOpen = open === i

          const row = (
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
              <span className="flex size-[38px] shrink-0 items-center justify-center overflow-hidden rounded-full border border-[var(--ink-line-strong)] bg-[var(--ink-surface)] text-[15px] text-[var(--ink-fg-dim)]">
                {e.logo ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={e.logo}
                    alt=""
                    aria-hidden
                    className="size-full object-contain p-1.5"
                  />
                ) : (
                  (e.initial ?? e.company[0])
                )}
              </span>
              <div className="min-w-0 flex-1 text-left">
                <h3 className="text-[18px] font-medium text-[var(--ink-fg-strong)]">
                  {e.company}
                </h3>
                <p className="mt-0.5 text-[13px] text-[var(--ink-fg-dim)]">
                  {e.role}
                  {e.status ? ` · ${e.status}` : null}
                </p>
              </div>
              <span className="shrink-0 rounded-full border border-[var(--ink-line-strong)] px-2.5 py-1 text-[13px] text-[var(--ink-fg-dim)]">
                {e.period}
              </span>
              {expandable ? (
                <ChevronDown
                  aria-hidden
                  className={cn(
                    "size-4 shrink-0 text-[var(--ink-fg-dim)] transition-transform duration-200",
                    isOpen && "rotate-180",
                  )}
                />
              ) : (
                <span aria-hidden className="size-4 shrink-0" />
              )}
            </div>
          )

          return (
            <li key={`${e.company}-${e.period}`} className="py-4 first:pt-0">
              {expandable ? (
                <button
                  type="button"
                  onClick={() => setOpen(isOpen ? null : i)}
                  aria-expanded={isOpen}
                  className="w-full"
                >
                  {row}
                </button>
              ) : (
                row
              )}

              {expandable ? (
                <div
                  className={cn(
                    "grid transition-all duration-300 ease-out",
                    isOpen
                      ? "grid-rows-[1fr] opacity-100"
                      : "grid-rows-[0fr] opacity-0",
                  )}
                >
                  <div className="overflow-hidden">
                    <ul className="mt-3 space-y-1.5 pl-[54px] text-[14px] leading-[1.6] text-[var(--ink-fg-dim)]">
                      {e.bullets?.map((b) => (
                        <li key={b} className="relative pl-4">
                          <span
                            aria-hidden
                            className="absolute left-0 top-[9px] size-1 rounded-full bg-[var(--ink-fg-dim)]"
                          />
                          {b}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ) : null}
            </li>
          )
        })}
      </InkStagger>
    </InkSection>
  )
}
