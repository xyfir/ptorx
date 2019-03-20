import { render } from 'react-dom';
import * as React from 'react';
import { Ptorx } from 'types/ptorx';
import { hot } from 'react-hot-loader/root';
import { App } from 'components/App';
import 'typeface-roboto';

declare global {
  namespace NodeJS {
    interface Process {
      enve: Ptorx.Env.Web;
    }
  }
}

render(React.createElement(hot(App)), document.getElementById('content'));
