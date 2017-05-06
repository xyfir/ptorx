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

// react-md
import TabsContainer from 'react-md/lib/Tabs/TabsContainer';
import ListItem from 'react-md/lib/Lists/ListItem';
import Button from 'react-md/lib/Buttons/Button';
import Dialog from 'react-md/lib/Dialogs';
import Paper from 'react-md/lib/Papers';
import List from 'react-md/lib/Lists/List';
import Tabs from 'react-md/lib/Tabs/Tabs';
import Tab from 'react-md/lib/Tabs/Tab';

export default class CreateOrEditEmailForm extends React.Component {

  constructor(props) {
    super(props);

    this.onAddModifier = this.onAddModifier.bind(this);
    this.onAddFilter = this.onAddFilter.bind(this);

    this.state = {
      filters: this.props.email.filters, modifiers: this.props.email.modifiers,
      advancedSettingsTab: 0
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
   */
  onMoveModifierDown() {
    const mods = this.state.modifiers.slice(0);
    const id = this.state.selectedModifier;
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
   */
  onMoveModifierUp() {
    const mods = this.state.modifiers.slice(0);
    const id = this.state.selectedModifier;
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
   */
  onRemoveModifier() {
    const id = this.state.selectedModifier;
    this.setState({
      modifiers: this.state.modifiers.filter(mod => mod.id != id),
      selectedModifier: 0
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
      <form
        className='email-form section md-paper md-paper--1'
        onSubmit={e => this.onSubmit(e)}
      >
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

        {!this.state.showAdvanced ? (
          <a onClick={() => this.setState({ showAdvanced: true})}>
            Show Advanced Settings
          </a>
        ) : null}

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

          <Paper zDepth={2} className='filters-and-modifiers section'>
          <TabsContainer
            colored
            onTabChange={i => this.setState({ advancedSettingsTab: i })}
            activeTabIndex={this.state.advancedSettingsTab}
          >
            <Tabs tabId='tab'>
              <Tab label='Filters'>
                {this.state.filters.length ? <h3>Linked Filters</h3> : null}
                
                <List
                  className='filters-list section md-paper md-paper--1'
                >{
                  this.state.filters.map(f =>
                    <ListItem
                      threeLines
                      key={f.id}
                      onClick={() => this.onRemoveFilter(f.id)}
                      className='filter'
                      primaryText={f.name}
                      secondaryText={filterTypes[f.type] + '\n' + f.description}
                    />
                  )
                }</List>

                <h3>Add Filters</h3>

                <LinkFilter
                  {...this.props}
                  onAdd={this.onAddFilter}
                  ignore={this.state.filters}
                />
              </Tab>

              <Tab label='Modifiers'>
                {this.state.modifiers.length ?
                  <h3>Linked Modifiers</h3> : null
                }
                
                <p>
                  The order in which the modifiers are listed are the order in which they are applied to emails.
                </p>
                
                <List
                  className='modifiers-list section md-paper md-paper--1'
                >{
                  this.state.modifiers.map(m =>
                    <ListItem
                      threeLines
                      key={m.id}
                      onClick={() => this.setState({ selectedModifier: m.id })}
                      className='modifier'
                      primaryText={m.name}
                      secondaryText={
                        modifierTypes[m.type] + '\n' + m.description
                      }
                    />
                  )
                }</List>

                <h3>Add Modifiers</h3>

                <LinkModifier
                  {...this.props}
                  onAdd={this.onAddModifier}
                  ignore={this.state.modifiers}
                />
              </Tab>
            </Tabs>
          </TabsContainer>
          </Paper>

          <Dialog
            id='selected-modifier'
            onHide={() => this.setState({ selectedModifier: 0 })}
            visible={!!this.state.selectedModifier}
          >
            <List>
              <ListItem
                primaryText='Move up'
                onClick={() => this.onMoveModifierUp()}
              />
              <ListItem
                primaryText='Move down'
                onClick={() => this.onMoveModifierDown()}
              />
              <ListItem
                primaryText='Remove'
                onClick={() => this.onRemoveModifier()}
              />
            </List>
          </Dialog>
        </div>

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
        
        <Button
          primary raised
          onClick={e => this.onSubmit(e)}
          label='Submit'
        />
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