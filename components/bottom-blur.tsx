"use client"

import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"

interface BottomBlurProps {
  className?: string
  size?: "sm" | "md" | "lg"
  offset?: number
}

export function BottomBlur({
  className,
  size = "md",
  offset = 20,
}: BottomBlurProps) {
  const [isVisible, setIsVisible] = useState(false)

  const heights = {
    sm: "h-16",
    md: "h-24",
    lg: "h-32",
  }

  useEffect(() => {
    let ticking = false

    const update = () => {
      ticking = false
      const scrollTop = window.scrollY
      const { scrollHeight, clientHeight } = document.documentElement
      const isAtBottom = scrollTop + clientHeight >= scrollHeight - offset
      setIsVisible(!isAtBottom && scrollTop > 50)
    }

    const onScroll = () => {
      if (ticking) return
      ticking = true
      requestAnimationFrame(update)
    }

    window.addEventListener("scroll", onScroll, { passive: true })
    update()

    return () => window.removeEventListener("scroll", onScroll)
  }, [offset])

  return (
    <div
      aria-hidden
      className={cn(
        "pointer-events-none fixed right-0 bottom-0 left-0 z-[100] bg-gradient-to-t from-background via-background/70 to-transparent transition-opacity duration-300",
        heights[size],
        isVisible ? "opacity-100" : "opacity-0",
        className
      )}
    />
  )
}
