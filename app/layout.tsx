// app/layout.tsx
import { Geist_Mono, Outfit, Syne } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { DockComponent } from "@/components/dock"
import { cn } from "@/lib/utils"

const syne = Syne({ subsets: ["latin"], variable: "--font-sans" })

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
      className={cn(syne.variable, fontMono.variable)}
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
          <DockComponent />
          <main>{children}</main>
        </ThemeProvider>
      </body>
    </html>
  )
}
