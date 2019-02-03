import { AppState } from 'components/App';
import * as React from 'react';

export interface AppContextValue extends AppState {
  reload(): void;
}

export const AppContext = React.createContext<AppContextValue | null>(null);
