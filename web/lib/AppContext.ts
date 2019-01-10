import * as React from 'react';
import { Ptorx } from 'typings/ptorx';

export type AppContextValue = {
  account: Ptorx.Account;
};

export const AppContext = React.createContext<AppContextValue | null>(null);
