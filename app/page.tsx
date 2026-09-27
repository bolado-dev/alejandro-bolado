import { Hero } from "@/components/hero"
import { BottomBlur } from "@/components/bottom-blur"
import { Grain } from "@/components/grain"
import { AsciiFluid } from "@/components/ui/ascii-fluid"
import { Projects } from "@/components/sections"
import { SobreMiHero } from "@/components/sobre-mi/hero"
import { Story } from "@/components/sobre-mi/story"
import { Skills } from "@/components/sobre-mi/skills"
import { Education } from "@/components/sobre-mi/education"
import { CybersecTeaser } from "@/components/sections/cybersec-teaser"
import { VisualsTeaser } from "@/components/sections/visuals-teaser"
import { Footer } from "@/components/footer"

export default function Page() {
  return (
    <>
      <AsciiFluid className="fixed inset-0 -z-10" />
      <Grain />
      <Hero />
      <SobreMiHero />
      <Story />
      <Skills />
      <Education />
      <Projects />
      <CybersecTeaser />
      <VisualsTeaser />
      <Footer />
      <BottomBlur size="lg" offset={300} />
    </>
  )
}
