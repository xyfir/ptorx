import {
  TabsContainer,
  SelectField,
  TextField,
  Checkbox,
  ListItem,
  Button,
  DialogContainer,
  Paper,
  List,
  Tabs,
  Tab
} from 'react-md';
import PropTypes from 'prop-types';
import { api } from 'lib/api';
import * as moment from 'moment';
import * as React from 'react';

// Components
import LinkModifier from 'components/modifiers/Link';
import LinkFilter from 'components/filters/Link';

// Constants
import { filterTypes, modifierTypes } from 'constants/types';

export default class EmailForm extends React.Component {
  constructor(props) {
    super(props);

    this.onAddModifier = this.onAddModifier.bind(this);
    this.onAddFilter = this.onAddFilter.bind(this);

    this.state = {
      filters: this.props.email.filters,
      modifiers: this.props.email.modifiers,
      advancedSettingsTab: 0,
      addressAvailable: true
    };
  }

  /**
   * Checks if an email address on the selected domain is available.
   */
  onCheckAddress(domain: number = this._domain.state.value) {
    clearInterval(this.timeout);

    this.timeout = setTimeout(() => {
      const address = this._address.value;

      if (!address) return this.setState({ addressAvailable: true });

      api
        .get('/emails/availability', { params: { domain, address } })
        .then(res => this.setState({ addressAvailable: res.data.available }));
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

      mods[i] = b;
      mods[i + 1] = a;

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

      mods[i] = b;
      mods[i - 1] = a;

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
      to: this.props.data.account.emails.find(
        e => e.address == this._to.state.value
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

    data.name = data.name || 'Untitled Custom Proxy Email';

    if (this.props.create) {
      data.domain = this._domain.state.value;
      data.address = this._address.value
        ? this._address.value.split('@')[0]
        : '';
      data.description =
        data.description ||
        'Created on ' + moment().format('YYYY-MM-DD, HH:mm:ss');
    }

    this.props.onSubmit(data);
  }

  _renderFilters() {
    return (
      <section className="filters">
        {this.state.filters.length ? (
          <section className="linked">
            <header>
              <h3>Linked Filters</h3>
              <p>Click on filters below to remove them from this email.</p>
            </header>

            <List className="filters-list section md-paper md-paper--1">
              {this.state.filters.map(f => (
                <ListItem
                  threeLines
                  key={f.id}
                  onClick={() => this.onRemoveFilter(f.id)}
                  className="filter"
                  primaryText={f.name}
                  secondaryText={filterTypes[f.type] + '\n' + f.description}
                />
              ))}
            </List>
          </section>
        ) : null}

        <section className="add">
          <header>
            <h3>Add Filters</h3>
            <p>Click on filters below to add them to this email.</p>
          </header>

          <LinkFilter
            {...this.props}
            onAdd={this.onAddFilter}
            ignore={this.state.filters}
          />
        </section>
      </section>
    );
  }

  _renderModifiers() {
    return (
      <section className="modifiers">
        {this.state.modifiers.length ? (
          <section className="linked">
            <header>
              <h3>Linked Modifiers</h3>
              <p>Click on modifiers below to remove them from this email.</p>
              <p>
                The order in which the modifiers are listed are the order in
                which they are applied to emails.
              </p>
            </header>

            <List className="modifiers-list section md-paper md-paper--1">
              {this.state.modifiers.map(m => (
                <ListItem
                  threeLines
                  key={m.id}
                  onClick={() => this.setState({ selectedModifier: m.id })}
                  className="modifier"
                  primaryText={m.name}
                  secondaryText={modifierTypes[m.type] + '\n' + m.description}
                />
              ))}
            </List>
          </section>
        ) : null}

        <section className="add">
          <header>
            <h3>Add Modifiers</h3>
            <p>Click on modifiers below to add them to this email.</p>
          </header>

          <LinkModifier
            {...this.props}
            onAdd={this.onAddModifier}
            ignore={this.state.modifiers}
          />
        </section>
      </section>
    );
  }

  render() {
    const { email } = this.props;

    return (
      <div className="email-form">
        <Paper
          zDepth={1}
          component="section"
          className="main-form section flex"
        >
          <TextField
            id="text--name"
            ref={i => (this._name = i)}
            type="text"
            label="Name"
            helpText={'(optional) Give your email a name to find it easier'}
            maxLength={40}
            defaultValue={email.name}
          />

          <TextField
            id="text--description"
            ref={i => (this._description = i)}
            type="text"
            label="Description"
            helpText={
              '(optional) Give your email a description to find it easier'
            }
            maxLength={150}
            defaultValue={email.description}
          />

          {this.props.create ? (
            <React.Fragment>
              <TextField
                id="text--address"
                ref={i => (this._address = i)}
                type="text"
                label="Address"
                error={!this.state.addressAvailable}
                helpText={
                  '(optional) Customize your Ptorx address or leave it blank ' +
                  'for a randomly generated address'
                }
                onChange={() => this.onCheckAddress()}
                errorText="Address is not available"
                maxLength={64}
              />

              <SelectField
                id="select--domain"
                ref={i => (this._domain = i)}
                label="Domain"
                helpText={'The domain your proxy email will use'}
                position={SelectField.Positions.BELOW}
                onChange={v => this.onCheckAddress(v)}
                className="md-full-width"
                menuItems={this.props.data.domains.map(d =>
                  Object({ label: `@${d.domain}`, value: d.id })
                )}
                defaultValue={email.domain}
              />
            </React.Fragment>
          ) : null}

          <SelectField
            id="select--redirect"
            ref={i => (this._to = i)}
            label="Redirect To"
            position={SelectField.Positions.BELOW}
            helpText={
              'Your real email that messages sent to your Ptorx address ' +
              'will be redirected to'
            }
            className="md-full-width"
            menuItems={this.props.data.account.emails.map(e => e.address)}
            defaultValue={
              email.toEmail || this.props.data.account.emails[0].address
            }
          />

          {!this.state.showAdvanced ? (
            <Button
              flat
              primary
              onClick={() => this.setState({ showAdvanced: true })}
              iconChildren="settings"
            >
              Advanced Settings
            </Button>
          ) : null}
        </Paper>

        <Paper
          style={{ display: this.state.showAdvanced ? 'flex' : 'none' }}
          zDepth={1}
          component="section"
          className="advanced-settings checkboxes section"
        >
          <Checkbox
            id="checkbox--spam-filter"
            name="spam-filter"
            label="Spam Filter"
            defaultChecked={email.spamFilter}
          />

          <Checkbox
            id="checkbox--save-mail"
            name="save-mail"
            label="Save Mail"
            defaultChecked={email.saveMail}
          />

          <Checkbox
            id="checkbox--no-redirect"
            name="no-redirect"
            label="No Redirect"
            defaultChecked={
              email.noToAddress == undefined
                ? !email.toEmail
                : email.noToAddress
            }
          />

          <Checkbox
            id="checkbox--direct-forward"
            name="direct-forward"
            label="Direct Forward"
            defaultChecked={email.directForward}
          />
        </Paper>

        <TabsContainer
          colored
          style={{ display: this.state.showAdvanced ? 'initial' : 'none' }}
          className={
            'advanced-settings filters-and-modifiers ' +
            'md-paper md-paper--1 section'
          }
          onTabChange={i =>
            // !! For some reason the index `3` pops up sometimes
            this.setState({ advancedSettingsTab: i == 0 ? 0 : 1 })
          }
          activeTabIndex={this.state.advancedSettingsTab}
        >
          <Tabs tabId="tab">
            <Tab label="Filters">
              {this.state.advancedSettingsTab == 0
                ? this._renderFilters()
                : null}
            </Tab>
            <Tab label="Modifiers">
              {this.state.advancedSettingsTab == 1
                ? this._renderModifiers()
                : null}
            </Tab>
          </Tabs>
        </TabsContainer>

        <DialogContainer
          id="selected-modifier"
          onHide={() => this.setState({ selectedModifier: 0 })}
          visible={!!this.state.selectedModifier}
          aria-label="Selected modifier"
        >
          <List>
            <ListItem
              primaryText="Move up"
              onClick={() => this.onMoveModifierUp()}
            />
            <ListItem
              primaryText="Move down"
              onClick={() => this.onMoveModifierDown()}
            />
            <ListItem
              primaryText="Remove"
              onClick={() => this.onRemoveModifier()}
            />
          </List>
        </DialogContainer>

        <Button primary raised onClick={e => this.onSubmit(e)}>
          {this.props.create ? 'Create' : 'Update'}
        </Button>
      </div>
    );
  }
}

EmailForm.propTypes = {
  App: PropTypes.object.isRequired,
  data: PropTypes.object.isRequired,
  email: PropTypes.object,
  create: PropTypes.bool,
  dispatch: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired
};

EmailForm.defaultProps = {
  email: {
    name: '',
    description: '',
    toEmail: '',
    spamFilter: true,
    saveMail: false,
    directForward: false,
    noToAddress: false,
    filters: [],
    modifiers: [],
    domain: 1
  },
  create: false
};
