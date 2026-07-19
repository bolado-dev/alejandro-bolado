---
title: Modelo OSI y TCP/IP
order: 2
description: Las capas de red, qué hace cada una y cómo la encapsulación envuelve tus datos en segmento, paquete y trama — con su lectura ofensiva.
---

## Dos modelos, una misma idea

Una comunicación de red es demasiado compleja para pensarla de golpe, así que se divide en **capas**. Cada capa resuelve un problema concreto y habla solo con la capa de arriba y la de abajo. Hay dos modelos:

- **OSI** (7 capas) — modelo teórico de referencia. Perfecto para *razonar* y para clasificar ataques ("esto es capa 2", "esto es capa 7").
- **TCP/IP** (4 capas) — el modelo real que usa Internet. Es OSI simplificado.

![Modelo OSI y TCP/IP con encapsulación](/manual/redes/osi-encapsulacion.svg)

## Las 7 capas de OSI (de arriba abajo)

| # | Capa | Qué hace | PDU | Ejemplos | Ataques típicos |
|---|------|----------|-----|----------|-----------------|
| 7 | Aplicación | La app que usa el usuario | Datos | HTTP, DNS, SMB, FTP | Inyección web, enum de servicios |
| 6 | Presentación | Formato, cifrado, codificación | Datos | TLS, ASCII, JPEG | Ataques a TLS |
| 5 | Sesión | Abre/mantiene/cierra sesiones | Datos | NetBIOS, RPC | Secuestro de sesión |
| 4 | Transporte | Entrega fiable, **puertos** | Segmento | **TCP**, **UDP** | Escaneo de puertos |
| 3 | Red | Direccionamiento lógico, routing | Paquete | **IP**, ICMP | Spoofing de IP, routing |
| 2 | Enlace | Direccionamiento físico (MAC) | Trama | Ethernet, **ARP**, switching | ARP spoofing, MAC flooding |
| 1 | Física | Bits por el cable/aire | Bits | Cables, Wi-Fi | Sniffing físico |

> [!TIP]
> Regla mnemotécnica de arriba abajo: **A**plicación **P**resentación **S**esión **T**ransporte **R**ed **E**nlace **F**ísica → "**A**-**P**-**S**-**T**-**R**-**E**-**F**". O en inglés: *All People Seem To Need Data Processing*.

## Encapsulación: cómo viajan tus datos

Cuando envías algo, **cada capa envuelve** lo de la capa superior añadiendo su propia cabecera. Al llegar al destino, se desenvuelve en orden inverso (*desencapsulación*). Esto es lo más importante de toda la lección:

```text
  TÚ escribes:      "GET /index.html"                        (Capa 7 · Datos)
  + cabecera TCP →  [TCP | GET /index.html]                  (Capa 4 · Segmento)   ← puerto 80
  + cabecera IP  →  [IP | TCP | GET /index.html]             (Capa 3 · Paquete)    ← IP destino
  + cab. Ethernet → [ETH | IP | TCP | GET /index.html]       (Capa 2 · Trama)      ← MAC destino
  → 0101110100...                                            (Capa 1 · Bits)
```

Cada cabecera responde a una pregunta distinta:

- **TCP** → ¿a qué **puerto/aplicación** va? ¿en qué orden van los bytes?
- **IP** → ¿a qué **máquina** (a través de posibles routers) va?
- **Ethernet** → ¿a qué **tarjeta física** de mi red local se lo entrego ahora mismo?

> [!IMPORTANT]
> La cabecera **IP no cambia** de extremo a extremo (misma IP origen/destino todo el viaje), pero la cabecera **Ethernet se reescribe en cada salto** (router a router). Por eso el ARP spoofing solo funciona en tu **red local**: solo puedes falsear MACs de tu propio segmento de capa 2.

## Por qué esto le importa a un pentester

Clasificar un problema por capas te dice **qué herramienta** usar y **qué es posible**:

- ¿Quieres interceptar tráfico de la LAN? → capa 2 (ARP spoofing con `bettercap`).
- ¿Enrutar hacia otra red? → capa 3 (rutas, pivoting).
- ¿Ver puertos abiertos? → capa 4 (nmap).
- ¿Explotar una web? → capa 7.

Un firewall de capa 4 solo ve IPs y puertos; uno de capa 7 (WAF) entiende el HTTP. Saber *a qué capa* mira tu defensa te dice cómo evadirla.

## Práctica

**Ejercicio 1.** Clasifica cada elemento en su capa OSI: `ARP`, `nmap -sS`, una cookie de sesión robada, una inyección SQL, el cable de red, `TLS`, una dirección MAC.

<details>
<summary>Ver solución</summary>

- `ARP` → **Capa 2** (resuelve IP↔MAC en la LAN).
- `nmap -sS` → **Capa 4** (manipula segmentos TCP/puertos).
- Cookie de sesión → **Capa 5/7** (sesión/aplicación).
- Inyección SQL → **Capa 7** (aplicación).
- Cable de red → **Capa 1** (física).
- `TLS` → **Capa 6** (presentación/cifrado); en TCP/IP se considera aplicación.
- Dirección MAC → **Capa 2** (enlace).

</details>

**Ejercicio 2.** Abre Wireshark, captura un `ping` a `8.8.8.8` y despliega un paquete. Identifica en el panel de detalles las tres cabeceras: *Ethernet II* (MAC), *Internet Protocol* (IP) e *ICMP*. ¿Qué capa falta y por qué?

<details>
<summary>Ver solución</summary>

Falta la **capa 4 (TCP/UDP)**: `ping` usa **ICMP**, que va directamente sobre IP (capa 3) y **no usa puertos**. Por eso en un `ping` no verás cabecera TCP ni UDP. Verás: Ethernet (capa 2) → IP (capa 3) → ICMP → datos. Esto explica por qué no puedes "escanear un puerto" con ping: ICMP no tiene el concepto de puerto.

</details>

## Recursos

- [**Cloudflare Learning — "What is the OSI Model?"**](https://www.cloudflare.com/learning/ddos/glossary/open-systems-interconnection-model-osi/) — explicación visual y clara.
- [**Professor Messer — Network+ N10-009**](https://www.professormesser.com/network-plus/n10-009/n10-009-video/n10-009-training-course/) — módulos de conceptos de red.
- [**Wireshark**](https://www.wireshark.org/) — tu mejor profesor de encapsulación: captura y despliega paquetes reales.
