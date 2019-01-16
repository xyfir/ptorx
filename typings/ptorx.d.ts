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
  }

  export type DomainList = {
    id: Domain["id"];
    domain: Domain["domain"];
    isCreator: Domain["isCreator"];
    global: Domain["global"];
    created: Domain["created"];
  }[];

  export interface DomainUser {
    domainId: number;
    userId: number;
    label: string;
    requestKey: string;
    created: number;
    authorized: boolean;
  }

  export type DomainUserList = {
    label: DomainUser["label"];
    requestKey: DomainUser["requestKey"];
    created: DomainUser["created"];
    authorized: DomainUser["authorized"];
  }[];

  export interface ProxyEmail {
    id: number;
    userId: number;
    domainId: Ptorx.Domain["id"];
    address: string;
    name: string;
    created: number;
    spamFilter: boolean;
    saveMail: boolean;
    directForward: boolean;
    links: ProxyEmailLink[];
  }

  export type ProxyEmailList = {
    id: number;
    name: string;
    /**
     * @example `"ejection81@sandbox86b2c.mailgun.org"`
     */
    address: string;
    created: number;
  }[];

  export interface ProxyEmailLink {
    proxyEmailId: Ptorx.ProxyEmail["id"];
    orderIndex: number;
    primaryEmailId?: Ptorx.PrimaryEmail["id"];
    modifierId?: Ptorx.Modifier["id"];
    filterId?: Ptorx.Filter["id"];
  }

  export interface Message {
    id: string;
    proxyEmailId: Ptorx.ProxyEmail["id"];
    created: number;
    subject: string;
    sender: string;
    /**
     * `0` = accepted, `1` = rejected, `2` = spam
     */
    type: 0 | 1 | 2;
  }

  export type MessageList = Message[];

  export interface Filter {
    id: number;
    userId: number;
    name: string;
    type: 1 | 2 | 3 | 4 | 5 | 6;
    find: string;
    blacklist: boolean;
    regex: boolean;
    created: number;
  }

  export type FilterList = {
    id: Filter["id"];
    name: Filter["name"];
    type: Filter["type"];
    created: Filter["created"];
  }[];

  export interface Modifier {
    id: number;
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
    id: Ptorx.Modifier["id"];
    userId: Ptorx.Modifier["userId"];
    name: Ptorx.Modifier["name"];
    type: Ptorx.Modifier["type"];
    created: Ptorx.Modifier["created"];
    global: boolean;
  }[];

  export interface PrimaryEmail {
    id: number;
    userId: number;
    address: string;
    created: number;
  }

  export type PrimaryEmailList = PrimaryEmail[];
}
