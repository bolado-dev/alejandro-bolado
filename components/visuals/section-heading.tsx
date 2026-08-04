import { cn } from "@/lib/utils"

export function SectionHeading({
  eyebrow,
  title,
  description,
  center = false,
  dark = false,
  className,
}: {
  eyebrow: string
  title: React.ReactNode
  description?: string
  center?: boolean
  dark?: boolean
  className?: string
}) {
  return (
    <div
      className={cn(center ? "mx-auto max-w-2xl text-center" : "max-w-2xl", className)}
    >
      <span
        className={cn(
          "inline-flex items-center rounded-full px-3 py-1 text-xs font-medium",
          dark ? "bg-white/10 text-white/70" : "bg-secondary text-muted-foreground"
        )}
      >
        {eyebrow}
      </span>
      <h2 className="visuals-display mt-5 text-4xl text-balance md:text-5xl">
        {title}
      </h2>
      {description && (
        <p
          className={cn(
            "mt-4 text-lg leading-relaxed",
            dark ? "text-zinc-400" : "text-muted-foreground",
            center ? "mx-auto max-w-xl" : "max-w-xl"
          )}
        >
          {description}
        </p>
      )}
    </div>
  )
}
