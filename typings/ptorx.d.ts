export namespace Ptorx {
  export interface Account {
    loggedIn: boolean;
    uid: number;
    credits: number;
    emailTemplate?: number;
  }

  export interface Domain {
    id: number;
    userId: number;
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
    isCreator: boolean;
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
    proxyEmailId: number;
    userId: number;
    domainId: number;
    mgRouteId: string;
    address: string;
    name: string;
    description: string;
    /**
     * @example `"2020-07-20 00:00:00"
     */
    created: string;
    spamFilter: boolean;
    saveMail: boolean;
    directForward: boolean;
    //
    /**
     * @example `"ejection81@sandbox86b2c.mailgun.org"`
     */
    fullAddress: string;
    links: {
      orderIndex: number;
      primaryEmailId?: number;
      modifierId?: number;
      filterId?: number;
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
    filterId: number;
    name: string;
    description: string;
    type: number;
    find: string;
    acceptOnMatch: boolean;
    regex: boolean;
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
    value?: string;
    subject?: string;
    with?: string;
    flags?: string;
    regex?: boolean;
    prepend?: boolean;
    target?: boolean;
  }

  export type ModifierList = {
    uid: number;
    id: number;
    name: string;
    description: string;
    type: number;
    global: boolean;
  }[];

  export type PrimaryEmailList = {
    id: number;
    address: string;
  }[];
}
