"use client"

import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"

interface BottomBlurProps {
  className?: string
  size?: "sm" | "md" | "lg" | "xl"
  /** Radio del desenfoque en el borde inferior, en px. Por defecto `16`. */
  strength?: number
  /** Nº de capas del degradado de desenfoque. Más capas = más suave. Por defecto `6`. */
  layers?: number
  /**
   * Distancia al final del documento, en px, a partir de la cual se retira.
   * Conviene que cubra el alto del pie para no emborronarlo. Por defecto `360`.
   */
  hideWithin?: number
}

/**
 * Franja de desenfoque fija al pie de la ventana: el contenido se difumina al
 * salir por abajo, sugiriendo que el scroll continúa.
 *
 * Es desenfoque puro, sin degradado de color — lo que hay detrás se sigue
 * viendo, solo que emborronado. Se retira al llegar al final del documento,
 * donde ya no queda scroll que sugerir y además estorbaría al pie.
 *
 * La progresión es un desenfoque progresivo por capas, no una sola capa con
 * máscara: una rampa lineal de alfa sobre un `backdrop-filter` se percibe
 * como un borde, por nítido que sea el degradado. Aquí cada capa desenfoca el
 * doble que la anterior y queda confinada a una banda más baja, así que al
 * apilarse el radio efectivo crece de forma geométrica hacia el borde
 * inferior y no hay ningún corte perceptible.
 */
export function BottomBlur({
  className,
  size = "md",
  strength = 16,
  layers = 6,
  hideWithin = 360,
}: BottomBlurProps) {
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    let ticking = false

    const update = () => {
      ticking = false
      const { scrollHeight, clientHeight } = document.documentElement
      const left = scrollHeight - (window.scrollY + clientHeight)
      setVisible(left > hideWithin)
    }

    const onScroll = () => {
      if (ticking) return
      ticking = true
      requestAnimationFrame(update)
    }

    window.addEventListener("scroll", onScroll, { passive: true })
    window.addEventListener("resize", onScroll, { passive: true })
    update()

    return () => {
      window.removeEventListener("scroll", onScroll)
      window.removeEventListener("resize", onScroll)
    }
  }, [hideWithin])

  const heights = {
    sm: "h-16",
    md: "h-24",
    lg: "h-32",
    xl: "h-44",
  }

  const band = 100 / layers

  return (
    <div
      aria-hidden
      className={cn(
        "pointer-events-none fixed inset-x-0 bottom-0 z-[100] transition-opacity duration-300",
        heights[size],
        visible ? "opacity-100" : "opacity-0",
        className,
      )}
    >
      {Array.from({ length: layers }, (_, i) => {
        // i = 0 es la capa menos borrosa y la que más banda cubre.
        const radius = (strength * 2 ** i) / 2 ** (layers - 1)
        const solid = (layers - 1 - i) * band
        const fade = Math.min(100, solid + band * 1.8)
        const mask = `linear-gradient(to top, black 0%, black ${solid}%, transparent ${fade}%)`
        return (
          <div
            key={i}
            className="absolute inset-0"
            style={{
              backdropFilter: `blur(${radius.toFixed(2)}px)`,
              WebkitBackdropFilter: `blur(${radius.toFixed(2)}px)`,
              maskImage: mask,
              WebkitMaskImage: mask,
            }}
          />
        )
      })}
    </div>
  )
}
