// Contenido de Fotografía y Filmmaking.
//
// ── Fotografía ──────────────────────────────────────────────────────────────
// Coloca las imágenes en `public/photography/` y añádelas aquí.
// `width`/`height` (en px) se usan para reservar el aspecto en la galería:
// indícalos para evitar saltos de layout (valores aproximados valen).
//
// ── Filmmaking ──────────────────────────────────────────────────────────────
// Para cada vídeo: o bien un archivo local en `public/film/` (campo `src`),
// o una URL de YouTube/Vimeo embebida (campo `embed`). `poster` es la miniatura.

export type Photo = {
  src: string
  alt: string
  width: number
  height: number
  category?: string
}

export type Film = {
  title: string
  category: string
  poster: string
  /** Ruta a un vídeo local en public/, p.ej. "/film/reel.mp4" */
  src?: string
  /** URL embebida (YouTube/Vimeo) como alternativa a un archivo local */
  embed?: string
  year?: string
}

// Placeholders: sustituye por tus fotos reales en public/photography/.
export const photos: Photo[] = [
  { src: "/photography/01.jpg", alt: "Retrato", width: 800, height: 1000, category: "Retrato" },
  { src: "/photography/02.jpg", alt: "Calle", width: 1000, height: 700, category: "Calle" },
  { src: "/photography/03.jpg", alt: "Paisaje", width: 1000, height: 667, category: "Paisaje" },
  { src: "/photography/04.jpg", alt: "Retrato", width: 800, height: 1100, category: "Retrato" },
  { src: "/photography/05.jpg", alt: "Calle", width: 800, height: 800, category: "Calle" },
  { src: "/photography/06.jpg", alt: "Paisaje", width: 1000, height: 1250, category: "Paisaje" },
]

// Showreel destacado (opcional). Si lo defines, se muestra grande arriba.
export const showreel: Film | null = {
  title: "Showreel",
  category: "Reel",
  poster: "/film/showreel-poster.jpg",
  src: "/film/showreel.mp4",
  year: "2026",
}

// Placeholders: sustituye por tus vídeos reales en public/film/.
export const films: Film[] = [
  { title: "Proyecto en movimiento", category: "Cortometraje", poster: "/film/01-poster.jpg", src: "/film/01.mp4" },
  { title: "Sesión a cámara", category: "Videoclip", poster: "/film/02-poster.jpg", src: "/film/02.mp4" },
  { title: "Documental breve", category: "Documental", poster: "/film/03-poster.jpg", src: "/film/03.mp4" },
]
