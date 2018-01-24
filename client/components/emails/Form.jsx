import PropTypes from 'prop-types';
import request from 'superagent';
import moment from 'moment';
import React from 'react';
import swal from 'sweetalert';

// Components
import LinkModifier from 'components/modifiers/Link';
import LinkFilter from 'components/filters/Link';

// Constants
import { filterTypes, modifierTypes } from 'constants/types';
import { RECAPTCHA_KEY } from 'constants/config';

// react-md
import TabsContainer from 'react-md/lib/Tabs/TabsContainer';
import SelectField from 'react-md/lib/SelectFields';
import TextField from 'react-md/lib/TextFields';
import Checkbox from 'react-md/lib/SelectionControls/Checkbox';
import ListItem from 'react-md/lib/Lists/ListItem';
import Button from 'react-md/lib/Buttons/Button';
import Dialog from 'react-md/lib/Dialogs';
import Paper from 'react-md/lib/Papers';
import List from 'react-md/lib/Lists/List';
import Tabs from 'react-md/lib/Tabs/Tabs';
import Tab from 'react-md/lib/Tabs/Tab';

export default class EmailForm extends React.Component {

  constructor(props) {
    super(props);

    this.onAddModifier = this.onAddModifier.bind(this);
    this.onAddFilter = this.onAddFilter.bind(this);

    this.state = {
      filters: this.props.email.filters, modifiers: this.props.email.modifiers,
      advancedSettingsTab: 0, addressAvailable: true
    };
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
   * Checks if an email address on the selected domain is available.
   * @param {number} [domain]
   */
  onCheckAddress(domain = this._domain.state.value) {
    clearInterval(this.timeout);

    this.timeout = setTimeout(() => {
      const address = this._address.value;

      if (!address) return this.setState({ addressAvailable: true });

      request
        .get('/api/emails/availability')
        .query({ domain, address })
        .end((err, res) => !err &&
          this.setState({ addressAvailable: res.body.available })
        );
    }, 250);
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
   */
  onSubmit() {
    const data = {
      to: this.props.data.account.emails.find(e =>
        e.address == this._to.state.value
      ).id,
      name: this._name.value,
      filters: this.state.filters.map(f => f.id).join(','),
      saveMail: window['checkbox--save-mail'].checked,
      modifiers: this.state.modifiers.map(m => m.id).join(','),
      description: this._description.value,
      noToAddress: window['checkbox--no-redirect'].checked,
      noSpamFilter: !window['checkbox--spam-filter'].checked,
      directForward: window['checkbox--direct-forward'].checked
    };

    data.name = data.name || 'Untitled Proxy Email';

    if (this.props.create) {
      data.domain = this._domain.state.value,
      data.address = this._address.value
        ? this._address.value.split('@')[0]
        : '',
      data.description = data.description ||
        'Created on ' + moment().format('YYYY-MM-DD, HH:mm:ss');
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
      <Paper
        zDepth={1}
        component='section'
        className='email-form section flex'
      >
        <TextField
          id='text--name'
          ref={i => this._name = i}
          type='text'
          label='Name'
          helpText='(optional) Give your proxy email a name to find it easier'
          maxLength={40}
          className='md-cell'
          defaultValue={email.name}
        />

        <TextField
          id='text--description'
          ref={i => this._description = i}
          type='text'
          label='Description'
          helpText={
            '(optional) Give your proxy email a description to find it easier'
          }
          maxLength={150}
          className='md-cell'
          defaultValue={email.description}
        />

        {this.props.create ? (
          <div className='address flex'>
            <TextField
              id='text--address'
              ref={i => this._address = i}
              type='text'
              label='Address'
              error={!this.state.addressAvailable}
              helpText={
                '(optional) Customize your Ptorx address or leave it blank ' +
                'for a randomly generated address'
              }
              onChange={() => this.onCheckAddress()}
              errorText='Proxy address is not available'
              maxLength={64}
              className='md-cell'
            />

            <SelectField
              id='select--domain'
              ref={i => this._domain = i}
              label='Domain'
              position={SelectField.Positions.BELOW}
              onChange={v => this.onCheckAddress(v)}
              className='md-cell'
              menuItems={
                this.props.data.domains.map(d =>
                  Object({ label: `@${d.domain}`, value: d.id })
                )
              }
              defaultValue={email.domain}
            />
          </div>
        ) : null}

        <SelectField
          id='select--redirect'
          ref={i => this._to = i}
          label='Redirect To'
          position={SelectField.Positions.BELOW}
          helpText={
            'Your real email that messages sent to your Ptorx address ' +
            'will be redirected to'
          }
          className='md-cell'
          menuItems={this.props.data.account.emails.map(e => e.address)}
          defaultValue={
            email.toEmail || this.props.data.account.emails[0].address
          }
        />

        {!this.state.showAdvanced ? (
          <a onClick={() => this.setState({ showAdvanced: true})}>
            Show Advanced Settings
          </a>
        ) : null}

        <div
          className='advanced-settings flex'
          style={{ display: this.state.showAdvanced ? 'flex' : 'none' }}
        >
          <div className='checkboxes'>
            <Checkbox
              id='checkbox--spam-filter'
              name='spam-filter'
              label='Spam Filter'
              defaultChecked={email.spamFilter}
            />

            <Checkbox
              id='checkbox--save-mail'
              name='save-mail'
              label='Save Mail'
              defaultChecked={email.saveMail}
            />

            <Checkbox
              id='checkbox--no-redirect'
              name='no-redirect'
              label='No Redirect'
              defaultChecked={
                email.noToAddress == undefined
                  ? !email.toEmail
                  : email.noToAddress
              }
            />

            <Checkbox
              id='checkbox--direct-forward'
              name='direct-forward'
              label='Direct Forward'
              defaultChecked={email.directForward}
            />
          </div>

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
            aria-label='Selected modifier'
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
        ) : null}

        <Button
          primary raised
          onClick={e => this.onSubmit(e)}
        >Submit</Button>
      </Paper>
    );
  }

}

EmailForm.PropTypes = {
  App: PropTypes.object.isRequired,
  data: PropTypes.object.isRequired,
  email: PropTypes.object,
  create: PropTypes.bool,
  dispatch: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  recaptcha: PropTypes.bool
};

EmailForm.defaultProps = {
  email: {
    name: '', description: '', toEmail: '', spamFilter: true, saveMail: false,
    directForward: false, noToAddress: false, filters: [], modifiers: [],
    domain: 1
  },
  recaptcha: false, create: false
};