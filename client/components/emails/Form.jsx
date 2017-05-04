import PropTypes from 'prop-types';
import request from 'superagent';
import React from 'react';

// Components
import LinkModifier from 'components/modifiers/Link';
import LinkFilter from 'components/filters/Link';

// Action creators
import { loadModifiers } from 'actions/creators/modifiers';
import { loadFilters } from 'actions/creators/filters';
import { addEmail } from 'actions/creators/account/email';

// Constants
import { filterTypes, modifierTypes } from 'constants/types';
import { RECAPTCHA_KEY } from 'constants/config';

export default class CreateOrEditEmailForm extends React.Component {

  constructor(props) {
    super(props);

    this.onAddModifier = this.onAddModifier.bind(this);
    this.onAddFilter = this.onAddFilter.bind(this);

    this.state = {
      filters: this.props.email.filters, modifiers: this.props.email.modifiers
    };
  }

  /**
   * Load filters and/or modifiers if needed.
   */
  componentWillMount() {
    if (!this.props.data.modifiers.length) {
      request
        .get('../api/modifiers')
        .end((err, res) =>
          this.props.dispatch(loadModifiers(res.body.modifiers))
        );
    }
    if (!this.props.data.filters.length) {
      request
        .get('../api/filters')
        .end((err, res) =>
          this.props.dispatch(loadFilters(res.body.filters))
        );
    }
  }

  /**
   * Add reCAPTCHA to page if needed.
   */
  componentDidMount() {
    if (this.props.recaptcha) {
      // Load recaptcha
      const element = document.createElement('script');
      element.src = 'https://www.google.com/recaptcha/api.js';
      element.type = 'text/javascript';
      document.head.appendChild(element);
    }
  }

  /**
   * Adds a real/main address to the user's account.
   */
  onAddRealAddress() {
    swal({
      title: 'Add a normal email address to your account',
      text: 'Add a normal email address to your account to receive redirected '
        + 'mail at.',
      type: 'input',
      showCancelButton: true,
      closeOnConfirm: true,
      inputPlaceholder: 'address@domain.com'
    },
    email => {
      if (!email) return false;
    
      request
        .post('../api/account/email/' + email)
        .end((err, res) => {
          if (err || res.body.error)
            swal('Error', res.body.message, 'error');
          else
            this.props.dispatch(addEmail(res.body.id, email));
        });
    });
  }

  /**
   * Moves a modifier down in its list, which increases its order number.
   * @param {number} id
   */
  onMoveModifierDown(id) {
    const mods = this.state.modifiers.slice(0);
    const i = mods.findIndex(m => m.id == id);

    // Swap indexes with next sibling
    // Ensure modifier is not last in array
    if (i != -1 && i != mods.length - 1) {
      const a = Object.assign({}, mods[i]);
      const b = Object.assign({}, mods[i + 1]);

      mods[i] = b, mods[i + 1] = a;

      this.setState({ modifiers: mods }); 
    }
  }

  /**
   * Moves a modifier up in its list, which decreases its order number.
   * @param {number} id
   */
  onMoveModifierUp(id) {
    const mods = this.state.modifiers.slice(0);
    const i = mods.findIndex(m => m.id == id);

    // Swap indexes with previous sibling
    // Ensure modifier is not first in array
    if (i > 0) {
      const a = Object.assign({}, mods[i]);
      const b = Object.assign({}, mods[i - 1]);

      mods[i] = b, mods[i - 1] = a;

      this.setState({ modifiers: mods }); 
    }
  }

  /**
   * Removes a modifier from `this.state.modifiers`.
   * @param {number} id
   */
  onRemoveModifier(id) {
    this.setState({
      modifiers: this.state.modifiers.filter(mod => mod.id != id)
    });
  }

  /**
   * Removes a filter from `this.state.filters`.
   * @param {number} id
   */
  onRemoveFilter(id) {
    this.setState({
      filters: this.state.filters.filter(f => f.id != id)
    });
  }

  /**
   * Adds a modifier to `this.state.modifiers`.
   * @param {number} id
   */
  onAddModifier(id) {
    if (this.state.modifiers.find(m => m.id == id)) return;
    
    this.setState({
      modifiers: this.state.modifiers.concat([
        this.props.data.modifiers.find(m => m.id == id)
      ])
    });
  }

  /**
   * Adds a filter to `this.state.filters`.
   * @param {number} id
   */
  onAddFilter(id) {
    if (this.state.filters.find(f => f.id == id)) return;
    
    this.setState({
      filters: this.state.filters.concat([
        this.props.data.filters.find(f => f.id == id)
      ])
    });
  }

  /**
   * Builds data from form and passes it to `this.props.onSubmit()`.
   * @param {Event} e
   */
  onSubmit(e) {
    e && e.preventDefault();

    const data = {
      to: this.props.data.account.emails.find(e =>
        e.address == this.refs.to.value
      ).id,
      name: this.refs.name.value,
      filters: this.state.filters.map(f => f.id).join(','),
      saveMail: +this.refs.saveMail.checked,
      modifiers: this.state.modifiers.map(m => m.id).join(','),
      description: this.refs.description.value,
      noToAddress: +this.refs.noToAddress.checked,
      noSpamFilter: +(!this.refs.spamFilter.checked)
    };

    if (this.props.create) {
      data.address = this.refs.address.value
        ? this.refs.address.value + '@ptorx.com' : '';
    }

    if (this.props.recaptcha) {
      data.recaptcha = grecaptcha.getResponse();

      if (!data.recaptcha) {
        swal('Error', 'You must complete the captcha', 'error');
        return;
      }
    }

    this.props.onSubmit(data);
  }

  render() {
    const { email } = this.props;
    
    return (
      <form className='email-form' onSubmit={e => this.onSubmit(e)}>
        <label>Name</label>
        <span className='input-description'>
          Give your email a name to find it easier.
        </span>
        <input type='text' ref='name' defaultValue={email.name} />
        
        <label>Description</label>
        <span className='input-description'>
          Describe your email to find it easier.
        </span>
        <input
          type='text'
          ref='description'
          defaultValue={email.description}
        />

        {this.props.create ? (
          <div className='proxy-address'>
            <label>Address</label>
            <span className='input-description'>
              Customize your Ptorx address or leave it blank for a randomly generated address.
            </span>
            <input type='text' ref='address' className='name' />
            <span className='domain'>@ptorx.com</span>
          </div>
        ) : (
          <div />
        )}
        
        <hr />
        
        <div className='redirect-to'>
          <label>Redirect To</label>
          <span className='input-description'>
            This is your real email that messages sent to your Ptorx address will be redirected to.
          </span>
          <select ref='to' defaultValue={email.toEmail}>{
            this.props.data.account.emails.map(e =>
              <option value={e.address}>{e.address}</option>
            )
          }</select>
          <a
            className='icon-add'
            onClick={() => this.onAddRealAddress()}
            title='Add a real email address to account'
          />
        </div>
        
        <hr />

        <a onClick={() =>
          this.setState({ showAdvanced: !this.state.showAdvanced })
        }>
          {this.state.showAdvanced ? 'Hide' : 'Show'} Advanced Settings
        </a>

        <div
          className='advanced-settings'
          style={{ display: this.state.showAdvanced ? 'initial' : 'none' }}
        > 
          <label>Spam Filter</label>
          <span className='input-description'>
            By default we block any messages that are marked as spam. Disable this only if you believe legitimate messages are being blocked by the spam filter.
          </span>
          <label><input
            type='checkbox'
            ref='spamFilter'
            defaultChecked={email.spamFilter}
          />Enable</label>
          
          <label>Save Mail</label>
          <span className='input-description'>
              Any emails that are sent to this address will be temporarily stored for 3 days. You can then access the messages by viewing the 'Messages' section when viewing this email's info.
              <br />
              'Rejected' emails that don't match your filters will also be saved in a separate section for only rejected emails. If you have 'Spam Filter' enabled, messages detected as spam will <em>not</em> be stored at all.
              <br />
              This option is required if you want to reply to emails.
            </span>
          <label><input
            type='checkbox'
            ref='saveMail'
            defaultChecked={email.saveMail}
          />Enable</label>
          
          <label>No 'To' Address</label>
          <span className='input-description'>
            Enabling this will allow you to avoid having emails sent to your Ptorx address redirected to your real email. This will act like the <em>Save Mail</em> feature just without the emails being redirected.
          </span>
          <label><input
            type='checkbox'
            ref='noToAddress'
            defaultChecked={
              email.noToAddress == undefined
                ? !email.toEmail : email.noToAddress
            }
          />Enable</label>

          <hr />

          <h3>Filters</h3>
          <p>Create or select filters for your email to use.</p>
          <div className='linked-filters'>{
            this.state.filters.map(filter =>
              <div className='filter'>
                <span className='type'>{
                  filterTypes[filter.type]
                }</span>
                <span className='name'>{filter.name}</span>
                <span
                  className='icon-trash'
                  title='Remove Filter'
                  onClick={() => this.onRemoveFilter(filter.id)}
                />
                <span className='description'>{
                  filter.description
                }</span>
              </div>
            )
          }</div>

          <LinkFilter data={this.props.data} onAdd={this.onAddFilter} />

          <hr />

          <h3>Modifiers</h3>
          <p>
            Create or select modifiers for your email to use.
            <br />
            <strong>Note:</strong> The order in which the modifiers are listed are the order in which they are applied to emails.
          </p>
          <div className='linked-modifiers'>{
            this.state.modifiers.map(mod =>
              <div className='modifier'>
                <span className='type'>{
                  modifierTypes[mod.type]
                }</span>
                <span className='name'>{mod.name}</span>
                <span className='description'>{
                  mod.description
                }</span>
                <div className='controls'>
                  <a
                    className='icon-trash'
                    onClick={
                      () => this.onRemoveModifier(mod.id)
                    }
                  >Remove</a>

                  <a
                    className='icon-arrow-up'
                    onClick={() => {
                      this.onMoveModifierUp(mod.id);
                    }}
                    title='Change modifier order'
                  >Up</a>
                  <a
                    className='icon-arrow-down'
                    onClick={() => {
                      this.onMoveModifierDown(mod.id);
                    }}
                    title='Change modifier order'
                  >Down</a>
                </div>
              </div>
            )
          }</div>

          <LinkModifier data={this.props.data} onAdd={this.onAddModifier} />
        </div>
        
        <hr />

        {this.props.recaptcha ? (
          <div className='recaptcha-wrapper'>
            <div
              className='g-recaptcha'
              data-sitekey={RECAPTCHA_KEY}
            />
          </div>
        ) : (
          <div />    
        )}
        
        <button className='btn-primary'>Submit</button>
      </form>
    );
  }

}

CreateOrEditEmailForm.PropTypes = {
  data: PropTypes.object.isRequired,
  email: PropTypes.object,
  create: PropTypes.bool,
  dispatch: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  recaptcha: PropTypes.bool
};

CreateOrEditEmailForm.defaultProps = {
  email: {
    name: '', description: '', toEmail: '', spamFilter: true, saveMail: false,
    noToAddress: false, filters: [], modifiers: []
  },
  recaptcha: false, create: false
};