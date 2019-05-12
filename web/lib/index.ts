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

declare module 'mailparser' {
  interface ParsedMail {
    headerLines: { key: string; line: string }[];
  }
}

render(React.createElement(hot(App)), document.getElementById('content'));
