import type { Metadata } from "next"
import { VisualsHeader } from "@/components/visuals/visuals-header"
import { VisualsProgress } from "@/components/visuals/visuals-progress"

export const metadata: Metadata = {
  title: {
    default: "Bolado Visuals · Fotografía & Filmmaking",
    template: "%s · Bolado Visuals",
  },
  description:
    "Bolado Visuals: fotografía y filmmaking. Retrato, eventos, comercial y vídeo. Creative · Strategy · Impact.",
  openGraph: {
    title: "Bolado Visuals · Fotografía & Filmmaking",
    description:
      "Fotografía y filmmaking con una mirada limpia y cuidada. Creative · Strategy · Impact.",
    type: "website",
    locale: "es_ES",
    url: "https://alejandrobolado.es/visuals",
  },
  icons: {
    icon: "/visuals/favicon.png",
  },
}

export default function VisualsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div
      id="top"
      className="visuals-scope min-h-screen bg-background font-sans text-foreground antialiased"
    >
      <VisualsProgress />
      <VisualsHeader />
      {children}
    </div>
  )
}
