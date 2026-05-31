// app/layout.tsx
import { Geist_Mono, Manrope } from "next/font/google"
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
}

const sans = Manrope({ subsets: ["latin"], variable: "--font-sans" })

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
          defaultTheme="system"
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
