import { BrowserRouter, Switch, Route } from 'react-router-dom';
import * as React from 'react';
import { Info } from 'components/app/Info';
import { App } from 'components/app/App';

export const AppRouter = () => (
  <BrowserRouter>
    <Switch>
      <Route path="/app" render={p => <App {...p} />} />
      <Route render={p => <Info {...p} />} />
    </Switch>
  </BrowserRouter>
);
