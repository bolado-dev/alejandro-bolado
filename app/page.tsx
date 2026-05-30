import { Hero } from "@/components/hero"
import { BottomBlur } from "@/components/bottom-blur"
import { Grain } from "@/components/grain"
import { About, Skills, Education, Contact } from "@/components/sections"
import { WriteupsTeaser } from "@/components/sections/writeups-teaser"

export default function Page() {
  return (
    <>
      <Grain />
      <Hero />
      <About />
      <WriteupsTeaser />
      <Skills />
      <Education />
      <Contact />
      <BottomBlur size="lg" offset={300} />
    </>
  )
}
