---
title: Enumeración Web
order: 2
description: Fingerprinting de tecnologías, fuzzing de directorios y ficheros, virtual hosts y enumeración de CMS.
---

## Identificar la tecnología

```bash wrap=false
whatweb http://10.10.10.10
curl -I http://10.10.10.10
```

Revisa cabeceras (`Server`, `X-Powered-By`), `robots.txt`, el código fuente y los comentarios HTML.

## Fuzzing de directorios

```bash wrap=false
feroxbuster -u http://10.10.10.10 -w /usr/share/seclists/Discovery/Web-Content/directory-list-2.3-medium.txt -x php,txt,html
```

Alternativa con `gobuster`:

```bash wrap=false
gobuster dir -u http://10.10.10.10 -w /usr/share/wordlists/dirb/common.txt -t 50
```

## Virtual Hosts (vhosts)

Cuando hay un dominio, fuzzea subdominios por la cabecera `Host`:

```bash wrap=false
ffuf -u http://10.10.10.10 -H "Host: FUZZ.dominio.htb" -w /usr/share/seclists/Discovery/DNS/subdomains-top1million-5000.txt -fs 0
```

> [!NOTE]
> Añade el dominio descubierto a tu `/etc/hosts` para poder navegarlo.

## CMS conocidos

- **WordPress** → `wpscan --url http://... --enumerate u,vp`
- **Joomla** → `joomscan`
- **Drupal** → `droopescan`
