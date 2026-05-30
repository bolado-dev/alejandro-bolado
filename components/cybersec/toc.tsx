"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import type { Heading } from "@/lib/markdown"

export function Toc({ headings }: { headings: Heading[] }) {
  const [active, setActive] = React.useState<string>("")

  React.useEffect(() => {
    if (headings.length === 0) return
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActive(entry.target.id)
        }
      },
      { rootMargin: "-80px 0px -70% 0px", threshold: 0 }
    )
    for (const h of headings) {
      const el = document.getElementById(h.id)
      if (el) observer.observe(el)
    }
    return () => observer.disconnect()
  }, [headings])

  if (headings.length === 0) return null

  return (
    <nav>
      <p className="mb-3 text-[10px] tracking-widest text-muted-foreground uppercase">
        En esta página
      </p>
      <ul className="space-y-1 border-l">
        {headings.map((h) => (
          <li key={h.id}>
            <a
              href={`#${h.id}`}
              className={cn(
                "block border-l-2 py-1 text-[13px] leading-snug transition-colors",
                h.depth === 3 ? "pl-6" : "pl-4",
                active === h.id
                  ? "border-foreground text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              )}
            >
              {h.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  )
}
