import { BrowserRouter, Switch, Route } from 'react-router-dom';
import * as React from 'react';
import { Home } from 'components/app/Home';
import { App } from 'components/app/App';

export const AppRouter = () => (
  <BrowserRouter>
    <Switch>
      <Route path="/app" render={p => <App {...p} />} />
      <Route exact path="/" render={p => <Home {...p} />} />
    </Switch>
  </BrowserRouter>
);
