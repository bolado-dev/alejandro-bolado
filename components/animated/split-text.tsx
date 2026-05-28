"use client"

import { useRef, type ElementType } from "react"
import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { useGsap } from "@/hooks/use-gsap"
import { cn } from "@/lib/utils"

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger)
}

type SplitTextProps = {
  children: string
  as?: ElementType
  className?: string
  delay?: number
  duration?: number
  stagger?: number
  y?: string | number
  trigger?: "load" | "scroll"
  start?: string
}

export function SplitText({
  children,
  as,
  className,
  delay = 0,
  duration = 1,
  stagger = 0.06,
  y = "110%",
  trigger = "scroll",
  start = "top 85%",
}: SplitTextProps) {
  const Tag = (as ?? "h2") as ElementType
  const ref = useRef<HTMLElement>(null)

  const words = children.split(/(\s+)/)

  useGsap(
    () => {
      const el = ref.current
      if (!el) return
      const targets = el.querySelectorAll<HTMLElement>("[data-split-word]")
      if (!targets.length) return

      const animation = {
        y: 0,
        opacity: 1,
        duration,
        delay,
        stagger,
        ease: "power4.out",
      }

      if (trigger === "load") {
        gsap.fromTo(targets, { y, opacity: 0 }, animation)
      } else {
        gsap.fromTo(targets, { y, opacity: 0 }, {
          ...animation,
          scrollTrigger: {
            trigger: el,
            start,
            toggleActions: "play none none none",
          },
        })
      }
    },
    [children, delay, duration, stagger, y, trigger, start],
  )

  return (
    <Tag ref={ref} className={cn("inline-block", className)} aria-label={children}>
      {words.map((word, i) =>
        word.trim() === "" ? (
          <span key={i}>&nbsp;</span>
        ) : (
          <span
            key={i}
            aria-hidden
            className="inline-block overflow-hidden align-bottom"
          >
            <span data-split-word className="inline-block will-change-transform">
              {word}
            </span>
          </span>
        ),
      )}
    </Tag>
  )
}
