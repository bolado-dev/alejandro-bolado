import type { Metadata } from "next"
import { PhotoGallery } from "@/components/visuals/photo-gallery"
import { VisualsServices } from "@/components/visuals/visuals-services"
import { VisualsContact } from "@/components/visuals/visuals-contact"
import { VisualsFooter } from "@/components/visuals/visuals-footer"

export const metadata: Metadata = {
  title: "Fotografía",
  description:
    "Fotografía de Alejandro Bolado (Bolado Visuals): retrato, eventos, bodas, comercial y producto.",
  openGraph: {
    title: "Fotografía · Bolado Visuals",
    description: "Retrato, eventos, bodas, comercial y producto.",
    type: "website",
    locale: "es_ES",
    url: "https://alejandrobolado.es/visuals/fotografia",
  },
}

export default function FotografiaPage() {
  return (
    <>
      <PhotoGallery />
      <VisualsServices variant="foto" />
      <VisualsContact />
      <VisualsFooter />
    </>
  )
}
