export namespace Ptorx {
  export type AccountTier = "basic" | "premium" | "ultimate";

  export interface User {
    userId: number;
    email: string;
    credits: number;
    tier: AccountTier;
    tierExpiration?: number;
  }

  export interface Payment {
    id: number;
    userId: User["userId"];
    tier: AccountTier;
    months: number;
    paid?: number;
  }

  export interface JWT {
    userId: Ptorx.User["userId"];
    email: Ptorx.User["email"];
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
    id: Domain["id"];
    domain: Domain["domain"];
    isCreator: Domain["isCreator"];
    global: Domain["global"];
    created: Domain["created"];
  }[];

  export interface DomainAuth {
    domain: Ptorx.Domain["domain"];
    publicKey: Ptorx.Domain["publicKey"];
    privateKey: Ptorx.Domain["privateKey"];
    selector: Ptorx.Domain["selector"];
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
    domainId: DomainUser["domainId"];
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
    links: ProxyEmailLink[];
    /**
     * @example `"address@domain.com"`
     */
    fullAddress: string;
  }

  export type ProxyEmailList = {
    id: Ptorx.ProxyEmail["id"];
    name: Ptorx.ProxyEmail["name"];
    created: Ptorx.ProxyEmail["created"];
    fullAddress: Ptorx.ProxyEmail["fullAddress"];
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
    userId: number;
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
    target: "subject" | "html" | "text";
    template: string;
    created: number;
  }

  export type ModifierList = {
    id: Ptorx.Modifier["id"];
    userId: Ptorx.Modifier["userId"];
    name: Ptorx.Modifier["name"];
    created: Ptorx.Modifier["created"];
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
    id: PrimaryEmail["id"];
    userId: PrimaryEmail["userId"];
    address: PrimaryEmail["address"];
    created: PrimaryEmail["created"];
    verified: PrimaryEmail["verified"];
  }[];

  export interface Recipient {
    proxyEmailId?: Ptorx.ProxyEmail["id"];
    domainId?: number;
    message?: Ptorx.Message;
    address: string;
    user?: Ptorx.User;
  }
}
