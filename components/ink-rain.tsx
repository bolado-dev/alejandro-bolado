"use client"

import { useEffect, useRef } from "react"

import { cn } from "@/lib/utils"

/**
 * Lluvia de caracteres ASCII de fondo, muy tenue.
 *
 * El lienzo es opaco y del color del fondo a propósito: el rastro se consigue
 * superponiendo cada fotograma un velo del mismo color, y eso necesita que el
 * lienzo acumule la imagen. Como el color coincide con el de la superficie, el
 * resultado se lee como el propio fondo de la página.
 *
 * Va deliberadamente por debajo del umbral de atención: columnas dispersas,
 * caída lenta y glifos a muy poca opacidad. Se detiene con la pestaña oculta y
 * con `prefers-reduced-motion` no se dibuja nada.
 */

const CHARS = "01<>[]{}()/\\|!?*+-=_:;.$#@%&ABCDEFGHJKLMNPQRSTUVWXYZ"

type Props = {
  className?: string
  /** Color del fondo. */
  background?: string
  /** Color de los glifos. */
  ink?: string
  /** Opacidad máxima de un glifo, 0–1. Por defecto `0.14`. */
  intensity?: number
  /** Separación entre columnas en px. Por defecto `16`. */
  cell?: number
  /** Fracción de columnas activas a la vez, 0–1. Por defecto `0.5`. */
  density?: number
}

export function InkRain({
  className,
  background = "#0a0a0a",
  ink = "#d1d5dc",
  intensity = 0.14,
  cell = 16,
  density = 0.5,
}: Props) {
  const ref = useRef<HTMLCanvasElement | null>(null)

  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    const ctx = canvas.getContext("2d", { alpha: false })
    if (!ctx) return

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      // Un fondo liso: ni rastro ni movimiento.
      const paint = () => {
        const dpr = 1
        canvas.width = Math.max(1, Math.floor(window.innerWidth * dpr))
        canvas.height = Math.max(1, Math.floor(window.innerHeight * dpr))
        ctx.fillStyle = background
        ctx.fillRect(0, 0, canvas.width, canvas.height)
      }
      paint()
      window.addEventListener("resize", paint)
      return () => window.removeEventListener("resize", paint)
    }

    let w = 0
    let h = 0
    let dpr = 1
    let cols = 0
    let heads = new Float32Array(0)
    let speeds = new Float32Array(0)
    let active = new Uint8Array(0)
    let lastCell = new Int32Array(0)
    let raf = 0
    let running = true
    let last = 0

    const layout = () => {
      // 1.5 basta: a esta opacidad nadie va a ver los bordes de los glifos.
      dpr = Math.min(window.devicePixelRatio || 1, 1.5)
      w = window.innerWidth
      h = window.innerHeight
      canvas.width = Math.max(1, Math.floor(w * dpr))
      canvas.height = Math.max(1, Math.floor(h * dpr))
      canvas.style.width = `${w}px`
      canvas.style.height = `${h}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.fillStyle = background
      ctx.fillRect(0, 0, w, h)

      cols = Math.max(1, Math.ceil(w / cell))
      heads = new Float32Array(cols)
      speeds = new Float32Array(cols)
      active = new Uint8Array(cols)
      lastCell = new Int32Array(cols).fill(-9999)
      for (let i = 0; i < cols; i++) {
        heads[i] = Math.random() * (h * 1.6) - h * 0.6
        // px/s. Por debajo de ~50 un glifo no avanza ni una celda antes de
        // desvanecerse, así que no se forma rastro y se ve como parpadeo.
        speeds[i] = 55 + Math.random() * 85
        active[i] = Math.random() < density ? 1 : 0
      }
      ctx.font = `${cell - 3}px ui-monospace, SFMono-Regular, Menlo, Consolas, monospace`
      ctx.textBaseline = "top"
    }

    const frame = (now: number) => {
      if (!running) return
      const dt = last ? Math.min((now - last) / 1000, 0.05) : 0.016
      last = now

      // Velo del color del fondo: desvanece lo dibujado antes y deja el rastro
      ctx.globalAlpha = 0.075
      ctx.fillStyle = background
      ctx.fillRect(0, 0, w, h)
      ctx.globalAlpha = 1

      for (let i = 0; i < cols; i++) {
        if (!active[i]) continue
        heads[i] += speeds[i] * dt
        const y = heads[i]
        if (y > h + cell) {
          // Reaparece arriba, y de paso se baraja qué columnas están vivas
          heads[i] = -Math.random() * h * 0.5
          speeds[i] = 55 + Math.random() * 85
          active[i] = Math.random() < density ? 1 : 0
          lastCell[i] = -9999
          continue
        }
        if (y < 0) continue
        // Solo al cruzar de celda. Dibujar en cada fotograma repintaría el
        // mismo hueco 7-17 veces seguidas: la opacidad se acumularía hasta
        // casi opaco y el carácter cambiaría sin parar, que se ve como
        // parpadeo en vez de caída.
        const row = Math.floor(y / cell)
        if (row === lastCell[i]) continue
        lastCell[i] = row
        const ch = CHARS[(Math.random() * CHARS.length) | 0]
        ctx.globalAlpha = intensity
        ctx.fillStyle = ink
        ctx.fillText(ch, i * cell, row * cell)
        ctx.globalAlpha = 1
      }

      raf = requestAnimationFrame(frame)
    }

    layout()
    raf = requestAnimationFrame(frame)

    const onResize = () => {
      layout()
      last = 0
    }
    const onVisibility = () => {
      if (document.hidden) {
        running = false
        cancelAnimationFrame(raf)
        raf = 0
      } else if (!running) {
        running = true
        last = 0
        raf = requestAnimationFrame(frame)
      }
    }

    window.addEventListener("resize", onResize)
    document.addEventListener("visibilitychange", onVisibility)

    return () => {
      running = false
      cancelAnimationFrame(raf)
      window.removeEventListener("resize", onResize)
      document.removeEventListener("visibilitychange", onVisibility)
    }
  }, [background, ink, intensity, cell, density])

  return (
    <canvas
      ref={ref}
      aria-hidden
      className={cn("pointer-events-none fixed inset-0 z-0 block", className)}
    />
  )
}
