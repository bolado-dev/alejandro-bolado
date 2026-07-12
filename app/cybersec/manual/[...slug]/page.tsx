import Link from "next/link"
import { notFound } from "next/navigation"
import type { Metadata } from "next"
import { Clock, ChevronRight, ArrowLeft, ArrowRight } from "@/components/icons/solar"
import { getManualPage, getAllManualParams } from "@/lib/manual"
import { Toc } from "@/components/cybersec/toc"
import { TocMobile } from "@/components/cybersec/toc-mobile"
import { Prose } from "@/components/cybersec/prose"

export async function generateStaticParams() {
  return getAllManualParams()
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string[] }>
}): Promise<Metadata> {
  const { slug } = await params
  const page = await getManualPage(slug)
  if (!page) return { title: "Página no encontrada" }
  return {
    title: page.title,
    description: page.description,
  }
}

export default async function ManualPage({
  params,
}: {
  params: Promise<{ slug: string[] }>
}) {
  const { slug } = await params
  const page = await getManualPage(slug)
  if (!page) notFound()

  return (
    <div className="py-8 xl:grid xl:grid-cols-[1fr_200px] xl:gap-10">
      <article className="min-w-0">
        <nav className="mb-6 flex items-center gap-1.5 text-[13px] text-muted-foreground">
          <Link href="/cybersec/manual" className="hover:text-foreground">
            Manual
          </Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <span>{page.sectionTitle}</span>
          <ChevronRight className="h-3.5 w-3.5" />
          <span className="text-foreground">{page.title}</span>
        </nav>

        <header className="mb-8 border-b pb-6">
          <p className="text-[11px] tracking-widest text-muted-foreground uppercase">
            {page.sectionTitle}
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight md:text-4xl">
            {page.title}
          </h1>
          {page.description && (
            <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-muted-foreground">
              {page.description}
            </p>
          )}
          <div className="mt-4 flex items-center gap-1.5 text-[13px] text-muted-foreground">
            <Clock className="h-3.5 w-3.5" />
            {page.readingMinutes} min de lectura
          </div>
        </header>

        <TocMobile headings={page.headings} className="xl:hidden" />

        <Prose html={page.html} />

        {(page.prev || page.next) && (
          <nav className="mt-16 grid gap-4 border-t pt-8 sm:grid-cols-2">
            {page.prev ? (
              <Link
                href={page.prev.href}
                className="group flex flex-col rounded-xl border p-4 transition-colors hover:bg-secondary"
              >
                <span className="inline-flex items-center gap-1 text-[10px] tracking-widest text-muted-foreground uppercase">
                  <ArrowLeft className="h-3 w-3" /> Anterior
                </span>
                <span className="mt-1 text-sm font-medium">{page.prev.title}</span>
              </Link>
            ) : (
              <span />
            )}
            {page.next && (
              <Link
                href={page.next.href}
                className="group flex flex-col rounded-xl border p-4 text-right transition-colors hover:bg-secondary"
              >
                <span className="inline-flex items-center justify-end gap-1 text-[10px] tracking-widest text-muted-foreground uppercase">
                  Siguiente <ArrowRight className="h-3 w-3" />
                </span>
                <span className="mt-1 text-sm font-medium">{page.next.title}</span>
              </Link>
            )}
          </nav>
        )}
      </article>

      <aside className="hidden xl:block">
        <div className="sticky top-24 max-h-[calc(100vh-8rem)] overflow-y-auto py-8">
          <Toc headings={page.headings} />
        </div>
      </aside>
    </div>
  )
}
