import 'app-module-path/register';
import { startSMTPServer } from 'lib/mail/smtp-server';
import * as cookieParser from 'cookie-parser';
import * as bodyParser from 'body-parser';
import * as Express from 'express';
import * as CONFIG from 'constants/config';
import { router } from 'api/router';
import { Ptorx } from 'typings/ptorx';
import * as path from 'path';
import * as jwt from 'jsonwebtoken';
import { cron } from 'jobs/cron';

declare module 'express' {
  interface Request {
    jwt?: Ptorx.JWT;
  }
}

const app = Express();
if (!CONFIG.PROD) {
  // Needed to allow communication from webpack-dev-server host
  app.use((req, res, next) => {
    res.header(
      'Access-Control-Allow-Origin',
      `http://localhost:${CONFIG.WEBPACK_PORT}`
    );
    res.header(
      'Access-Control-Allow-Methods',
      'GET, POST, OPTIONS, PUT, DELETE'
    );
    res.header(
      'Access-Control-Allow-Headers',
      'Origin, X-Requested-With, Content-Type, Accept'
    );
    res.header('Access-Control-Allow-Credentials', 'true');
    next();
  });
}
app.use('/static', Express.static(__dirname + '../web/dist'));
app.use(bodyParser.json({ limit: '35mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '35mb' }));
app.use(cookieParser());
app.use(
  async (
    req: Express.Request,
    res: Express.Response,
    next: Express.NextFunction
  ) => {
    try {
      // Verify JWT
      if (req.cookies.jwt) {
        req.jwt = await new Promise((resolve, reject) =>
          jwt.verify(req.cookies.jwt, CONFIG.JWT_KEY, {}, (err, token) =>
            err ? reject(err) : resolve(token as Express.Request['jwt'])
          )
        );
      }
      // Nothing to verify
      else {
        throw 'No JWT provided';
      }
    } catch (err) {
      req.jwt = null;
      if (req.cookies.jwt) res.clearCookie('jwt');
    }
    next();
  }
);
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
app.listen(CONFIG.API_PORT, () => console.log('Listening on', CONFIG.API_PORT));

if (CONFIG.CRON) cron();

startSMTPServer();
