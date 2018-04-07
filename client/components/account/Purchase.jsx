import { TextField, Button, Paper } from 'react-md';
import request from 'superagent';
import React from 'react';
import swal from 'sweetalert';

export default class Purchase extends React.Component {

  constructor(props) {
    super(props);
  }

  /** @param {string} type - `'iap|normal|swiftdemand'` */
  onPurchase(type) {
    request
      .post('/api/account/purchase')
      .send({ type })
      .end((err, res) => {
        if (err || res.body.error)
          return swal('Error', res.body.message, 'error');
        location.href = res.body.url;
      });
  }

  render() {
    const {referral, trial} = this.props.data.account;
    const discount =
      (referral.user || referral.promo) &&
      !referral.hasMadePurchase;

    if (referral.source == 'swiftdemand' && trial) return (
      <Paper
        zDepth={1}
        component='section'
        className='purchase-subscription swiftdemand section flex'
      >
        <p>
          You can purchase a one-time, three month subscription using SwiftDemand. This offer will expire when your account's 14 day free trial ends, so get it soon!
        </p>

        <Button
          primary raised
          onClick={() => this.onPurchase('swiftdemand')}
        >Purchase</Button>
      </Paper>
    )
    else return (
      <Paper
        zDepth={1}
        component='section'
        className='purchase-subscription section flex'
      >
        <div className='info'>
          <p>
            Check Ptorx's <a href="#/docs">Help Docs</a> to see all the features a subscription gives you.
          </p>

          <p>
            A subscription with Ptorx costs $9.99 USD and gives you 365 days of access to all of Ptorx's features. You will not be automatically charged at the end of your subscription, but a week before expiration you will receive a notification to optionally purchase another year. If you currently already have a subscription, purchasing another one will add an additional 365 days to your current subscription.
          </p>

          <p>
            Ptorx offers a 30 day money-back guarantee. If you're not happy with your purchase within the first 30 days, we'll offer a full refund, no questions asked.
          </p>

          {discount ? (
            <p>You will receive 10% off of your first purchase.</p>
          ) : null}
        </div>

        <Button
          raised primary
          onClick={() => this.onPurchase(window.cordova ? 'iap' : 'normal')}
        >Purchase</Button>
      </Paper>
    )
  }

}