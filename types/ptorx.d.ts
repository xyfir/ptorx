export namespace Ptorx {
  export type Tier = 'basic' | 'premium' | 'ultimate';

  export type TierDuration = 'month' | 'year' | 'life';

  export interface User {
    userId: number;
    email: string;
    credits: number;
    tier: Tier;
    tierExpiration?: number;
  }

  export interface Payment {
    id: number;
    userId: User['userId'];
    tier: Tier;
    duration: TierDuration;
    amount: number;
    paid?: number;
  }

  export interface JWT {
    userId: Ptorx.User['userId'];
    email: Ptorx.User['email'];
  }

  export interface Domain {
    id: number;
    userId: number;
    domain: string;
    publicKey: string;
    privateKey?: string;
    selector: string;
    created: number;
    verified: boolean;
    global: boolean;
    isCreator: boolean;
  }

  export type DomainList = {
    id: Domain['id'];
    domain: Domain['domain'];
    isCreator: Domain['isCreator'];
    global: Domain['global'];
    created: Domain['created'];
  }[];

  export interface DomainAuth {
    domain: Ptorx.Domain['domain'];
    publicKey: Ptorx.Domain['publicKey'];
    privateKey: Ptorx.Domain['privateKey'];
    selector: Ptorx.Domain['selector'];
  }

  export interface DomainUser {
    domainId: number;
    userId: number;
    label: string;
    requestKey: string;
    created: number;
    authorized: boolean;
  }

  export type DomainUserList = {
    domainId: DomainUser['domainId'];
    label: DomainUser['label'];
    requestKey: DomainUser['requestKey'];
    created: DomainUser['created'];
    authorized: DomainUser['authorized'];
  }[];

  export interface ProxyEmail {
    id: number;
    userId: number;
    domainId: Ptorx.Domain['id'];
    address: string;
    name: string;
    created: number;
    saveMail: boolean;
    links: ProxyEmailLink[];
    /**
     * @example `"address@domain.com"`
     */
    fullAddress: string;
  }

  export type ProxyEmailList = {
    id: Ptorx.ProxyEmail['id'];
    name: Ptorx.ProxyEmail['name'];
    created: Ptorx.ProxyEmail['created'];
    fullAddress: Ptorx.ProxyEmail['fullAddress'];
  }[];

  export interface ProxyEmailLink {
    proxyEmailId: Ptorx.ProxyEmail['id'];
    orderIndex: number;
    primaryEmailId?: Ptorx.PrimaryEmail['id'];
    modifierId?: Ptorx.Modifier['id'];
    filterId?: Ptorx.Filter['id'];
  }

  export interface Message {
    id: number;
    userId: number;
    proxyEmailId: Ptorx.ProxyEmail['id'];
    created: number;
    key: string;
    subject: string;
    /**
     * @example `'"User" <user@example.com>, user@domain.com'`
     */
    from: string;
    /**
     * @example `'"User" <user@example.com>, user@domain.com'`
     */
    to: string;
    text: string;
    html?: string;
    /**
     * @example `['Content-Type: text/html; charset="utf-8"']`
     */
    headers: string[];
    replyTo?: string;
    attachments: {
      id?: number;
      filename?: string;
      contentType: string;
      size: number;
      content?: Blob | Buffer;
    }[];
    /**
     * @example `"messageId--messageKey--reply-x@domain.tld"`
     */
    ptorxReplyTo: string;
  }

  export type MessageList = {
    id: Message['id'];
    proxyEmailId: Message['proxyEmailId'];
    created: Message['created'];
    subject: Message['subject'];
    from: Message['from'];
  }[];

  export interface Filter {
    id: number;
    userId: number;
    name: string;
    type: 'subject' | 'address' | 'text' | 'html' | 'header';
    find: string;
    blacklist: boolean;
    regex: boolean;
    created: number;
  }

  export type FilterList = {
    id: Filter['id'];
    name: Filter['name'];
    type: Filter['type'];
    created: Filter['created'];
  }[];

  export interface Modifier {
    id: number;
    userId: number;
    name: string;
    target: 'subject' | 'html' | 'text';
    template: string;
    created: number;
  }

  export type ModifierList = {
    id: Ptorx.Modifier['id'];
    userId: Ptorx.Modifier['userId'];
    name: Ptorx.Modifier['name'];
    created: Ptorx.Modifier['created'];
  }[];

  export interface PrimaryEmail {
    id: number;
    userId: number;
    address: string;
    created: number;
    key?: string;
    verified: boolean;
  }

  export type PrimaryEmailList = {
    id: PrimaryEmail['id'];
    userId: PrimaryEmail['userId'];
    address: PrimaryEmail['address'];
    created: PrimaryEmail['created'];
    verified: PrimaryEmail['verified'];
  }[];

  export interface Recipient {
    proxyEmailId?: Ptorx.ProxyEmail['id'];
    domainId?: number;
    message?: Ptorx.Message;
    address: string;
    user?: Ptorx.User;
  }

  export namespace Env {
    export interface Common {
      /**
       * Name of the application as displayed to the user.
       */
      NAME: string;
      /**
       * Is this a production environment?
       */
      PROD: boolean;
      /**
       * The app's main domain name.
       * @example "example.com"
       */
      DOMAIN: string;
      /**
       * The app's root API URL.
       * @example "https://ptorx.com/api/6"
       */
      API_URL: string;
    }

    export interface Server extends Ptorx.Env.Common {
      /**
       * Should app run cron jobs?
       */
      CRON: boolean;
      /**
       * MySQL / MariaDB connection object passed to mysql.createPool()
       * https://github.com/mysqljs/mysql#pooling-connections
       */
      MYSQL: any;
      /**
       * Shared secret (also used by Accownt and Rich Cow) used for signing and
       *  verifying JSON Web Tokens.
       */
      JWT_KEY: string;
      /**
       * The app's root web client URL.
       * @example "https://ptorx.com"
       */
      WEB_URL: string;
      /**
       * The port to host the API server on.
       * @example 2070
       */
      API_PORT: number;
      /**
       * The internal database id of `DOMAIN`. Probably `1`.
       */
      DOMAIN_ID: number;
      /**
       * The port to host the SMTP server on.
       * @example 2071
       */
      SMTP_PORT: number;
      /**
       * Absolute path for ptorx-web.
       * @example "/path/to/ptorx/web"
       */
      WEB_DIRECTORY: string;
      /**
       * The port to host the test SMTP server on. Used for capturing outgoing mail
       *  in a testing environment.
       * @example 2072
       */
      TEST_SMTP_PORT: number;
      /**
       * URL for the Rich Cow web client.
       * @example "https://ptorx.com/rich-cow"
       */
      RICH_COW_WEB_URL: string;
      /**
       * Configuration for the SMTP server.
       *  https://nodemailer.com/extras/smtp-server/#step-3-create-smtpserver-instance
       *  Note that unlike the original object, the `cert` and `key` properties
       *  also accept file paths. `name` and `banner` should be your server's
       *  hostname.
       */
      SMTP_SERVER_OPTIONS: any;
      /**
       * Absolute path for where to temporarily cache large outgoing mail for
       *  before being signed.
       * @example "/path/to/mail-cache"
       */
      MAIL_CACHE_DIRECTORY: string;
      /**
       * A proxy email within the database. Used for testing.
       * @example "test@ptorx.com"
       */
      PERSISTENT_PROXY_EMAIL: string;
    }

    export interface Web extends Ptorx.Env.Common {
      /**
       * Port for the Webpack dev server. Only needed for Ptorx developers.
       * @example 2073
       */
      PORT: number;
      /**
       * The root documentation URL.
       */
      DOCS_URL: 'https://github.com/Xyfir/Ptorx/blob/docs';
      /**
       * The URL for the Accownt web client.
       * @example "https://ptorx.com/accownt"
       */
      ACCOWNT_WEB_URL: string;
      /**
       * The URL for the Accownt API.
       * @example "https://ptorx.com/api/accownt"
       */
      ACCOWNT_API_URL: string;
    }
  }
}
