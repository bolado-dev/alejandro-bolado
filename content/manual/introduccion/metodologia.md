---
title: Metodología de Pentesting
order: 1
description: Las fases de una auditoría ofensiva — reconocimiento, enumeración, explotación, post-explotación y reporte — y cómo organizarte.
---

## Fases de una auditoría

Un pentest no es lanzar herramientas al azar. Sigue un flujo ordenado donde cada fase alimenta a la siguiente.

1. **Reconocimiento** — recopilar información del objetivo (pasivo y activo).
2. **Enumeración** — listar servicios, versiones, usuarios y rutas.
3. **Explotación** — abusar de una vulnerabilidad para obtener acceso.
4. **Post-explotación** — escalar privilegios, pivotar y mantener acceso.
5. **Reporte** — documentar hallazgos, impacto y remediación.

## Reconocimiento

El objetivo es ampliar la superficie de ataque. Cuanta más información, más vectores.

- **Pasivo**: OSINT, DNS, certificados, metadatos. Sin tocar el objetivo.
- **Activo**: escaneo de puertos, fingerprinting de servicios.

## Enumeración

La fase más importante. El 80% del trabajo en una máquina suele ser enumerar bien.

> [!TIP]
> Si te atascas, casi siempre es porque te falta enumerar algo. Vuelve atrás.

## Explotación

Con un servicio vulnerable identificado, se busca el exploit o la mala configuración que permita ejecutar código o leer datos.

## Post-explotación

- Estabilizar la shell.
- Enumerar el sistema interno (usuarios, permisos, procesos, red).
- Escalar a `root` / `Administrator`.
- Pivotar hacia otras máquinas.

## Toma de notas

Documenta **mientras** trabajas, no después:

- Comandos ejecutados y su salida relevante.
- Credenciales encontradas (usuario, hash, dónde).
- Puertos y servicios.
- Capturas de cada paso clave.

Una buena estructura de carpetas por máquina:

```bash
maquina/
├── nmap/
├── content/      # ficheros descargados / subidos
├── exploits/
└── notes.md
```
