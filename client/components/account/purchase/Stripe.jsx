import StripeCheckout from 'react-stripe-checkout';
import request from 'superagent';
import React from 'react';

// Constants
import { STRIPE_KEY_PUB } from 'constants/config';
import subscriptions from '../../../../subscriptions';

// react-md
import SelectField from 'react-md/lib/SelectFields';
import Paper from 'react-md/lib/Papers';

export default class StripePurchase extends React.Component {

  constructor(props) {
    super(props);

    this.state = { subscription: 0 };
  }

  onPurchase(token) {
    request
      .post('../api/account/stripe-purchase')
      .send({
        token: token.id, subscription: this.state.subscription
      })
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
    const subscription = subscriptions[this.state.subscription];
    const { referral } = this.props.data.account;
    const discount =
      (referral.referral || referral.affiliate) &&
      !referral.hasMadePurchase;

    return (
      <Paper
        zDepth={1}
        component='section'
        className='purchase-subscription stripe section flex'
      >
        {discount ? (
          <p>You will receive 10% off of your first purchase.</p>
        ) : null}

        <SelectField
          id='select-subscription'
          value={this.state.subscription}
          onChange={v => this.setState({ subscription: v })}
          position={SelectField.Positions.BELOW}
          className='md-cell'
          menuItems={
            subscriptions.map((s, i) => Object({ label: s.name, value: i }))
          }
          placeholder='Type'
        />

        <StripeCheckout
          bitcoin zipCode
          name='Ptorx // Xyfir, LLC'
          label='Purchase'
          token={t => this.onPurchase(t)}
          image='https://ptorx.com/static/icons/android-chrome-192x192.png'
          amount={subscription.amount}
          stripeKey={STRIPE_KEY_PUB}
          description={subscription.name}
        />
      </Paper>
    )
  }

}