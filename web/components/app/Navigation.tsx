import {
  ListItem,
  Toolbar,
  MenuButton,
  Divider,
  Drawer,
  Button,
  FontIcon,
  Subheader
} from 'react-md';
import * as React from 'react';

export class AppNavigation extends React.Component {
  constructor(props) {
    super(props);

    this.state = { drawer: false };
  }

  /**
   * Delete access token and redirect to logout.
   */
  onLogout() {
    delete localStorage.accessToken;
    location.href = '/api/6/account/logout';
  }

  /** @return {JSX.Element[]} */
  _renderDrawerNavItems() {
    const { App } = this.props;

    return [
      <a href="#/emails/list">
        <ListItem leftIcon={<FontIcon>email</FontIcon>} primaryText="Emails" />
      </a>,
      <a href="#/filters/list">
        <ListItem
          leftIcon={<FontIcon>filter_list</FontIcon>}
          primaryText="Filters"
        />
      </a>,
      <a href="#/modifiers/list">
        <ListItem
          leftIcon={<FontIcon>code</FontIcon>}
          primaryText="Modifiers"
        />
      </a>,
      <a href="#/domains">
        <ListItem
          leftIcon={<FontIcon>domain</FontIcon>}
          primaryText="Domains"
        />
      </a>,

      <Divider />,

      <ListItem
        leftIcon={<FontIcon>account_box</FontIcon>}
        primaryText="My Account"
        nestedItems={[
          <a href="#/account/settings">
            <ListItem
              leftIcon={<FontIcon>settings</FontIcon>}
              primaryText="Settings"
            />
          </a>,
          App.state.account.affiliate ? (
            <a href="/affiliate">
              <ListItem
                leftIcon={<FontIcon>attach_money</FontIcon>}
                primaryText="Affiliate"
              />
            </a>
          ) : (
            <a />
          ),
          <a href="#/account/primary-emails">
            <ListItem
              leftIcon={<FontIcon>email</FontIcon>}
              primaryText="Primary Emails"
            />
          </a>,
          <ListItem
            onClick={() => this.onLogout()}
            leftIcon={<FontIcon>close</FontIcon>}
            primaryText="Logout"
          />
        ]}
      />,

      <ListItem
        leftIcon={<FontIcon>info</FontIcon>}
        primaryText="Documentation"
        nestedItems={[
          <a href="#/docs/help">
            <ListItem leftIcon={<FontIcon>help</FontIcon>} primaryText="Help" />
          </a>,
          <a href="#/docs/privacy">
            <ListItem
              leftIcon={<FontIcon>security</FontIcon>}
              primaryText="Privacy Policy"
            />
          </a>,
          <a href="#/docs/tos">
            <ListItem
              leftIcon={<FontIcon>gavel</FontIcon>}
              primaryText="Terms of Service"
            />
          </a>
        ]}
      />,

      <Divider />,

      <Subheader primaryText={`${App.state.account.credits} credits`} />,
      <a href="#/account/credits/purchase">
        <ListItem
          leftIcon={<FontIcon>credit_card</FontIcon>}
          primaryText="Purchase Credits"
        />
      </a>,
      <a href="#/account/credits/earn">
        <ListItem
          leftIcon={<FontIcon>money_off</FontIcon>}
          primaryText="Earn Credits"
        />
      </a>
    ];
  }

  render() {
    const { App } = this.props;

    return (
      <React.Fragment>
        <Toolbar
          colored
          fixed
          actions={[
            <Button
              icon
              iconChildren="search"
              onClick={() => (location.hash = '#/quick-search')}
            />,
            <MenuButton
              icon
              id="menu--create-item"
              menuItems={[
                <Subheader primaryText="Create a new:" />,
                !App.state.account.emails.length ? (
                  <a />
                ) : (
                  <a href="#/emails/create?instant=1">
                    <ListItem
                      leftIcon={<FontIcon>email</FontIcon>}
                      primaryText="Email (Instant)"
                    />
                  </a>
                ),
                <a href="#/emails/create">
                  <ListItem
                    leftIcon={<FontIcon>email</FontIcon>}
                    primaryText="Email (Custom)"
                  />
                </a>,
                <a href="#/filters/create">
                  <ListItem
                    leftIcon={<FontIcon>filter_list</FontIcon>}
                    primaryText="Filter"
                  />
                </a>,
                <a href="#/modifiers/create">
                  <ListItem
                    leftIcon={<FontIcon>code</FontIcon>}
                    primaryText="Modifier"
                  />
                </a>,
                <a href="#/domains/add">
                  <ListItem
                    leftIcon={<FontIcon>domain</FontIcon>}
                    primaryText="Domain"
                  />
                </a>
              ]}
              iconChildren="add"
            />
          ]}
          title="Ptorx"
          nav={
            <Button
              icon
              iconChildren="menu"
              onClick={() => this.setState({ drawer: true })}
            />
          }
        />

        <Drawer
          onVisibilityChange={v => this.setState({ drawer: v })}
          autoclose={true}
          navItems={this._renderDrawerNavItems()}
          visible={this.state.drawer}
          header={
            <Toolbar
              colored
              nav={
                <Button
                  icon
                  onClick={() => this.setState({ drawer: false })}
                  iconChildren="arrow_back"
                />
              }
            />
          }
          type={Drawer.DrawerTypes.TEMPORARY}
        />
      </React.Fragment>
    );
  }
}
