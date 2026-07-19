---
title: MITM y Sniffing en la LAN
order: 17
description: Cómo capturar tráfico ajeno en una red switcheada mediante ARP spoofing con bettercap, qué credenciales obtienes y cómo defenderse.
---

## Por qué el sniffing pasivo no basta en redes modernas

En los años del HUB (concentrador), toda la red compartía el mismo dominio de colisión: cualquier tarjeta en modo promiscuo veía **todos** los paquetes de todos los hosts. Bastaba con `tcpdump` o Wireshark para leer el tráfico ajeno.

El SWITCH cambió las reglas. Un switch aprende qué MAC está en cada puerto y envía cada trama **solo al puerto de destino**. Tu interfaz solo recibe:

- Tráfico destinado a tu propia MAC.
- Tráfico **broadcast** (ARP requests, DHCP, etc.).
- Tráfico **multicast** que tu NIC acepte.

Por tanto, en una red switcheada moderna, el sniffing pasivo te muestra tu propio tráfico y broadcasts, pero **no** la conversación entre otros dos hosts. Para eso necesitas colocarte en medio: un ataque **Man-in-the-Middle (MITM)**.

> [!NOTE]
> Wireshark en modo promiscuo sigue siendo útil para capturar tu propio tráfico (útil en pentesting cuando generas tú las peticiones). Para tráfico ajeno necesitas el MITM primero. Consulta [Wireshark a Fondo](/cybersec/manual/redes/wireshark-a-fondo) para el análisis posterior.

## ARP Spoofing: el MITM clásico

El fundamento es la debilidad de ARP: **no hay autenticación**. Cualquier host puede enviar una respuesta ARP no solicitada (*gratuitous ARP*) y el receptor la almacena en su caché. Lo explica en detalle la lección [UDP, ICMP y ARP](/cybersec/manual/redes/udp-icmp-arp).

La idea del ataque:

```text
Estado legítimo:
  Víctima  →  ARP caché: Gateway = MAC_GW
  Gateway  →  ARP caché: Víctima = MAC_VICTIM

Tras el envenenamiento:
  Víctima  →  ARP caché: Gateway = MAC_ATTACKER  ← inyectamos ARP falso
  Gateway  →  ARP caché: Víctima = MAC_ATTACKER  ← inyectamos ARP falso

Flujo del tráfico:
  Víctima ──→ Attacker ──→ Gateway ──→ Internet
         ←──          ←──
```

El atacante queda **en medio** de toda la comunicación. Para que la víctima no pierda conectividad (lo que delataría el ataque), debemos **reenviar los paquetes**: activar *IP forwarding* en Linux.

```bash
# Activar IP forwarding (imprescindible para no cortar la conexión)
sudo sysctl -w net.ipv4.ip_forward=1

# Verificar que está activo
cat /proc/sys/net/ipv4/ip_forward   # debe mostrar 1
```

> [!WARNING]
> El ARP spoofing es un ataque activo que intercepta tráfico ajeno. Realízalo **únicamente en laboratorios propios o redes donde tengas autorización escrita**. En redes de producción o de terceros es ilegal.

## bettercap: flujo de trabajo moderno

`bettercap` es la herramienta de referencia para MITM en la actualidad. Sustituye a ettercap con una arquitectura modular, interfaz interactiva y soporte para múltiples vectores de ataque.

### Instalación

```bash
# En Kali Linux ya viene preinstalada; si no:
sudo apt install bettercap

# Actualizar los caplets (scripts predefinidos de bettercap)
sudo bettercap -eval "caplets.update; quit"
```

### Flujo típico de ARP spoofing + sniffing

Ejecuta bettercap como root con la interfaz de red correcta:

```bash
sudo bettercap -iface eth0
```

Dentro de la consola interactiva de bettercap:

```bash
# 1. Descubrir hosts activos en la red local
net.probe on

# 2. Ver los hosts descubiertos
net.show

# 3. Seleccionar la víctima (puedes poner varias IPs separadas por coma)
set arp.spoof.targets 192.168.1.105

# 4. Activar el ARP spoofing (envenena víctima Y gateway automáticamente)
arp.spoof on

# 5. Activar el sniffer de red
net.sniff on
```

> [!TIP]
> Para sniffing más selectivo puedes configurar filtros BPF: `set net.sniff.filter tcp port 80 or port 21 or port 23`. bettercap analiza automáticamente protocolos y extrae credenciales de HTTP básico, FTP y Telnet.

### Caplets: automatización de flujos

Los caplets son scripts `.cap` que agrupan comandos bettercap. El caplet `http-req-dump.cap` captura peticiones HTTP completas; `arp.spoof.cap` automatiza el ARP spoofing básico.

```bash
# Ejecutar directamente un caplet
sudo bettercap -iface eth0 -caplet http-req-dump

# Ver caplets disponibles
ls /usr/share/bettercap/caplets/
```

## Qué capturas y sus límites

### Protocolos en claro (jugosos para el OSCP)

| Protocolo | Puerto | Qué obtienes |
|-----------|--------|--------------|
| HTTP básico | 80/TCP | Usuario y contraseña en Base64 (trivial de decodificar) |
| FTP | 21/TCP | Credenciales en texto plano (`USER`/`PASS`) |
| Telnet | 23/TCP | Todo el stream de la sesión, contraseñas incluidas |
| SMTP sin TLS | 25/TCP | Credenciales AUTH LOGIN/PLAIN |
| SNMP v1/v2c | 161/UDP | Community strings (actúan como contraseñas) |
| POP3/IMAP sin TLS | 110,143 | Credenciales de correo |

### HTTPS y TLS: el gran bloqueador

TLS cifra el contenido **antes** de que salga del navegador. El MITM ve el handshake TLS y el certificado, pero el payload está cifrado. No puedes leer contraseñas de login en HTTPS sin técnicas adicionales.

**SSLstrip** (técnica histórica de Moxie Marlinspike) intentaba degradar HTTPS a HTTP interceptando las redirecciones. Sus límites actuales son severos:

- **HSTS** (*HTTP Strict Transport Security*): el navegador memoriza que ese dominio *debe* usar HTTPS y rechaza la conexión HTTP directamente, sin consultar al servidor. Google, Facebook y miles de sitios llevan años en la lista HSTS preinstalada en los navegadores.
- **HSTS Preloading**: los dominios más críticos están *hardcodeados* en el binario del navegador; SSLstrip no tiene forma de atacarlos.

> [!IMPORTANT]
> En el OSCP, si encuentras credenciales HTTP en claro, es señal de una configuración antigua o un servicio interno mal securizado. HTTPS bien configurado con HSTS es efectivamente opaco al sniffing.

## Análisis en Wireshark

Una vez activo el MITM, puedes capturar con Wireshark en paralelo para un análisis más profundo:

```bash
# Capturar a fichero mientras bettercap sniffa
sudo tcpdump -i eth0 -w /tmp/captura_mitm.pcap &
```

Luego abre el `.pcap` en Wireshark y aplica filtros:

```text
# Credenciales FTP
ftp.request.command == "PASS"

# HTTP básico
http.authorization

# Telnet (muestra el stream completo)
telnet
```

> [!TIP]
> En Wireshark: `Follow → TCP Stream` sobre una conexión Telnet o FTP te muestra la sesión completa reconstruida, incluyendo la contraseña tecleada carácter a carácter. Ver [Wireshark a Fondo](/cybersec/manual/redes/wireshark-a-fondo) para más filtros.

## Contramedidas defensivas

Entender la defensa te ayuda a razonar los escenarios del OSCP (y a responder preguntas de examen sobre por qué ciertos ataques fallan en redes bien configuradas).

| Contramedida | Cómo funciona | Dónde se configura |
|---|---|---|
| **Dynamic ARP Inspection (DAI)** | El switch valida cada ARP contra una tabla DHCP snooping; descarta los ARP falsos | Switch gestionado (Cisco, HP, etc.) |
| **DHCP Snooping** | El switch aprende qué IP asignó DHCP a cada puerto; base para DAI | Switch gestionado |
| **Port Security** | Limita el número de MACs por puerto; detecta flooding de MACs falsas | Switch gestionado |
| **Segmentación con VLANs** | Reduce el dominio de broadcast; un atacante en una VLAN no puede hacer ARP spoof a otra | Switch + router |
| **HTTPS + HSTS** | Cifra el contenido; el sniffing solo obtiene metadatos | Servidor web / app |

## Práctica

**Ejercicio 1.** ¿Por qué en una red switcheada no puedes ver el tráfico entre otros dos hosts sin realizar un ataque MITM? Explica el mecanismo del switch que lo impide.

<details>
<summary>Ver solución</summary>

Un switch **aprende la MAC** de cada dispositivo conectado a cada uno de sus puertos (tabla CAM / MAC address table). Cuando recibe una trama, la envía **únicamente al puerto** donde vio la MAC de destino, en lugar de replicarla a todos los puertos como haría un hub.

Por eso, si el host A envía tráfico al host B, el switch lo manda solo al puerto de B. Tu interfaz (en otro puerto) nunca recibe esa trama, aunque estés en modo promiscuo. El modo promiscuo solo te ayuda si el switch **ya te envía** la trama.

El MITM por ARP spoofing resuelve esto: haces que el switch y los hosts crean que tú eres el destino, y entonces el switch *sí* te envía el tráfico.

</details>

**Ejercicio 2.** Ordena correctamente los pasos para ejecutar un ARP spoofing con sniffing usando bettercap. Justifica por qué `arp.spoof on` debe ir **antes** que `net.sniff on`.

```text
A) set arp.spoof.targets 192.168.1.50
B) net.sniff on
C) sudo bettercap -iface eth0
D) arp.spoof on
E) net.probe on
```

<details>
<summary>Ver solución</summary>

Orden correcto: **C → E → A → D → B**

1. `C` — Arrancas bettercap con la interfaz correcta.
2. `E` — Descubres hosts activos para saber qué IPs existen.
3. `A` — Seleccionas la IP de la víctima.
4. `D` — Activas el ARP spoofing. En este momento empiezas a envenenar las cachés ARP y el tráfico comienza a llegar a tu interfaz.
5. `B` — Ahora activas el sniffer. **Tiene sentido encenderlo después del spoofing** porque antes de eso el tráfico ajeno no llega a tu NIC; el sniffer no capturaría nada relevante.

Además, recuerda verificar que `net.ipv4.ip_forward=1` está activo antes de paso D, o cortarás la conexión de la víctima.

</details>

**Ejercicio 3.** ¿Por qué SSLstrip ya no funciona contra Google.com aunque hagas un MITM exitoso?

<details>
<summary>Ver solución</summary>

Google lleva años en la lista **HSTS Preload** incluida en todos los navegadores principales (Chrome, Firefox, Safari, Edge). Esta lista está **compilada dentro del binario del navegador**, por lo que el navegador exige HTTPS para google.com **antes de hacer ninguna petición de red**, sin necesidad de haber visitado el sitio antes.

SSLstrip necesita interceptar una redirección HTTP→HTTPS para degradar la conexión. Con HSTS preloaded, esa redirección HTTP nunca sale del navegador: la conexión se establece directamente en HTTPS. No hay nada que interceptar en texto claro.

</details>

## Recursos

- [bettercap — documentación oficial](https://www.bettercap.org)
- [HackTricks — ARP Spoofing / L2 attacks](https://book.hacktricks.wiki)
- [Lección UDP, ICMP y ARP (base del protocolo ARP)](/cybersec/manual/redes/udp-icmp-arp)
- [Wireshark a Fondo (análisis del tráfico capturado)](/cybersec/manual/redes/wireshark-a-fondo)
