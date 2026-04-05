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

export default function Page() {
  return (
    <>
      <Hero />
      <About />
      <Skills />
      <Projects />
      <Experience />
      <Education />
      <Contact />
      <BottomBlur size="lg" offset={300} />
    </>
  )
}
