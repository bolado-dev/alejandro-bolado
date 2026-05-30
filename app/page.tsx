import { Hero } from "@/components/hero"
import { BottomBlur } from "@/components/bottom-blur"
import {
  About,
  Skills,
  Projects,
  Experience,
  Education,
  Contact,
} from "@/components/sections"
import { WriteupsTeaser } from "@/components/sections/writeups-teaser"

export default function Page() {
  return (
    <>
      <Hero />
      <About />
      <Skills />
      <Projects />
      <WriteupsTeaser />
      <Experience />
      <Education />
      <Contact />
      <BottomBlur size="lg" offset={300} />
    </>
  )
}
