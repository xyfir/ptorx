import { TextField, Button, Paper } from 'react-md';
import { render } from 'react-dom';
import request from 'superagent';
import React from 'react';
import swal from 'sweetalert';

class Affiliate extends React.Component {
  constructor(props) {
    super(props);

    this.state = {};

    request.get('/api/affiliates').end((err, res) => {
      if (err) location.href = '/app';
      else this.setState(res.body);
    });
  }

  onPay() {
    request
      .post('/api/affiliates/pay')
      .send({
        timestamp: this.state.timestamp
      })
      .end((err, res) => {
        if (err) return swal('Error', res.body.message, 'error');
        location.href = res.body.url;
      });
  }

  onGenerateKey() {
    request.post('/api/affiliates/key').end((err, res) => {
      if (err) swal('Error', res.body.message, 'error');
      else this.setState({ api_key: res.body.api_key });
    });
  }

  render() {
    if (!this.state) return null;

    const affiliate = this.state;

    return (
      <div className="affiliate">
        <h1>Affiliate (#{affiliate.user_id})</h1>
        <p>
          This account has paid for <strong>{affiliate.credits} </strong>
          credits and has a current cost of
          <strong> ${0.0006 - affiliate.discount}</strong> per credit, a
          <strong> ${affiliate.discount}</strong> per credit discount.
        </p>
        <p>
          <strong>${affiliate.owed}</strong> is owed for
          <strong> {affiliate.unpaid_credits}</strong> unpaid credits.
        </p>

        <div className="key">
          <TextField
            readOnly
            id="text--apikey"
            type="text"
            value={this.state.api_key}
            onClick={e => e.target.select()}
            helpText="Your private API key"
          />
          <Button
            icon
            primary
            iconChildren="autorenew"
            onClick={() => this.onGenerateKey('api')}
          />
        </div>

        {affiliate.owed ? (
          <Button
            flat
            secondary
            onClick={() => this.onPay()}
            iconChildren="credit_card"
          >
            Pay Owed
          </Button>
        ) : null}
      </div>
    );
  }
}

render(<Affiliate />, document.getElementById('content'));
