# Self-hosting Ptorx

Hosting Ptorx yourself gives you a greater level of control and privacy (assuming you set everything up correctly) but it does come at a cost: it's not a simple process. If you need a self-hosted Ptorx installation you can either follow this tutorial with no support should you get stuck, or you can hire us to do it for you by sending an email to contact@xyfir.com. Some steps will be implied, or vague and generalized, so you'll be expected to know how to fill in the blanks based on your environment and requirements.

# Requisites

- Access to a domain whose DNS records you can configure.
- A Linux server. We'll use Ubuntu.

Ptorx can run on fairly low-spec servers, but we recommend at least 1GB of RAM with 1-2GB of swap space.

Make sure your server's host allows you to send mail.

# Step 1: General Server Configuration

For this tutorial, we'll assume you're using a non-`root` user with `sudo` access.

## Step 1A: Set Hostname

We'll use `example.com` as a placeholder for your domain and `ptorx.example.com` as a placeholder for your hostname/subdomain. Even if you plan to send and receive mail and access Ptorx from `example.com` you still _need_ a matching hostname/subdomain which the underlying mail servers will communicate on.

```bash
hostnamectl # get current hostname
sudo hostnamectl set-hostname ptorx.example.com
sudo nano /etc/hosts
```

In `/etc/hosts`, replace the old hostname with `ptorx.example.com` and add `127.0.0.1 ptorx.example.com` if it's missing. If `/etc/cloud/cloud.cfg` exists, set `preserve_hostname` to `true`.

## Step 1B: Install Dependencies

Nginx:

```bash
sudo apt install nginx
sudo ufw allow 'Nginx Full' # assuming your firewall is on
```

Node.js / nvm:

```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/vX.X.X/install.sh | bash
# run command it prints to console
nvm install X.X.X
```

Get the latest nvm version number from their [repo](https://github.com/nvm-sh/nvm) and the latest [Node version](https://nodejs.org/en/download/releases/) that was available upon last [server/package.json](https://github.com/xyfir/ptorx/blob/master/server/package.json) update.

Sendmail:

```bash
sudo apt install sendmail
```

## Step 1C: Enable Swap

If you're running on a small server with RAM under ~2GB, you should allocate some swap space. The build process often fails on low-memory systems without it.

```bash
sudo fallocate -l 4G /swapfile # 1-2GB is probably good enough
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
sudo nano /etc/sysctl.conf
```

In the configuration file, edit or add the following values:

```
vm.swappiness=30
vm.vfs_cache_pressure=50
```

# Step 2: Clone the Repo

First change to the directory where you wish to keep Ptorx.

```bash
git clone --recurse-submodules https://github.com/xyfir/ptorx.git
cd ptorx
```

From now on we'll assume commands are run from `ptorx/`.

# Step 3: Download npm Dependencies

Install npm depencies for each module:

```bash
cd server
npm install
cd ../web
npm install
cd ../accownt/server
npm install
cd ../web
npm install
cd ../../ccashcow/server
npm install
cd ../web
npm install
cd ../../yalcs/loader
npm install
cd ../server
npm install
cd ../web
npm install
cd ../../ # back to ptorx/
```

Then install pm2 to manage our API servers:

```bash
npm install -g pm2
```

Technically pm2 is not required, but it's what we'll use for this tutorial.

# Step 4: Configure Database

```bash
sudo apt install mariadb-server
sudo systemctl enable mysql
sudo mysql_secure_installation
sudo mysql -u root
```

```sql
-- user, pass, and database name are of course all configurable
CREATE USER 'ptorx'@'localhost' IDENTIFIED BY 'PASSWORD_123';
GRANT SELECT, INSERT, UPDATE, DELETE ON *.* TO 'ptorx'@'localhost';
FLUSH PRIVILEGES;
CREATE DATABASE 'ptorx';
```

Next we'll build the database:

```bash
sudo mysql -u root -p ptorx < server/db/build/structure.sql
sudo mysql -u root -p ptorx < server/db/build/data.sql
```

# Step 5: Create Data Directories

Now we need to create the data directories where Ptorx and its submodules will write both temporary and permanent data to the disk. You can put them wherever you'd like (just remember it for Step 4), but for now we'll put them alongside `ptorx/`.

```bash
mkdir ../accownt-db ../mail-cache ../ccashcow-db ../yalcs-db
```

You can also name the three directories however you'd like.

# Step 6: Set Environment Variables

Ptorx and its submodules are configured via environment variables which are loaded into the applications via `.env` files located in each modules's directory.

To understand the syntax of the `.env` files, know that they are first loaded via [dotenv](https://www.npmjs.com/package/dotenv) and then the string values provided by dotenv are parsed by [enve](https://www.npmjs.com/package/enve).

## Step 6A: Create `.env` Files

First we'll create each file and then we'll work our way through populating them with values.

```bash
touch accownt/server/.env accownt/web/.env ccashcow/server/.env ccashcow/web/.env
cp server/example.env server/.env
cp web/example.env web/.env
```

## Step 6B: Configure CCashCow

_Note: This is our payment module. You can safely skip it._

See [xyfir/ccashcow](https://github.com/xyfir/ccashcow) for instructions.

Use `vim` or `nano` or similar to edit the files `ccashcow/server/.env` and `ccashcow/web/.env`.

## Step 6C: Configure Accownt

See [xyfir/accownt](https://github.com/xyfir/accownt) for instructions.

Edit the files `accownt/server/.env` and `accownt/web/.env`.

## Step 6D: Configure Yalcs

_Note: This is our live chat module. You can safely skip it._

See [xyfir/yalcs](https://github.com/xyfir/yalcs) for instructions.

Edit the files `yalcs/loader/.env`, `yalcs/server/.env`, and `yalcs/web/.env`.

## Step 6E: Configure Ptorx

Now we'll do the same thing for Ptorx. You can find the available environment variables in [types/ptorx.d.ts](https://github.com/xyfir/ptorx/blob/master/types/ptorx.d.ts) under the `Ptorx.Env` namespace.

# Step 7: Build From Source

```bash
cd server
npm run build
cd ../web
npm run build
cd ../accownt/server
npm run build
cd ../web
npm run build
cd ../../ccashcow/server
npm run build
cd ../web
npm run build
cd ../../yalcs/loader
npm run build
cd ../server
npm run build
cd ../web
npm run build
cd ../../
```

# Step 8: Open and Forward Ports

Make sure your firewall allows traffic through the needed ports. If you're using `ufw`, it'll look something like:

```bash
sudo ufw allow smtp # 25
sudo ufw allow submission # 587
sudo ufw allow 2071 # -> 25
sudo ufw allow 2076 # -> 587
```

Next we'll need to forward incoming traffic from port `25` to the port you set for the MTA server via `MTA_PORT` in `server/.env`. We'll also forward `587` to the port for the MSA server, as configured via `MSA_PORT`. We'll assume the suggested ports for each.

```bash
sudo iptables -t nat -A PREROUTING -p tcp --dport 25 -j REDIRECT --to-port 2071
sudo iptables -t nat -A PREROUTING -p tcp --dport 587 -j REDIRECT --to-port 2076
sudo iptables -t nat -nvL # optionally validate your rules
sudo apt install iptables-persistent # save files on prompt
```

## Suggested Ports

Ptorx requires a lot of servers. The suggested _local_ ports are as follows:

| Name                   | Port |
| ---------------------- | ---- |
| Ptorx API              | 2070 |
| Ptorx MTA              | 2071 |
| Ptorx test MTA         | 2072 |
| Ptorx client (for dev) | 2073 |
| Accownt                | 2074 |
| CCashCow               | 2075 |
| Ptorx MSA              | 2076 |
| Yalcs                  | 2079 |

# Step 9: Set DNS Records

For this step, we'll be using `example.com` as a placeholder for your domain.

## Step 9A: DKIM

First of all, set the domain key TXT record to `<SELECTOR>._domainkey.example.com` as provided by the Ptorx app after you've added your domain. Ignore the other records it tells you to set.

## Step 9B: MX

Create a single MX record for `example.com` that points to your server's IP address, which will probably be the same as your domain's A record. The priority doesn't matter with only a single server, but we'll set it to `10`.

## Step 9C: SPF

_This step is optional but highly recommended to prevent your mail from being marked as spam._

Create a TXT record for `example.com` with something like this:

```
"v=spf1 +a ~all"
```

Before you blindly copy and paste, you should understand how SPF works and how best to utilize it according your needs.

## Step 9D: DMARC

_This step is optional but highly recommended to prevent your mail from being marked as spam._

Create a TXT record for `_dmarc.example.com` with something like this:

```
"v=DMARC1; p=reject; fo=1; rua=mailto:aggregate-dmarc-x@example.com; ruf=mailto:fail-dmarc-x@example.com"
```

Before you blindly copy and paste, you should understand how DMARC works and how best to utilize it according your needs.

## Step 9E: Reverse DNS

Go to your server host's control panel and change the reverse DNS to your domain name. By default its value probably looks something like `0.0.0.0.yourhost.com` where `0.0.0.0` is your server's IPv4 address and `yourhost.com` is the name of your server host.

For example with [VULTR](https://www.vultr.com/?ref=7140527), it'll look like `140.82.16.198.vultr.com`, and it can be found under the `Settings > IPv4` tab when viewing your server instance.

# Step 10: Generate TLS Certificates

Generate TLS certificates from Let's Encrypt:

```bash
sudo apt install letsencrypt
sudo letsencrypt certonly --webroot -w /var/www/html -d example.com
```

Then we'll enable auto-renewal:

```bash
sudo crontab -e
```

Add something like...

```
11 4 * * * letsencrypt renew
```

Finally, we'll need to make sure our Node server can read the certificate. The _easiest_ way to do that is:

```bash
sudo chmod 755 /etc/letsencrypt/live/
sudo chmod 755 /etc/letsencrypt/archive/
```

# Step 11: Configure Nginx

Create a config file for your site or edit `/etc/nginx/nginx.conf` directly, placing the following code within the `http { ... }` block:

```nginx
server {
  listen 80;
  server_name example.com;
  return 301 https://$host$request_uri;
}

server {
  listen 443 ssl;
  server_name example.com;

  ssl_certificate /etc/letsencrypt/live/example.com/fullchain.pem;
  ssl_certificate_key /etc/letsencrypt/live/example.com/privkey.pem;

  add_header Strict-Transport-Security "max-age=31536000; includeSubDomains";
  add_header X-XSS-Protection "1; mode=block";
  add_header X-Content-Type-Options nosniff;

  location / {
    root /path/to/ptorx/web/dist;
    try_files /index.html =404;
  }
  location /api {
    proxy_pass http://localhost:2070;
  }
  location /yalcs {
    root /path/to/ptorx/yalcs/web/dist;
    try_files /index.html =404;
  }
  location /static {
    gzip_static on;
    alias /path/to/ptorx/web/dist;
  }
  location /accownt {
    root /path/to/ptorx/accownt/web/dist;
    try_files /index.html =404;
  }
  location /ccashcow {
    root /path/to/ptorx/ccashcow/web/dist;
    try_files /index.html =404;
  }
  location /icon.png {
    root /path/to/ptorx/mobile;
    try_files /icon.png =404;
  }
  location /.well-known {
    alias /var/www/html/.well-known;
  }
  location /yalcs/api/ {
    proxy_read_timeout 3600;
    proxy_pass http://localhost:2079/api/;
  }
  location /accownt/api/ {
    proxy_pass http://localhost:2074/api/;
  }
  location /yalcs/static {
    gzip_static on;
    alias /path/to/ptorx/yalcs/web/dist;
  }
  location /ccashcow/api/ {
    proxy_pass http://localhost:2075/api/;
  }
  location /accownt/static {
    gzip_static on;
    alias /path/to/ptorx/accownt/web/dist;
  }
  location /ccashcow/static {
    gzip_static on;
    alias /path/to/ptorx/ccashcow/web/dist;
  }
}
```

As always, replace `example.com`, the ports you chose, and `/path/to`. Anything with `yalcs` or `ccashcow` is optional.

Test your config and restart Nginx:

```bash
sudo nginx -t
sudo systemctl restart nginx
```

# Step 12: Start Servers

Last but not least, start the servers with pm2, which you should have installed earlier:

```bash
cd server
pm2 start --name ptorx npm -- run start
cd ../accownt/server
pm2 start --name accownt npm -- run start
cd ../../ccashcow/server
pm2 start --name ccashcow npm -- run start
cd ../../yalcs/server
pm2 start --name yalcs npm -- run start
cd ../../
pm2 startup # then follow instructions
```

# Upgrading Ptorx

This is a general guide for upgrading from one version of Ptorx to another. It's likely there are more specific steps you'll have to follow based on your current version and that of which you wish to upgrade to, but these steps should typically get you at least 90% of the way there.

To begin the process of upgrading Ptorx, let's first reset the repos and pull in changes:

```bash
git reset --hard origin/master
git submodule foreach git reset --hard
git pull
git submodule update --recursive
```

Now we'll once again run through some of the steps above:

- Go to [Step 3](#step-3-download-npm-dependencies) to update dependencies.
- Go to [Step 6](#step-6-set-environment-variables) to update any `.env` files that may require changes.
- Go to [Step 7](#step-7-build-from-source) to rebuild the apps.

Update your database if needed by running _in order_ the `server/db/upgrade/` SQL files for every version _after_ your current installation's. For example, assuming you're on version `1.0.0` and the latest is `1.1.0`:

```bash
sudo mysql -u root -p ptorx < server/db/upgrade/1.0.1.sql
sudo mysql -u root -p ptorx < server/db/upgrade/1.0.2.sql
sudo mysql -u root -p ptorx < server/db/upgrade/1.1.0.sql
```

Finally, restart the servers:

```bash
pm2 restart all
```
