if [ "$PACKAGE" == "server" ]; then
  # configure mysql
  # sudo apt install mariadb-server
  # sudo systemctl enable mysql
  sudo mysql -u root -e "CREATE DATABASE ptorx"
  sudo mysql -u root -p ptorx < server/db/build/structure.sql
  sudo mysql -u root -p ptorx < server/db/build/data.sql
  sudo mysql -u root -p ptorx < server/db/build/test-data.sql

  # misc config
  mkdir mail-cache
fi

if [ "$PACKAGE" != "." ]; then
  cp example.env .env
  npm t
  npm run build
fi