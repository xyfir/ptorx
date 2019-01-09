import 'styles/styles.scss';
import 'typeface-roboto';

import { AppRouter } from 'components/app/Router';
import { render } from 'react-dom';
import * as React from 'react';
import { hot } from 'react-hot-loader';

render(
  React.createElement(hot(module)(AppRouter)),
  document.getElementById('content')
);
