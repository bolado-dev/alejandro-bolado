---
title: Sau
os: Linux
published: 2026-06-12
tags: [SSRF, Maltrail, RCE, Abusing sudoers, systemcl, eWPT,]
category: HackTheBox
---

## Información Básica

### Técnicas vistas

- requests-baskets 1.2.1 Exploitation (SSRF - Server Side Request Forgery)
- Maltrail 0.53 Exploitation (RCE - Username Injection)
- Abusing sudoers privilege (systemctl) [Privilege Escalation]

### Preparación

- eWPT

***

## Reconocimiento

### Nmap

Iniciaremos el escaneo de **Nmap** con la siguiente línea de comandos:

```bash
nmap -p- --open -sS --min-rate 5000 -vvv -n -Pn 10.129.228.213 -oG nmap/allPorts 
```

```
PORT     STATE SERVICE    REASON
22/tcp   open  ssh        syn-ack ttl 63
8080/tcp open  http-proxy syn-ack ttl 63
```

Ahora con la función **extractPorts** (*Función de S4vitar*), extraeremos los puertos abiertos y nos los copiaremos al clipboard para hacer un escaneo más profundo:

```
nmap -sVC -p22,8080 10.129.228.213 -oN nmap/targeted
```

```
PORT     STATE SERVICE     VERSION
22/tcp   open  ssh         OpenSSH 8.2p1 Ubuntu 4ubuntu0.5 (Ubuntu Linux; protocol 2.0)
| ssh-hostkey: 
|   3072 ca:f1:0c:51:5a:59:62:77:f0:a8:0c:5c:7c:8d:da:f8 (RSA)
|   256 d5:1c:81:c9:7b:07:6b:1c:c1:b4:29:25:4b:52:21:9f (ECDSA)
|_  256 db:1d:8c:eb:94:72:b0:d3:ed:44:b9:6c:93:a7:f9:1d (ED25519)
8080/tcp open  nagios-nsca Nagios NSCA
|_http-title: Home
Service Info: OS: Linux; CPE: cpe:/o:linux:linux_kernel
```





[Pwned!](https://labs.hackthebox.com/achievement/machine/1992274/513)

---