---
title: Protocolos de Aplicación y Servicios
order: 11
description: HTTP/HTTPS y el handshake TLS, más un recorrido por los servicios que enumerarás una y otra vez en OSCP — SMB, SNMP, SMTP, FTP, SSH, RDP y WinRM.
---

## HTTP: la superficie de ataque número uno

HTTP es un protocolo **petición/respuesta** de texto plano sobre TCP (puerto 80). El cliente pide, el servidor responde. Entenderlo es imprescindible porque la mayoría de vulnerabilidades del OSCP están en aplicaciones web.

```text
PETICIÓN                                  RESPUESTA
GET /index.html HTTP/1.1                  HTTP/1.1 200 OK
Host: ejemplo.com                         Content-Type: text/html
User-Agent: curl/8.0                      Content-Length: 1256
Accept: */*                               Set-Cookie: session=abc123
                                          <blank line>
<blank line>                              <html>...</html>
```

### Métodos y códigos de estado

| Método | Uso | | Código | Significado |
|--------|-----|-|--------|-------------|
| `GET` | Pedir un recurso | | `200` | OK |
| `POST` | Enviar datos | | `301/302` | Redirección |
| `PUT` | Subir/crear recurso | | `401` | No autenticado |
| `DELETE` | Borrar recurso | | `403` | Prohibido |
| `OPTIONS` | Métodos permitidos | | `404` | No existe |
| `HEAD` | Solo cabeceras | | `500` | Error del servidor |

> [!TIP]
> Las **cabeceras** filtran información: `Server:`, `X-Powered-By:` revelan tecnología y versiones; `Set-Cookie` revela el gestor de sesiones. Míralas siempre: `curl -I http://objetivo` (solo cabeceras) o con Burp Suite.

## HTTPS y el handshake TLS

HTTPS es HTTP **dentro** de un túnel cifrado TLS (puerto 443). Antes de intercambiar HTTP, cliente y servidor negocian el cifrado **por encima** del handshake TCP que ya conoces:

```text
[ handshake TCP: SYN → SYN/ACK → ACK ]      ← primero se abre la conexión (Lección TCP)
        │
   Client Hello   → "soporto estas cifras y versiones TLS"
   Server Hello   ← "usaremos esta, y aquí está mi certificado"
   [ intercambio de claves ]
   Finished (ambos) → a partir de aquí, todo va cifrado
        │
[ ahora sí: GET / HTTP/1.1 ... pero cifrado ]
```

> [!NOTE]
> El **certificado** TLS es una fuente de enumeración: su campo *Subject Alternative Name* (SAN) suele listar **otros dominios y subdominios** del objetivo. `openssl s_client -connect objetivo:443` o mirar el certificado en el navegador te los revela gratis.

## Servicios que enumerarás en (casi) cada máquina

Este es tu mapa de puertos-servicio para OSCP. Aprende el puerto, qué es y cómo se enumera:

| Servicio | Puerto(s) | Qué es | Enumeración típica |
|----------|-----------|--------|--------------------|
| **FTP** | 21 | Transferencia de ficheros | login `anonymous`, `ftp`, listar |
| **SSH** | 22 | Shell remota segura | versión, auth por clave, túneles |
| **SMTP** | 25 | Envío de correo | `VRFY`/`RCPT` para enumerar usuarios |
| **DNS** | 53 | Resolución de nombres | AXFR, subdominios (ver Lección DNS) |
| **HTTP** | 80 | Web | fuzzing de rutas, vhosts, tecnología |
| **POP3/IMAP** | 110/143 | Lectura de correo | credenciales, buzones |
| **SMB** | 139, 445 | Compartición Windows | shares, usuarios, null session |
| **SNMP** | 161/udp | Gestión de red | community strings (`public`) |
| **HTTPS** | 443 | Web cifrada | igual que HTTP + certificado (SAN) |
| **RDP** | 3389 | Escritorio remoto Windows | acceso con credenciales |
| **WinRM** | 5985/5986 | Gestión remota Windows | `evil-winrm` con credenciales |

### SMB — el más rentable en Windows

SMB (puertos 139/445) comparte ficheros e impresoras en redes Windows. Es un pozo de vectores: shares accesibles, enumeración de usuarios, versiones vulnerables (EternalBlue).

```bash
nmap -p445 --script smb-os-discovery,smb-enum-shares 10.10.10.10
smbclient -L //10.10.10.10/ -N          # listar shares sin credenciales (null session)
smbclient //10.10.10.10/share -N        # conectar a un share
netexec smb 10.10.10.10 -u '' -p ''     # enumeración moderna (antes crackmapexec)
```

### SNMP — el olvidado que regala credenciales

SNMP (161/UDP) gestiona dispositivos. Con la *community string* por defecto (`public`) suele filtrar procesos, usuarios, software e incluso credenciales.

```bash
snmpwalk -v2c -c public 10.10.10.10          # vuelca toda la MIB
onesixtyone -c comunidades.txt 10.10.10.10   # fuerza bruta de community
```

> [!IMPORTANT]
> Metodología OSCP: para **cada** puerto abierto, pregunta tres cosas — ¿qué servicio y versión es? ¿acepto acceso anónimo/por defecto? ¿hay exploits conocidos para esa versión? Enumerar bien es el 80% del trabajo.

## Práctica

**Ejercicio 1.** Con `curl`, obtén solo las cabeceras de respuesta de `http://example.com` e identifica qué servidor web corre.

<details>
<summary>Ver solución</summary>

```bash
curl -I http://example.com
```

Busca la cabecera `Server:` (p. ej. `Server: nginx` o `Apache/2.4.41`). También `X-Powered-By:` si aparece (revela lenguaje/framework). Esa versión es tu pista para buscar exploits conocidos.

</details>

**Ejercicio 2.** Una máquina tiene 445 abierto. Sin credenciales, ¿cómo compruebas si puedes listar sus carpetas compartidas y qué significa que lo permita?

<details>
<summary>Ver solución</summary>

```bash
smbclient -L //10.10.10.10/ -N          # -N = sin contraseña (null session)
netexec smb 10.10.10.10 -u '' -p '' --shares
```

Si lista los shares con sesión nula, el servidor permite acceso **anónimo**: es una mala configuración que puede darte lectura (o escritura) de ficheros sin autenticarte. Conéctate a los shares interesantes (`smbclient //ip/share -N`) y busca credenciales, configs o rutas.

</details>

## Recursos

- [**HackTricks — Pentesting (por puerto/servicio)**](https://book.hacktricks.wiki/en/index.html) — cheatsheets para cada servicio.
- [**howhttps.works**](https://howhttps.works/) — cómic interactivo del handshake TLS.
- [**HTB Academy — "Footprinting"**](https://academy.hackthebox.com/course/preview/footprinting) — enumeración servicio por servicio.
- [**NetExec (GitHub)**](https://github.com/Pennyw0rth/NetExec) — la navaja suiza para SMB/WinRM/otros.
- [**Burp Suite Community**](https://portswigger.net/burp/communitydownload) — para diseccionar HTTP/HTTPS a fondo.
