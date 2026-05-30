import Link from "next/link"
import Image from "next/image"
import { notFound } from "next/navigation"
import type { Metadata } from "next"
import { ArrowLeft, Clock, Calendar, ChevronRight } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { getWriteup, getWriteupSlugs, getAllWriteups } from "@/lib/writeups"
import { Toc } from "@/components/cybersec/toc"
import { TocMobile } from "@/components/cybersec/toc-mobile"
import { Prose } from "@/components/cybersec/prose"

const SITE = "https://alejandrobolado.es"

export async function generateStaticParams() {
  const slugs = await getWriteupSlugs()
  return slugs.map((slug) => ({ slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const w = await getWriteup(slug)
  if (!w) return { title: "Writeup no encontrado" }
  return {
    title: w.title,
    description: w.description || `Writeup de ${w.title} — ${w.category}.`,
  }
}

const DIFF_ORDER = ["Easy", "Medium", "Hard", "Insane"]

function diffColor(d: string | null) {
  switch (d) {
    case "Easy":
      return "text-emerald-600 dark:text-emerald-400"
    case "Medium":
      return "text-amber-600 dark:text-amber-400"
    case "Hard":
      return "text-red-600 dark:text-red-400"
    case "Insane":
      return "text-fuchsia-600 dark:text-fuchsia-400"
    default:
      return "text-muted-foreground"
  }
}

export default async function WriteupPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const writeup = await getWriteup(slug)
  if (!writeup) notFound()

  const all = await getAllWriteups()
  const idx = all.findIndex((w) => w.slug === slug)
  const prev = idx >= 0 ? all[idx + 1] : undefined
  const next = idx > 0 ? all[idx - 1] : undefined

  const topicTags = writeup.tags.filter((t) => !DIFF_ORDER.includes(t))
  const related = all
    .filter((w) => w.slug !== slug)
    .map((w) => ({
      w,
      score: w.tags.filter((t) => topicTags.includes(t)).length,
    }))
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map((r) => r.w)

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "TechArticle",
    headline: writeup.title,
    description: writeup.description || `Writeup de ${writeup.title}`,
    datePublished: writeup.published,
    author: { "@type": "Person", name: "Alejandro Bolado" },
    keywords: writeup.tags.join(", "),
    articleSection: writeup.category,
    ...(writeup.image ? { image: `${SITE}${writeup.image}` } : {}),
    url: `${SITE}/cybersec/writeups/${slug}`,
  }

  const published = new Date(writeup.published).toLocaleDateString("es-ES", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  return (
    <main className="mx-auto max-w-6xl px-4 pt-10 pb-28">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <nav className="mb-8 flex items-center gap-1.5 text-[13px] text-muted-foreground">
        <Link href="/cybersec/writeups" className="hover:text-foreground">
          Writeups
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="text-foreground">{writeup.title}</span>
      </nav>

      <div className="lg:grid lg:grid-cols-[1fr_220px] lg:gap-12">
        <article className="min-w-0">
          <header className="mb-10 border-b pb-8">
            <div className="mb-5 flex items-center gap-4">
              {writeup.image && (
                <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center overflow-hidden rounded-xl border bg-muted">
                  <Image
                    src={writeup.image}
                    alt={writeup.title}
                    width={64}
                    height={64}
                    className="h-full w-full object-cover"
                  />
                </div>
              )}
              <div>
                <p className="text-[11px] tracking-widest text-muted-foreground uppercase">
                  {writeup.category}
                </p>
                <h1 className="mt-1 text-2xl font-bold tracking-tight md:text-3xl">
                  {writeup.title}
                </h1>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[13px] text-muted-foreground">
              {writeup.difficulty && (
                <span className={cn("font-medium", diffColor(writeup.difficulty))}>
                  {writeup.difficulty}
                </span>
              )}
              <span className="inline-flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5" />
                {published}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5" />
                {writeup.readingMinutes} min
              </span>
            </div>

            <div className="mt-5 flex flex-wrap gap-1.5">
              {topicTags.map((tag) => (
                <Link key={tag} href={`/cybersec/writeups?q=${encodeURIComponent(tag)}`}>
                  <Badge
                    variant="secondary"
                    className="cursor-pointer rounded-full text-[11px] font-normal transition-colors hover:bg-foreground hover:text-background"
                  >
                    {tag}
                  </Badge>
                </Link>
              ))}
            </div>
          </header>

          <TocMobile headings={writeup.headings} className="lg:hidden" />

          <Prose html={writeup.html} />

          {related.length > 0 && (
            <section className="mt-16 border-t pt-8">
              <p className="mb-5 text-[11px] tracking-widest text-muted-foreground uppercase">
                Relacionados
              </p>
              <div className="grid gap-3 sm:grid-cols-3">
                {related.map((r) => (
                  <Link
                    key={r.slug}
                    href={`/cybersec/writeups/${r.slug}`}
                    className="group rounded-xl border p-3 transition-colors hover:bg-secondary"
                  >
                    <div className="flex items-center gap-2">
                      {r.image && (
                        <Image
                          src={r.image}
                          alt={r.title}
                          width={28}
                          height={28}
                          className="h-7 w-7 flex-shrink-0 rounded-md border object-cover"
                        />
                      )}
                      <span className="truncate text-[13px] font-medium">
                        {r.title}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {(prev || next) && (
            <nav className="mt-12 grid gap-4 border-t pt-8 sm:grid-cols-2">
              {prev ? (
                <Link
                  href={`/cybersec/writeups/${prev.slug}`}
                  className="group rounded-xl border p-4 transition-colors hover:bg-secondary"
                >
                  <span className="text-[10px] tracking-widest text-muted-foreground uppercase">
                    ← Anterior
                  </span>
                  <p className="mt-1 text-sm font-medium">{prev.title}</p>
                </Link>
              ) : (
                <span />
              )}
              {next && (
                <Link
                  href={`/cybersec/writeups/${next.slug}`}
                  className="group rounded-xl border p-4 text-right transition-colors hover:bg-secondary"
                >
                  <span className="text-[10px] tracking-widest text-muted-foreground uppercase">
                    Siguiente →
                  </span>
                  <p className="mt-1 text-sm font-medium">{next.title}</p>
                </Link>
              )}
            </nav>
          )}
        </article>

        <aside className="hidden lg:block">
          <div className="sticky top-24 max-h-[calc(100vh-8rem)] overflow-y-auto pb-8">
            <Toc headings={writeup.headings} />
            <Link
              href="/cybersec/writeups"
              className="mt-8 flex items-center gap-2 text-[13px] text-muted-foreground transition-colors hover:text-foreground"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Todos los writeups
            </Link>
          </div>
        </aside>
      </div>
    </main>
  )
}
