import { render } from 'react-dom';
import * as React from 'react';
import { hot } from 'react-hot-loader';
import { App } from 'components/App';
import 'typeface-roboto';

render(
  React.createElement(hot(module)(App)),
  document.getElementById('content')
);
