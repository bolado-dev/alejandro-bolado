"use client"

import { useRef } from "react"
import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { useGsap } from "@/hooks/use-gsap"
import { cn } from "@/lib/utils"

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger)
}

type CounterProps = {
  to: number
  duration?: number
  suffix?: string
  prefix?: string
  className?: string
}

export function Counter({
  to,
  duration = 1.8,
  suffix,
  prefix,
  className,
}: CounterProps) {
  const ref = useRef<HTMLSpanElement>(null)

  useGsap(() => {
    const el = ref.current
    if (!el) return
    const obj = { val: 0 }

    gsap.to(obj, {
      val: to,
      duration,
      ease: "power2.out",
      onUpdate: () => {
        el.textContent = Math.round(obj.val).toString()
      },
      scrollTrigger: {
        trigger: el,
        start: "top 90%",
        toggleActions: "play none none none",
      },
    })
  }, [to, duration])

  return (
    <span className={cn("tabular-nums", className)}>
      {prefix}
      <span ref={ref}>0</span>
      {suffix}
    </span>
  )
}
