# Self Host Ptorx

Hosting Ptorx yourself gives you a greater level of control and privacy (assuming you set everything up correctly) but it does come at a cost: it's not a simple process. If you need a self-hosted Ptorx installation you can either follow this tutorial with no support should you get stuck, or you can hire us to do it for you by sending an email to contact@xyfir.com. Many steps will be vague and generalized, so you'll be expected to know how to fill in the blanks based on your environment and requirements.

# Requisites

- Access to a domain whose DNS records you can configure.
- A Linux server (we'll use Ubuntu) whose host allows it to send mail, which primarily means that outgoing port 25 should be open.
- Know-how to set up a secure server before we install Ptorx onto it.
- Nginx or similar software installed to serve static files and act as a proxy for Ptorx and other APIs.
- Let's Encrypt or similar geniune TLS (SSL) certificate (no self-signed certs!) for your main domain where the instance of Ptorx will be hosted. Additional mail-only domains don't need this.
- Node.js installed on your server. Ptorx targets the latest version available at time of the last [server/package.json](https://github.com/Xyfir/ptorx/blob/master/server/package.json) update.
- MariaDB or MySQL installed on your server. Ptorx.com runs MariaDB so there may be unknown discrepancies with MySQL.
- sendmail installed on your server. (Make sure your server's hostname is set correctly to prevent slow mail!)

# Step 1: Download Code and npm Dependencies

First change to the directory where you wish to keep Ptorx.

```bash
git clone --recurse-submodules https://github.com/Xyfir/ptorx.git
```

Then install npm depencies for each module:

```bash
cd ptorx/server
npm install
cd ../web
npm install
cd ../accownt/server
npm install
cd ../web
npm install
cd ../../rich-cow/server
npm install
cd ../web
npm install
cd ../../ # back to ptorx/
```

From now on we'll assume commands are run from `ptorx/`.

Then install pm2 to manage our API servers:

```bash
npm install -g pm2
```

Technically pm2 is not required, but it's what we'll use for this tutorial.

# Step 2: Create Database

Create a database and preferably a non-root MySQL user with `SELECT`, `INSERT`, `UPDATE`, and `DELETE` privileges as well. We'll name our database `ptorx` but any name will do.

```bash
sudo mysql -u root -e "CREATE DATABASE ptorx"
```

Next we'll build the database:

```bash
sudo mysql -u root -p ptorx < server/db/build/structure.sql
sudo mysql -u root -p ptorx < server/db/build/data.sql
```

Replace `ptorx` with the name of your database.

# Step 3: Create Data Directories

Now we need to create the data directories where Ptorx and its submodules will write both temporary and permanent data to the disk. You can put them wherever you'd like (just remember it for Step 4), but for now we'll put them alongside `ptorx/`.

```bash
mkdir ../accownt-db ../mail-cache ../rich-cow-db
```

You can also name the three directories however you'd like.

# Step 4: Set Environment Variables

Ptorx and its submodules are configured via environment variables which are loaded into the applications via `.env` files located in each modules's directory.

To understand the syntax of the `.env` files, know that they are first loaded via [dotenv](https://www.npmjs.com/package/dotenv) and then the string values provided by dotenv are parsed by [enve](https://www.npmjs.com/package/dotenv).

## Step 4a: Create `.env` Files

First we'll create each file and then we'll work our way through populating them with values.

```bash
touch server/.env web/.env accownt/server/.env accownt/web/.env rich-cow/server/.env rich-cow/web/.env
```

## Step 4b: Configure Rich Cow

See [Xyfir/rich-cow](https://github.com/Xyfir/rich-cow) for instructions.

Use `vim` or `nano` or similar to edit the files `rich-cow/server/.env` and `rich-cow/web/.env`.

## Step 4c: Configure Accownt

See [Xyfir/accownt](https://github.com/Xyfir/accownt) for instructions.

Edit the files `accownt/server/.env` and `accownt/web/.env`.

## Step 4d: Configure Ptorx

Now we'll do the same thing for Ptorx. You can find the available environment variables in [types/ptorx.d.ts](https://github.com/Xyfir/ptorx/blob/master/types/ptorx.d.ts) under the `Ptorx.Env` namespace.

# Step 5: Build From Source

```bash
cd server
npm run build
cd ../web
npm run build
cd ../accownt/server
npm run build
cd ../web
npm run build
cd ../../rich-cow/server
npm run build
cd ../web
npm run build
cd ../../
```

# Step 6: Open and Forward Ports

Next we'll need to forward incoming traffic from port `25` to the port you set for the SMTP server via `SMTP_PORT` in `server/.env`, which we'll assume is `2071`. Before doing this, make sure your firewall allows connections to both.

```bash
sudo iptables -t nat -A PREROUTING -p tcp --dport 25 -j REDIRECT --to-port 2071
```

# Step 7: Set DNS Records

For this step, we'll be using `example.com` as a placeholder for your domain.

## Step 7a: DKIM

First of all, set the domain key TXT record to `<SELECTOR>._domainkey.example.com` as provided by the Ptorx app after you've added your domain. Ignore the other records it tells you to set.

## Step 7b: MX

Create a single MX record for `example.com` that points to your server's IP address, which will probably be the same as your domain's A record. The priority doesn't matter with only a single server, but we'll set it to `10`.

## Step 7c: SPF

_This step is optional but highly recommended to prevent your mail from being marked as spam._

Create a TXT record for `example.com` with something like this:

```
"v=spf1 +a ~all"
```

Before you blindly copy and paste, you should understand how SPF works and how best to utilize it according your needs.

## Step 7d: DMARC

_This step is optional but highly recommended to prevent your mail from being marked as spam._

Create a TXT record for `_dmarc.example.com` with something like this:

```
"v=DMARC1; p=reject; fo=1; rua=mailto:aggregate-dmarc-x@example.com; ruf=mailto:fail-dmarc-x@example.com"
```

Before you blindly copy and paste, you should understand how DMARC works and how best to utilize it according your needs.

## Step 7e: Reverse DNS

_This step is optional but highly recommended to prevent your mail from being marked as spam._

Go to your server host's control panel and change the reverse DNS to your domain name. By default its value probably looks something like `0.0.0.0.yourhost.com` where `0.0.0.0` is your server's IPv4 address and `yourhost.com` is the name of your server host. For example with [VULTR](https://www.vultr.com/?ref=7140527), which Ptorx uses, it'll look like `140.82.16.198.vultr.com`, and it can be found under the `Settings > IPv4` tab when viewing your server instance.

# Step 8: Start Servers

Last but not least, start the servers with pm2, which you should have installed earlier:

```bash
cd server
pm2 start --name ptorx npm -- run start
cd ../accownt/server
pm2 start --name accownt npm -- run start
cd ../../rich-cow/server
pm2 start --name rich-cow npm -- run start
```

# Upgrading Ptorx

Reset the repo; pull updates for repo and submodules; npm install everything; npm build everything; pm2 restart all; run appropriate files in server/db/upgrade; ... Tutorial will be improved later.
