import { BottomBlur } from "@/components/bottom-blur"
import { InkRain } from "@/components/ink-rain"
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
    <div data-surface="ink" className="relative min-h-screen">
      <InkRain />
      <div className="relative z-10">
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
            height="clamp(240px,29vw,420px)"
          />
        </div>
      </div>
      <BottomBlur size="md" strength={18} hideWithin={460} />
    </div>
  )
}
