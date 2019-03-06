export type Category =
  | 'Primary Emails'
  | 'Proxy Emails'
  | 'Modifiers'
  | 'Messages'
  | 'Filters'
  | 'Domains';

export const CATEGORIES: {
  name: Category;
  route: string;
  singular: string;
  variable: string;
}[] = [
  {
    name: 'Proxy Emails',
    route: 'proxy-emails',
    singular: 'Proxy Email',
    variable: 'proxyEmails'
  },
  {
    name: 'Messages',
    route: 'messages',
    singular: 'Message',
    variable: 'messages'
  },
  {
    name: 'Primary Emails',
    route: 'primary-emails',
    singular: 'Primary Email',
    variable: 'primaryEmails'
  },
  {
    name: 'Filters',
    route: 'filters',
    singular: 'Filter',
    variable: 'filters'
  },
  {
    name: 'Modifiers',
    route: 'modifiers',
    singular: 'Modifier',
    variable: 'modifiers'
  },
  {
    name: 'Domains',
    route: 'domains',
    singular: 'Domain',
    variable: 'domains'
  }
];
