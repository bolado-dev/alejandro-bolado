import { VisualsHero } from "@/components/visuals/visuals-hero"
import { VisualsPortfolio } from "@/components/visuals/visuals-portfolio"
import { VisualsServices } from "@/components/visuals/visuals-services"
import { VisualsAbout } from "@/components/visuals/visuals-about"
import { VisualsContact } from "@/components/visuals/visuals-contact"
import { VisualsFooter } from "@/components/visuals/visuals-footer"

export default function VisualsPage() {
  return (
    <>
      <VisualsHero />
      <VisualsPortfolio />
      <VisualsServices />
      <VisualsAbout />
      <VisualsContact />
      <VisualsFooter />
    </>
  )
}
