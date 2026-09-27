"use client"

import { useState } from "react"
import { Reveal } from "@/components/animated/reveal"
import { SectionHeading } from "@/components/visuals/section-heading"
import { Lightbox, type LightboxItem } from "@/components/lightbox"
import { photos } from "@/lib/gallery"

export function PhotoGallery() {
  const [index, setIndex] = useState<number | null>(null)

  const items: LightboxItem[] = photos.map((p) => ({
    type: "image",
    src: p.src,
    alt: p.alt,
    title: p.category ?? p.alt,
  }))

  if (photos.length === 0) return null

  return (
    <section id="portfolio" className="px-6 py-24 md:py-32">
      <div className="mx-auto max-w-6xl">
        <Reveal y={24}>
          <SectionHeading
            eyebrow="Portfolio"
            title="Fotografía"
            description="Retrato, calle y paisaje. Una selección de trabajos, composición y luz."
          />
        </Reveal>

        <div className="mt-12 columns-1 gap-6 sm:columns-2 lg:columns-3 [&>*]:mb-6">
          {photos.map((p, i) => (
            <button
              key={p.src}
              onClick={() => setIndex(i)}
              data-cursor-label="Ver"
              className="group relative block w-full overflow-hidden rounded-3xl border border-border bg-secondary"
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
                className="relative h-full w-full object-cover grayscale transition duration-700 ease-out group-hover:scale-[1.03] group-hover:grayscale-0"
              />
              <span className="absolute inset-x-0 bottom-0 flex items-end justify-between p-5 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                {p.category && (
                  <span className="rounded-full bg-background/90 px-3 py-1 text-[11px] font-medium tracking-widest uppercase backdrop-blur">
                    {p.category}
                  </span>
                )}
              </span>
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
