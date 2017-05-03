import request from 'superagent';
import React from 'react';

// Components
import Purchase from './Purchase';

// Action creators
import { deleteEmail, addEmail } from 'actions/creators/account/email';

// Constants
import { PURCHASE_SUBSCRIPTION } from 'constants/views';

export default class Account extends React.Component {

  constructor(props) {
    super(props);
  }

  onAddEmail() {
    const email = this.refs.email.value;
    
    request
      .post('../api/account/email/' + email)
      .end((err, res) => {
        if (err || res.body.error) {
          swal('Error', res.body.message, 'error');
        }
        else {
          this.props.dispatch(addEmail(res.body.id, email));
          this.refs.email.value = '';
        }
      });
  }

  onDeleteEmail(id) {
    swal({
      title: 'Are you sure?',
      text: 'Any redirect emails linked to this address will be deleted.',
      type: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#DD6B55',
      confirmButtonText: 'Yes, delete it!'
    }, () =>
      request
        .delete('../api/account/email/' + id)
        .end((err, res) => {
          if (err || res.body.error)
            swal('Error', 'Could not delete address', 'error');
          else
            this.props.dispatch(deleteEmail(id));
        })
    );
  }

  render() {
    if (this.props.data.view == PURCHASE_SUBSCRIPTION) {
      return (
        <Purchase
          data={this.props.data}
          dispatch={this.props.dispatch}
        />
      );
    }
    
    return (
      <div className='account'>
        <section className='referral-link'>
          <label>Referral Program</label>
          <span className='input-description'>
            Refer new users to Ptorx and they'll receive 10% off of their first purchase.
            <br />
            You'll receive one week of free premium subscription time for every month they purchase.
          </span>
          <input
            type='text' readonly
            value={'https://ptorx.com/#?r=' + this.props.data.account.uid}
            onFocus={e => e.target.select()}
          />
        </section>

        {this.props.data.account.subscription > Date.now() ? (
          <section className='subscription'>
            Your subscription will expire on <strong>{
              (new Date(this.props.data.account.subscription))
                .toLocaleString()
            }</strong>
            
            <br />
            
            <button
              onClick={() =>
                location.hash = '#account/purchase-subscription'
              }
              className='btn btn-primary'
            >
              Extend Subscription
            </button>
          </section>
        ) : (
          <section className='subscription'>
            You do not have a Ptorx Premium subscription.
            
            <br />

            <button
              onClick={() =>
                location.hash = '#account/purchase-subscription'
              }
              className='btn btn-primary'
            >Purchase Subscription</button>
          </section>
        )}
        
        <section className='emails'>
          <h3>Emails</h3>
          <p>
            These are your real emails that will receive messages redirected from your Ptorx addresses.
          </p>
          <div className='main-emails'>
            <div className='add'>
              <input type='text' ref='email' placeholder='email@example.com' />
              <a
                className='icon-add'
                onClick={() => this.onAddEmail()}
                title='Add Email'
              />
            </div>

            <div className='list'>{
              this.props.data.account.emails.map(email =>
                <div className='email' key={email.id}>
                  <input
                    readOnly
                    type='email'
                    value={email.address}
                    onFocus={e => e.target.select()}
                  />

                  <a
                    className='icon-trash'
                    title='Remove Email'
                    onClick={() => this.onDeleteEmail(email.id)}
                  />
                </div>
              )
            }</div>
          </div>
        </section>
      </div>                
    );
  }    

}