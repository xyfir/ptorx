export namespace Ptorx {
  export interface Domain {
    id: number;
    user_id: number;
    /**
     * @example `"sandbox86b2c.mailgun.org"`
     */
    domain: string;
    domainKey: string;
    /**
     * @example `"2017-09-03 20:33:42"`
     */
    added: string;
    verified: boolean;
    global: boolean;
    isCreator: true;
    users: {
      id: number;
      label: number;
      requestKey: number;
      /**
       * @example `"2017-09-03 20:33:42"`
       */
      added: string;
    }[];
  }

  export type DomainList = {
    id: number;
    domain: string;
    isCreator: boolean;
    global: boolean;
  }[];

  export interface ProxyEmail {
    id: number;
    name: string;
    description: string;
    saveMail: boolean;
    /**
     * @example `"ejection81@sandbox86b2c.mailgun.org"`
     */
    address: string;
    toEmail: string;
    spamFilter: boolean;
    directForward: boolean;
    filters: {
      id: number;
      name: string;
      description: string;
      type: number;
    }[];
    modifiers: {
      id: number;
      name: string;
      description: string;
      type: number;
    }[];
  }

  export type ProxyEmailList = {
    id: number;
    name: string;
    description: string;
    /**
     * @example `"ejection81@sandbox86b2c.mailgun.org"`
     */
    address: string;
  }[];

  export interface Message {
    url: string;
    /** Unix timestamp */
    received: number;
    text: string;
    html: string;
    headers: Array<[string, string]>;
    from: string;
    subject: string;
  }

  export type MessageList = {
    /**
     * @example `"cea27f3c-db20-485a-a41e-b197661207e1"`
     */
    id: string;
    /**
     * Unix timestamp
     */
    received: number;
    subject: string;
  }[];

  export interface Filter {
    id: number;
    name: string;
    description: string;
    type: number;
    find: string;
    acceptOnMatch: boolean;
    regex: boolean;
    /**
     * Proxy emails
     */
    linkedTo: {
      id: number;
      /**
       * @example `"ejection81@sandbox86b2c.mailgun.org"`
       */
      address: string;
    }[];
  }

  export type FilterList = {
    id: number;
    name: string;
    description: string;
    type: number;
  }[];

  export interface Modifier {
    id: number;
    name: string;
    description: string;
    type: number;
    /**
     * Based on `type`. Could be empty, a value, or a JSON string
     */
    data: string;
    /**
     * Proxy emails
     */
    linkedTo: {
      id: number;
      /**
       * @example `"ejection81@sandbox86b2c.mailgun.org"`
       */
      address: string;
    }[];
  }

  export type ModifierList = {
    uid: number;
    id: number;
    name: string;
    description: string;
    type: number;
    global: boolean;
  }[];

  export interface PrimaryEmail {
    id: number;
    address: string;
  }
}
