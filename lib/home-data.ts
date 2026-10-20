/**
 * Contenido de la home. Todo lo editable vive aquí para no tener que tocar
 * componentes.
 *
 * Los proyectos y el stack salen de lo que ya había en el repo
 * (`components/sections.tsx` y `components/sobre-mi/skills.tsx`). Los campos
 * marcados con REVISAR son suposiciones mías que tienes que confirmar.
 */

export const PROFILE = {
  name: "Alejandro Bolado",
  /** Frase en serif itálica sobre el banner. */
  tagline: "Entre el código y la cámara.",
  role: "Desarrollo full-stack · Ciberseguridad y pentesting",
  location: "Cantabria, España",
  email: "a.bolado.dev@gmail.com",
  github: "https://github.com/bolado-dev",
  linkedin: "https://linkedin.com/in/alejandrobolado",
  banner: "/hero.webp",
  avatar: "/alejandro.webp",
  portrait: "/alejandro-bw.webp",
} as const

/**
 * Párrafos de entrada. `strong` marca los fragmentos que van resaltados en
 * blanco, igual que las métricas de la referencia.
 */
export const INTRO: { text: string; strong?: string[] }[] = [
  {
    text: "Construyo cosas y luego intento romperlas. Desarrollo full-stack por un lado, pentesting por otro, y la cámara cuando me canso de la pantalla.",
    strong: ["Construyo cosas y luego intento romperlas."],
  },
  {
    text: "Llevo 42+ máquinas de Hack The Box resueltas y 51 writeups publicados explicando cómo, paso a paso, porque documentar el proceso es la mitad del aprendizaje.",
    strong: ["42+ máquinas de Hack The Box", "51 writeups publicados"],
  },
  {
    text: "Lo último: un driver de kernel y un parche de tabla ACPI para que un portátil que Linux no soportaba del todo funcione como debería.",
    strong: ["un driver de kernel y un parche de tabla ACPI"],
  },
]

export type Experience = {
  company: string
  role: string
  /** "Activo", "Adquirida", "Finalizado"… Opcional. */
  status?: string
  period: string
  logo?: string
  /** Fallback cuando no hay logo: inicial sobre fondo sutil. */
  initial?: string
  bullets?: string[]
}

/**
 * REVISAR — no tengo tu historial laboral y no me lo puedo inventar. Esto es
 * un marcador de posición con lo único que consta en el repo (la formación).
 * Pásame puestos, fechas y dos o tres resultados concretos de cada uno y lo
 * relleno.
 */
export const EXPERIENCE: Experience[] = [
  {
    company: "IES Miguel Herrero",
    role: "ASIR · Administración de Sistemas Informáticos en Red",
    status: "En curso",
    period: "2024 — Presente",
    initial: "M",
  },
]

export type Project = {
  title: string
  /** "Activo" | "Completado" | "Archivado" */
  status: string
  year: string
  description: string
  stack: string[]
  image?: string
  live?: string
  repo?: string
}

export const PROJECTS: Project[] = [
  {
    title: "Spotted",
    status: "Activo", // REVISAR
    year: "2025", // REVISAR
    description:
      "App para amantes del motor: fotografía los coches que te encuentras, guárdalos en tu garaje y descúbrelos en un mapa por ubicación.",
    stack: ["React Native", "TypeScript", "Node.js", "PostgreSQL"], // REVISAR
    image: "/projects/spotted/screenshot.webp",
    live: "https://spotted.es",
  },
  {
    title: "MEDION 14 S1 OLED — Linux fixes",
    status: "Activo", // REVISAR
    year: "2026", // REVISAR
    description:
      "Driver a medida para el teclado interno (scancodes corruptos y LED de Bloq Mayús nunca implementado) y parche de la tabla ACPI DSDT que arregla que la batería nunca reportase “Charging”, cargado en caliente vía initrd sin flashear la BIOS.",
    stack: ["C", "Python", "Bash", "ACPI"],
    image: "/projects/medion-linux-fixes/laptop.webp",
    repo: "https://github.com/bolado-dev/medion-14-s1-oled-linux",
  },
  {
    title: "BoladoBSPWM",
    status: "Completado", // REVISAR
    year: "2025", // REVISAR
    description:
      "Setup de escritorio sobre BSPWM orientado a hacking y desarrollo: Polybar, Rofi, Kitty, Picom y scripts propios.",
    stack: ["Bash", "BSPWM", "Linux"],
    repo: "https://github.com/bolado-dev/BoladoBSPWM",
  },
]

/** Bio de la sección "Mí". `strong` resalta en blanco. */
export const ABOUT: { text: string; strong?: string[] }[] = [
  {
    text: "Desarrollador y estudiante de ASIR en Cantabria. Empecé tocando sistemas por curiosidad y acabé partiendo el tiempo entre escribir código y entender por qué el código de otros se rompe.",
    strong: ["Desarrollador y estudiante de ASIR en Cantabria."],
  },
  {
    text: "Ahora mismo: 42+ máquinas de Hack The Box, 51 writeups publicados y un manual de pentesting propio con siete bloques, desde reconocimiento hasta Active Directory y binary exploitation.",
    strong: ["un manual de pentesting propio"],
  },
  {
    text: "Y cuando cierro el portátil, fotografía y filmmaking — que es la otra mitad de Bolado Visuals.",
    strong: ["Bolado Visuals"],
  },
]

/** Stack con slug de simple-icons para el logo. */
export const STACK: { name: string; slug: string }[] = [
  { name: "TypeScript", slug: "typescript" },
  { name: "React", slug: "react" },
  { name: "Next.js", slug: "nextdotjs" },
  { name: "Node.js", slug: "nodedotjs" },
  { name: "Python", slug: "python" },
  { name: "PostgreSQL", slug: "postgresql" },
  { name: "Tailwind CSS", slug: "tailwindcss" },
  { name: "Docker", slug: "docker" },
  { name: "Linux", slug: "linux" },
  { name: "Git", slug: "git" },
]

/** Herramientas de ciberseguridad y edición, en la fila de "Skills". */
export const TOOLS: { name: string; slug: string }[] = [
  { name: "Kali Linux", slug: "kalilinux" },
  { name: "Burp Suite", slug: "burpsuite" },
  { name: "Wireshark", slug: "wireshark" },
  { name: "Hack The Box", slug: "hackthebox" },
  { name: "Lightroom", slug: "adobelightroom" },
  { name: "DaVinci Resolve", slug: "davinciresolve" },
]

/** Entradas del bloque "Archivo". */
export const ARCHIVE: { title: string; description: string; year: string; href: string }[] = [
  {
    title: "Manual de pentesting",
    description:
      "Siete bloques, de reconocimiento a Active Directory y binary exploitation.",
    year: "2026",
    href: "/cybersec/manual",
  },
  {
    title: "Bolado Visuals",
    description: "La otra mitad: fotografía y filmmaking.",
    year: "2025",
    href: "/visuals",
  },
]

export const QUOTE = {
  text: "Lo que no se documenta, no se ha aprendido.",
  author: "",
} as const

/**
 * Notas cortas del acordeón. Vacío a propósito: son opiniones tuyas y no me
 * las voy a inventar. Añade `{ title, body }` y la sección aparece sola.
 */
export const THOUGHTS: { title: string; body: string }[] = []
