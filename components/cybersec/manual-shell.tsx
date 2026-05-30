"use client"

import * as React from "react"
import { usePathname } from "next/navigation"
import { PanelLeft, X } from "lucide-react"
import { ManualSidebar } from "@/components/cybersec/manual-sidebar"
import type { ManualSection } from "@/lib/manual"

export function ManualShell({
  nav,
  children,
}: {
  nav: ManualSection[]
  children: React.ReactNode
}) {
  const [open, setOpen] = React.useState(false)
  const pathname = usePathname()

  // cerrar el drawer al navegar
  React.useEffect(() => {
    setOpen(false)
  }, [pathname])

  return (
    <div className="mx-auto max-w-6xl px-4">
      <div className="lg:grid lg:grid-cols-[240px_1fr] lg:gap-10">
        {/* Sidebar desktop */}
        <aside className="hidden lg:block">
          <div className="sticky top-16 max-h-[calc(100vh-5rem)] overflow-y-auto py-8 pr-2">
            <ManualSidebar nav={nav} />
          </div>
        </aside>

        {/* Toggle móvil */}
        <button
          onClick={() => setOpen(true)}
          className="mt-6 mb-2 flex items-center gap-2 rounded-full border px-4 py-1.5 text-[13px] text-muted-foreground transition-colors hover:text-foreground lg:hidden"
        >
          <PanelLeft className="h-3.5 w-3.5" />
          Índice del manual
        </button>

        {/* Drawer móvil */}
        {open && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setOpen(false)}
            />
            <div className="absolute top-0 left-0 h-full w-72 max-w-[80vw] overflow-y-auto border-r border-border bg-background p-5">
              <div className="mb-4 flex justify-end">
                <button
                  onClick={() => setOpen(false)}
                  className="flex h-7 w-7 items-center justify-center rounded-md border border-border"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <ManualSidebar nav={nav} />
            </div>
          </div>
        )}

        <div className="min-w-0">{children}</div>
      </div>
    </div>
  )
}
