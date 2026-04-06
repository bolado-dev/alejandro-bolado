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
    <section className="relative flex min-h-screen w-full items-center justify-center px-4">
      <div className="absolute inset-0 z-0 flex items-center justify-center p-2 md:p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          className="relative h-full w-full overflow-hidden rounded-2xl border"
        >
          <div className="absolute inset-0 z-10 bg-background/40" />
          <img
            src="/bg.jpg"
            alt="Hero background"
            className="h-full w-full object-cover"
          />
        </motion.div>
      </div>

      <div className="relative z-20 mx-auto flex flex-col items-center space-y-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
        >
          {mounted && theme && (
            <img
              src={theme === "dark" ? "/Logo ICON-02.png" : "/Logo ICON-01.png"}
              alt="Logo"
              className="mx-auto h-24 w-auto object-contain"
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

          <p className="mx-auto max-w-xl text-lg font-light md:text-xl">
            Full Stack Developer · Building amazing experiences
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.7 }}
          className="flex flex-col items-center justify-center gap-4 sm:flex-row"
        >
          <Button
            asChild
            size="lg"
            className="h-12 w-full rounded-full px-6 font-medium sm:w-auto"
          >
            <a href="#projects">
              View Projects
              <ArrowRight className="ml-2 h-4 w-4" />
            </a>
          </Button>

          <Button
            asChild
            variant="outline"
            size="lg"
            className="h-12 w-full rounded-full px-6 sm:w-auto"
          >
            <a href="#contact">Contact Me</a>
          </Button>
        </motion.div>
      </div>
    </section>
  )
}
