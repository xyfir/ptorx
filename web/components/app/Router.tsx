import { Affiliate } from 'components/app/Affiliate';
import * as React from 'react';
import { Info } from 'components/app/Info';
import { App } from 'components/app/App';

export const AppRouter = () => {
  const [, path] = location.pathname.split('/');
  switch (path) {
    case 'affiliate':
      return <Affiliate />;
    case 'app':
      return <App />;
    default:
      return <Info />;
  }
};
