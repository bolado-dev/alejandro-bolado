"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { AnimatePresence, motion, type Variants } from "framer-motion"
import { ArrowRight } from "@/components/icons/solar"
import { Button } from "@/components/ui/button"
import { useTheme } from "next-themes"

// Las cuatro disciplinas, todas con el mismo peso visual: ninguna prevalece
// sobre las demás. Se alternan en bucle lento sobre el mismo rótulo.
const DISCIPLINES = ["Desarrollo full-stack", "Ciberseguridad", "Fotografía", "Filmmaking"]

const containerVariants: Variants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.12, delayChildren: 0.15 },
  },
}

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 22 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.9, ease: [0.22, 1, 0.36, 1] },
  },
}

const HEADLINE_CLASS =
  "block text-[clamp(2.75rem,8vw,6rem)] font-medium leading-[1.02] tracking-tighter text-foreground"

function RotatingHeadline({ reduced }: { reduced: boolean }) {
  const [index, setIndex] = useState(0)

  useEffect(() => {
    if (reduced) return
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % DISCIPLINES.length)
    }, 2600)
    return () => clearInterval(id)
  }, [reduced])

  return (
    <div>
      <p className="mb-2 text-[11px] uppercase tracking-widest text-muted-foreground">
        <span className="mr-2 inline-block h-2 w-2 translate-y-px rounded-full bg-brand" />
        Perfil técnico-creativo
      </p>

      {reduced ? (
        <span className={HEADLINE_CLASS}>{DISCIPLINES[index]}</span>
      ) : (
        <span className="block overflow-hidden pb-[0.12em]">
          <AnimatePresence mode="wait">
            <motion.span
              key={DISCIPLINES[index]}
              initial={{ y: "110%" }}
              animate={{ y: "0%" }}
              exit={{ y: "-110%" }}
              transition={{ duration: 0.72, ease: [0.16, 1, 0.3, 1] }}
              className={HEADLINE_CLASS}
            >
              {DISCIPLINES[index]}
            </motion.span>
          </AnimatePresence>
        </span>
      )}
    </div>
  )
}

export function Hero() {
  const [mounted, setMounted] = useState(false)
  const [reducedMotion, setReducedMotion] = useState(false)
  const { resolvedTheme } = useTheme()

  useEffect(() => {
    setMounted(true)
    setReducedMotion(window.matchMedia("(prefers-reduced-motion: reduce)").matches)
  }, [])

  return (
    <section className="relative flex min-h-svh w-full items-center overflow-hidden px-4">
      {/* Fondo full-bleed optimizado */}
      <div className="absolute inset-0 z-0 p-2 md:p-6">
        <div className="relative h-full w-full overflow-hidden rounded-2xl border">
          <Image
            src="/hero.webp"
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-background/80 via-background/30 to-background/5" />
          <div className="absolute inset-0 bg-gradient-to-t from-background/55 via-transparent to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-b from-background/20 via-transparent to-transparent" />
        </div>
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="relative z-20 mx-auto w-full max-w-6xl"
      >
        <div className="flex max-w-xl flex-col items-start gap-8 text-left">
          {/* Lockup de marca: logo + nombre, pequeños y en la misma línea */}
          <motion.div
            variants={itemVariants}
            className="flex items-center gap-2.5"
          >
            {mounted && (
              <img
                src={resolvedTheme === "dark" ? "/Logo ICON-02.png" : "/Logo ICON-01.png"}
                alt=""
                className="h-8 w-auto object-contain md:h-9"
              />
            )}
            <h1 className="text-lg font-medium tracking-tight md:text-xl">
              Alejandro Bolado
            </h1>
          </motion.div>

          {/* Titular protagonista: las disciplinas, en grande y animadas */}
          <motion.div variants={itemVariants}>
            {mounted ? (
              <RotatingHeadline reduced={reducedMotion} />
            ) : (
              <div>
                <p className="mb-2 text-[11px] uppercase tracking-widest text-muted-foreground">
                  <span className="mr-2 inline-block h-2 w-2 translate-y-px rounded-full bg-brand" />
                  Perfil técnico-creativo
                </p>
                <span className={HEADLINE_CLASS}>{DISCIPLINES[0]}</span>
              </div>
            )}
          </motion.div>

          <motion.div
            variants={itemVariants}
            className="flex items-center gap-4 text-[11px] uppercase tracking-widest text-muted-foreground"
          >
            <span>Cantabria, España</span>
            <span className="h-3 w-px bg-border" />
            <span className="inline-flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-brand" />
              Disponible
            </span>
          </motion.div>

          <motion.div variants={itemVariants} className="mt-1 flex items-center gap-6">
            <Button asChild size="lg" className="h-12 rounded-full px-7 font-medium">
              <a href="#disciplines">
                Ver mi trabajo
                <ArrowRight className="ml-2 h-4 w-4" />
              </a>
            </Button>

            <a
              href="#contact"
              className="group inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              Hablemos
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
            </a>
          </motion.div>
        </div>
      </motion.div>

      {/* Indicador de scroll */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.1, duration: 0.8 }}
        className="absolute bottom-8 left-1/2 z-20 -translate-x-1/2"
      >
        <div className="flex h-9 w-5 items-start justify-center rounded-full border border-foreground/30 p-1.5">
          <motion.span
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
            className="h-1.5 w-1.5 rounded-full bg-foreground/60"
          />
        </div>
      </motion.div>
    </section>
  )
}
