import { Hero } from "@/components/hero"
import { BottomBlur } from "@/components/bottom-blur"
import { Grain } from "@/components/grain"
import { About, Projects } from "@/components/sections"
import { Disciplines } from "@/components/sections/disciplines"
import { Photography } from "@/components/sections/photography"
import { Filmmaking } from "@/components/sections/filmmaking"
import { WriteupsTeaser } from "@/components/sections/writeups-teaser"
import { Footer } from "@/components/footer"

export default function Page() {
  return (
    <>
      <Grain />
      <Hero />
      <About />
      <Disciplines />
      <WriteupsTeaser />
      <Projects />
      <Photography />
      <Filmmaking />
      <Footer />
      <BottomBlur size="lg" offset={300} />
    </>
  )
}
