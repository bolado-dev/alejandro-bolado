// Las fuentes viven aquí y no en app/layout.tsx porque hay componentes que
// necesitan el NOMBRE de la familia, no solo la variable CSS: canvas no
// resuelve `var(--font-ui)` en `ctx.font`, así que requiere la cadena real
// que genera next/font (`.style.fontFamily`).
import { Geist_Mono, Hanken_Grotesk, Instrument_Serif, Outfit } from "next/font/google"

export const fontSans = Outfit({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
})

export const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})

export const fontUi = Hanken_Grotesk({
  subsets: ["latin"],
  variable: "--font-ui",
  display: "swap",
})

export const fontSerif = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  variable: "--font-serif",
  display: "swap",
})
