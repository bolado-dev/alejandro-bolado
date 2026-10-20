import Link from "next/link"

import { BottomBlur } from "@/components/bottom-blur"
import HalftoneWordmarkFooter from "@/components/ui/halftone-wordmark-footer"
import { Cover } from "@/components/home/cover"
import { Cybersec } from "@/components/home/cybersec"
import { GithubActivity } from "@/components/home/github-activity"
import { InkDivider } from "@/components/ink"
import { Experience } from "@/components/home/experience"
import {
  AboutMe,
  Archive,
  Closing,
  Intro,
  SelectedWork,
  Stack,
} from "@/components/home/sections"
import { Thoughts } from "@/components/home/thoughts"
import { Writing } from "@/components/home/writing"
import { fontMono, fontUi } from "@/lib/fonts"
import { PROFILE, THOUGHTS } from "@/lib/home-data"

export default function Page() {
  return (
    <div data-surface="ink" className="min-h-screen">
      {/* Logo fijo arriba a la izquierda, fuera de los raíles. ICON-02 es la
          variante solo-icono en blanco, la que sirve sobre #0a0a0a. */}
      <Link
        href="/"
        aria-label="Inicio"
        className="fixed left-6 top-5 z-[90] opacity-70 transition-opacity hover:opacity-100"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/Logo ICON-02.png"
          alt=""
          aria-hidden
          className="h-6 w-auto"
        />
      </Link>

      <Cover />
      <Intro />
      <Experience />
      <SelectedWork />
      <Cybersec />
      <AboutMe />
      <GithubActivity user="bolado-dev" />
      <Thoughts items={THOUGHTS} />
      <Writing />
      <Stack />
      <Archive />
      <Closing />
      <InkDivider />
      {/* Limitado al contenedor de 1008px con raíles, como el resto de
          secciones. Las familias van por nombre real y no por var(--font-ui):
          el canvas del wordmark no resuelve variables CSS en ctx.font. */}
      <div className="ink-rail mx-auto w-full max-w-[1008px] px-8">
        <HalftoneWordmarkFooter
          className="hwf-inset"
          wordmark="bolado"
          label={PROFILE.name}
          meta={`©${new Date().getFullYear()} · ${PROFILE.location}`}
          columns={[]}
          palette={{ background: "#0a0a0a", ink: "#d1d5dc", warm: "#ffffff" }}
          crop={-0.08}
          fontFamily={fontUi.style.fontFamily}
          monoFamily={fontMono.style.fontFamily}
          height="420px"
        />
      </div>

      <BottomBlur size="md" strength={18} hideWithin={460} />
    </div>
  )
}
