import StripeCheckout from 'react-stripe-checkout';
import request from 'superagent';
import React from 'react';
import swal from 'sweetalert';

// Constants
import { STRIPE_KEY_PUB } from 'constants/config';

// react-md
import Button from 'react-md/lib/Buttons/Button';
import Paper from 'react-md/lib/Papers';

export default class Purchase extends React.Component {

  constructor(props) {
    super(props);

    this.state = { subscription: 0 };
  }

  onPurchase(token) {
    request
      .post('../api/account/purchase')
      .send({ token: token.id })
      .end((err, res) => {
          if (err || res.body.error) {
            swal('Error', res.message, 'error');
          }
          else {
            location.hash = '#account';
            location.reload();
          }
      });
  }

  render() {
    const { referral } = this.props.data.account;
    const discount =
      (referral.referral || referral.affiliate) &&
      !referral.hasMadePurchase;

    return (
      <Paper
        zDepth={1}
        component='section'
        className='purchase-subscription section flex'
      >
        <div className='info'>
          <p>
            Check Ptorx's <a href="#docs">Help Docs</a> to see all the features a subscription gives you.
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
          token={t => this.onPurchase(t)}
          image='https://ptorx.com/static/icons/android-chrome-192x192.png'
          amount={discount ? 2250 : 2500}
          stripeKey={STRIPE_KEY_PUB}
          description='365 Days'
        />

        <Button
          raised primary
          onClick={() =>
            // bad code, don't care
            document.querySelector('.StripeCheckout').click()
          }
          label='Purchase'
        >credit_card</Button>
      </Paper>
    )
  }

}