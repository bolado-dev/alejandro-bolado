import Link from "next/link"

export function VisualsFooter() {
  const year = new Date().getFullYear()
  return (
    <footer className="border-t border-border px-6 py-12">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-6 text-center sm:flex-row sm:justify-between sm:text-left">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/visuals/logo-dark.svg"
          alt="Bolado Visuals"
          className="h-6 w-auto"
        />
        <p className="text-xs text-muted-foreground">
          © {year} Bolado Visuals · Fotografía &amp; Filmmaking · Cantabria
        </p>
        <Link
          href="/"
          className="text-xs tracking-widest text-muted-foreground uppercase transition-colors hover:text-foreground"
        >
          ← Alejandro Bolado
        </Link>
      </div>
    </footer>
  )
}
