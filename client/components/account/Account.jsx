import request from 'superagent';
import moment from 'moment';
import React from 'react';
import copy from 'copyr';

// Components
import Purchase from 'components/account/Purchase';

// react-md
import TextField from 'react-md/lib/TextFields';
import ListItem from 'react-md/lib/Lists/ListItem';
import Dialog from 'react-md/lib/Dialogs';
import Button from 'react-md/lib/Buttons/Button';
import Paper from 'react-md/lib/Papers';
import List from 'react-md/lib/Lists/List'

// Action creators
import { deleteEmail, addEmail } from 'actions/creators/account/email';

// Constants
import { PURCHASE_SUBSCRIPTION } from 'constants/views';

export default class Account extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      selectedEmail: {}, canPurchase: !localStorage.isPhoneGap
    };
  }

  onAddEmail() {
    const email = this.refs.email.getField().value;
    
    request
      .post('../api/account/email/' + email)
      .end((err, res) => {
        if (err || res.body.error) {
          swal('Error', res.body.message, 'error');
        }
        else {
          this.props.dispatch(addEmail(res.body.id, email));
          this.refs.email.getField().value = '';
        }
      });
  }

  onDeleteEmail() {
    const {id} = this.state.selectedEmail;

    swal({
      title: 'Are you sure?',
      text: 'Any proxy emails linked to this address will be deleted.',
      type: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#DD6B55',
      confirmButtonText: 'Yes, delete it!'
    }, () =>
      request
        .delete('../api/account/email/' + id)
        .end((err, res) => {
          if (err || res.body.error)
            return swal('Error', 'Could not delete address', 'error');

          this.setState({ selectedEmail: {} });
          this.props.dispatch(deleteEmail(id));
        })
    );
  }

  render() {
    if (this.props.data.view == PURCHASE_SUBSCRIPTION)
      return <Purchase {...this.props} />

    const { account } = this.props.data;
    
    return (
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
            label='Copy Link'
            onClick={() => copy('https://ptorx.com/#?r=' + account.uid)}
          >content_copy</Button>
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
                  label='Extend'
                  onClick={() => location.hash =
                    '#account/purchase-subscription'
                  }
                />
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
                  label='Purchase'
                  onClick={() => location.hash =
                    '#account/purchase-subscription'
                  }
                />
              ) : (
                <p>Subscriptions must be purchased via Ptorx's website.</p>
              )}
            </div>
          )}
        </Paper>
        
        <Paper
          zDepth={1}
          component='section'
          className='primary-emails section flex'
        >
          <h3>Primary Emails</h3>
          <p>
            These are your real email addresses that will receive messages redirected from your proxy email addresses.
          </p>

          <div className='add'>
            <TextField
              id='email--email'
              ref='email'
              type='email'
              label='Email'
              className='md-cell'
            />
            <Button icon onClick={() => this.onAddEmail()}>add</Button>
          </div>

          <List>{
            account.emails.map(email =>
              <ListItem
                key={email.id}
                onClick={() => this.setState({ selectedEmail: email })}
                primaryText={email.address} 
              />
            )
          }</List>

          <Dialog
            id='selected-email'
            title={this.state.selectedEmail.address}
            onHide={() => this.setState({ selectedEmail: {} })}
            visible={!!this.state.selectedEmail.id}
          >
            <List>
              <ListItem
                primaryText='Copy'
                onClick={() => copy(this.state.selectedEmail.address)}
              />
              <ListItem
                primaryText='Delete'
                onClick={() => this.onDeleteEmail()}
              />
            </List>
          </Dialog>
        </Paper>
      </div>                
    );
  }    

}