import { Hero } from "@/components/hero"
import { BottomBlur } from "@/components/bottom-blur"
import { Grain } from "@/components/grain"
import {
  About,
  Skills,
  Projects,
  Experience,
  Education,
  Contact,
} from "@/components/sections"
import { Disciplines } from "@/components/sections/disciplines"
import { Photography } from "@/components/sections/photography"
import { Filmmaking } from "@/components/sections/filmmaking"
import { WriteupsTeaser } from "@/components/sections/writeups-teaser"

export default function Page() {
  return (
    <>
      <Grain />
      <Hero />
      <About />
      <Disciplines />
      <Skills />
      <Projects />
      <WriteupsTeaser />
      <Photography />
      <Filmmaking />
      <Experience />
      <Education />
      <Contact />
      <BottomBlur size="lg" offset={300} />
    </>
  )
}
