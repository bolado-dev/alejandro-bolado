"use client"

import { Briefcase, Code2, Mail } from "lucide-react"
import { MinimalistHero } from "@/components/ui/minimalist-hero"

const EMAIL = "a.bolado.dev@gmail.com"

const socialLinks = [
  { icon: Code2, href: "https://github.com/bolado-dev" },
  { icon: Briefcase, href: "https://linkedin.com/in/alejandrobolado" },
  { icon: Mail, href: `mailto:${EMAIL}` },
]

export function Hero() {
  return (
    <MinimalistHero
      mainText="Desarrollo full-stack, ciberseguridad y pentesting, fotografía y filmmaking. Entre el código y la cámara."
      readMoreLink="#about"
      overlayText={{
        part1: "código",
        part2: "y cámara.",
      }}
      socialLinks={socialLinks}
      locationText="Cantabria, España"
    />
  )
}
