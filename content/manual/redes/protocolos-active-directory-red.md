---
title: "Protocolos de Active Directory en la Red"
order: 23
description: "Identifica los puertos y protocolos clave que expone un Domain Controller y aprende a enumerarlos desde la red antes de pivotar a AD."
---

## Por qué importa conocer los protocolos del DC

Un **Domain Controller (DC)** no es un servidor normal. Concentra autenticación, autorización y directorio de toda la organización, y para ello expone una pila de protocolos muy característica. Reconocer esa combinación de puertos en un `nmap` te permite identificar el DC al instante y priorizar la enumeración.

Este conocimiento actúa como puente entre el reconocimiento de red (lo que estás haciendo en esta sección) y los ataques específicos de Active Directory, que encontrarás en la sección [Enumeración de Active Directory](/cybersec/manual/active-directory/enumeracion).

> [!NOTE]
> Un DC casi siempre tendrá abiertos **88 + 389 + 445 + 53** simultáneamente. Esa combinación es prácticamente su firma en un escaneo de red.

## Tabla de puertos clave del Domain Controller

| Puerto(s) | Protocolo | Para qué sirve | Qué puedes enumerar |
|-----------|-----------|----------------|---------------------|
| **53 TCP/UDP** | DNS | Resolución de nombres del dominio | Registros del dominio, transferencias de zona (AXFR) |
| **88 TCP/UDP** | Kerberos | Autenticación del dominio | AS-REP Roasting, Kerberoasting, validación de usuarios |
| **135 TCP** | RPC Endpoint Mapper | Mapa de servicios RPC dinámicos | Descubrimiento de interfaces DCOM/RPC |
| **137-139 TCP/UDP** | NetBIOS | Resolución legacy, sesiones SMB antiguas | Nombre de equipo, grupo de trabajo |
| **389 TCP/UDP** | LDAP | Directorio (consultas de usuarios, grupos, OUs) | Usuarios, grupos, políticas, SPNs, ACLs |
| **445 TCP** | SMB | Recursos compartidos, autenticación NTLM/Kerberos | Shares, usuarios, sesiones, políticas de contraseñas |
| **464 TCP/UDP** | Kpasswd | Cambio de contraseña Kerberos | (raramente atacado directamente) |
| **636 TCP** | LDAPS | LDAP sobre TLS | Igual que LDAP pero cifrado |
| **3268 TCP** | Global Catalog (LDAP) | Búsquedas en todo el bosque AD | Objetos de todos los dominios del bosque |
| **3269 TCP** | Global Catalog (LDAPS) | Global Catalog sobre TLS | Igual que 3268 pero cifrado |
| **5985 TCP** | WinRM (HTTP) | Administración remota PowerShell | Ejecución remota si tienes credenciales |
| **5986 TCP** | WinRM (HTTPS) | WinRM sobre TLS | Igual que 5985 pero cifrado |

> [!TIP]
> Los puertos dinámicos RPC (arriba de 49152) aparecen cuando el endpoint mapper en 135 los asigna. En un nmap con `-p-` los verás abiertos junto al 135.

## Kerberos: el protocolo de autenticación del dominio

Kerberos opera en el puerto **88** y es el protocolo de autenticación predeterminado en Active Directory desde Windows 2000. Entender su flujo básico es esencial porque muchos ataques de AD lo explotan directamente.

```text
  [Cliente]                    [DC - KDC]                 [Servidor de Servicio]
      |                              |                              |
      |─── AS-REQ ─────────────────>|                              |
      |    (pide TGT, cifrado con    |                              |
      |     hash de contraseña)      |                              |
      |<── AS-REP ──────────────────|                              |
      |    (recibe TGT cifrado       |                              |
      |     con clave del KDC)       |                              |
      |                              |                              |
      |─── TGS-REQ ────────────────>|                              |
      |    (presenta TGT, pide       |                              |
      |     ticket de servicio)      |                              |
      |<── TGS-REP ─────────────────|                              |
      |    (recibe ticket de         |                              |
      |     servicio / ST)           |                              |
      |                              |                              |
      |─── AP-REQ ──────────────────────────────────────────────> |
      |    (presenta ST al servicio) |                              |
      |<── AP-REP ──────────────────────────────────────────────  |
      |    (acceso concedido)        |                              |
```

- **AS-REQ / AS-REP**: el cliente pide al KDC (Key Distribution Center, que vive en el DC) un **TGT** (Ticket Granting Ticket). Si la pre-autenticación está desactivada para un usuario, se puede obtener el AS-REP sin conocer la contraseña → **AS-REP Roasting**.
- **TGS-REQ / TGS-REP**: con el TGT, el cliente pide un ticket para un servicio concreto. Los tickets de servicio van cifrados con el hash de la cuenta de servicio → **Kerberoasting**.

Los detalles de explotación los encontrarás en la sección [Enumeración de Active Directory](/cybersec/manual/active-directory/enumeracion).

> [!IMPORTANT]
> Kerberos usa sellos de tiempo; si tu máquina tiene más de 5 minutos de diferencia con el DC, los tickets no serán válidos. En pentesting esto se llama "Kerberos clock skew" y se soluciona con `ntpdate <DC>` o `timedatectl`.

## Enumeración desde la red

Antes de tener credenciales, puedes obtener mucha información del DC con herramientas que interactúan con estos protocolos de forma anónima o con autenticación nula.

### nmap: identificar el DC y sus servicios

```bash
nmap -p 53,88,135,139,389,445,464,636,3268,3269,5985,5986 -sCV <IP_DC>
```

La firma típica de un DC en nmap:

```text
53/tcp   open  domain        Microsoft DNS
88/tcp   open  kerberos-sec  Microsoft Windows Kerberos
135/tcp  open  msrpc         Microsoft Windows RPC
389/tcp  open  ldap          Microsoft Windows Active Directory LDAP
445/tcp  open  microsoft-ds  Windows Server 20xx microsoft-ds
3268/tcp open  ldap          Microsoft Windows Active Directory LDAP
```

### LDAP: enumeración de directorio

```bash
# Enumeración anónima (null bind)
ldapsearch -x -H ldap://<DC> -b "dc=dominio,dc=local"

# Con credenciales
ldapsearch -x -H ldap://<DC> -D "usuario@dominio.local" -w 'contraseña' \
  -b "dc=dominio,dc=local" "(objectClass=user)" sAMAccountName
```

El puerto **389** es LDAP en claro; el **636** es LDAPS (TLS). El Global Catalog en **3268** permite buscar objetos de todos los dominios del bosque, no solo del dominio local.

### enum4linux-ng: enumeración SMB/RPC/LDAP combinada

```bash
enum4linux-ng -A <IP_DC>
```

Extrae usuarios, grupos, shares, políticas de contraseñas y más, todo en una sola ejecución.

### netexec (nxc): verificación rápida

```bash
# Información básica del DC vía SMB
netexec smb <IP_DC>

# Enumeración de usuarios (requiere credenciales o sesión nula)
netexec smb <IP_DC> -u '' -p '' --users
```

> [!WARNING]
> El uso de estas herramientas de enumeración solo está permitido en sistemas y redes sobre los que tienes autorización explícita. En entornos de producción sin permiso es ilegal.

Para entender los protocolos de aplicación subyacentes (SMB, DNS, etc.) con mayor profundidad, consulta las lecciones [Protocolos de aplicación](/cybersec/manual/redes/protocolos-de-aplicacion) y [Escaneo de puertos: teoría](/cybersec/manual/redes/escaneo-de-puertos-teoria).

## Puente hacia Active Directory

La enumeración de red te da el mapa: sabes qué DC hay, qué servicios expone y qué versión de Windows corre. El siguiente paso es usar esa información para enumerar el dominio en profundidad: usuarios, grupos, ACLs, SPNs, políticas. Todo eso lo encontrarás en la sección [Enumeración de Active Directory](/cybersec/manual/active-directory/enumeracion).

## Práctica

**Ejercicio 1.** En un escaneo nmap ves un host con los puertos 53, 88, 389 y 445 abiertos. ¿Qué tipo de máquina es con alta probabilidad y por qué esa combinación la delata?

<details>
<summary>Ver solución</summary>

Es casi con certeza un **Domain Controller de Active Directory**. La combinación es característica porque:
- **53**: DNS del dominio (el DC siempre actúa como servidor DNS).
- **88**: Kerberos, el protocolo de autenticación de AD.
- **389**: LDAP, el directorio donde viven usuarios, grupos y políticas.
- **445**: SMB, para recursos compartidos y autenticación NTLM/Kerberos.

Ningún servidor normal expone los cuatro a la vez; solo el DC tiene necesidad de todos ellos simultáneamente.

</details>

**Ejercicio 2.** ¿A qué puerto te conectarías con `ldapsearch` y para qué sirve exactamente esa consulta en el contexto de un pentest?

<details>
<summary>Ver solución</summary>

Te conectas al puerto **389** (LDAP) o **636** (LDAPS). Con `ldapsearch` consultas el directorio LDAP del DC para extraer información del dominio: nombres de usuario (`sAMAccountName`), grupos, unidades organizativas (OUs), atributos de cuentas de servicio (SPNs para Kerberoasting), delegaciones, políticas de contraseñas, etc. En un pentest es una de las primeras fuentes de inteligencia porque incluso una sesión anónima (null bind) puede devolver datos valiosos si el DC no está endurecido.

</details>

## Recursos

- [HTB Academy — Active Directory Enumeration & Attacks](https://academy.hackthebox.com/course/preview/active-directory-enumeration-and-attacks)
- [HackTricks — Active Directory](https://book.hacktricks.wiki)
- [impacket — fortra/impacket (GitHub)](https://github.com/fortra/impacket)
- [Lección Escaneo de puertos: teoría](/cybersec/manual/redes/escaneo-de-puertos-teoria)
- [Enumeración de Active Directory](/cybersec/manual/active-directory/enumeracion)
