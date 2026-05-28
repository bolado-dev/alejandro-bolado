"use client"

import { useEffect, useRef, type ReactNode } from "react"
import { gsap } from "gsap"
import { cn } from "@/lib/utils"

type MagneticProps = {
  children: ReactNode
  className?: string
  strength?: number
}

export function Magnetic({ children, className, strength = 0.35 }: MagneticProps) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    if (reduceMotion) return

    const xTo = gsap.quickTo(el, "x", { duration: 0.6, ease: "elastic.out(1,0.3)" })
    const yTo = gsap.quickTo(el, "y", { duration: 0.6, ease: "elastic.out(1,0.3)" })

    const handleMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect()
      const x = e.clientX - rect.left - rect.width / 2
      const y = e.clientY - rect.top - rect.height / 2
      xTo(x * strength)
      yTo(y * strength)
    }

    const handleLeave = () => {
      xTo(0)
      yTo(0)
    }

    el.addEventListener("mousemove", handleMove)
    el.addEventListener("mouseleave", handleLeave)

    return () => {
      el.removeEventListener("mousemove", handleMove)
      el.removeEventListener("mouseleave", handleLeave)
    }
  }, [strength])

  return (
    <div ref={ref} className={cn("inline-block", className)}>
      {children}
    </div>
  )
}
