"use client"

import * as React from "react"
import Link from "next/link"
import { Menu, X, ArrowUpRight } from "@/components/icons/solar"
import { cn } from "@/lib/utils"
import { Magnetic } from "@/components/animated/magnetic"

const NAV = [
  { href: "#portfolio", label: "Portfolio" },
  { href: "#servicios", label: "Servicios" },
  { href: "#sobre", label: "Sobre" },
]

function scrollTo(href: string) {
  const el = document.getElementById(href.replace("#", ""))
  if (el) el.scrollIntoView({ behavior: "smooth" })
}

export function VisualsHeader() {
  const [scrolled, setScrolled] = React.useState(false)
  const [open, setOpen] = React.useState(false)

  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  return (
    <div className="fixed inset-x-0 top-4 z-50 px-4">
      <nav
        className={cn(
          "mx-auto flex max-w-4xl items-center justify-between gap-4 rounded-full border border-border/70 bg-background/70 py-2 pr-2 pl-5 backdrop-blur-md transition-all duration-500",
          scrolled ? "shadow-lg shadow-zinc-900/5" : "shadow-sm"
        )}
      >
        <Magnetic>
          <button
            onClick={() => scrollTo("#top")}
            className="flex items-center"
            aria-label="Bolado Visuals"
            data-cursor-label="Inicio"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/visuals/logo-dark.svg"
              alt="Bolado Visuals"
              className="h-5 w-auto"
            />
          </button>
        </Magnetic>

        <div className="hidden items-center gap-6 md:flex">
          {NAV.map((item) => (
            <button
              key={item.href}
              onClick={() => scrollTo(item.href)}
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              {item.label}
            </button>
          ))}
          <Link
            href="/"
            className="inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            Alejandro Bolado
            <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="flex items-center gap-2">
          <Magnetic className="hidden sm:inline-flex">
            <button
              onClick={() => scrollTo("#contacto")}
              data-cursor-label="Hablemos"
              className="rounded-full bg-brand px-5 py-2 text-sm font-medium text-brand-foreground transition-colors hover:opacity-90"
            >
              Hablemos
            </button>
          </Magnetic>
          <button
            onClick={() => setOpen((v) => !v)}
            className="flex h-9 w-9 items-center justify-center rounded-full border md:hidden"
            aria-label="Menú"
          >
            {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </nav>

      {open && (
        <div className="mx-auto mt-2 max-w-4xl rounded-3xl border border-border/70 bg-background/95 p-3 backdrop-blur-md md:hidden">
          <div className="flex flex-col">
            {NAV.map((item) => (
              <button
                key={item.href}
                onClick={() => {
                  scrollTo(item.href)
                  setOpen(false)
                }}
                className="rounded-2xl px-4 py-3 text-left text-sm text-muted-foreground hover:bg-secondary hover:text-foreground"
              >
                {item.label}
              </button>
            ))}
            <button
              onClick={() => {
                scrollTo("#contacto")
                setOpen(false)
              }}
              className="rounded-2xl px-4 py-3 text-left text-sm text-muted-foreground hover:bg-secondary hover:text-foreground"
            >
              Contacto
            </button>
            <Link
              href="/"
              onClick={() => setOpen(false)}
              className="flex items-center gap-1.5 rounded-2xl px-4 py-3 text-sm text-muted-foreground hover:bg-secondary hover:text-foreground"
            >
              Alejandro Bolado
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
