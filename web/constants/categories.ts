export type Category =
  | 'Primary Emails'
  | 'Aliases'
  | 'Modifiers'
  | 'Messages'
  | 'Filters'
  | 'Domains';

export const CATEGORIES: {
  name: Category;
  route: string;
  variable: string;
  nameSingular: string;
  variableSingular: string;
}[] = [
  {
    name: 'Aliases',
    route: 'aliases',
    variable: 'aliases',
    nameSingular: 'Alias',
    variableSingular: 'alias'
  },
  {
    name: 'Messages',
    route: 'messages',
    variable: 'messages',
    nameSingular: 'Message',
    variableSingular: 'message'
  },
  {
    name: 'Primary Emails',
    route: 'primary-emails',
    variable: 'primaryEmails',
    nameSingular: 'Primary Email',
    variableSingular: 'primaryEmail'
  },
  {
    name: 'Filters',
    route: 'filters',
    variable: 'filters',
    nameSingular: 'Filter',
    variableSingular: 'filter'
  },
  {
    name: 'Modifiers',
    route: 'modifiers',
    variable: 'modifiers',
    nameSingular: 'Modifier',
    variableSingular: 'modifier'
  },
  {
    name: 'Domains',
    route: 'domains',
    variable: 'domains',
    nameSingular: 'Domain',
    variableSingular: 'domain'
  }
];
