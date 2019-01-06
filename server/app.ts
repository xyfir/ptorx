require('app-module-path').addPath(__dirname);

const SessionStore = require('express-mysql-session');
const express = require('express');
const session = require('express-session');
const parser = require('body-parser');
const app = express();

const config = require('./config');

app.listen(config.environment.port, () =>
  console.log('~~Server running on port', config.environment.port)
);

/* Sessions */
app.use(
  session({
    secret: config.keys.session,
    store: new SessionStore({
      host: config.database.mysql.host,
      port: config.database.mysql.port,
      user: config.database.mysql.user,
      password: config.database.mysql.password,
      database: config.database.mysql.database,
      useConnectionPooling: true
    }),
    saveUninitialized: true,
    resave: true,
    cookie: {
      httpOnly: false
    }
  })
);

/* Body Parser */
app.use(parser.json({ limit: '26mb' }));
app.use(parser.urlencoded({ extended: true, limit: '26mb' }));

// Express middleware / controllers
app.get('/affiliate', (req, res) =>
  res.sendFile(__dirname + '/views/affiliate.html')
);
app.use('/static', express.static(__dirname + '../web/dist'));
app.get('/panel', (req, res) => res.sendFile(__dirname + '/views/panel.html'));
app.get('/app', (req, res) => res.sendFile(__dirname + '/views/app.html'));
app.use('/api', require('./controllers/'));
app.get('/*', (req, res) => {
  if (config.environment.type == 'development') req.session.uid = 1;

  res.sendFile(__dirname + '/views/info.html');
});

if (config.environment.runCronJobs) require('jobs/cron/start')();
