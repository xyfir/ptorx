import 'app-module-path/register';
import { startSMTPServer } from 'lib/mail/smtp-server';
import * as Session from 'express-session';
import * as Express from 'express';
import * as parser from 'body-parser';
import * as CONFIG from 'constants/config';
import * as Store from 'express-mysql-session';
import { router } from 'api/router';
import * as path from 'path';
import { cron } from 'jobs/cron';

// @ts-ignore
const SessionStore = Store(Session);
const app = Express();

app.listen(CONFIG.API_PORT, () => console.log('Listening on', CONFIG.API_PORT));

app.use(
  Session({
    store: new SessionStore(CONFIG.MYSQL),
    secret: CONFIG.SESSION_SECRET,
    resave: false,
    saveUninitialized: false
  })
);
if (!CONFIG.PROD) {
  app.use((req, res, next) => {
    req.session.uid = 1;
    res.header('Access-Control-Allow-Origin', '*');
    res.header(
      'Access-Control-Allow-Methods',
      'GET, POST, OPTIONS, PUT, DELETE'
    );
    res.header(
      'Access-Control-Allow-Headers',
      'Origin, X-Requested-With, Content-Type, Accept'
    );
    next();
  });
}
app.use(parser.json({ limit: '26mb' }));
app.use(parser.urlencoded({ extended: true, limit: '26mb' }));
app.use('/static', Express.static(__dirname + '../web/dist'));
app.use('/api/6', router);
app.get('/*', (req, res) =>
  res.sendFile(path.resolve(CONFIG.DIRECTORIES.WEB, 'dist', 'index.html'))
);
app.use(
  (
    err: string | Error,
    req: Express.Request,
    res: Express.Response,
    next: Express.NextFunction
  ) => {
    if (typeof err == 'string') {
      res.status(400).json({ error: err });
    } else {
      console.error(err.stack);
      res.status(500).json({ error: 'Something went wrong...' });
    }
  }
);

if (CONFIG.CRON) cron();

startSMTPServer();
