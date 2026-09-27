"use client"

import { useRef } from "react"
import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { useGsap } from "@/hooks/use-gsap"
import { Counter } from "@/components/animated/counter"
import { MapPin } from "@/components/icons/solar"

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger)
}

export function SobreMiHero() {
  const sectionRef = useRef<HTMLDivElement>(null)
  const photoRef = useRef<HTMLDivElement>(null)
  const imgRef = useRef<HTMLImageElement>(null)
  const leftRef = useRef<HTMLDivElement>(null)
  const rightRef = useRef<HTMLDivElement>(null)

  useGsap(() => {
    const section = sectionRef.current
    const photo = photoRef.current
    const img = imgRef.current
    const left = leftRef.current
    const right = rightRef.current
    if (!section || !photo || !img || !left || !right) return

    const scrollTrigger = {
      trigger: section,
      start: "top top",
      end: "+=100%",
      scrub: 0.6,
    }

    // La foto arranca grande y dominante, y se asienta a su tamaño final.
    gsap.fromTo(
      photo,
      { scale: 1.9 },
      { scale: 1, ease: "none", scrollTrigger },
    )
    gsap.fromTo(
      img,
      { filter: "grayscale(0.6) contrast(0.9)" },
      { filter: "grayscale(0) contrast(1)", ease: "none", scrollTrigger },
    )
    // Los datos aparecen a ambos lados a medida que la foto encoge.
    gsap.fromTo(
      left,
      { opacity: 0, x: -32 },
      { opacity: 1, x: 0, ease: "none", scrollTrigger },
    )
    gsap.fromTo(
      right,
      { opacity: 0, x: 32 },
      { opacity: 1, x: 0, ease: "none", scrollTrigger },
    )
  }, [])

  return (
    <section
      ref={sectionRef}
      id="about"
      className="relative h-[220vh]"
      aria-label="Presentación"
    >
      <div className="sticky top-0 flex h-screen items-center overflow-hidden px-4">
        <div className="container mx-auto grid max-w-6xl grid-cols-1 items-center gap-8 md:grid-cols-[1fr_auto_1fr] md:gap-10">
          {/* Datos: izquierda */}
          <div ref={leftRef} className="hidden text-left md:block">
            <p className="mb-4 flex items-center gap-1.5 text-xs uppercase tracking-widest text-muted-foreground">
              <MapPin className="h-4 w-4" />
              Cantabria, España
            </p>
            <h2 className="text-[clamp(2rem,3.2vw,2.75rem)] font-medium leading-[1.05] tracking-tight">
              Entre el código y la cámara
            </h2>
            <p className="mt-5 max-w-xs text-base leading-[1.7] text-muted-foreground">
              Desarrollador full-stack, hacker ético y fotógrafo. Esta es la
              historia detrás de las tres cosas.
            </p>
          </div>

          {/* Foto: centro, arranca grande y encoge con el scroll */}
          <div
            ref={photoRef}
            className="relative mx-auto aspect-[3/4] w-full max-w-[320px] shrink-0 md:max-w-[380px]"
          >
            <img
              ref={imgRef}
              src="/alejandro-bw.webp"
              alt="Alejandro Bolado"
              className="h-full w-full object-contain object-bottom"
              style={{
                maskImage: "linear-gradient(to bottom, black 88%, transparent 100%)",
                WebkitMaskImage:
                  "linear-gradient(to bottom, black 88%, transparent 100%)",
              }}
            />
          </div>

          {/* Datos: derecha */}
          <div ref={rightRef} className="hidden text-left md:block">
            <div className="flex flex-col gap-8">
              <div>
                <p className="font-mono text-4xl font-medium tracking-tight">
                  <Counter to={42} suffix="+" />
                </p>
                <p className="mt-1.5 text-sm text-muted-foreground">
                  Máquinas HTB resueltas
                </p>
              </div>
              <div>
                <p className="font-mono text-4xl font-medium tracking-tight">
                  <Counter to={2} />
                </p>
                <p className="mt-1.5 text-sm text-muted-foreground">
                  Proyectos propios en producción
                </p>
              </div>
              <div>
                <p className="font-mono text-4xl font-medium tracking-tight">
                  ASIR
                </p>
                <p className="mt-1.5 text-sm text-muted-foreground">
                  IES Miguel Herrero · en curso
                </p>
              </div>
            </div>
          </div>

          {/* Fallback compacto en móvil: sin columnas laterales */}
          <div className="text-center md:hidden">
            <h2 className="text-[clamp(2rem,7vw,2.75rem)] font-medium leading-[1.05] tracking-tight">
              Entre el código y la cámara
            </h2>
            <p className="mt-4 text-base leading-[1.7] text-muted-foreground">
              Desarrollador full-stack, hacker ético y fotógrafo.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
