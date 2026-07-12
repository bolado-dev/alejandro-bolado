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
          className="mb-4 text-[clamp(2.5rem,6vw,5rem)] font-medium leading-[0.95] tracking-tight"
        >
          A través del objetivo
        </SplitText>
        <Reveal delay={0.2}>
          <p className="mb-12 max-w-xl text-[17px] leading-[1.7] text-muted-foreground">
            Una selección de imágenes. Composición, luz y momento.
          </p>
        </Reveal>

        {categories.length > 2 && (
          <Reveal y={12} className="mb-10 flex flex-wrap gap-x-6 gap-y-2 border-t border-b py-3 text-[11px] tracking-widest uppercase">
            {categories.map((c) => (
              <button
                key={c}
                onClick={() => setActive(c)}
                className={cn(
                  "relative py-1 transition-colors",
                  active === c
                    ? "text-brand"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {c}
                {active === c && (
                  <span className="absolute -bottom-[13px] left-0 h-px w-full bg-brand" />
                )}
              </button>
            ))}
          </Reveal>
        )}

        <div className="columns-2 gap-4 md:columns-3 [&>*]:mb-4">
          {visible.map((p, i) => (
            <button
              key={p.src}
              onClick={() => setIndex(i)}
              className="group relative block w-full overflow-hidden bg-muted"
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
                className="relative h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
              />
              <span className="absolute inset-0 bg-gradient-to-t from-background/85 via-background/0 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
              <span className="absolute inset-x-0 bottom-0 translate-y-3 p-4 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                {p.category && (
                  <span className="mb-1 block text-[10px] tracking-widest text-brand uppercase">
                    {p.category}
                  </span>
                )}
                <span className="block text-sm font-medium text-foreground">{p.alt}</span>
              </span>
              <span className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-brand/0 transition-all duration-300 group-hover:ring-brand/40" />
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
