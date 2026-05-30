"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useTheme } from "next-themes"
import { FileText, BookOpen, ArrowLeft, Menu, X, Search } from "lucide-react"
import { cn } from "@/lib/utils"
import { ModeToggle } from "@/components/mode-toggle"

const NAV = [
  { href: "/cybersec/writeups", label: "Writeups", icon: FileText },
  { href: "/cybersec/manual", label: "Manual", icon: BookOpen },
]

export function CyberHeader() {
  const pathname = usePathname()
  const { theme } = useTheme()
  const [mounted, setMounted] = React.useState(false)
  const [open, setOpen] = React.useState(false)

  React.useEffect(() => setMounted(true), [])

  return (
    <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-5xl items-center justify-between gap-4 px-4">
        <Link href="/cybersec" className="flex items-center gap-3">
          {mounted && (
            <img
              src={theme === "dark" ? "/Logo ICON-02.png" : "/Logo ICON-01.png"}
              alt="Logo"
              className="h-7 w-auto object-contain"
            />
          )}
          <span className="text-[11px] tracking-widest text-muted-foreground uppercase">
            Ciberseguridad
          </span>
        </Link>

        <nav className="hidden items-center gap-1 sm:flex">
          {NAV.map((item) => {
            const active = pathname.startsWith(item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-2 rounded-full px-4 py-1.5 text-sm transition-colors",
                  active
                    ? "bg-secondary text-foreground"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                )}
              >
                <item.icon className="h-3.5 w-3.5" />
                {item.label}
              </Link>
            )
          })}
        </nav>

        <div className="flex items-center gap-2">
          <button
            onClick={() =>
              window.dispatchEvent(new Event("open-command-palette"))
            }
            className="hidden items-center gap-2 rounded-full border px-3 py-1.5 text-[13px] text-muted-foreground transition-colors hover:text-foreground md:flex"
            aria-label="Buscar"
          >
            <Search className="h-3.5 w-3.5" />
            <span>Buscar</span>
            <kbd className="rounded border px-1.5 py-0.5 text-[10px]">⌘K</kbd>
          </button>
          <Link
            href="/"
            className="hidden items-center gap-1.5 rounded-full border px-4 py-1.5 text-[13px] text-muted-foreground transition-colors hover:text-foreground sm:flex"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Portfolio
          </Link>
          <ModeToggle />
          <button
            onClick={() => setOpen((v) => !v)}
            className="flex h-9 w-9 items-center justify-center rounded-full border sm:hidden"
            aria-label="Menú"
          >
            {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="border-t px-4 py-3 sm:hidden">
          <div className="flex flex-col gap-1">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-secondary hover:text-foreground"
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            ))}
            <Link
              href="/"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-secondary hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" />
              Volver al Portfolio
            </Link>
          </div>
        </div>
      )}
    </header>
  )
}
