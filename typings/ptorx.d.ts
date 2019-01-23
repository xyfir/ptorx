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
    id: number;
    proxyEmailId: Ptorx.ProxyEmail["id"];
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
    attachments: {
      id?: number;
      filename?: string;
      contentType: string;
      size: number;
      content?: Blob | Buffer;
    }[];
  }

  export type MessageList = {
    id: Message["id"];
    proxyEmailId: Message["proxyEmailId"];
    created: Message["created"];
    subject: Message["subject"];
    from: Message["from"];
  }[];

  export interface Filter {
    id: number;
    userId: number;
    name: string;
    type: "subject" | "address" | "text" | "html" | "header";
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
    type: "text-only" | "replace" | "subject" | "tag" | "concat" | "builder";
    subject?: string;
    replacement?: string;
    flags?: string;
    regex?: boolean;
    prepend?: boolean;
    target?: "subject" | "html" | "text";
    add?: "from" | "subject";
    to?: "subject" | "html" | "text";
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

  export interface Recipient {
    proxyEmailId?: Ptorx.ProxyEmail["id"];
    domainId?: number;
    message?: Ptorx.Message;
    address: string;
    userId?: number;
  }
}
