# Spotted — branding

- `icon.svg` — icono de la app tras el rebranding (manual de marca, 2026-10-29):
  tile con el degradado naranja y la marca en blanco. Es el que sale como badge
  en la tarjeta del proyecto (`icon` en `PROJECTS`, `lib/home-data.ts`).
- `screenshot.webp` — captura grande de la parte superior de la tarjeta
  (`image` en `PROJECTS`).

La fuente de la marca es el repo de la app (`~/Dev/spotted`):
`web/public/favicon.svg` y `web/components/ui/LogoGlyph.tsx` llevan los mismos
trazos, y `assets/brand/logo-icon.png` es el tile del que se vectorizó este SVG.
Si vuelve a cambiar la marca, se regenera desde ahí — no se redibuja a mano.

El logo anterior (`logo.webp`, la carretera en S sobre tile negro) se retiró con
el rebranding.
