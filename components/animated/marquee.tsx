"use client"

import { useRef, type ReactNode } from "react"
import { gsap } from "gsap"
import { useGsap } from "@/hooks/use-gsap"
import { cn } from "@/lib/utils"

type MarqueeProps = {
  children: ReactNode
  className?: string
  speed?: number
  direction?: "left" | "right"
  pauseOnHover?: boolean
}

export function Marquee({
  children,
  className,
  speed = 40,
  direction = "left",
  pauseOnHover = true,
}: MarqueeProps) {
  const ref = useRef<HTMLDivElement>(null)

  useGsap(() => {
    const wrap = ref.current
    if (!wrap) return
    const track = wrap.querySelector<HTMLDivElement>("[data-marquee-track]")
    if (!track) return
    const inner = track.querySelector<HTMLDivElement>("[data-marquee-inner]")
    if (!inner) return

    const totalWidth = inner.scrollWidth
    if (!totalWidth) return

    const duration = totalWidth / speed
    const fromX = direction === "left" ? 0 : -totalWidth
    const toX = direction === "left" ? -totalWidth : 0

    gsap.set(track, { x: fromX })
    const tween = gsap.to(track, {
      x: toX,
      duration,
      ease: "none",
      repeat: -1,
      modifiers: {
        x: (x) => {
          const val = parseFloat(x)
          return `${gsap.utils.wrap(-totalWidth, 0, val)}px`
        },
      },
    })

    if (pauseOnHover) {
      const enter = () => tween.timeScale(0.15)
      const leave = () => tween.timeScale(1)
      wrap.addEventListener("mouseenter", enter)
      wrap.addEventListener("mouseleave", leave)
      return () => {
        wrap.removeEventListener("mouseenter", enter)
        wrap.removeEventListener("mouseleave", leave)
      }
    }
  }, [speed, direction, pauseOnHover])

  return (
    <div ref={ref} className={cn("relative overflow-hidden", className)}>
      <div className="absolute inset-y-0 left-0 z-10 w-24 bg-gradient-to-r from-background to-transparent" />
      <div className="absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-l from-background to-transparent" />
      <div data-marquee-track className="flex w-max">
        <div data-marquee-inner className="flex w-max items-center">
          {children}
        </div>
        <div aria-hidden className="flex w-max items-center">
          {children}
        </div>
      </div>
    </div>
  )
}
