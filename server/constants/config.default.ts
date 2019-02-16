import { SMTPServerOptions } from 'smtp-server';
import { readFileSync } from 'fs';

export const URL = 'http://';
export const NAME = '';
export const PROD = false;
export const CRON = false;
export const MYSQL = {
  host: 'localhost',
  port: 3306,
  user: 'root',
  charset: 'UTF8MB4_UNICODE_CI',
  password: '',
  database: '',
  dateStrings: true,
  connectionLimit: 100,
  supportBigNumbers: true,
  waitForConnections: true
};
export const DOMAIN = '';
export const JWT_KEY = '';
export const API_PORT = 2070;
export const DOMAIN_ID = 4;
export const SMTP_PORT = 2071;
export const DIRECTORIES = {
  MAIL_CACHE: '',
  WEB: ''
};
export const WEBPACK_PORT = 2073;
export const CALLBACK_URL = 'http://';
export const XYPAYMENTS_ID = 13;
export const TEST_SMTP_PORT = 2072;
export const XYPAYMENTS_KEY = '';
export const XYPAYMENTS_URL = 'http://';
export const RICH_COW_WEB_URL = 'http://';
export const XYPAYMENTS_PRODUCTS = { 1: 10, 2: 11, 3: 12 };
export const PERSISTENT_PROXY_EMAIL = '';
export const SMTP_SERVER_OPTIONS: SMTPServerOptions = {
  banner: '',
  logger: true,
  cert: readFileSync(''),
  name: '',
  key: readFileSync('')
};
