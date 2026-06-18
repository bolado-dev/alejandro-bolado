"use client"

import { useMemo, useState } from "react"
import { Reveal } from "@/components/animated/reveal"
import { SplitText } from "@/components/animated/split-text"
import { SectionLabel } from "@/components/section-label"
import { Lightbox, type LightboxItem } from "@/components/lightbox"
import { photos } from "@/lib/gallery"
import { cn } from "@/lib/utils"

export function Photography() {
  const [active, setActive] = useState<string>("Todo")
  const [index, setIndex] = useState<number | null>(null)

  const categories = useMemo(
    () => [
      "Todo",
      ...Array.from(new Set(photos.map((p) => p.category).filter(Boolean) as string[])),
    ],
    []
  )

  const visible = useMemo(
    () => (active === "Todo" ? photos : photos.filter((p) => p.category === active)),
    [active]
  )

  const items: LightboxItem[] = visible.map((p) => ({
    type: "image",
    src: p.src,
    alt: p.alt,
    title: p.category ?? p.alt,
  }))

  if (photos.length === 0) return null

  return (
    <section id="photography" className="border-b px-4 py-28 md:py-32">
      <div className="container mx-auto max-w-4xl">
        <SectionLabel>Fotografía</SectionLabel>
        <SplitText
          as="h2"
          stagger={0.05}
          duration={0.9}
          className="mb-4 text-4xl font-medium tracking-tight"
        >
          A través del objetivo
        </SplitText>
        <Reveal delay={0.2}>
          <p className="mb-10 max-w-xl text-[17px] leading-[1.7] text-muted-foreground">
            Una selección de imágenes. Composición, luz y momento.
          </p>
        </Reveal>

        {categories.length > 2 && (
          <Reveal y={12} className="mb-8 flex flex-wrap gap-2">
            {categories.map((c) => (
              <button
                key={c}
                onClick={() => setActive(c)}
                className={cn(
                  "rounded-full border px-3 py-1.5 text-sm transition-colors",
                  active === c
                    ? "bg-foreground text-background"
                    : "bg-card text-muted-foreground hover:bg-secondary hover:text-foreground"
                )}
              >
                {c}
              </button>
            ))}
          </Reveal>
        )}

        <div className="columns-2 gap-4 md:columns-3 [&>*]:mb-4">
          {visible.map((p, i) => (
            <button
              key={p.src}
              onClick={() => setIndex(i)}
              className="group relative block w-full overflow-hidden rounded-2xl border bg-muted"
              style={{ aspectRatio: `${p.width} / ${p.height}` }}
            >
              <span className="absolute inset-0 flex items-center justify-center text-[11px] tracking-widest text-muted-foreground/40 uppercase">
                {p.category}
              </span>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={p.src}
                alt={p.alt}
                loading="lazy"
                className="relative h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <span className="absolute inset-0 bg-foreground/0 transition-colors group-hover:bg-foreground/5" />
            </button>
          ))}
        </div>
      </div>

      <Lightbox
        items={items}
        index={index}
        onClose={() => setIndex(null)}
        onIndexChange={setIndex}
      />
    </section>
  )
}
