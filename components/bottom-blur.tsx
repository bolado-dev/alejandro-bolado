"use client"

import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"
import { motion, AnimatePresence } from "framer-motion"

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
    md: "h-32",
    lg: "h-48",
  }

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop =
        document.documentElement.scrollTop || document.body.scrollTop

      setIsVisible(scrollTop > 50)

      const scrollHeight = document.documentElement.scrollHeight
      const clientHeight = document.documentElement.clientHeight
      const isAtBottom = scrollTop + clientHeight >= scrollHeight - offset
      setIsVisible(!isAtBottom && scrollTop > 50)
    }

    window.addEventListener("scroll", handleScroll)
    handleScroll()

    return () => window.removeEventListener("scroll", handleScroll)
  }, [offset])

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div
            className={cn(
              "pointer-events-none fixed right-0 bottom-0 left-0 z-[100]",
              heights[size],
              className
            )}
            style={{
              backdropFilter: "blur(12px)",
              maskImage: "linear-gradient(to bottom, transparent, black 80%)",
              WebkitMaskImage:
                "linear-gradient(to bottom, transparent, black 80%)",
            }}
          />
          <div
            className={cn(
              "pointer-events-none fixed right-0 bottom-0 left-0 z-[101] h-20 bg-gradient-to-t from-background via-background/50 to-transparent",
              className
            )}
          />
        </motion.div>
      )}
    </AnimatePresence>
  )
}
