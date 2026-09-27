"use client"

import {
  AnimatePresence,
  motion,
  useMotionValue,
  useSpring,
  useReducedMotion,
} from "framer-motion"
import { useEffect, useState } from "react"

// Cursor personalizado global: un punto que sigue al puntero al instante, con
// mezcla "difference" para invertir el color del fondo, y una etiqueta
// contextual leída de `data-cursor-label`. Se activa solo en punteros finos y
// respeta prefers-reduced-motion.
export function CustomCursor() {
  const reduce = useReducedMotion()
  const [enabled, setEnabled] = useState(false)
  const [hovering, setHovering] = useState(false)
  const [label, setLabel] = useState<string | null>(null)

  const x = useMotionValue(-100)
  const y = useMotionValue(-100)
  const labelX = useSpring(x, { stiffness: 350, damping: 28, mass: 0.5 })
  const labelY = useSpring(y, { stiffness: 350, damping: 28, mass: 0.5 })

  useEffect(() => {
    if (reduce) return
    if (!window.matchMedia("(pointer: fine)").matches) return

    // Detección de capacidad única en cliente (puntero fino): activa el cursor.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setEnabled(true)
    const root = document.documentElement
    root.classList.add("has-custom-cursor")

    const move = (e: MouseEvent) => {
      x.set(e.clientX)
      y.set(e.clientY)
    }
    const over = (e: MouseEvent) => {
      const el = e.target as HTMLElement | null
      setHovering(
        !!el?.closest?.(
          "a, button, [role='button'], input, textarea, label, [data-cursor]"
        )
      )
      const labeled = el?.closest?.("[data-cursor-label]") as HTMLElement | null
      setLabel(labeled?.getAttribute("data-cursor-label") ?? null)
    }

    window.addEventListener("mousemove", move, { passive: true })
    window.addEventListener("mouseover", over, { passive: true })
    return () => {
      window.removeEventListener("mousemove", move)
      window.removeEventListener("mouseover", over)
      root.classList.remove("has-custom-cursor")
    }
  }, [reduce, x, y])

  if (!enabled) return null

  return (
    <>
      {/* Punto: sigue al puntero al instante, con mezcla "difference" para
          que se invierta contra la página en cualquier fondo. */}
      <div
        className="pointer-events-none fixed inset-0 z-[10000]"
        style={{ mixBlendMode: "difference" }}
        aria-hidden
      >
        <motion.div
          style={{ x, y, willChange: "transform" }}
          className="absolute top-0 left-0"
        >
          <motion.div
            animate={{
              scale: label ? 0 : hovering ? 2.6 : 1,
              opacity: label ? 0 : 1,
            }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
            className="-mt-1 -ml-1 h-2 w-2 rounded-full bg-white"
          />
        </motion.div>
      </div>

      {/* Etiqueta contextual (usa --brand: se adapta a cada sección) */}
      <motion.div
        style={{ x: labelX, y: labelY }}
        className="pointer-events-none fixed top-0 left-0 z-[10000]"
        aria-hidden
      >
        <AnimatePresence>
          {label && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 22 }}
              className="-translate-x-1/2 -translate-y-1/2 rounded-full bg-brand px-4 py-2 text-xs font-medium whitespace-nowrap text-brand-foreground"
            >
              {label}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </>
  )
}
