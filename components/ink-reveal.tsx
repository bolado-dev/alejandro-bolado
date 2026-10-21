"use client"

import { useEffect, useRef, useState } from "react"

import { cn } from "@/lib/utils"

/**
 * Entrada al entrar en pantalla: opacidad y un desplazamiento corto, con una
 * transición de 0.5s ease-out. Es la misma técnica que la referencia
 * (IntersectionObserver + transiciones CSS, sin GSAP ni framer-motion), así
 * que no añade dependencias ni hilo principal.
 *
 * Se revela una sola vez. `prefers-reduced-motion` lo desactiva desde CSS, y
 * sin JavaScript el <noscript> de app/layout.tsx deja todo visible: el estado
 * inicial oculto vive en CSS, así que sin esa salida el contenido nunca
 * aparecería.
 */

type Props = {
  children: React.ReactNode
  className?: string
  /** Retraso en ms. */
  delay?: number
  /** Margen del observer; negativo retrasa el disparo. */
  rootMargin?: string
  as?: "div" | "section" | "ul" | "li" | "article"
}

export function InkReveal({
  children,
  className,
  delay = 0,
  rootMargin = "0px 0px -12% 0px",
  as: Tag = "div",
}: Props) {
  const ref = useRef<HTMLElement | null>(null)
  const [shown, setShown] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (typeof IntersectionObserver === "undefined") {
      // Fuera del camino síncrono del efecto. No vale resolverlo con estado
      // inicial: en el servidor IntersectionObserver también es undefined, así
      // que el primer render no coincidiría con el del cliente.
      const t = window.setTimeout(() => setShown(true), 0)
      return () => window.clearTimeout(t)
    }

    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setShown(true)
          io.disconnect()
        }
      },
      { rootMargin, threshold: 0.01 },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [rootMargin])

  return (
    <Tag
      ref={ref as never}
      className={cn("ink-reveal", className)}
      data-shown={shown ? "true" : "false"}
      style={delay ? ({ "--reveal-delay": `${delay}ms` } as React.CSSProperties) : undefined}
    >
      {children}
    </Tag>
  )
}

/**
 * Igual, pero escalona a sus hijos directos: cada uno entra `step` ms después
 * del anterior. Se usa en rejillas y listas.
 */
export function InkStagger({
  children,
  className,
  step = 70,
  delay = 0,
  as: Tag = "div",
}: Omit<Props, "rootMargin"> & { step?: number }) {
  const ref = useRef<HTMLElement | null>(null)
  const [shown, setShown] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (typeof IntersectionObserver === "undefined") {
      // Fuera del camino síncrono del efecto. No vale resolverlo con estado
      // inicial: en el servidor IntersectionObserver también es undefined, así
      // que el primer render no coincidiría con el del cliente.
      const t = window.setTimeout(() => setShown(true), 0)
      return () => window.clearTimeout(t)
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setShown(true)
          io.disconnect()
        }
      },
      { rootMargin: "0px 0px -10% 0px", threshold: 0.01 },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])

  return (
    <Tag
      ref={ref as never}
      className={cn("ink-stagger", className)}
      data-shown={shown ? "true" : "false"}
      style={
        {
          "--stagger-step": `${step}ms`,
          "--reveal-delay": `${delay}ms`,
        } as React.CSSProperties
      }
    >
      {children}
    </Tag>
  )
}
