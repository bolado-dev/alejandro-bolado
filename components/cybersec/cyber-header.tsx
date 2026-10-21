"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"

import {
  ArrowLeft,
  BookOpen,
  FileText,
  Menu,
  Search,
  Server,
  X,
} from "@/components/icons/solar"
import { cn } from "@/lib/utils"

const NAV = [
  { href: "/cybersec/maquinas", label: "Máquinas", icon: Server },
  { href: "/cybersec/writeups", label: "Writeups", icon: FileText },
  { href: "/cybersec/manual", label: "Manual", icon: BookOpen },
]

/**
 * Cabecera de la sección. Alineada a los raíles de 1008px del portfolio, con
 * las mismas píldoras y el mismo filete punteado.
 *
 * Sin selector de tema: la superficie ink es solo oscura, así que el logo es
 * siempre la variante blanca y el toggle no tendría nada que alternar.
 */
export function CyberHeader() {
  const pathname = usePathname()
  const [open, setOpen] = React.useState(false)

  return (
    <header className="sticky top-0 z-50 border-b border-[var(--ink-line)] bg-[var(--ink-bg)]">
      <div className="mx-auto flex h-16 w-full max-w-[1008px] items-center justify-between gap-4 px-8">
        <Link
          href="/cybersec"
          data-cursor-label="Cybersec"
          className="flex items-center gap-3"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/Logo ICON-02.png"
            alt=""
            aria-hidden
            className="h-5 w-auto object-contain"
          />
          <span className="font-display text-lg italic text-[var(--ink-fg-strong)]">
            Cybersec
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
                  "flex items-center gap-2 rounded-full px-3.5 py-1.5 text-[13px] transition-colors",
                  active
                    ? "bg-[var(--ink-surface-hi)] text-[var(--ink-fg-strong)]"
                    : "text-[var(--ink-fg-dim)] hover:bg-[var(--ink-surface)] hover:text-[var(--ink-fg-strong)]",
                )}
              >
                <item.icon className="size-3.5" />
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
            className="hidden items-center gap-2 rounded-full border border-[var(--ink-line-strong)] px-3 py-1.5 text-[13px] text-[var(--ink-fg-dim)] transition-colors hover:bg-[var(--ink-surface)] hover:text-[var(--ink-fg-strong)] md:flex"
            aria-label="Buscar"
          >
            <Search className="size-3.5" />
            <span>Buscar</span>
            <kbd className="rounded-full border border-[var(--ink-line-strong)] px-1.5 py-0.5 text-[10px]">
              ⌘K
            </kbd>
          </button>
          <Link
            href="/"
            data-cursor-label="Portfolio"
            className="hidden items-center gap-1.5 rounded-full border border-[var(--ink-line-strong)] px-3.5 py-1.5 text-[13px] text-[var(--ink-fg-dim)] transition-colors hover:bg-[var(--ink-surface)] hover:text-[var(--ink-fg-strong)] sm:flex"
          >
            <ArrowLeft className="size-3.5" />
            Portfolio
          </Link>
          <button
            onClick={() => setOpen((v) => !v)}
            className="flex size-9 items-center justify-center rounded-full border border-[var(--ink-line-strong)] sm:hidden"
            aria-label="Menú"
            aria-expanded={open}
          >
            {open ? <X className="size-4" /> : <Menu className="size-4" />}
          </button>
        </div>
      </div>

      {open ? (
        <div className="border-t border-[var(--ink-line)] px-8 py-3 sm:hidden">
          <div className="flex flex-col gap-1">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="flex items-center gap-2 rounded-full px-3 py-2 text-[14px] text-[var(--ink-fg-dim)] hover:bg-[var(--ink-surface)] hover:text-[var(--ink-fg-strong)]"
              >
                <item.icon className="size-4" />
                {item.label}
              </Link>
            ))}
            <Link
              href="/"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2 rounded-full px-3 py-2 text-[14px] text-[var(--ink-fg-dim)] hover:bg-[var(--ink-surface)] hover:text-[var(--ink-fg-strong)]"
            >
              <ArrowLeft className="size-4" />
              Volver al portfolio
            </Link>
          </div>
        </div>
      ) : null}
    </header>
  )
}
