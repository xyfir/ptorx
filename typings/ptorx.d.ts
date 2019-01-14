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
    domain: string;
    domainKey: string;
    created: number;
    verified: boolean;
    global: boolean;
    isCreator: boolean;
    users: {
      id: number;
      label: number;
      requestKey: number;
      created: number;
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
    created: number;
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
    /**
     * @example `"ejection81@sandbox86b2c.mailgun.org"`
     */
    address: string;
  }[];

  export interface Message {
    url: string;
    created: number;
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
    created: number;
    subject: string;
  }[];

  export interface Filter {
    filterId: number;
    userId: number;
    name: string;
    type: 1 | 2 | 3 | 4 | 5 | 6;
    find: string;
    acceptOnMatch: boolean;
    regex: boolean;
    created: number;
  }

  export type FilterList = {
    filterId: number;
    name: string;
    type: number;
    created: number;
  }[];

  export interface Modifier {
    modifierId: number;
    userId: number;
    name: string;
    type: 2 | 3 | 4 | 5 | 6 | 8;
    subject?: string;
    replacement?: string;
    flags?: string;
    regex?: boolean;
    prepend?: boolean;
    target?: "subject" | "body-html" | "body-plain";
    add?: "from" | "subject" | "senderName" | "domain" | "sender";
    to?: "subject" | "body-html" | "body-plain";
    separator?: string;
    find?: string;
    tag?: string;
    template?: string;
    created: number;
  }

  export type ModifierList = {
    modifierId: Ptorx.Modifier["modifierId"];
    userId: Ptorx.Modifier["userId"];
    name: Ptorx.Modifier["name"];
    type: Ptorx.Modifier["type"];
    created: Ptorx.Modifier["created"];
    global: boolean;
  }[];

  export interface PrimaryEmail {
    primaryEmailId: number;
    userId: number;
    address: string;
    created: number;
  }

  export type PrimaryEmailList = PrimaryEmail[];
}
