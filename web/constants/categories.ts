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
  singular: string;
  variable: string;
}[] = [
  {
    name: 'Aliases',
    route: 'aliases',
    singular: 'Alias',
    variable: 'aliases'
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
