---
title: DNS — Resolución y Enumeración
order: 10
description: Cómo se resuelven los nombres, los tipos de registro que importan y cómo abusar del DNS en pentesting — transferencias de zona, enumeración de subdominios y PTR.
---

## Qué problema resuelve el DNS

Las máquinas se hablan por **IP**, pero los humanos recordamos **nombres**. El DNS es la "guía telefónica" de Internet: traduce `www.ejemplo.com` → `93.184.216.34`. Es una base de datos **jerárquica y distribuida**.

```text
                    . (raíz)
                    │
          ┌─────────┼─────────┐
         com       org        es          ← TLD (Top-Level Domain)
          │
       ejemplo                             ← dominio de 2º nivel
          │
    ┌─────┴─────┐
   www         mail                        ← subdominios / hosts
```

## Cómo se resuelve un nombre (recursivo vs iterativo)

Cuando tu equipo pregunta por `www.ejemplo.com`, el **resolver** (normalmente tu router/ISP) hace el trabajo pesado:

```text
Tu PC → Resolver:  "¿www.ejemplo.com?"                 (consulta RECURSIVA: "resuélvelo tú")
Resolver → Raíz:   "¿y .com?"          → "pregunta al TLD .com"   (ITERATIVA)
Resolver → TLD:    "¿ejemplo.com?"     → "pregunta al NS de ejemplo.com"
Resolver → NS auth: "¿www.ejemplo.com?" → "93.184.216.34"  (respuesta AUTORITATIVA)
Resolver → Tu PC:  "93.184.216.34"     (y lo cachea según el TTL)
```

- **Recursiva:** "dame la respuesta final" (tu PC al resolver).
- **Iterativa:** "dame la siguiente pista" (el resolver preguntando por la jerarquía).

## Tipos de registro que debes conocer

| Registro | Qué guarda | Por qué importa en pentesting |
|----------|-----------|-------------------------------|
| **A** | Nombre → IPv4 | El mapeo básico |
| **AAAA** | Nombre → IPv6 | A veces hay servicios solo en IPv6 |
| **CNAME** | Alias → otro nombre | Revela infraestructura (CDN, cloud) |
| **MX** | Servidor de correo | Superficie de correo (SMTP) |
| **NS** | Servidores de nombres del dominio | Objetivos para intentar AXFR |
| **PTR** | IP → Nombre (DNS inverso) | Descubrir hostnames de un rango |
| **TXT** | Texto libre (SPF, verificaciones) | A veces filtra info interna |
| **SOA** | Datos de la zona (serial, etc.) | Punto de partida de la zona |

## Herramientas de consulta

```bash
dig ejemplo.com A                 # registro A
dig ejemplo.com MX +short         # servidores de correo, salida limpia
dig ejemplo.com NS +short         # servidores de nombres
dig -x 93.184.216.34              # DNS inverso (PTR)
nslookup ejemplo.com              # alternativa clásica
host -t txt ejemplo.com           # registros TXT
```

## Ataque estrella: transferencia de zona (AXFR)

Una **transferencia de zona** es cómo un servidor DNS secundario copia *toda* la base de datos del primario. Si un servidor está mal configurado y permite AXFR a **cualquiera**, te entrega en bandeja **todos** los registros del dominio: subdominios internos, IPs, hosts… un mapa completo.

```bash
# 1) averigua los servidores de nombres (NS)
dig ns zonevulnerable.htb +short
# 2) pide la zona completa a cada NS
dig axfr zonevulnerable.htb @ns1.zonevulnerable.htb
```

> [!IMPORTANT]
> El AXFR es de las primeras cosas que se prueban contra un puerto **53** en OSCP/HTB. Si funciona, te ahorras horas de enumeración: obtienes subdominios y hosts internos directamente. Si falla (lo normal en producción), pasas a fuerza bruta de subdominios.

## Enumeración de subdominios (cuando el AXFR falla)

```bash
# fuerza bruta de subdominios con diccionario
gobuster dns -d ejemplo.com -w /usr/share/seclists/Discovery/DNS/subdomains-top1million-5000.txt
# alternativas
dnsenum ejemplo.com
ffuf -w subdominios.txt -u http://FUZZ.ejemplo.com
```

> [!TIP]
> En HTB/OSCP, cuando un servicio web redirige a un nombre como `http://maquina.htb`, añádelo a tu `/etc/hosts` apuntando a la IP de la máquina. Muchos vhosts solo responden si mandas el `Host:` correcto → prueba también **fuzzing de vhosts** con `ffuf -H "Host: FUZZ.maquina.htb"`.

## Práctica

**Ejercicio 1.** Solo con `dig`, averigua: (a) la IP de `example.com`, (b) sus servidores de nombres, (c) su servidor de correo.

<details>
<summary>Ver solución</summary>

```bash
dig example.com A +short        # (a) IP(s)
dig example.com NS +short       # (b) servidores de nombres
dig example.com MX +short       # (c) servidor de correo (con prioridad)
```
`+short` recorta la salida a lo esencial. Sin él, verás también las secciones `ANSWER`, `AUTHORITY` y `ADDITIONAL`, útiles para entender de dónde vino la respuesta.

</details>

**Ejercicio 2.** Tienes una máquina HTB en `10.10.11.55` con el puerto 53 abierto y sospechas del dominio `friendzone.htb`. ¿Qué comando intentarías primero y qué buscas?

<details>
<summary>Ver solución</summary>

Intentar una **transferencia de zona**:

```bash
dig axfr friendzone.htb @10.10.11.55
```

Buscas que el servidor te devuelva la zona completa: registros `A` de subdominios (`admin.friendzone.htb`, `uploads.friendzone.htb`, etc.). Cada subdominio nuevo es una superficie de ataque adicional; añádelos a `/etc/hosts` y enuméralos por web.

</details>

## Recursos

- [**howdns.works**](https://howdns.works/) — cómic interactivo que explica la resolución paso a paso.
- [**Cloudflare Learning — "What is DNS?"**](https://www.cloudflare.com/learning/dns/what-is-dns/) — la jerarquía explicada visualmente.
- [**HTB Academy — "Footprinting"**](https://academy.hackthebox.com/course/preview/footprinting) — incluye enumeración DNS ofensiva.
- [**`dig` — manual**](https://manpages.ubuntu.com/manpages/noble/en/man1/dig.1.html) — dominar `+short`, `axfr`, `-x`.
- [**SecLists — Discovery/DNS/**](https://github.com/danielmiessler/SecLists/tree/master/Discovery/DNS) — diccionarios de subdominios.
