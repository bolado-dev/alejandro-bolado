"use client"

import { useEffect, useState, type ReactNode } from "react"
import { useTheme } from "next-themes"
import { motion, useReducedMotion } from "framer-motion"
import { ArrowUp, ArrowUpRight, Mail } from "@/components/icons/solar"
import { GithubIcon } from "@/components/icons/github-icon"
import { LinkedinIcon } from "@/components/icons/linkedin-icon"

const EMAIL = "a.bolado.dev@gmail.com"

const links = [
  { title: "Sobre mí", href: "/#about" },
  { title: "Proyectos", href: "/#projects" },
  { title: "Cybersec", href: "/cybersec" },
  { title: "Visuals", href: "/visuals" },
  { title: "GitHub", href: "https://github.com/bolado-dev", Icon: GithubIcon },
  {
    title: "LinkedIn",
    href: "https://linkedin.com/in/alejandrobolado",
    Icon: LinkedinIcon,
  },
]

function AnimatedContainer({
  delay = 0.1,
  children,
  className,
}: {
  delay?: number
  children: ReactNode
  className?: string
}) {
  const reduce = useReducedMotion()

  if (reduce) {
    return <div className={className}>{children}</div>
  }

  return (
    <motion.div
      initial={{ filter: "blur(4px)", y: -8, opacity: 0 }}
      whileInView={{ filter: "blur(0px)", y: 0, opacity: 1 }}
      viewport={{ once: false, amount: 0.4 }}
      transition={{ delay, duration: 0.7 }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

export function Footer() {
  const [year, setYear] = useState(2025)
  const { theme } = useTheme()
  const [mounted, setMounted] = useState(false)
  useEffect(() => {
    setYear(new Date().getFullYear())
    setMounted(true)
  }, [])

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" })

  return (
    <footer
      id="contact"
      className="relative h-[600px] w-full"
      style={{ clipPath: "polygon(0% 0, 100% 0%, 100% 100%, 0 100%)" }}
    >
      <div className="fixed bottom-0 h-[600px] w-full">
        <div className="sticky top-[calc(100vh-600px)] h-full overflow-y-auto">
          <div className="flex size-full flex-col items-center justify-between gap-10 border-t px-4 py-12 text-center">
            <AnimatedContainer className="flex flex-col items-center gap-5">
              {mounted && (
                <img
                  src={theme === "dark" ? "/Logo ICON-02.png" : "/Logo ICON-01.png"}
                  alt="Alejandro Bolado"
                  className="h-9 w-auto object-contain"
                />
              )}
              <p className="max-w-md text-base text-muted-foreground">
                Desarrollo full-stack, ciberseguridad y fotografía. Entre el
                código y la cámara.
              </p>
              <a
                href={`mailto:${EMAIL}`}
                data-cursor-label="Escríbeme"
                className="group inline-flex items-center gap-2 text-lg font-medium text-foreground transition-colors hover:text-brand"
              >
                {EMAIL}
                <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </a>
            </AnimatedContainer>

            <AnimatedContainer delay={0.15}>
              <nav className="flex flex-wrap items-center justify-center gap-x-8 gap-y-4 text-base text-muted-foreground">
                {links.map(({ title, href, Icon }) => (
                  <a
                    key={title}
                    href={href}
                    target={href.startsWith("http") ? "_blank" : undefined}
                    rel={href.startsWith("http") ? "noreferrer" : undefined}
                    data-cursor-label={title}
                    className="inline-flex items-center gap-2 transition-colors hover:text-foreground"
                  >
                    {Icon && <Icon className="h-4 w-4" />}
                    {title}
                  </a>
                ))}
              </nav>
            </AnimatedContainer>

            <div className="flex w-full max-w-md flex-col items-center justify-between gap-3 border-t pt-6 text-sm text-muted-foreground sm:flex-row">
              <span>© {year} Alejandro Bolado</span>
              <button
                type="button"
                onClick={scrollToTop}
                className="group inline-flex items-center gap-1.5 transition-colors hover:text-foreground"
              >
                Volver arriba
                <ArrowUp className="h-4 w-4 transition-transform group-hover:-translate-y-0.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
