"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useTheme } from "next-themes"
import { AnimatePresence, motion } from "framer-motion"
import { Menu, X } from "@/components/icons/solar"
import { ModeToggle } from "@/components/mode-toggle"
import { cn } from "@/lib/utils"

const NAV = [
  { href: "/#about", label: "Sobre mí" },
  { href: "/#projects", label: "Proyectos" },
  { href: "/cybersec", label: "Cybersec" },
  { href: "/visuals", label: "Visuals" },
  { href: "/#contact", label: "Contacto" },
]

const HOME_SECTION_IDS = NAV.filter((item) => item.href.startsWith("/#")).map(
  (item) => item.href.slice(2)
)

export function Navbar() {
  const pathname = usePathname()
  const { theme } = useTheme()
  const [mounted, setMounted] = React.useState(false)
  const [scrolled, setScrolled] = React.useState(false)
  const [open, setOpen] = React.useState(false)
  const [activeSection, setActiveSection] = React.useState("")

  React.useEffect(() => setMounted(true), [])

  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  React.useEffect(() => {
    if (pathname !== "/") {
      setActiveSection("")
      return
    }

    const els = HOME_SECTION_IDS.map((id) => document.getElementById(id)).filter(
      (el): el is HTMLElement => el !== null
    )
    if (!els.length) return

    const visible = new Set<string>()
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) visible.add(entry.target.id)
          else visible.delete(entry.target.id)
        }
        const current = HOME_SECTION_IDS.find((id) => visible.has(id))
        setActiveSection(current ?? "")
      },
      { rootMargin: "-45% 0px -45% 0px", threshold: 0 }
    )

    els.forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [pathname])

  const isActive = (href: string) => {
    if (href.startsWith("/#")) return pathname === "/" && activeSection === href.slice(2)
    return pathname === href || pathname.startsWith(`${href}/`)
  }

  // Cybersec y Visuals tienen su propia cabecera
  if (pathname?.startsWith("/cybersec") || pathname?.startsWith("/visuals")) return null

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 flex flex-col items-center transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]",
        scrolled ? "px-3 sm:px-4" : "px-0"
      )}
    >
      <div
        className={cn(
          "flex w-full items-center justify-between gap-2 border backdrop-blur-xl transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] sm:gap-4",
          scrolled
            ? "mt-3 h-14 max-w-4xl rounded-2xl border-border/70 bg-background/90 px-3 shadow-lg shadow-zinc-900/5 sm:px-4 md:rounded-full"
            : "mt-0 h-16 max-w-5xl rounded-none border-transparent bg-background/80 px-4 shadow-none"
        )}
      >
        <Link href="/" data-cursor-label="Inicio" className="flex items-center gap-3.5">
          {mounted && (
            <img
              src={theme === "dark" ? "/Logo ICON-02.png" : "/Logo ICON-01.png"}
              alt="Alejandro Bolado"
              className="h-5 w-auto object-contain"
            />
          )}
          <span className="text-sm font-semibold tracking-tight">Alejandro Bolado</span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "rounded-full px-4 py-1.5 text-sm transition-colors",
                isActive(item.href)
                  ? "bg-secondary text-foreground"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <ModeToggle />
          <button
            onClick={() => setOpen((v) => !v)}
            className="flex h-9 w-9 items-center justify-center rounded-full border md:hidden"
            aria-label="Menú"
          >
            {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="mt-2 w-full max-w-4xl overflow-hidden rounded-2xl border border-border/70 bg-background/95 backdrop-blur-xl md:hidden"
          >
            <div className="flex flex-col gap-1 px-4 py-3">
              {NAV.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "rounded-lg px-3 py-2.5 text-sm transition-colors",
                    isActive(item.href)
                      ? "bg-secondary text-foreground"
                      : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                  )}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
