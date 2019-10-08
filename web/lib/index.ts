import { render } from 'react-dom';
import * as React from 'react';
import { Ptorx } from 'types/ptorx';
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

render(React.createElement(App), document.getElementById('content'));
