import { VisualsHero } from "@/components/visuals/visuals-hero"
import { VisualsCards } from "@/components/visuals/visuals-cards"
import { VisualsAbout } from "@/components/visuals/visuals-about"
import { VisualsContact } from "@/components/visuals/visuals-contact"
import { VisualsFooter } from "@/components/visuals/visuals-footer"

export default function VisualsPage() {
  return (
    <>
      <VisualsHero />
      <VisualsCards />
      <VisualsAbout />
      <VisualsContact />
      <VisualsFooter />
    </>
  )
}
