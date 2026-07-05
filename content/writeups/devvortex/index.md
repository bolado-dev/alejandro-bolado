---
title: Devvortext
os: Linux
published: 2026-07-05
tags: [Abusing Request Tracker, Information Leakage, KeePass, eWPT, OSWE]
category: HackTheBox
---

## Información Básica

### Técnicas vistas

- Subdomain Enumeration
- Abusing Joomla
- Joomla Exploitation (CVE-2023-23752)
- Customizing administration template to achieve RCE
- Database Enumeration (User Pivoting)
- Abusing sudoers privilege (apport-cli) [Privilege Escalation]

### Preparación

- eWPT

---

## Reconocimiento

### Nmap

Iniciaremos el escaneo de **Nmap** con la siguiente línea de comandos:

```bash
nmap -p- --open -sS --min-rate 5000 -vvv -n -Pn 10.129.34.48 -oG nmap/allPorts
```

```
PORT   STATE SERVICE REASON
22/tcp open  ssh     syn-ack ttl 63
80/tcp open  http    syn-ack ttl 63
```

Ahora con la función **extractPorts** (_Función de S4vitar_), extraeremos los puertos abiertos y nos los copiaremos al clipboard para hacer un escaneo más profundo:

```bash
nmap -sVC -p22,80 10.129.34.48 -oN nmap/targeted
```

```
PORT   STATE SERVICE VERSION
22/tcp open  ssh     OpenSSH 8.9p1 Ubuntu 3ubuntu0.1 (Ubuntu Linux; protocol 2.0)
| ssh-hostkey:
|   256 3e:ea:45:4b:c5:d1:6d:6f:e2:d4:d1:3b:0a:3d:a9:4f (ECDSA)
|_  256 64:cc:75:de:4a:e6:a5:b4:73:eb:3f:1b:cf:b4:e3:94 (ED25519)
80/tcp open  http    nginx
|_http-title: Did not follow redirect to http://2million.htb/
Service Info: OS: Linux; CPE: cpe:/o:linux:linux_kernel
```











[Pwned!](https://labs.hackthebox.com/achievement/machine/1992274/547)

---
