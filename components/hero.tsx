"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { motion } from "framer-motion"
import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useTheme } from "next-themes"

export function Hero() {
  const [mounted, setMounted] = useState(false)
  const { resolvedTheme } = useTheme()

  useEffect(() => {
    setMounted(true)
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
          <div className="absolute inset-0 bg-gradient-to-r from-background/70 via-background/25 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-background/40 to-transparent" />
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-20 mx-auto w-full max-w-6xl"
      >
        <div className="flex max-w-xl flex-col items-start gap-7 text-left">
          <div className="h-14">
            {mounted && (
              <img
                src={resolvedTheme === "dark" ? "/Logo ICON-02.png" : "/Logo ICON-01.png"}
                alt="Alejandro Bolado"
                className="h-14 w-auto object-contain"
              />
            )}
          </div>

          <div className="space-y-4">
            <h1 className="text-5xl font-semibold tracking-tighter md:text-6xl lg:text-7xl">
              Alejandro
              <br />
              Bolado
            </h1>

            <p className="text-base text-muted-foreground md:text-lg">
              Full-stack · Ciberseguridad · Fotografía · Filmmaking
            </p>
          </div>

          <div className="mt-1 flex items-center gap-6">
            <Button
              asChild
              size="lg"
              className="h-12 rounded-full px-7 font-medium"
            >
              <a href="#disciplines">
                Ver mi trabajo
                <ArrowRight className="ml-2 h-4 w-4" />
              </a>
            </Button>

            <a
              href="#contact"
              className="group inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              Contacto
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
            </a>
          </div>
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
