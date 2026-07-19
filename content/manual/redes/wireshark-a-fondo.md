---
title: "Wireshark a Fondo"
order: 12
description: "Domina los filtros de captura BPF y los filtros de display de Wireshark para analizar tráfico y extraer credenciales en pruebas de penetración OSCP."
---

## Introducción

Wireshark es la herramienta de análisis de paquetes más utilizada en ciberseguridad. En el contexto del OSCP, te permitirá inspeccionar capturas realizadas en pivots, reconstruir sesiones de protocolos en claro y extraer artefactos (credenciales, ficheros) de tráfico interceptado. Ver también: [MitM y Sniffing](/cybersec/manual/redes/mitm-y-sniffing) y [Protocolos de Aplicación](/cybersec/manual/redes/protocolos-de-aplicacion).

---

## Filtros de Captura vs. Filtros de Display

Esta es la distinción más importante que debes interiorizar antes de tocar cualquier otro ajuste.

```text
┌─────────────────────────────────────────────────────────────────┐
│                       TRÁFICO DE RED                            │
│                            │                                    │
│              ┌─────────────▼─────────────┐                     │
│              │   FILTRO DE CAPTURA (BPF) │  ← Se aplica ANTES  │
│              │   Descarta paquetes que   │    de guardar        │
│              │   no coinciden            │                      │
│              └─────────────┬─────────────┘                     │
│                            │                                    │
│              ┌─────────────▼─────────────┐                     │
│              │   BUFFER / PCAP           │  ← Paquetes en RAM  │
│              └─────────────┬─────────────┘    o disco          │
│                            │                                    │
│              ┌─────────────▼─────────────┐                     │
│              │  FILTRO DE DISPLAY        │  ← Se aplica DESPUÉS│
│              │  Oculta/muestra paquetes  │    (no descarta)     │
│              │  ya capturados            │                      │
│              └─────────────┬─────────────┘                     │
│                            │                                    │
│              ┌─────────────▼─────────────┐                     │
│              │   PANEL DE PAQUETES       │                      │
│              └───────────────────────────┘                     │
└─────────────────────────────────────────────────────────────────┘
```

### Filtros de Captura (BPF — Berkeley Packet Filter)

Se configuran en **Capture → Options** antes de iniciar la captura. Usan sintaxis BPF idéntica a `tcpdump`. Su ventaja es que reducen la carga en memoria y disco al descartar paquetes a nivel de kernel, antes de que Wireshark los procese.

> [!IMPORTANT]
> Los filtros de captura **descartan permanentemente** los paquetes que no coinciden. Si capturas solo HTTP y luego necesitas ver DNS, deberás capturar de nuevo. Úsalos solo cuando sepas exactamente qué tráfico quieres.

| Objetivo | Filtro BPF |
|---|---|
| Solo tráfico HTTP | `tcp port 80` |
| Un host concreto | `host 10.10.10.5` |
| Una subred | `net 192.168.1.0/24` |
| Excluir tráfico SSH | `not port 22` |
| Solo SYN iniciales | `tcp[13] & 2 != 0 and tcp[13] & 16 = 0` |

### Filtros de Display

Se escriben en la barra de filtros de la interfaz principal. No eliminan paquetes del buffer: simplemente los **ocultan o muestran** en la lista. Puedes cambiarlos tantas veces como quieras sobre la misma captura. Su sintaxis es específica de Wireshark y más expresiva que BPF.

> [!TIP]
> La barra de filtros se vuelve **verde** cuando el filtro es válido y **roja** cuando contiene errores de sintaxis. Si está vacía, muestra todos los paquetes.

---

## Filtros de Display Esenciales para OSCP

### Filtros por dirección y puerto

```text
ip.addr == 10.10.10.5          # Cualquier paquete con esa IP (origen o destino)
ip.src == 10.10.10.5           # Solo paquetes originados desde esa IP
ip.dst == 10.10.10.5           # Solo paquetes destinados a esa IP
tcp.port == 80                 # Puerto TCP 80 en cualquier dirección
tcp.dstport == 443             # Solo conexiones hacia el puerto 443
```

### Filtros por protocolo

```text
http                           # Todo el tráfico HTTP (capa de aplicación)
dns                            # Consultas y respuestas DNS
ftp                            # Tráfico FTP (credenciales en claro)
telnet                         # Tráfico Telnet (credenciales en claro)
```

### Filtros de flags TCP

```text
tcp.flags.syn == 1 && tcp.flags.ack == 0    # SYN inicial (inicio de conexión)
tcp.flags.syn == 1 && tcp.flags.ack == 1    # SYN/ACK (respuesta del servidor)
tcp.flags.reset == 1                         # Resets (puerto cerrado, errores)
tcp.flags.fin == 1                           # Cierre de conexión
```

El filtro `tcp.flags.syn == 1 && tcp.flags.ack == 0` es especialmente útil durante el OSCP: permite ver **todas las nuevas conexiones iniciadas** desde/hacia un host, revelando qué servicios están siendo contactados.

### Búsqueda en payload

```text
frame contains "password"      # Busca el string "password" en cualquier capa
http contains "login"          # Busca en paquetes HTTP
tcp contains "USER"            # Útil para detectar autenticación FTP
```

> [!WARNING]
> `frame contains` es sensible a mayúsculas. Usa `frame matches "(?i)password"` para búsqueda insensible a mayúsculas (expresión regular).

### Seguimiento de streams

```text
tcp.stream eq 0                # Filtra SOLO la primera conversación TCP
tcp.stream eq 3                # Filtra SOLO la cuarta conversación TCP
```

El número de stream es asignado por Wireshark automáticamente en orden de aparición. Es la forma más limpia de aislar una conversación concreta.

---

## Follow Stream: Reconstruir Conversaciones

Wireshark puede reconstruir el diálogo completo de una conexión TCP o HTTP en texto legible. Esto es fundamental para leer credenciales, comandos o respuestas en claro.

### TCP Stream

1. Haz clic derecho sobre cualquier paquete de la conversación que te interesa.
2. Selecciona **Follow → TCP Stream**.
3. Wireshark abre una ventana con el intercambio completo: el tráfico del cliente se muestra en **rojo** y el del servidor en **azul**.
4. En el desplegable inferior puedes cambiar entre **ASCII**, **Hex** o **Raw**.

```text
┌─────────────────────────────────────────┐
│  Follow TCP Stream                      │
│                                         │
│  USER ftpuser              ← cliente    │
│  331 Password required     ← servidor   │
│  PASS s3cr3t               ← cliente    │
│  230 Login successful      ← servidor   │
└─────────────────────────────────────────┘
```

### HTTP Stream

Igual que TCP Stream, pero Wireshark descomprime el cuerpo HTTP automáticamente. Usa **Follow → HTTP Stream** para ver formularios POST con credenciales o respuestas JSON en claro.

> [!NOTE]
> El TCP Stream aplica el filtro `tcp.stream eq N` automáticamente. Recuérdalo para volver al análisis posterior o combinar filtros.

---

## Statistics: Análisis Global de la Captura

El menú **Statistics** ofrece vistas agregadas que permiten entender el tráfico de un vistazo.

### Protocol Hierarchy

**Statistics → Protocol Hierarchy** muestra el porcentaje de paquetes y bytes de cada protocolo. Útil para detectar protocolos inesperados (¿hay FTP en una red que solo debería tener HTTPS?) o confirmar qué capa de aplicación domina el tráfico.

### Conversations y Endpoints

- **Conversations**: lista todos los pares de hosts que han intercambiado paquetes, con bytes y duración de cada conversación. Permite identificar rápidamente qué hosts se comunican más.
- **Endpoints**: lista individual de IPs, MACs o puertos con sus estadísticas. Útil para detectar hosts con tráfico anómalo.

### Flow Graph (Diagrama de Secuencia)

**Statistics → Flow Graph** genera un diagrama de secuencia temporal que muestra el orden exacto de los paquetes entre los hosts. Es especialmente útil para visualizar el handshake TCP y el inicio de sesión de protocolos como HTTP o FTP.

```text
  Cliente              Servidor
     │                    │
     │──── SYN ──────────►│
     │◄─── SYN/ACK ───────│
     │──── ACK ──────────►│
     │──── GET /login ───►│
     │◄─── 200 OK ────────│
     │                    │
```

---

## Extracción de Ficheros: Export Objects

Wireshark puede **reensamblar y exportar** ficheros que fueron transferidos sobre HTTP (imágenes, ejecutables, documentos).

1. Ve a **File → Export Objects → HTTP**.
2. Aparece una lista con todos los recursos descargados por HTTP, con su URL, tipo de contenido y tamaño.
3. Selecciona el fichero que te interesa y haz clic en **Save**.

> [!TIP]
> Si la víctima descargó un ejecutable desde un servidor HTTP sin cifrar, puedes recuperarlo exactamente como lo recibió. Esto es relevante en análisis forense y en ejercicios de pivoting donde quieres entender qué herramientas descargó el atacante anterior.

Para otros protocolos existe **File → Export Objects → SMB**, útil para capturas de red Windows.

---

## Colorización y Perfiles

Wireshark colorea los paquetes por defecto según el protocolo (verde para HTTP, azul para DNS, etc.). Puedes personalizar las reglas en **View → Coloring Rules**.

Los **perfiles** (**Edit → Configuration Profiles**) permiten guardar juegos de filtros, colores y columnas distintos para diferentes escenarios (análisis web, análisis de malware, análisis de red industrial). En OSCP es útil tener un perfil con columnas que muestren la IP de destino y el payload de la primera línea HTTP.

---

## tshark: Wireshark en la Línea de Comandos

`tshark` es la versión CLI de Wireshark. Comparte el mismo motor de disección y los mismos filtros de display, pero funciona sin interfaz gráfica.

> [!IMPORTANT]
> `tshark` es ideal cuando tienes acceso a un servidor Linux sin entorno gráfico o cuando quieres automatizar análisis con scripts de shell.

### Opciones principales

```bash
# Listar interfaces disponibles
tshark -D

# Capturar en vivo en la interfaz eth0, mostrando solo tráfico HTTP
tshark -i eth0 -Y 'http.request'

# Leer un pcap existente y aplicar un filtro de display
tshark -r captura.pcap -Y 'http.request'

# Leer pcap y extraer campos concretos (IP destino y URI HTTP)
tshark -r captura.pcap -Y 'http.request' -T fields -e ip.dst -e http.request.uri

# Leer pcap y mostrar solo SYN iniciales
tshark -r captura.pcap -Y 'tcp.flags.syn==1 && tcp.flags.ack==0'

# Capturar 100 paquetes y guardar a fichero
tshark -i eth0 -c 100 -w salida.pcap
```

La opción `-T fields -e <campo>` permite extraer campos específicos para pasarlos a otras herramientas con `grep`, `awk` o `sort | uniq -c`.

---

## Uso Ofensivo: Extracción de Credenciales

Cuando realizas un ataque MitM (ver [MitM y Sniffing](/cybersec/manual/redes/mitm-y-sniffing)) o capturas tráfico en un segmento de red comprometido, Wireshark permite extraer credenciales de protocolos en claro.

### HTTP Basic Auth

```bash
# Filtrar peticiones HTTP con cabecera Authorization
tshark -r captura.pcap -Y 'http.authorization' -T fields -e ip.src -e http.authorization
```

Las credenciales están codificadas en Base64. El resultado `dXNlcjpwYXNz` se decodifica con `echo dXNlcjpwYXNz | base64 -d`.

### FTP

```bash
# Filtrar comandos de autenticación FTP
tshark -r captura.pcap -Y 'ftp.request.command == "USER" or ftp.request.command == "PASS"' \
  -T fields -e ip.src -e ftp.request.command -e ftp.request.arg
```

### Telnet

Telnet envía cada carácter en un paquete separado. Usa **Follow → TCP Stream** para reconstruir la sesión completa. Los protocolos en claro y sus riesgos se explican con más detalle en [Protocolos de Aplicación](/cybersec/manual/redes/protocolos-de-aplicacion).

> [!CAUTION]
> El uso de estas técnicas solo está autorizado en entornos de laboratorio controlados o con permiso explícito por escrito. En el OSCP, aplica estas técnicas únicamente dentro del alcance definido.

---

## Práctica

**Ejercicio 1.** Escribe el filtro de display de Wireshark para ver **únicamente los SYN iniciales** (paquetes que inician una nueva conexión TCP, sin el bit ACK activado).

<details>
<summary>Ver solución</summary>

El filtro correcto es:

```text
tcp.flags.syn == 1 && tcp.flags.ack == 0
```

**Por qué funciona:** un SYN inicial tiene el bit SYN activo (valor 1) y el bit ACK inactivo (valor 0). El SYN/ACK del servidor también tiene SYN=1, pero además tiene ACK=1, por lo que queda excluido. Así solo ves el primer paquete de cada nueva conexión TCP, lo que revela todos los servicios contactados por los hosts.

</details>

**Ejercicio 2.** Tienes una captura `trafico.pcap` de una red donde la víctima descargó un fichero ejecutable desde un servidor HTTP. Describe los pasos para recuperar ese fichero usando Wireshark.

<details>
<summary>Ver solución</summary>

1. Abre `trafico.pcap` en Wireshark: **File → Open**.
2. Aplica el filtro de display `http` para confirmar que hay tráfico HTTP visible.
3. Ve a **File → Export Objects → HTTP**.
4. En la ventana que aparece, busca entradas cuyo **Content Type** sea `application/octet-stream`, `application/x-msdownload` o similar, o cuya extensión sea `.exe`.
5. Selecciona la entrada y haz clic en **Save** (o **Save All** para exportar todo).

Si el servidor usó compresión gzip, Wireshark descomprime el cuerpo automáticamente antes de exportar. Si hay más de un objeto con el mismo nombre, Wireshark añade un sufijo numérico.

</details>

---

## Recursos

- [Wireshark — Sitio oficial](https://www.wireshark.org)
- [Wireshark Display Filter Reference (home)](https://www.wireshark.org)
- [Póster SANS TCP/IP and tcpdump](https://www.sans.org/posters/tcp-ip-and-tcpdump/)
- [tcpdump — Sitio oficial (sintaxis BPF compartida)](https://www.tcpdump.org)
