# Spotted — branding

Coloca aquí el logo de la app:
- `logo.svg` (preferido) o `logo.png` con fondo transparente.

Luego, en `components/sections.tsx` (array `projects`, entrada "Spotted"):
- `logo`: ruta al archivo, p.ej. "/projects/spotted/logo.svg"
- `accent`: color de marca en hex/oklch (icono y detalles)
- `description`: pitch real de la app
- `category`: p.ej. "App móvil · React Native"
- Cuando deje de ser "próximamente": quita `comingSoon` y añade `href` (y `repoLabel` si aplica).
