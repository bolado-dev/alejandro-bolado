"use client"

import { useRef } from "react"
import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { useGsap } from "@/hooks/use-gsap"
import { SectionLabel } from "@/components/section-label"
import { Globe, ShieldAlert, Camera } from "@/components/icons/solar"
import { SiDiscord } from "@icons-pack/react-simple-icons"

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger)
}

type IconProps = { className?: string }
type IconCmp = React.ComponentType<IconProps>

const beats: { eyebrow: string; text: string; Icon?: IconCmp }[] = [
  {
    eyebrow: "El inicio",
    text: "Empecé programando bots de Discord, solo por curiosidad de entender cómo funcionaban por dentro.",
    Icon: SiDiscord,
  },
  {
    eyebrow: "La curiosidad crece",
    text: "Esa curiosidad se hizo más profunda: ya no era un bot, era todo el mundo digital lo que quería entender.",
    Icon: Globe,
  },
  {
    eyebrow: "La seguridad",
    text: "Ahí entró la ciberseguridad. 42+ máquinas de Hack The Box y un manual técnico propio, siempre con la misma pregunta: ¿por dónde entra esto?",
    Icon: ShieldAlert,
  },
  {
    eyebrow: "La cámara",
    text: "Cuando cierro el portátil, la cojo. Mismo ojo, distinto lenguaje: mirar de cerca hasta encontrar lo que los demás pasan por alto.",
    Icon: Camera,
  },
  {
    eyebrow: "Hoy",
    text: "Código, seguridad y cámara no son tres caminos distintos. Son la misma curiosidad, mirando en tres direcciones a la vez.",
  },
]

export function Story() {
  const sectionRef = useRef<HTMLDivElement>(null)
  const beatRefs = useRef<(HTMLDivElement | null)[]>([])
  const barRef = useRef<HTMLDivElement>(null)
  const counterRef = useRef<HTMLSpanElement>(null)

  useGsap(() => {
    const section = sectionRef.current
    const bar = barRef.current
    const els = beatRefs.current.filter((el): el is HTMLDivElement => !!el)
    if (!section || !bar || els.length !== beats.length) return

    gsap.set(els, { opacity: 0, y: 24 })
    gsap.set(els[0], { opacity: 1, y: 0 })

    const scrollTrigger = {
      trigger: section,
      start: "top top",
      end: "bottom bottom",
      scrub: 0.6,
      onUpdate: (self: ScrollTrigger) => {
        if (!counterRef.current) return
        const i = Math.min(
          beats.length - 1,
          Math.round(self.progress * (beats.length - 1)),
        )
        counterRef.current.textContent = String(i + 1).padStart(2, "0")
      },
    }

    const tl = gsap.timeline({ scrollTrigger })

    els.forEach((el, i) => {
      if (i === 0) return
      tl.to(els[i - 1], { opacity: 0, y: -24, duration: 0.3 }, i - 0.65)
      tl.to(el, { opacity: 1, y: 0, duration: 0.3 }, i - 0.55)
    })

    gsap.fromTo(bar, { scaleX: 0 }, { scaleX: 1, ease: "none", scrollTrigger })
  }, [])

  return (
    <section id="historia" className="relative" aria-label="Mi historia">
      <div
        ref={sectionRef}
        className="relative"
        style={{ height: `${beats.length * 100}vh` }}
      >
        <div className="sticky top-0 flex h-screen flex-col items-center justify-center overflow-hidden px-4">
          <div className="absolute top-16 left-1/2 -translate-x-1/2">
            <SectionLabel className="mb-0 text-center">
              Lo que hago
            </SectionLabel>
          </div>

          <div className="relative flex w-full max-w-2xl items-center justify-center">
            {beats.map((beat, i) => (
              <div
                key={beat.eyebrow}
                ref={(el) => {
                  beatRefs.current[i] = el
                }}
                className="absolute inset-0 flex flex-col items-center justify-center text-center"
              >
                <span
                  aria-hidden
                  className="pointer-events-none absolute text-[9rem] leading-none font-bold text-foreground/[0.04] select-none sm:text-[13rem]"
                >
                  {String(i + 1).padStart(2, "0")}
                </span>

                <div className="relative">
                  {beat.Icon && (
                    <span className="text-brand mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-full bg-secondary">
                      <beat.Icon className="h-6 w-6" />
                    </span>
                  )}
                  <p className="font-mono text-xs tracking-widest text-brand uppercase">
                    {beat.eyebrow}
                  </p>
                  <p className="mt-4 text-[clamp(1.5rem,4vw,2.75rem)] leading-[1.3] font-medium tracking-tight">
                    {beat.text}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="absolute bottom-14 flex w-full max-w-xs flex-col items-center gap-3">
            <div className="h-px w-full overflow-hidden bg-border">
              <div
                ref={barRef}
                className="h-full w-full origin-left scale-x-0 bg-brand"
              />
            </div>
            <p className="flex items-center gap-1.5 font-mono text-[10px] tracking-widest text-muted-foreground uppercase">
              <span ref={counterRef}>01</span>
              <span className="text-muted-foreground/50">/</span>
              {String(beats.length).padStart(2, "0")}
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
