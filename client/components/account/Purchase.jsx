import { TextField, Button, Paper } from 'react-md';
import StripeCheckout from 'react-stripe-checkout';
import request from 'superagent';
import React from 'react';
import swal from 'sweetalert';

// Constants
import { STRIPE_KEY_PUB } from 'constants/config';

export default class Purchase extends React.Component {

  constructor(props) {
    super(props);

    this.state = { subscription: 0 };
  }

  onStripePurchase(token) {
    request
      .post('/api/account/purchase/stripe')
      .send({ token: token.id })
      .end((err, res) => {
          if (err || res.body.error) {
            swal('Error', res.body.message, 'error');
          }
          else {
            location.hash = '#/account';
            location.reload();
          }
      });
  }

  onSwiftDemandPurchase() {
    const swiftId = this.refs.swift.value;

    if (!swiftId) return;

    request
      .post('/api/account/purchase/swiftdemand')
      .send({ swiftId })
      .end((err, res) => {
        if (err || !res.body.redirect)
          swal('Error', res.body.message, 'error');
        else
          location.href = res.body.redirect;
      });
  }

  render() {
    const { referral, trial } = this.props.data.account;
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

        <TextField
          id='text--swift'
          ref='swift'
          type='text'
          label='Your Swift ID'
          className='md-cell'
        />

        <Button
          primary raised
          onClick={() => this.onSwiftDemandPurchase()}
        >Purchase</Button>
      </Paper>
    )
    else return (
      <Paper
        zDepth={1}
        component='section'
        className='purchase-subscription stripe section flex'
      >
        <div className='info'>
          <p>
            Check Ptorx's <a href="#/docs">Help Docs</a> to see all the features a subscription gives you.
          </p>

          <p>
            A subscription with Ptorx costs $25 USD and gives you 365 days of access to all of Ptorx's features. You will not be automatically charged at the end of your subscription, but a week before expiration you will receive a notification to optionally purchase another year. If you currently already have a subscription, purchasing another one will add an additional 365 days to your current subscription.
          </p>
          
          <p>
            Ptorx offers a 30 day money-back guarantee. If you're not happy with your purchase within the first 30 days, we'll offer a full refund, no questions asked.
          </p>
          
          {discount ? (
            <p>
              You will receive 10% off of your first purchase. Your first subscription will only cost $22.50!
            </p>
          ) : null}
        </div>

        <StripeCheckout
          bitcoin zipCode
          name='Ptorx // Xyfir, LLC'
          label='Purchase'
          token={t => this.onStripePurchase(t)}
          image='https://ptorx.com/static/icons/android-chrome-192x192.png'
          amount={discount ? 2250 : 2500}
          stripeKey={STRIPE_KEY_PUB}
          description='365 Days'
        />

        <Button
          raised primary
          onClick={() =>
            document.querySelector('.StripeCheckout').click()
          }
        >Purchase</Button>
      </Paper>
    )
  }

}