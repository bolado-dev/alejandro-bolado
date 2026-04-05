"use client"

import Link from "next/link"
import { useTheme } from "next-themes"

import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu"
import { Button } from "@/components/ui/button"
import { GithubIcon } from "@/components/icons/github-icon"
import { ModeToggle } from "@/components/mode-toggle"

const navItems = [
  { title: "Features", href: "#features" },
  { title: "Pricing", href: "#pricing" },
  { title: "About", href: "#about" },
  { title: "Contact", href: "#contact" },
]

export function Navbar() {
  const { theme } = useTheme()

  return (
    <div className="flex justify-center py4">
      <header className="sticky top-4 z-50 w-full max-w-7xl rounded-full border bg-background/95 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-10 items-center justify-between px-5">
          <Link href="/" className="flex items-center">
            <img
              src={theme === "dark" ? "/Logo ICON-02.png" : "/Logo ICON-01.png"}
              alt="Logo"
              className="h-6 w-auto"
            />
          </Link>

          <NavigationMenu>
            <NavigationMenuList>
              {navItems.map((item) => (
                <NavigationMenuItem key={item.href}>
                  <NavigationMenuLink
                    asChild
                    className={navigationMenuTriggerStyle()}
                  >
                    <Link href={item.href}>{item.title}</Link>
                  </NavigationMenuLink>
                </NavigationMenuItem>
              ))}
            </NavigationMenuList>
          </NavigationMenu>

          <div className="flex items-center gap-2">
            <ModeToggle />
            <Button variant="ghost" size="sm" asChild>
              <Link
                href="https://github.com"
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5"
              >
                <GithubIcon className="size-4" />
                GitHub
              </Link>
            </Button>
          </div>
        </div>
      </header>
    </div>
  )
}
