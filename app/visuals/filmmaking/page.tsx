import type { Metadata } from "next"
import { FilmGallery } from "@/components/visuals/film-gallery"
import { VisualsServices } from "@/components/visuals/visuals-services"
import { VisualsContact } from "@/components/visuals/visuals-contact"
import { VisualsFooter } from "@/components/visuals/visuals-footer"

export const metadata: Metadata = {
  title: "Filmmaking",
  description:
    "Filmmaking de Alejandro Bolado (Bolado Visuals): vídeo corporativo, videoclips, reels y piezas de redes.",
  openGraph: {
    title: "Filmmaking · Bolado Visuals",
    description: "Vídeo corporativo, videoclips, reels y piezas de redes.",
    type: "website",
    locale: "es_ES",
    url: "https://alejandrobolado.es/visuals/filmmaking",
  },
}

export default function FilmmakingPage() {
  return (
    <>
      <FilmGallery />
      <VisualsServices variant="video" />
      <VisualsContact />
      <VisualsFooter />
    </>
  )
}
