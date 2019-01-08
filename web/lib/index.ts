import 'styles/styles.scss';
import 'typeface-roboto';

import { AppRouter } from 'components/app/Router';
import { render } from 'react-dom';
import * as React from 'react';

render(React.createElement(AppRouter), document.getElementById('content'));
