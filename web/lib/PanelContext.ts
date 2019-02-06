import { PanelState } from 'components/panel/Panel';
import * as React from 'react';

export type PanelContextValue = PanelState;

export const PanelContext = React.createContext<PanelContextValue | null>(null);
