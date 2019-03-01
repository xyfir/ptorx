Hosting Ptorx yourself gives you a greater level of control and privacy (assuming you set everything up correctly) but it does come at a cost: it's not a simple process. If you need a self-hosted Ptorx installation you can either follow this tutorial with no support should you get stuck, or you can hire us to do it for you by sending an email to contact@xyfir.com. Many steps will be vague and generalized, so you'll be expected to fill in the blanks based on your environment and requirements.

# Requisites

- Access to a domain whose DNS records you can configure
- A Linux server (we'll use Ubuntu) whose host allows it to send mail (outgoing port 25 should be open)
- Know-how to set up a secure server before we install Ptorx onto it
- Nginx or similar software installed to serve static files and act as a proxy for Ptorx and other local APIs
- Let's Encrypt or similar geniune TLS (SSL) certificate (no self-signed certs!) for your main domain where the instance of Ptorx will be hosted (additional mail-only domains don't need this)
- Node.js installed on your server (the latest version available at time of the last [server/package.json](https://github.com/Xyfir/ptorx/blob/master/server/package.json) update)
- MariaDB or MySQL installed on your server (ptorx.com runs MariaDB so there may be unknown discrepancies with MySQL)

# Step 1: Download Code and npm Dependencies

First change to directory where you want to keep Ptorx.

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

Then install pm2 to manage our API servers:

```bash
npm install -g pm2
```

# Step 2: Create Database

Create a database and preferably a non-root MySQL user with `SELECT, INSERT, UPDATE, DELETE` privileges as well. We'll name our database `ptorx` but any name will do.

```bash
sudo mysql -u root -e "CREATE DATABASE ptorx"
```

Next we'll build the database, so assuming we're still in `ptorx/`:

```bash
sudo mysql -u root -p ptorx < db/build/structure.sql
sudo mysql -u root -p ptorx < db/build/data.sql
```

Replace `ptorx` with the name of your database.

# Step N: Set Reverse DNS

This is an important step that can help prevent your mail from being marked as spam. Go to your server's control panel and change the reverse DNS to your domain name. By default its value probably looks something like `0.0.0.0.yourhost.com` where `0.0.0.0` is your server's IPv4 address and `yourhost.com` is the name of your server host. For example with [VULTR](https://www.vultr.com/?ref=7140527), which Ptorx uses, it'll look like `140.82.16.198.vultr.com`, and it can be found under the `Settings > IPv4` tab when viewing your server instance.
