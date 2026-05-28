"use client"

import { Reveal } from "@/components/animated/reveal"
import { cn } from "@/lib/utils"

type SectionLabelProps = {
  children: string
  index?: string
  className?: string
}

export function SectionLabel({ children, className }: SectionLabelProps) {
  return (
    <Reveal y={16} duration={0.7}>
      <p
        className={cn(
          "mb-12 text-[11px] uppercase tracking-widest text-muted-foreground",
          className,
        )}
      >
        {children}
      </p>
    </Reveal>
  )
}
