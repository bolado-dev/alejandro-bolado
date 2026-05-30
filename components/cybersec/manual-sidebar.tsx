"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"
import type { ManualSection } from "@/lib/manual"

export function ManualSidebar({ nav }: { nav: ManualSection[] }) {
  return (
    <nav>
      <p className="mb-4 px-2 text-[10px] tracking-widest text-muted-foreground uppercase">
        Manual
      </p>
      <div className="space-y-5">
        {nav.map((section) => (
          <Section key={section.slug} section={section} />
        ))}
      </div>
    </nav>
  )
}

function Section({ section }: { section: ManualSection }) {
  const pathname = usePathname()
  const [open, setOpen] = React.useState<boolean>(true)

  return (
    <div>
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center gap-1.5 px-2 text-[11px] font-medium tracking-wide text-muted-foreground uppercase transition-colors hover:text-foreground"
      >
        <ChevronRight
          className={cn("h-3 w-3 transition-transform", open && "rotate-90")}
        />
        {section.title}
      </button>

      {open && (
        <ul className="mt-1.5 space-y-0.5 border-l pl-2">
          {section.pages.map((page) => {
            const active = pathname === page.href
            return (
              <li key={page.href}>
                <Link
                  href={page.href}
                  className={cn(
                    "block rounded-md px-3 py-1.5 text-[13px] leading-snug transition-colors",
                    active
                      ? "manual-link-active"
                      : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                  )}
                >
                  {page.title}
                </Link>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
