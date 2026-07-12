"use client"

import * as React from "react"
import { createPortal } from "react-dom"
import { X } from "@/components/icons/solar"

export function Prose({ html }: { html: string }) {
  const ref = React.useRef<HTMLDivElement>(null)
  const [lightbox, setLightbox] = React.useState<{ src: string; alt: string } | null>(null)

  React.useEffect(() => {
    const root = ref.current
    if (!root) return

    // ── Botones de copiar en bloques de código ──────────────────────────
    const pres = Array.from(root.querySelectorAll("pre"))
    const cleanups: Array<() => void> = []
    for (const pre of pres) {
      if (pre.dataset.enhanced) continue
      pre.dataset.enhanced = "true"
      pre.classList.add("group/code")

      const btn = document.createElement("button")
      btn.type = "button"
      btn.className = "code-copy-btn"
      btn.setAttribute("aria-label", "Copiar código")
      btn.innerHTML = COPY_ICON
      const onClick = async (e: MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()
        const code = pre.querySelector("code")?.innerText ?? pre.innerText
        const ok = await copyToClipboard(code)
        btn.innerHTML = ok ? CHECK_ICON : ERROR_ICON
        btn.classList.add(ok ? "copied" : "copy-error")
        setTimeout(() => {
          btn.innerHTML = COPY_ICON
          btn.classList.remove("copied", "copy-error")
        }, 1600)
      }
      btn.addEventListener("click", onClick)
      pre.appendChild(btn)
      cleanups.push(() => btn.removeEventListener("click", onClick))
    }

    // ── Lightbox en imágenes ────────────────────────────────────────────
    const imgs = Array.from(root.querySelectorAll<HTMLImageElement>("img.prose-img"))
    const imgHandlers: Array<() => void> = []
    for (const img of imgs) {
      img.classList.add("zoomable")
      const onImg = () => setLightbox({ src: img.currentSrc || img.src, alt: img.alt })
      img.addEventListener("click", onImg)
      imgHandlers.push(() => img.removeEventListener("click", onImg))
    }

    return () => {
      cleanups.forEach((c) => c())
      imgHandlers.forEach((c) => c())
    }
  }, [html])

  React.useEffect(() => {
    if (!lightbox) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLightbox(null)
    }
    document.addEventListener("keydown", onKey)
    return () => document.removeEventListener("keydown", onKey)
  }, [lightbox])

  return (
    <>
      <div
        ref={ref}
        className="writeup-prose"
        dangerouslySetInnerHTML={{ __html: html }}
      />
      {lightbox &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            className="fixed inset-0 z-[300] flex items-center justify-center bg-black/85 p-6 backdrop-blur-sm"
            onClick={() => setLightbox(null)}
          >
            <button
              className="absolute top-5 right-5 flex h-10 w-10 items-center justify-center rounded-full border border-white/20 text-white/80 transition-colors hover:bg-white/10"
              aria-label="Cerrar"
              onClick={() => setLightbox(null)}
            >
              <X className="h-5 w-5" />
            </button>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={lightbox.src}
              alt={lightbox.alt}
              className="max-h-[90vh] max-w-[92vw] rounded-lg object-contain shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />
          </div>,
          document.body
        )}
    </>
  )
}

// iconos inline (lucide) para inyectar en botones creados con DOM
const ICON_BASE =
  'xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"'
const COPY_ICON = `<svg ${ICON_BASE}><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>`
const CHECK_ICON = `<svg ${ICON_BASE}><path d="M20 6 9 17l-5-5"/></svg>`
const ERROR_ICON = `<svg ${ICON_BASE}><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>`

/** Copia texto al portapapeles con fallback para contextos no seguros (HTTP/LAN). */
async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text)
      return true
    }
  } catch {
    /* cae al fallback */
  }
  try {
    const ta = document.createElement("textarea")
    ta.value = text
    ta.style.position = "fixed"
    ta.style.top = "-9999px"
    ta.style.opacity = "0"
    document.body.appendChild(ta)
    ta.focus()
    ta.select()
    const ok = document.execCommand("copy")
    document.body.removeChild(ta)
    return ok
  } catch {
    return false
  }
}
