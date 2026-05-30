"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useTheme } from "next-themes"

export function Hero() {
  const [mounted, setMounted] = useState(false)
  const { theme } = useTheme()

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <section className="relative flex min-h-screen w-full items-center overflow-hidden px-4">
      <div className="absolute inset-0 z-0 flex items-center justify-center p-2 md:p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          className="relative h-full w-full overflow-hidden rounded-2xl border"
        >
          <img
            src="/hero.png"
            alt="Hero background"
            className="h-full w-full object-cover"
          />
          {/* Degradado muy suave a la izquierda para un toque de legibilidad,
              dejando ver la imagen y el portátil de la derecha */}
          <div className="absolute inset-0 z-10 bg-gradient-to-r from-background/45 via-background/10 to-transparent" />
        </motion.div>
      </div>

      <div className="relative z-20 mx-auto w-full max-w-6xl">
        <div className="flex max-w-xl flex-col items-start space-y-6 text-left">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            {mounted && theme && (
              <img
                src={theme === "dark" ? "/Logo ICON-02.png" : "/Logo ICON-01.png"}
                alt="Logo"
                className="h-20 w-auto object-contain"
              />
            )}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="space-y-4"
          >
            <h1 className="text-4xl font-bold tracking-tighter md:text-5xl lg:text-6xl">
              Alejandro Bolado
            </h1>

            <p className="max-w-md text-lg font-light md:text-xl">
              Entusiasta de la ciberseguridad · Hacking ético & CTFs
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.7 }}
            className="flex flex-col items-start gap-4 sm:flex-row"
          >
            <Button
              asChild
              size="lg"
              className="h-12 w-full rounded-full px-6 font-medium sm:w-auto"
            >
              <a href="/cybersec">
                Ver writeups
                <ArrowRight className="ml-2 h-4 w-4" />
              </a>
            </Button>

            <Button
              asChild
              variant="outline"
              size="lg"
              className="h-12 w-full rounded-full px-6 sm:w-auto"
            >
              <a href="#contact">Contacto</a>
            </Button>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
