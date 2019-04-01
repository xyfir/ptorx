import 'app-module-path/register';
import { config } from 'dotenv';
config();
import 'enve';

import * as cookieParser from 'cookie-parser';
import * as bodyParser from 'body-parser';
import { verifyJWT } from 'lib/jwt/verify';
import { startMTA } from 'lib/mail/mta';
import * as Express from 'express';
import { router } from 'api/router';
import { Ptorx } from 'types/ptorx';
import * as path from 'path';
import { cron } from 'jobs/cron';

declare global {
  namespace NodeJS {
    interface Process {
      enve: Ptorx.Env.Server;
    }
  }
}

declare module 'express' {
  interface Request {
    jwt?: Ptorx.JWT;
  }
}

const app = Express();
if (process.enve.NODE_ENV == 'development') {
  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', process.enve.WEB_URL);
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
app.use(
  '/static',
  Express.static(path.resolve(process.enve.WEB_DIRECTORY, 'dist'))
);
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
      if (req.cookies.jwt) req.jwt = await verifyJWT(req.cookies.jwt);
      else throw 'No JWT provided';
    } catch (err) {
      req.jwt = null;
      if (req.cookies.jwt) res.clearCookie('jwt');
    }
    next();
  }
);
app.use('/api/6', router);
app.get('/*', (req, res) =>
  res.sendFile(path.resolve(process.enve.WEB_DIRECTORY, 'dist', 'index.html'))
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
app.listen(process.enve.API_PORT, () =>
  console.log('Listening on', process.enve.API_PORT)
);

if (process.enve.CRON) cron();

startMTA();
