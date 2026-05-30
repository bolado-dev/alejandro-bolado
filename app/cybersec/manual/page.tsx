import { redirect } from "next/navigation"
import { getFirstManualPage } from "@/lib/manual"

export default async function ManualIndex() {
  const first = await getFirstManualPage()
  if (first) redirect(first.href)

  return (
    <div className="py-20 text-center text-sm text-muted-foreground">
      El manual aún no tiene páginas.
    </div>
  )
}
