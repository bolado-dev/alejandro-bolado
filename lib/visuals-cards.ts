export type VisualsCard = {
  title: string
  description: string
  href: string
  image: string
  /** Si existe, se reproduce en bucle en vez de mostrar `image` como estática. */
  video?: string
}

export const visualsCards: VisualsCard[] = [
  {
    title: "Fotografía",
    description: "Retrato, calle y paisaje. Composición y luz con una mirada limpia y atenta al detalle.",
    href: "/visuals/fotografia",
    image: "/photography/01.webp",
  },
  {
    title: "Filmmaking",
    description: "De la idea al montaje final: rodaje, color y ritmo para contar historias en movimiento.",
    href: "/visuals/filmmaking",
    image: "/film/showreel-poster.webp",
    video: "/film/showreel.mp4",
  },
]
