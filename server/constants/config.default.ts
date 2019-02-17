import { SMTPServerOptions } from 'smtp-server';
import { readFileSync } from 'fs';

/**
 * Name of the application as displayed to the user.
 */
export const NAME = 'Ptorx';
/**
 * Is this a production environment?
 */
export const PROD = false;
/**
 * Should app run cron jobs?
 */
export const CRON = false;
/**
 * MySQL / MariaDB connection object passed to mysql.createPool()
 * https://github.com/mysqljs/mysql#pooling-connections
 */
export const MYSQL = {
  host: 'localhost',
  port: 3306,
  user: 'root',
  charset: 'UTF8MB4_UNICODE_CI',
  password: '',
  database: 'ptorx',
  dateStrings: true,
  connectionLimit: 100,
  supportBigNumbers: true,
  waitForConnections: true
};
/**
 * The app's main domain name.
 */
export const DOMAIN = 'ptorx.com';
/**
 * Shared secret (also used by Accownt and Rich Cow) used for signing and
 *  verifying JSON Web Tokens.
 */
export const JWT_KEY = 'ptorx-jwt';
/**
 * The app's root API URL.
 */
export const API_URL = 'https://ptorx.com/api';
/**
 * The app's root web client URL.
 */
export const WEB_URL = 'https://ptorx.com';
/**
 * The port to host the API server on.
 */
export const API_PORT = 12345;
/**
 * The internal database id of `DOMAIN`.
 */
export const DOMAIN_ID = 4;
/**
 * The port to host the SMTP server on.
 */
export const SMTP_PORT = 2071;
/**
 * Absolute path for ptorx-web.
 */
export const WEB_DIRECTORY = '/path/to/ptorx/web';
/**
 * The port to host the test SMTP server on. Used for capturing outgoing mail
 *  in a testing environment.
 */
export const TEST_SMTP_PORT = 2072;
/**
 * URL for the Rich Cow web client.
 */
export const RICH_COW_WEB_URL = 'https://ptorx.com/rich-cow';
/**
 * Absolute path for where to temporarily cache large outgoing mail for
 *  before being signed.
 */
export const MAIL_CACHE_DIRECTORY = '';
/**
 * A proxy email within the database. Used for testing.
 */
export const PERSISTENT_PROXY_EMAIL = 'test@ptorx.com';
/**
 * Configuration for the SMTP server.
 * https://nodemailer.com/extras/smtp-server/#step-3-create-smtpserver-instance
 */
export const SMTP_SERVER_OPTIONS: SMTPServerOptions = {
  banner: '',
  logger: true,
  cert: readFileSync(''),
  name: '',
  key: readFileSync('')
};
