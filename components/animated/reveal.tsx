"use client"

import { useRef, type ElementType, type ReactNode } from "react"
import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { useGsap } from "@/hooks/use-gsap"
import { cn } from "@/lib/utils"

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger)
}

type RevealProps = {
  as?: ElementType
  children: ReactNode
  className?: string
  delay?: number
  y?: number
  duration?: number
  stagger?: number
  start?: string
  once?: boolean
}

export function Reveal({
  as,
  children,
  className,
  delay = 0,
  y = 32,
  duration = 0.9,
  start = "top 85%",
  once = true,
}: RevealProps) {
  const Tag = (as ?? "div") as ElementType
  const ref = useRef<HTMLElement>(null)

  useGsap(
    () => {
      const el = ref.current
      if (!el) return

      gsap.fromTo(
        el,
        { y, opacity: 0, filter: "blur(6px)" },
        {
          y: 0,
          opacity: 1,
          filter: "blur(0px)",
          duration,
          delay,
          ease: "power3.out",
          scrollTrigger: {
            trigger: el,
            start,
            toggleActions: once ? "play none none none" : "play none none reverse",
          },
        },
      )
    },
    [y, duration, delay, start, once],
  )

  return (
    <Tag ref={ref} className={cn(className)}>
      {children}
    </Tag>
  )
}

type StaggerProps = {
  children: ReactNode
  className?: string
  selector?: string
  y?: number
  delay?: number
  stagger?: number
  duration?: number
  start?: string
}

export function StaggerReveal({
  children,
  className,
  selector,
  y = 24,
  delay = 0,
  stagger = 0.08,
  duration = 0.8,
  start = "top 85%",
}: StaggerProps) {
  const ref = useRef<HTMLDivElement>(null)

  useGsap(
    () => {
      const el = ref.current
      if (!el) return
      const items: HTMLElement[] = selector
        ? gsap.utils.toArray<HTMLElement>(selector, el)
        : (Array.from(el.children) as HTMLElement[])
      if (!items.length) return

      gsap.fromTo(
        items,
        { y, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration,
          delay,
          stagger,
          ease: "power3.out",
          scrollTrigger: {
            trigger: el,
            start,
            toggleActions: "play none none none",
          },
        },
      )
    },
    [selector, y, stagger, duration, delay, start],
  )

  return (
    <div ref={ref} className={cn(className)}>
      {children}
    </div>
  )
}
