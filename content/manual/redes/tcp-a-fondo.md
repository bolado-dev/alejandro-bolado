---
title: TCP a Fondo
order: 6
description: El handshake, las flags, los números de secuencia y los estados de conexión — la teoría real que explica por qué funciona cada tipo de escaneo de nmap.
---

## TCP es una conversación con acuse de recibo

UDP dispara paquetes y se olvida. **TCP garantiza** que los datos lleguen completos y en orden. Para lograrlo, antes de enviar nada, las dos máquinas **acuerdan un punto de partida**: ese acuerdo es el *3-way handshake*. Casi todo lo que necesitas de TCP para el OSCP sale de aquí.

## Las 6 flags que tienes que dominar

Cada segmento TCP lleva en su cabecera unos bits de control ("flags"):

| Flag | Nombre | Significado en la práctica |
|------|--------|----------------------------|
| **SYN** | Synchronize | "Quiero abrir conexión y sincronizar números de secuencia" |
| **ACK** | Acknowledge | "Confirmo que recibí tus datos hasta el byte X" |
| **FIN** | Finish | "He terminado de enviar, cerremos ordenadamente" |
| **RST** | Reset | "Corta ya" → puerto cerrado o conexión inválida |
| **PSH** | Push | "Entrega estos datos a la app ya, no los guardes en buffer" |
| **URG** | Urgent | "Hay datos urgentes" (casi no se usa) |

> [!IMPORTANT]
> La idea que lo cambia todo: un puerto **cerrado** responde con **RST**; un puerto **abierto** responde con **SYN/ACK**; un puerto **filtrado** (firewall) **no responde nada**. Nmap no hace más que provocar y leer estas tres respuestas.

## El 3-way handshake, paso a paso

![TCP 3-way handshake](/manual/redes/tcp-handshake.svg)

```text
   CLIENTE (tu Kali)                          SERVIDOR (:80 abierto)
        │  ①  SYN   Seq=1000                         │  "Mi ISN=1000"
        │ ──────────────────────────────────────────▶│
        │  ②  SYN, ACK   Seq=5000  Ack=1001          │  "Mi ISN=5000, recibí tu 1000"
        │ ◀──────────────────────────────────────────│
        │  ③  ACK   Seq=1001  Ack=5001               │  "Confirmado, empezamos"
        │ ──────────────────────────────────────────▶│
     [ CONEXIÓN ESTABLECIDA — fluyen los datos ]
```

Cada lado elige un **ISN** (Initial Sequence Number) aleatorio, y el otro responde con `Ack = Seq recibido + 1`. Ese "+1" es cómo TCP cuenta bytes y detecta pérdidas: si un segmento no se confirma, se retransmite. El cierre ordenado es simétrico con **FIN/ACK** por ambos lados (o abrupto con **RST**).

## Estados de una conexión TCP

Una conexión atraviesa estados que verás con `netstat -ant` o `ss -ant`. Los que importan:

| Estado | Qué significa |
|--------|---------------|
| `LISTEN` | Un servicio espera conexiones en ese puerto (¡puerto abierto!) |
| `SYN-SENT` | Enviaste SYN, esperas respuesta |
| `SYN-RECV` | Recibiste SYN, enviaste SYN/ACK (medio abierta) |
| `ESTABLISHED` | Handshake completo, datos fluyendo |
| `TIME-WAIT` | Cerraste tú, esperas por si llegan paquetes rezagados |
| `CLOSE-WAIT` | El otro extremo cerró, falta que cierres tú |

> [!TIP]
> En una máquina comprometida, `ss -antp` (o `netstat -antp`) te muestra puertos en `LISTEN` que **no** viste desde fuera: servicios escuchando solo en `127.0.0.1`. Esos son oro para escalar privilegios o pivotar (hay que hacer *port forwarding* para alcanzarlos).

## Cómo esto ES nmap (el mapeo clave)

Aquí es donde la teoría paga. Cada tipo de escaneo es una forma distinta de jugar con el handshake:

- **`-sS` (SYN scan / "half-open")** → manda el paso ① (SYN). Si vuelve **SYN/ACK** → *abierto* (y responde **RST** para no completar el handshake: rápido y algo sigiloso). Si vuelve **RST** → *cerrado*. Silencio → *filtrado*. Requiere root.
- **`-sT` (Connect scan)** → completa el handshake entero (①②③) usando la pila del sistema. Más ruidoso y se registra en logs. Se usa **sin privilegios** o **a través de proxychains** (pivoting).
- **`-sU` (UDP scan)** → sin handshake (ver lección de UDP).

Cuando leas `nmap -sS 10.10.10.5` → `80/tcp open`, ahora *sabes* que por debajo hubo `SYN → SYN/ACK → RST`. Eso es entender de verdad. En la lección **Teoría del escaneo de puertos** verás también los scans "raros" (FIN, NULL, Xmas, ACK) y por qué evaden ciertos firewalls.

## Práctica

**Ejercicio 1.** Interpreta esta captura resumida de `tcpdump` (recuerda: `[S]`=SYN, `[S.]`=SYN/ACK, `[R]`=RST, `[R.]`=RST/ACK, `[.]`=ACK, `[F]`=FIN, `[P]`=PSH):

```text
1  10.10.14.7.51234 > 10.10.10.5.80:  Flags [S],  seq 1000
2  10.10.10.5.80    > 10.10.14.7.51234: Flags [S.], seq 5000, ack 1001
3  10.10.14.7.51234 > 10.10.10.5.80:  Flags [R],  seq 1001
4  10.10.14.7.51235 > 10.10.10.5.445: Flags [S],  seq 2000
5  10.10.10.5.445   > 10.10.14.7.51235: Flags [R.], ack 2001
```

Preguntas: (a) ¿está abierto el puerto 80? (b) ¿y el 445? (c) ¿por qué el paquete 3 es RST y no ACK? (d) ¿es un `-sS` o un `-sT`?

<details>
<summary>Ver solución</summary>

- **(a) 80 abierto.** El servidor respondió `SYN/ACK` (paquete 2) → hay servicio escuchando.
- **(b) 445 cerrado.** El servidor respondió `RST/ACK` (paquete 5) → nadie escucha ahí.
- **(c)** Porque es un **SYN scan (`-sS`)**: nmap ya tiene su respuesta (abierto) tras el `SYN/ACK`, así que envía `RST` para **abortar** el handshake sin completarlo (no llega a `ESTABLISHED`). Por eso se llama "half-open".
- **(d) `-sS`.** Un `-sT` habría **completado** el handshake con un `ACK` (paso 3) en el puerto abierto, no un `RST`.

</details>

**Ejercicio 2 (hazlo en Kali).** Captura tu propio handshake y ciérralo:

```bash
# Terminal 1
sudo tcpdump -i any -n 'host example.com and tcp port 80' -c 15
# Terminal 2
curl -s http://example.com > /dev/null
```

Identifica los 3 paquetes de apertura y los `FIN`/`RST` del cierre. Abre la misma captura en **Wireshark** y usa *Statistics → Flow Graph* para verla como diagrama de secuencia.

<details>
<summary>Ver solución</summary>

Verás `[S]`, `[S.]`, `[.]` al inicio. Luego el `GET`/respuesta (`[P.]` con datos), y al final el cierre: normalmente `[F.]` (FIN+ACK) de cada lado, o un `[R]` si se corta abruptamente. En el *Flow Graph* de Wireshark queda idéntico al diagrama de arriba.

</details>

## Recursos

- [**RFC 9293**](https://www.rfc-editor.org/rfc/rfc9293) — especificación actual de TCP (referencia, no lectura lineal). El clásico [**RFC 793**](https://www.rfc-editor.org/rfc/rfc793) es el original.
- [**nmap — SYN scan**](https://nmap.org/book/synscan.html) — cómo implementa nmap el "half-open".
- [**wizardzines (Julia Evans)**](https://wizardzines.com/) — cómics cortos y visuales de TCP y redes.
- [**SANS — Póster "TCP/IP and tcpdump"**](https://www.sans.org/posters/tcp-ip-and-tcpdump/) — todas las flags y cabeceras en una hoja.
