import { PanelState } from 'components/panel/Panel';
import * as React from 'react';
import { Ptorx } from 'typings/ptorx';

export interface PanelContextValue extends PanelState {
  onSelectCategory(category: PanelState['categories'][0]): void;
  reload(): void;
  user: Ptorx.User;
}

export const PanelContext = React.createContext<PanelContextValue | null>(null);
