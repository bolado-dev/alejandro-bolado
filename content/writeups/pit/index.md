---
title: Pit
os: Linux
published: 2026-06-23
tags: [Information Leakage, SNMP Enumeration, SeedDMS Exploitation, SELinux, SNMP Code Execution, OSCP, eWPT]
category: HackTheBox
---

## Información Básica

### Técnicas vistas

- Information Leakage
- SNMP Enumeration (Snmpwalk/Snmpbulkwalk)
- SeedDMS Exploitation
- SELinux (Extra)
- SNMP Code Execution

### Preparación

- OSCP
- eWPT

---

## Reconocimiento

### Nmap

Iniciaremos el escaneo de **Nmap** con la siguiente línea de comandos:

```bash
nmap -p- --open -sS --min-rate 5000 -vvv -n -Pn 10.129.228.106 -oG nmap/allPorts
```

```
PORT     STATE SERVICE    REASON
22/tcp   open  ssh        syn-ack ttl 63
80/tcp   open  http       syn-ack ttl 63
9090/tcp open  zeus-admin syn-ack ttl 63
```

Ahora con la función **extractPorts** (_Función de S4vitar_), extraeremos los puertos abiertos y nos los copiaremos al clipboard para hacer un escaneo más profundo:

```bash
nmap -sVC -p22,80,9090 10.129.228.106 -oN nmap/targeted
```

```
PORT   STATE SERVICE VERSION
22/tcp open  ssh     OpenSSH 8.0 (protocol 2.0)
| ssh-hostkey: 
|   3072 6f:c3:40:8f:69:50:69:5a:57:d7:9c:4e:7b:1b:94:96 (RSA)
|   256 c2:6f:f8:ab:a1:20:83:d1:60:ab:cf:63:2d:c8:65:b7 (ECDSA)
|_  256 6b:65:6c:a6:92:e5:cc:76:17:5a:2f:9a:e7:50:c3:50 (ED25519)
80/tcp   open  http    nginx 1.14.1
|_http-server-header: nginx/1.14.1
|_http-title: Test Page for the Nginx HTTP Server on Red Hat Enterprise Linux
9090/tcp open  http    Cockpit web service 221 - 253
|_http-title: Did not follow redirect to https://10.129.29.40:9090/
Service Info: OS: Linux; CPE: cpe:/o:linux:linux_kernel
```

### Escaneo UDP



[Pwned!](https://labs.hackthebox.com/achievement/machine/1992274/578)

---
