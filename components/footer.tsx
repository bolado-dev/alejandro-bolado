"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { ArrowUp, ArrowUpRight, Mail } from "@/components/icons/solar"
import { Reveal, StaggerReveal } from "@/components/animated/reveal"
import { GithubIcon } from "@/components/icons/github-icon"
import { LinkedinIcon } from "@/components/icons/linkedin-icon"
import { cn } from "@/lib/utils"

const EMAIL = "a.bolado.dev@gmail.com"

const socialLinks = [
  { label: "GitHub", href: "https://github.com/bolado-dev", Icon: GithubIcon },
  {
    label: "LinkedIn",
    href: "https://linkedin.com/in/alejandrobolado",
    Icon: LinkedinIcon,
  },
  { label: "Email", href: `mailto:${EMAIL}`, Icon: Mail },
]

const internalLinks = [
  { label: "Cybersec", href: "/cybersec" },
  { label: "Sobre mí", href: "/sobre-mi" },
]

function LocalClock() {
  const [mounted, setMounted] = useState(false)
  const [time, setTime] = useState("")

  useEffect(() => {
    setMounted(true)

    const update = () => {
      setTime(
        new Date().toLocaleTimeString("es-ES", {
          timeZone: "Europe/Madrid",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        }),
      )
    }

    update()
    const id = setInterval(update, 1000)
    return () => clearInterval(id)
  }, [])

  return (
    <span className="inline-flex items-center gap-2 tabular-nums">
      <span className="h-1.5 w-1.5 rounded-full bg-brand" aria-hidden="true" />
      Cantabria, España · {mounted ? time : "--:--:--"}
    </span>
  )
}

export function Footer() {
  const year = new Date().getFullYear()

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  return (
    <footer className="relative border-t border-border">
      {/* Bloque final a sangre */}
      <section id="contact" className="px-4 py-28 md:py-40">
        <div className="container mx-auto max-w-6xl">
          <Reveal y={20} duration={0.8}>
            <p className="mb-6 text-[11px] uppercase tracking-widest text-muted-foreground">
              ¿Hablamos?
            </p>
          </Reveal>

          <Reveal y={40} duration={1.1} delay={0.05}>
            <a href={`mailto:${EMAIL}`} className="group block w-fit">
              <span
                className={cn(
                  "block text-[clamp(3rem,12vw,9rem)] font-medium leading-[0.95] tracking-tight",
                  "transition-colors duration-500 group-hover:text-brand",
                )}
              >
                Hablemos
              </span>
            </a>
          </Reveal>

          <Reveal y={16} duration={0.9} delay={0.2}>
            <a
              href={`mailto:${EMAIL}`}
              className="group mt-8 inline-flex items-center gap-2 text-base text-muted-foreground transition-colors duration-300 hover:text-brand md:text-lg"
            >
              {EMAIL}
              <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1" />
            </a>
          </Reveal>
        </div>
      </section>

      {/* Fila de enlaces */}
      <div className="border-t border-border px-4 py-10">
        <div className="container mx-auto flex max-w-6xl flex-col gap-8 md:flex-row md:items-center md:justify-between">
          <StaggerReveal className="flex flex-wrap items-center gap-x-8 gap-y-3 text-xs uppercase tracking-widest text-muted-foreground">
            {socialLinks.map(({ label, href, Icon }) => (
              <a
                key={label}
                href={href}
                target={href.startsWith("http") ? "_blank" : undefined}
                rel={href.startsWith("http") ? "noreferrer" : undefined}
                className="inline-flex items-center gap-2 transition-colors duration-300 hover:text-brand"
              >
                <Icon className="h-3.5 w-3.5" />
                {label}
              </a>
            ))}
            {internalLinks.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="inline-flex items-center gap-2 transition-colors duration-300 hover:text-brand"
              >
                {item.label}
              </Link>
            ))}
          </StaggerReveal>

          <div className="flex items-center gap-6 text-xs uppercase tracking-widest text-muted-foreground">
            <LocalClock />
            <button
              type="button"
              onClick={scrollToTop}
              className="group inline-flex items-center gap-2 transition-colors duration-300 hover:text-brand"
            >
              Volver arriba
              <ArrowUp className="h-3.5 w-3.5 transition-transform duration-300 group-hover:-translate-y-1" />
            </button>
          </div>
        </div>
      </div>

      {/* Pie */}
      <div className="border-t border-border px-4 py-6 pb-24 md:pb-6">
        <div className="container mx-auto flex max-w-6xl flex-col gap-2 text-[11px] text-muted-foreground md:flex-row md:items-center md:justify-between">
          <span>© {year} Alejandro Bolado</span>
          <span>Diseñado y construido con Next.js, Tailwind &amp; GSAP</span>
        </div>
      </div>
    </footer>
  )
}
