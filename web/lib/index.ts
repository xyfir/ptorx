import { render } from 'react-dom';
import * as React from 'react';
import { Ptorx } from 'types/ptorx';
import { hot } from 'react-hot-loader';
import { App } from 'components/App';
import 'typeface-roboto';

declare global {
  namespace NodeJS {
    interface Process {
      enve: Ptorx.Env.Web;
    }
  }
  interface Window {
    openpgp: typeof import('openpgp');
  }
}

render(
  React.createElement(hot(module)(App)),
  document.getElementById('content')
);
