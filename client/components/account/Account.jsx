import { Button, Paper } from 'react-md';
import request from 'superagent';
import moment from 'moment';
import React from 'react';
import copy from 'copyr';

// Components
import PrimaryEmails from 'components/account/PrimaryEmails';
import Purchase from 'components/account/Purchase';

// Constants
import { PURCHASE_SUBSCRIPTION, PRIMARY_EMAILS } from 'constants/views';

export default class Account extends React.Component {

  constructor(props) {
    super(props);

    this.state = { canPurchase: !window.cordova };
  }

  render() {
    const {account, view} = this.props.App.state;

    if (view == PURCHASE_SUBSCRIPTION) return (
      <Purchase {...this.props} />
    )
    else if (view == PRIMARY_EMAILS) return (
      <PrimaryEmails {...this.props} />
    )
    else return (
      <div className='account'>
        <Paper
          zDepth={1}
          component='section'
          className='referral-link section flex'
        >
          <h3>Referral Program</h3>
          <p>
            Refer new users to Ptorx and they'll receive 10% off of their first purchase and you'll receive a free month of subscription time when they purchase their own subscription.
          </p>

          <Button
            flat primary
            iconChildren='content_copy'
            onClick={() => copy(`https://ptorx.com/?r=user~${account.uid}`)}
          >Copy Link</Button>
        </Paper>

        <Paper
          zDepth={1}
          component='section'
          className='subscription section flex'
        >
          <h3>Subscription</h3>

          {account.subscription > Date.now() ? (
            <div className='flex'>
              <p>Your subscription will expire on {
                moment(account.subscription).format('YYYY-MM-DD')
              }</p>

              {this.state.canPurchase ? (
                <Button
                  raised primary
                  onClick={() => location.hash =
                    '#/account/purchase-subscription'
                  }
                >Extend</Button>
              ) : (
                <p>Subscriptions must be extended via Ptorx's website.</p>
              )}
            </div>
          ) : (
            <div className='flex'>
              <p>
                You do not have a Ptorx Premium subscription.
              </p>

              {this.state.canPurchase ? (
                <Button
                  raised primary
                  onClick={() => location.hash =
                    '#/account/purchase-subscription'
                  }
                >Purchase</Button>
              ) : (
                <p>Subscriptions must be purchased via Ptorx's website.</p>
              )}
            </div>
          )}
        </Paper>
      </div>
    );
  }

}