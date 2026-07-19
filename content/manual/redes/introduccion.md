---
title: Introducción y Ruta de Estudio
order: 1
description: Por qué las redes son la base del OSCP, cómo estudiarlas en profundidad y el método para que se te queden de verdad (teoría + captura + práctica).
---

## Por qué empezar por redes

Casi todo lo que harás en el OSCP —escanear, enumerar, explotar y sobre todo **pivotar**— es, por debajo, tráfico de red. Si entiendes qué pasa **byte a byte** cuando dos máquinas hablan, cada herramienta (`nmap`, `wireshark`, `chisel`, `proxychains`) deja de ser magia y se vuelve obvia.

> [!IMPORTANT]
> El objetivo de esta sección no es memorizar puertos, es entender **el porqué**. Un puerto cerrado responde `RST`, uno abierto responde `SYN/ACK`, uno filtrado no responde nada. Cuando entiendes eso, entiendes *todos* los tipos de escaneo de nmap sin memorizar ninguno.

## La regla de oro: verlo con tus propios ojos

Cada concepto que estudies, **reprodúcelo en Wireshark o `tcpdump`**. Leer que el handshake TCP es `SYN → SYN/ACK → ACK` se olvida; *capturarlo tú mismo* no. La fórmula que funciona:

```text
        TEORÍA  ──►  CAPTURA (Wireshark)  ──►  EXPLICARLO  ──►  HERRAMIENTA OFENSIVA
       el porqué      verlo de verdad       técnica Feynman    "esto es lo que hace nmap"
```

## Ruta de estudio de esta sección

El orden está pensado para construir de abajo hacia arriba. No pases a la siguiente lección hasta que puedas **explicar la anterior en voz alta**.

1. **Modelo OSI y TCP/IP** — el mapa mental. Encapsulación.
2. **Direccionamiento y Subnetting** — CIDR, máscaras, VLSM. *Crítico para scoping y pivoting.*
3. **TCP a fondo** — handshake, flags, estados. La teoría real detrás de nmap.
4. **UDP, ICMP y ARP** — sin conexión, descubrimiento de hosts, ARP spoofing.
5. **DNS** — registros, resolución, transferencias de zona (AXFR).
6. **Protocolos de aplicación y servicios** — HTTP/TLS, SMB, SNMP, SMTP, FTP, SSH, RDP/WinRM.
7. **Teoría del escaneo de puertos** — cada flag de nmap mapeada a comportamiento TCP.
8. **Firewalls, NAT, Tunneling y Pivoting** — el gran payoff del OSCP.

## Monta tu laboratorio

No necesitas nada caro. Con esto te sobra para practicar todo lo de esta sección:

- **Kali Linux** (tu máquina atacante) con `wireshark`, `tcpdump`, `nmap`, `dig`, `netcat`.
- Un objetivo cualquiera: otra VM, tu propio router, o una máquina de **Hack The Box** / **TryHackMe**.
- Para subnetting: papel y lápiz. En serio.

> [!TIP]
> Dedica **10 minutos al día** a ejercicios de subnetting hasta que te salgan de cabeza. Es la habilidad de redes con mejor relación esfuerzo/recompensa en el examen.

## Método de estudio (para que no se te olvide)

1. Lee o mira el concepto.
2. **Reprodúcelo** en tu laboratorio (captura, comando, cálculo).
3. **Explícalo** por escrito o en voz alta como si se lo enseñaras a alguien (técnica Feynman). Si te trabas, ahí está tu laguna.
4. **Conéctalo** con una herramienta ofensiva concreta.
5. Repite el subnetting a diario.

## Práctica

> [!NOTE]
> **Ejercicio de arranque.** Antes de empezar la Lección 1, monta la primera captura de tu vida. Abre dos terminales en Kali:

```bash
# Terminal 1 — captura el saludo TCP hacia un servidor web
sudo tcpdump -i any -n 'tcp port 443 and host example.com' -c 12

# Terminal 2 — provoca el tráfico
curl -sI https://example.com > /dev/null
```

**Preguntas:**
1. ¿Cuántos paquetes ves *antes* de que empiece el cifrado TLS?
2. ¿Reconoces las flags `[S]`, `[S.]` y `[.]` en la salida?
3. ¿Qué representa cada una?

<details>
<summary>Ver solución</summary>

1. Ves **3 paquetes** del handshake TCP antes del TLS: el `SYN`, el `SYN/ACK` y el `ACK`.
2. En la notación de `tcpdump`: `[S]` = SYN, `[S.]` = SYN/ACK (el punto es el ACK), `[.]` = ACK a secas.
3. `SYN` = "quiero abrir conexión y sincronizar números de secuencia"; `SYN/ACK` = "de acuerdo, y sincronizo yo también"; `ACK` = "confirmado, empezamos". Justo después verás los paquetes del handshake TLS (`Client Hello`, `Server Hello`…), que van *por encima* de la conexión TCP ya establecida.

</details>

## Recursos

- [**Professor Messer — Network+ (N10-009)**](https://www.professormesser.com/network-plus/n10-009/n10-009-video/n10-009-training-course/) — la mejor base ordenada y gratuita (curso completo en vídeo).
- [**TryHackMe — "Pre Security"**](https://tryhackme.com/path/outline/presecurity) — ruta práctica y guiada desde cero.
- [**HTB Academy — "Introduction to Networking"**](https://academy.hackthebox.com/course/preview/introduction-to-networking) — muy alineado con el OSCP.
- [**Practical Packet Analysis** (Chris Sanders, No Starch Press)](https://nostarch.com/packetanalysis3) — para dominar Wireshark.
- [**SANS — Póster "TCP/IP and tcpdump"**](https://www.sans.org/posters/tcp-ip-and-tcpdump/) — cheatsheet imprimible de cabeceras y flags.
