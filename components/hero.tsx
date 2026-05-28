"use client"

import { useEffect, useRef, useState } from "react"
import { ArrowRight } from "lucide-react"
import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { Button } from "@/components/ui/button"
import { useTheme } from "next-themes"
import { Magnetic } from "@/components/animated/magnetic"
import { useGsap } from "@/hooks/use-gsap"

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger)
}

const TITLE = "Alejandro Bolado"
const SUBTITLE = "Full Stack Developer · Building amazing experiences"

export function Hero() {
  const [mounted, setMounted] = useState(false)
  const { theme } = useTheme()

  const sectionRef = useRef<HTMLElement>(null)
  const bgRef = useRef<HTMLDivElement>(null)
  const curtainRef = useRef<HTMLDivElement>(null)
  const logoRef = useRef<HTMLDivElement>(null)
  const titleRef = useRef<HTMLHeadingElement>(null)
  const subtitleRef = useRef<HTMLDivElement>(null)
  const ctaRef = useRef<HTMLDivElement>(null)
  const scrollHintRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  useGsap(() => {
    const section = sectionRef.current
    if (!section) return

    if (bgRef.current) {
      gsap.fromTo(
        bgRef.current,
        { scale: 1.2 },
        { scale: 1, duration: 2.4, ease: "expo.out" },
      )

      gsap.to(bgRef.current, {
        yPercent: -8,
        ease: "none",
        scrollTrigger: {
          trigger: section,
          start: "top top",
          end: "bottom top",
          scrub: 0.6,
        },
      })
    }

    if (curtainRef.current) {
      gsap.to(curtainRef.current, {
        yPercent: -101,
        duration: 1.5,
        ease: "expo.inOut",
      })
    }

    const tl = gsap.timeline({
      defaults: { ease: "power3.out" },
      delay: 0.7,
    })

    if (logoRef.current) {
      tl.fromTo(
        logoRef.current,
        { opacity: 0, y: -24, scale: 0.85 },
        { opacity: 1, y: 0, scale: 1, duration: 1, ease: "back.out(1.4)" },
      )
    }

    if (titleRef.current) {
      const words = titleRef.current.querySelectorAll<HTMLElement>("[data-word]")
      tl.fromTo(
        words,
        { yPercent: 110 },
        { yPercent: 0, duration: 1.2, stagger: 0.14, ease: "expo.out" },
        "-=0.5",
      )
    }

    if (subtitleRef.current) {
      const line = subtitleRef.current.querySelector<HTMLElement>("[data-line]")
      if (line) {
        tl.fromTo(
          line,
          { yPercent: 100 },
          { yPercent: 0, duration: 1, ease: "expo.out" },
          "-=0.7",
        )
      }
    }

    if (ctaRef.current) {
      tl.fromTo(
        Array.from(ctaRef.current.children),
        { opacity: 0, y: 24 },
        { opacity: 1, y: 0, duration: 0.8, stagger: 0.1 },
        "-=0.5",
      )
    }

    if (scrollHintRef.current) {
      tl.fromTo(
        scrollHintRef.current,
        { opacity: 0, y: 12 },
        { opacity: 1, y: 0, duration: 0.6 },
        "-=0.2",
      )

      gsap.to(scrollHintRef.current.querySelector("[data-dot]"), {
        y: 14,
        opacity: 0,
        duration: 1.6,
        repeat: -1,
        ease: "power2.inOut",
      })

      gsap.to(scrollHintRef.current, {
        opacity: 0,
        ease: "none",
        scrollTrigger: {
          trigger: section,
          start: "top top",
          end: "20% top",
          scrub: true,
        },
      })
    }
  }, [mounted])

  const words = TITLE.split(" ")

  return (
    <section
      ref={sectionRef}
      className="relative flex min-h-screen w-full items-center justify-center overflow-hidden px-4"
    >
      <div className="absolute inset-0 z-0 flex items-center justify-center p-2 md:p-6">
        <div className="relative h-full w-full overflow-hidden rounded-2xl border">
          <div
            ref={bgRef}
            className="absolute inset-0 h-full w-full will-change-transform"
          >
            <img
              src="/bg.jpg"
              alt="Hero background"
              className="h-full w-full object-cover"
            />
          </div>
          <div className="absolute inset-0 z-10 bg-background/20" />
        </div>
      </div>

      <div
        ref={curtainRef}
        aria-hidden
        className="absolute inset-0 z-30 bg-background"
      />

      <div className="relative z-20 mx-auto flex flex-col items-center space-y-6 text-center">
        <div ref={logoRef} className="opacity-0">
          {mounted && theme && (
            <img
              src={theme === "dark" ? "/Logo ICON-02.png" : "/Logo ICON-01.png"}
              alt="Logo"
              className="mx-auto h-24 w-auto object-contain"
            />
          )}
        </div>

        <div className="space-y-4">
          <h1
            ref={titleRef}
            aria-label={TITLE}
            className="flex flex-wrap justify-center gap-x-3 text-4xl font-bold tracking-tighter md:text-5xl lg:text-6xl"
          >
            {words.map((word, i) => (
              <span
                key={i}
                aria-hidden
                className="relative inline-block overflow-hidden pb-[0.18em] leading-[1.05]"
              >
                <span
                  data-word
                  className="inline-block translate-y-full will-change-transform"
                >
                  {word}
                </span>
              </span>
            ))}
          </h1>

          <div
            ref={subtitleRef}
            aria-label={SUBTITLE}
            className="relative mx-auto max-w-xl overflow-hidden pb-[0.25em]"
          >
            <p
              data-line
              aria-hidden
              className="translate-y-full text-lg font-light text-foreground md:text-xl"
            >
              {SUBTITLE}
            </p>
          </div>
        </div>

        <div
          ref={ctaRef}
          className="flex flex-col items-center justify-center gap-4 sm:flex-row"
        >
          <Magnetic strength={0.25}>
            <Button
              asChild
              size="lg"
              className="h-12 w-full rounded-full px-6 font-medium sm:w-auto"
            >
              <a href="#projects">
                View Projects
                <ArrowRight className="ml-2 h-4 w-4" />
              </a>
            </Button>
          </Magnetic>

          <Magnetic strength={0.25}>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="h-12 w-full rounded-full px-6 sm:w-auto"
            >
              <a href="#contact">Contact Me</a>
            </Button>
          </Magnetic>
        </div>
      </div>

      <div
        ref={scrollHintRef}
        aria-hidden
        className="absolute bottom-8 left-1/2 z-20 -translate-x-1/2 opacity-0"
      >
        <div className="flex h-10 w-6 items-start justify-center rounded-full border border-foreground/30 pt-2">
          <span
            data-dot
            className="block h-1.5 w-1.5 rounded-full bg-foreground/60"
          />
        </div>
      </div>
    </section>
  )
}
