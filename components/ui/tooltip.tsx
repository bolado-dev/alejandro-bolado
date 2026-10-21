"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Tooltip as TooltipPrimitive } from "radix-ui"

import { cn } from "@/lib/utils"

function TooltipProvider({
  delayDuration = 0,
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Provider>) {
  return (
    <TooltipPrimitive.Provider
      data-slot="tooltip-provider"
      delayDuration={delayDuration}
      {...props}
    />
  )
}

function Tooltip({
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Root>) {
  return (
    <TooltipProvider>
      <TooltipPrimitive.Root data-slot="tooltip" {...props} />
    </TooltipProvider>
  )
}

function TooltipTrigger({
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Trigger>) {
  return <TooltipPrimitive.Trigger data-slot="tooltip-trigger" {...props} />
}

const tooltipVariants = cva(
  [
    // Píldora: el redondeo generoso es el del resto de la superficie.
    "z-50 max-w-[32ch] rounded-full px-3 py-1.5 text-xs",
    // Entrada y salida cortas. Las de scroll van a 0.5s, pero un tooltip a esa
    // velocidad se siente pesado: aquí manda la respuesta al puntero.
    "duration-150 ease-[cubic-bezier(0,0,0.2,1)]",
    "animate-in fade-in-0 zoom-in-95",
    "data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95",
    "data-[side=bottom]:slide-in-from-top-1 data-[side=left]:slide-in-from-right-1",
    "data-[side=right]:slide-in-from-left-1 data-[side=top]:slide-in-from-bottom-1",
    "motion-reduce:animate-none motion-reduce:transition-none",
  ],
  {
    variants: {
      variant: {
        /** Superficie de la paleta ink. Opaca, como el resto. */
        ink: "border border-[var(--ink-line-strong)] bg-[var(--ink-surface-hi)] text-[var(--ink-fg-strong)] shadow-lg shadow-black/40",
        /** Tokens de popover, para usarlo fuera de la superficie ink. */
        solid:
          "border border-border bg-popover text-popover-foreground shadow-md shadow-black/20",
      },
    },
    defaultVariants: {
      variant: "ink",
    },
  },
)

function TooltipContent({
  className,
  sideOffset = 6,
  variant,
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Content> &
  VariantProps<typeof tooltipVariants>) {
  return (
    // Portal a propósito: varias de nuestras tarjetas y el pie llevan
    // overflow-hidden, y sin portal el contenido se recortaría dentro de ellas.
    <TooltipPrimitive.Portal>
      <TooltipPrimitive.Content
        data-slot="tooltip-content"
        sideOffset={sideOffset}
        className={cn(tooltipVariants({ variant }), className)}
        {...props}
      />
    </TooltipPrimitive.Portal>
  )
}

export { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger }
