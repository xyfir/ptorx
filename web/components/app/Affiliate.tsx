import { TextField, Button } from 'react-md';
import * as React from 'react';
import * as swal from 'sweetalert';
import { api } from 'lib/api';

export class Affiliate extends React.Component {
  constructor(props) {
    super(props);

    this.state = {};
  }

  async componentDidMount() {
    try {
      const res = await api.get('/affiliates');
      this.setState(res.data);
    } catch (err) {
      location.href = '/app';
    }
  }

  async onPay() {
    let res: AxiosResponse;
    try {
      res = await api.post('/affiliates/pay', {
        timestamp: this.state.timestamp
      });
      location.href = res.data.url;
    } catch (err) {
      swal('Error', res.data.error, 'error');
    }
  }

  async onGenerateKey() {
    let res: AxiosResponse;
    try {
      res = await api.post('/affiliates/key');
      this.setState({ api_key: res.data.api_key });
    } catch (err) {
      swal('Error', res.data.error, 'error');
    }
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
