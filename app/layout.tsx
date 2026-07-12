// app/layout.tsx
import { Geist_Mono, Outfit } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { DockComponent } from "@/components/dock"
import { SmoothScroll } from "@/components/smooth-scroll"
import { cn } from "@/lib/utils"
import type { Metadata } from "next"

export const metadata: Metadata = {
  metadataBase: new URL("https://alejandrobolado.es"),
  title: {
    default: "Alejandro Bolado",
    template: "%s",
  },
  description:
    "Portfolio de Alejandro Bolado: desarrollo full-stack, ciberseguridad y pentesting, fotografía y filmmaking. Entre el código y la cámara.",
  keywords: [
    "Alejandro Bolado",
    "desarrollo full-stack",
    "ciberseguridad",
    "pentesting",
    "hacking ético",
    "fotografía",
    "filmmaking",
    "portfolio",
    "desarrollador",
    "Next.js",
  ],
  openGraph: {
    title: "Alejandro Bolado",
    description:
      "Portfolio de Alejandro Bolado: desarrollo full-stack, ciberseguridad y pentesting, fotografía y filmmaking. Entre el código y la cámara.",
    type: "website",
    locale: "es_ES",
    url: "https://alejandrobolado.es",
  },
  twitter: {
    card: "summary_large_image",
    title: "Alejandro Bolado",
    description:
      "Portfolio de Alejandro Bolado: desarrollo full-stack, ciberseguridad y pentesting, fotografía y filmmaking. Entre el código y la cámara.",
  },
}

const sans = Outfit({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
})

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="es"
      suppressHydrationWarning
      className={cn(sans.variable, fontMono.variable)}
    >
      <body
        className={cn("bg-background font-sans text-foreground antialiased")}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <SmoothScroll />
          <DockComponent />
          <main>{children}</main>
        </ThemeProvider>
      </body>
    </html>
  )
}
