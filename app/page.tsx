import { BottomBlur } from "@/components/bottom-blur"
import { InkRain } from "@/components/ink-rain"
import { SiteFooter } from "@/components/ui/site-footer"
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
import { THOUGHTS } from "@/lib/home-data"

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
        <SiteFooter wordmark="bolado" />
      </div>
      <BottomBlur size="md" strength={18} hideWithin={460} />
    </div>
  )
}
