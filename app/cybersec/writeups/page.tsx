import type { Metadata } from "next"
import { getAllWriteups } from "@/lib/writeups"
import { WriteupsExplorer } from "@/components/cybersec/writeups-explorer"

export const metadata: Metadata = {
  title: "Writeups",
  description:
    "Writeups de Hack The Box: pentesting, explotación y escalada de privilegios paso a paso.",
}

export default async function WriteupsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>
}) {
  const [writeups, { q }] = await Promise.all([getAllWriteups(), searchParams])

  return (
    <main className="px-4 pt-16 pb-28">
      <div className="container mx-auto max-w-4xl">
        <p className="mb-4 text-[11px] tracking-widest text-muted-foreground uppercase">
          Hack The Box · Apuntes
        </p>
        <h1 className="text-4xl font-bold tracking-tighter md:text-5xl">
          Writeups
        </h1>
        <p className="mt-4 mb-12 max-w-xl text-[15px] leading-relaxed text-muted-foreground">
          Resoluciones documentadas paso a paso. Enumeración, explotación,
          post-explotación y escalada de privilegios.
        </p>

        <WriteupsExplorer writeups={writeups} initialQuery={q ?? ""} />
      </div>
    </main>
  )
}
