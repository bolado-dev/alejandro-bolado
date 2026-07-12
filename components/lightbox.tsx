"use client"

import { useCallback, useEffect } from "react"
import { createPortal } from "react-dom"
import { AnimatePresence, motion } from "framer-motion"
import { X, ChevronLeft, ChevronRight } from "@/components/icons/solar"

export type LightboxItem = {
  type: "image" | "video"
  src?: string
  embed?: string
  poster?: string
  title?: string
  alt?: string
}

type LightboxProps = {
  items: LightboxItem[]
  index: number | null
  onClose: () => void
  onIndexChange: (index: number) => void
}

export function Lightbox({ items, index, onClose, onIndexChange }: LightboxProps) {
  const open = index !== null
  const current = open ? items[index] : null

  const go = useCallback(
    (dir: number) => {
      if (index === null) return
      const next = (index + dir + items.length) % items.length
      onIndexChange(next)
    },
    [index, items.length, onIndexChange]
  )

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
      if (e.key === "ArrowRight") go(1)
      if (e.key === "ArrowLeft") go(-1)
    }
    document.addEventListener("keydown", onKey)
    document.body.style.overflow = "hidden"
    return () => {
      document.removeEventListener("keydown", onKey)
      document.body.style.overflow = ""
    }
  }, [open, go, onClose])

  if (typeof document === "undefined") return null

  return createPortal(
    <AnimatePresence>
      {open && current && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[300] flex items-center justify-center bg-background/95 p-4 backdrop-blur-md sm:p-8"
          onClick={onClose}
        >
          <button
            aria-label="Cerrar"
            onClick={onClose}
            className="absolute top-4 right-4 z-10 flex h-10 w-10 items-center justify-center rounded-full border bg-card text-muted-foreground transition-colors hover:text-foreground"
          >
            <X className="h-5 w-5" />
          </button>

          {items.length > 1 && (
            <>
              <NavButton side="left" onClick={(e) => { e.stopPropagation(); go(-1) }} />
              <NavButton side="right" onClick={(e) => { e.stopPropagation(); go(1) }} />
            </>
          )}

          <motion.div
            key={index}
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="relative max-h-[88vh] w-full max-w-5xl"
            onClick={(e) => e.stopPropagation()}
          >
            {current.type === "image" ? (
              <img
                src={current.src}
                alt={current.alt ?? current.title ?? ""}
                className="mx-auto max-h-[88vh] w-auto rounded-lg object-contain"
              />
            ) : current.embed ? (
              <div className="aspect-video w-full overflow-hidden rounded-lg border">
                <iframe
                  src={current.embed}
                  title={current.title ?? "Vídeo"}
                  className="h-full w-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            ) : (
              <video
                src={current.src}
                poster={current.poster}
                controls
                autoPlay
                className="mx-auto max-h-[88vh] w-auto rounded-lg border"
              />
            )}

            {current.title && (
              <p className="mt-3 text-center text-sm text-muted-foreground">
                {current.title}
                {items.length > 1 && (
                  <span className="ml-2 tabular-nums">
                    {(index ?? 0) + 1} / {items.length}
                  </span>
                )}
              </p>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  )
}

function NavButton({
  side,
  onClick,
}: {
  side: "left" | "right"
  onClick: (e: React.MouseEvent) => void
}) {
  const Icon = side === "left" ? ChevronLeft : ChevronRight
  return (
    <button
      aria-label={side === "left" ? "Anterior" : "Siguiente"}
      onClick={onClick}
      className={`absolute top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border bg-card text-muted-foreground transition-colors hover:text-foreground ${
        side === "left" ? "left-4" : "right-4"
      }`}
    >
      <Icon className="h-5 w-5" />
    </button>
  )
}
