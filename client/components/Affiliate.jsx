import { render } from 'react-dom';
import request from 'superagent';
import React from 'react';
import swal from 'sweetalert';

// Constants
import { XACC, LOG_STATE, ENVIRONMENT } from 'constants/config';

class Affiliate extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    if (!this.state) return null;
    return <div className="affiliate" />;
  }
}

render(<Affiliate />, document.getElementById('content'));
