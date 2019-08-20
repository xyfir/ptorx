if [ "$PACKAGE" == "server" ]; then
  # configure mysql
  sudo mysql -u root -e "CREATE DATABASE ptorx"
  sudo mysql -u root ptorx < db/build/structure.sql
  sudo mysql -u root ptorx < db/build/data.sql
  sudo mysql -u root ptorx < db/build/prepare-tests.sql

  # misc config
  mkdir mail-cache
fi

if [ "$PACKAGE" != "." ]; then
  cp example.env .env
  npm t
  npm run build
fi