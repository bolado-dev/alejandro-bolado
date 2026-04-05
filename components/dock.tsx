"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"
import {
  Briefcase,
  Code,
  User,
  Mail,
  Sun,
  Folder,
  GraduationCap,
  ChevronDown,
  Monitor,
} from "lucide-react"
import { useTheme } from "next-themes"
import { GithubIcon } from "@/components/icons/github-icon"

interface DockProps {
  className?: string
  items: {
    icon: React.ReactNode
    label: string
    onClick?: (event: React.MouseEvent) => void
    href?: string
  }[]
}

interface DockIconButtonProps {
  icon: React.ReactNode
  label: string
  onClick?: (event: React.MouseEvent) => void
  href?: string
  className?: string
}

const floatingAnimation = {
  initial: { y: 0 },
  animate: {
    y: [-2, 2, -2],
    transition: {
      duration: 4,
      repeat: Infinity,
      ease: "easeInOut" as const,
    },
  },
}

const DockIconButton = React.forwardRef<HTMLButtonElement, DockIconButtonProps>(
  ({ icon, label, onClick, href, className }, ref) => {
    const content = (
      <motion.button
        ref={ref}
        whileHover={{ scale: 1.1, y: -2 }}
        whileTap={{ scale: 0.95 }}
        onClick={onClick}
        className={cn(
          "group relative cursor-pointer rounded-lg p-3",
          "transition-colors hover:bg-secondary",
          className
        )}
      >
        {React.isValidElement(icon)
          ? React.cloneElement(
              icon as React.ReactElement<{ className?: string }>,
              {
                className: cn(
                  "h-5 w-5 text-foreground",
                  (icon as React.ReactElement<{ className?: string }>).props
                    .className
                ),
              }
            )
          : icon}
        <span
          className={cn(
            "absolute -top-8 left-1/2 -translate-x-1/2",
            "rounded px-2 py-1 text-xs",
            "bg-popover text-popover-foreground",
            "opacity-0 group-hover:opacity-100",
            "pointer-events-none whitespace-nowrap transition-opacity"
          )}
        >
          {label}
        </span>
      </motion.button>
    )

    if (href) {
      return (
        <a href={href} target="_blank" rel="noreferrer">
          {content}
        </a>
      )
    }

    return content
  }
)
DockIconButton.displayName = "DockIconButton"

const Dock = React.forwardRef<HTMLDivElement, DockProps>(
  ({ items, className }, ref) => {
    return (
      <div
        ref={ref}
        className={cn("flex w-full items-center justify-center p-2", className)}
      >
        <div className="relative flex w-full max-w-4xl items-center justify-center rounded-2xl">
          <motion.div
            initial="initial"
            animate="animate"
            variants={floatingAnimation}
            className={cn(
              "flex items-center gap-1 rounded-2xl p-2",
              "border shadow-lg backdrop-blur-lg",
              "border-border bg-background/90",
              "transition-shadow duration-300 hover:shadow-xl"
            )}
          >
            {items.map((item) => (
              <DockIconButton key={item.label} {...item} />
            ))}
          </motion.div>
        </div>
      </div>
    )
  }
)
Dock.displayName = "Dock"

export { Dock }

const navItems = [
  { label: "Sobre mí", href: "#about", icon: User },
  { label: "Habilidades", href: "#skills", icon: Code },
  { label: "Proyectos", href: "#projects", icon: Folder },
  { label: "Experiencia", href: "#experience", icon: Briefcase },
  { label: "Educación", href: "#education", icon: GraduationCap },
  { label: "Contacto", href: "#contact", icon: Mail },
]

export function DockComponent() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)
  const [isOpen, setIsOpen] = React.useState(false)
  const [activeSection, setActiveSection] = React.useState("")

  React.useEffect(() => {
    setMounted(true)
  }, [])

  React.useEffect(() => {
    const handleScroll = () => {
      const sections = navItems.map((item) => item.href.slice(1))
      for (const section of sections.reverse()) {
        const el = document.getElementById(section)
        if (el && el.offsetTop <= window.scrollY + 100) {
          setActiveSection(section)
          break
        }
      }
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const toggleTheme = (event: React.MouseEvent) => {
    if (!document.startViewTransition) {
      setTheme(theme === "dark" ? "light" : "dark")
      return
    }

    const x = event.clientX
    const y = event.clientY
    const endRadius = Math.hypot(
      Math.max(x, window.innerWidth - x),
      Math.max(y, window.innerHeight - y)
    )

    const transition = document.startViewTransition(() => {
      setTheme(theme === "dark" ? "light" : "dark")
    })

    transition.ready.then(() => {
      const clipPath = [
        `circle(0px at ${x}px ${y}px)`,
        `circle(${endRadius}px at ${x}px ${y}px)`,
      ]

      document.documentElement.animate(
        {
          clipPath: theme === "dark" ? [...clipPath].reverse() : clipPath,
        },
        {
          duration: 500,
          easing: "ease-in-out",
          pseudoElement:
            theme === "dark"
              ? "::view-transition-old(root)"
              : "::view-transition-new(root)",
        }
      )
    })
  }

  const currentItem =
    navItems.find((item) => item.href.slice(1) === activeSection) || navItems[0]
  const CurrentIcon = currentItem?.icon || User

  const dockItems = [
    {
      icon: (
        <img
          src={
            mounted && theme === "dark"
              ? "/Logo ICON-02.png"
              : "/Logo ICON-01.png"
          }
          alt="Logo"
          className="h-5 w-5"
        />
      ),
      label: "Home",
      href: "/",
    },
    {
      icon: <GithubIcon className="h-5 w-5" />,
      label: "GitHub",
      href: "https://github.com",
    },
    ...navItems.map((item) => ({
      icon: React.createElement(item.icon, { className: "h-5 w-5" }),
      label: item.label,
      href: item.href,
    })),
    {
      icon: <Sun className="h-5 w-5" />,
      label: theme === "dark" ? "Light" : "Dark",
      onClick: toggleTheme,
    },
  ]

  return (
    <>
      {/* Desktop - Floating Dock */}
      <div className="fixed right-0 bottom-6 left-0 z-[200] hidden items-center justify-center px-4 md:flex">
        <Dock items={dockItems} className="!h-auto" />
      </div>

      {/* Mobile - Dropdown */}
      <div className="fixed right-0 bottom-0 left-0 z-[200] flex w-full items-center justify-center bg-background/95 p-2 md:hidden">
        <div className="w-full max-w-md">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="flex w-full items-center justify-between rounded-lg border bg-card px-4 py-3"
          >
            <div className="flex items-center gap-2">
              <Monitor className="h-4 w-4" />
              <span className="font-medium">{currentItem?.label}</span>
            </div>
            <ChevronDown
              className={cn(
                "h-4 w-4 transition-transform",
                isOpen && "rotate-180"
              )}
            />
          </button>

          {isOpen && (
            <AnimatePresence>
              <motion.div
                initial={{ opacity: 0, y: -20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 0.95 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                className="mt-2 overflow-hidden rounded-lg border bg-card/95 backdrop-blur-xl"
              >
                <div className="flex items-center justify-center py-4">
                  <img
                    src={
                      mounted && theme === "dark"
                        ? "/Logo ICON-02.png"
                        : "/Logo ICON-01.png"
                    }
                    alt="Logo"
                    className="h-10 w-auto object-contain"
                  />
                </div>
                {navItems.map((item, index) => (
                  <motion.a
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsOpen(false)}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex cursor-pointer items-center gap-3 px-4 py-3 hover:bg-secondary"
                  >
                    <item.icon className="h-5 w-5" />
                    <span>{item.label}</span>
                  </motion.a>
                ))}
                <div className="border-t p-2">
                  <button
                    onClick={(e) => {
                      toggleTheme(e)
                      setIsOpen(false)
                    }}
                    className="flex w-full cursor-pointer items-center gap-3 rounded-lg px-4 py-3 hover:bg-secondary"
                  >
                    <Sun className="h-5 w-5" />
                    <span>
                      {theme === "dark" ? "Modo Claro" : "Modo Oscuro"}
                    </span>
                  </button>
                </div>
              </motion.div>
            </AnimatePresence>
          )}
        </div>
      </div>
    </>
  )
}
